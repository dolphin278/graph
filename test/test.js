var assert = require('assert');

var JSV = require('JSV').JSV;
var validator = JSV.createEnvironment();
var graphSchema = require('../schema/graph.json');

var Graph = require('../lib/Graph');

var testGraphDescription = require('./testGraphDescription.json');

describe('when attempting to create Graph with hanging edge', function () {
    var gr = null;
    var invalidGraphSchema = JSON.parse(JSON.stringify(testGraphDescription));
    invalidGraphSchema.edges[0].to = 'X'; //non-existent node

    it('constructor should return error', function () {
        gr = new Graph(invalidGraphSchema);
        assert(gr instanceof Graph.errors.GraphStructureValidationError);
    });
});

describe('when Graph created', function () {
    var gr = null;
    before(function () {
        gr = new Graph(testGraphDescription);
    });

    it('should have edges and nodes', function () {
        assert(gr);
        assert(!(gr instanceof Graph.errors.GraphStructureValidationError), gr);
        assert(gr.nodes);
        assert(gr.edges);
    });

    it('should be able to find nodes by name', function () {
        var node = gr.getNode('C');
        assert(typeof node === "object");
        assert(node.name === "C");
        assert(node.someArbitraryData === "arbitrary data");
    });

    it('should be able to find edges by name', function () {
        var edge = gr.getEdge('AB');
        assert(typeof edge === "object");
        assert(edge.from === "A");
        assert(edge.to === "B");
        assert(edge.name === "AB");
        assert(edge.arbitraryData === "arbitrary edge data");
    });

    it('should be able to get list of outbound edges', function () {
        var outEdges = gr.outboundEdges('B');
        assert(Array.isArray(outEdges));
        assert(outEdges.length === 1);
        assert(outEdges[0].to === 'D');
    });

    it('should be able to get list of inbound edges', function () {
        var inEdges = gr.inboundEdges('D');
        assert(Array.isArray(inEdges));
        assert(inEdges.length === 2);
        assert(inEdges[0].from === 'B');
        assert(inEdges[1].from === 'C');
    });

    it('should determine terminal nodes', function () {
        assert(gr.isTerminalNode('D'));
        assert(!gr.isTerminalNode('B'));
    });

    it('should serializes to valid graph JSON', function () {
        var serialized = JSON.parse(JSON.stringify(gr));
        var report = validator.validate(serialized, graphSchema);
        assert(report.errors.length === 0);
    });

});
