var util = require('util');

var JSV = require('JSV').JSV;
var validator = JSV.createEnvironment();

var schema = require('../schema/graph.json');

function GraphStructureValidationError(message, errors) {
    Error.call(this);
    this.errors = errors;
}

util.inherits(GraphStructureValidationError, Error);


// Helper function that checks that field `fieldName` is
// unique amongst all array `arr` members.
// returns array of `fieldName` values that are doubled.
// If check is successful, return array will be zero
function fieldsAreUnique(arr, fieldName) {
    var hash = {};
    var doubles = {};

    arr.forEach(function (item) {
        var value = item[fieldName];
        if (hash[value]) {
            doubles[value] = 1;
        } else {
            hash[value] = 1;
        }
    });

    return Object.keys(doubles);
}

// Helper function that checks that all edges pointing to
// existent nodes (no "hanging" edges).
// returns array of invalid edges.
// First argument is a graph instance variable (to be able to use `.getNode()` method).
function findHangingEdges(graph, edges) {
    var errorEdges = [];
    edges.forEach(function (edge) {
        var fromNode = graph.getNode(edge.from);
        var toNode = graph.getNode(edge.to);
        if (!fromNode || !toNode) {
            errorEdges.push(edge);
        }
    });
    return errorEdges;
}

function Graph(structure) {
    if (!structure) {
        return new GraphStructureValidationError('Graph constructor should be provided with structure argument');
    }

    var report = validator.validate(structure, schema);
    if (report.errors.length > 0) {
        return new GraphStructureValidationError('Error validation graph structure on creation', report.errors);
    }

    var nodeNamesDoubles = fieldsAreUnique(structure.nodes, 'name');
    if (nodeNamesDoubles.length !== 0) {
        return new GraphStructureValidationError('Node names must be unique', nodeNamesDoubles);
    }
    this.nodes = structure.nodes;

    var edgeNamesDoubles = fieldsAreUnique(structure.edges, 'name');
    if (edgeNamesDoubles.length !== 0) {
        return new GraphStructureValidationError('Edge names must be unique', edgeNamesDoubles);   
    }
    var hangingEdges = findHangingEdges(this, structure.edges);
    if (hangingEdges.length !== 0) {
        return new GraphStructureValidationError('Edges must point to existing nodes', hangingEdges);
    }

    this.edges = structure.edges;
}

// Looks for node by name
Graph.prototype.getNode = function (name) {
    return (
        this.nodes.filter(function (node) {
            return node.name === name;
        })[0]
    );
};

// Looks for edge by name
Graph.prototype.getEdge = function (name) {
    return (
        this.edges.filter(function (edge) {
            return edge.name === name;
        })[0]
    );
};

// Gets outbound edges from node.
// Supports both node names and node object as argument.
Graph.prototype.outboundEdges = function (node) {
    var _node = (typeof node === 'string') ?
                this.getNode(node) :
                node;
    return (
        this.edges.filter(function (edge) {
            return edge.from === _node.name;
        })
    );
};

// Gets inbound edges from node.
// Supports both node names and node object as argument.
Graph.prototype.inboundEdges = function (node) {
    var _node = (typeof node === 'string') ?
                this.getNode(node) :
                node;
    return (
        this.edges.filter(function (edge) {
            return edge.to === _node.name;
        })
    );
};

// Checks, if this node is terminal, i.e. no outbound edges
Graph.prototype.isTerminalNode = function (node) {
    return this.outboundEdges(node).length === 0;
};

Graph.errors = {
    GraphStructureValidationError: GraphStructureValidationError
};

module.exports = Graph;
