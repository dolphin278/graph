#graph

Simple library for graph manipulations.

I need some graph-related operations for other project, so I decided to move them to separate module.

It is not intended to be full-featured graph manupulation (at least for now) but pull requests are welcome.

It will develop as my requirements will get more sophisticated.

Don't use it for large graphs — it uses array's `.filter()` methods to scan for nodes and edges, so it could be slow on large structures.

## Installation

```npm install node-graph```

## Usage

###new Graph(structure)

Returns graph instance.

```
var Graph = require('node-graph');

var structure = {
    nodes: [
        {
            name: 'A'
        },
        {
            name: 'B',
            youCanPutArbitraryDataOnYourNodes: { ... }
        }
    ],
    edges: [
        {
            name: 'A->B',
            from: 'A',
            to: 'B',
            youCanPutArbitraryDataOnYourEdgesToo: { ... }
        }
    ]
}

var gr = new Graph(structure);
```

Constructor checks that argument conforms to graph JSON schema (locates in `schema/graph.json`). 

**tl;dr** It requires `name` field for nodes and `name`, `from`, `to` fields for edges. Also it checks for `name` uniqueness amongst edges and nodes respectively.
Then is checks that every edge points to existing nodes (`from` and `to` fields containing valid node names).

###outboundEdges(node)

Returns array of edges that came out of specified node:

```
// You can pick outbound edges by node name
var outboundEdges = gr.outboundEdges('B');

// Or providing node object
var node = gr.getNode('B');
var outboundEdges2 = gr.outboundEdges(node);
```

Result example:
```
[{"name":"BD","from":"B","to":"D"}]
```

###inboundEdges(node)

Returns array of edges that came in to specified node:

```
// You can pick outbound edges by node name
var inboundEdges = gr.inboundEdges('D');

// Or providing node object
var node = gr.getNode('D');
var inboundEdges2 = gr.inboundEdges(node);
```
Result example:

```
[
    {"name":"BD","from":"B","to":"D"},
    {"name":"CD","from":"C","to":"D"}
]
```

###isTerminalNode(node)

If there are no outbound edges from specified node, returns true, false otherwise.

```
    // using node object
    var node = gr.getNode('D');
    gr.isTerminalNode(node);
    
    // using node name
    gr.isTerminalNode('D');
```

##getNode(name)

Returns node object by its name.

##getEdge(name)

Returns edge object by its name.

##License

MIT
