var width = 800;
var height = 400;

var nodes = [];
var edges = [];

var network = null;
var net = null;

var network_options = {
    autoResize:true,
    height:'100%',
    width:'100%',
    locale:'en',

    nodes: {
        color: {
            border: 'rgba(0, 0, 0, 1)',
            background: 'rgba(255, 255, 255, 1)'
        },
        borderWidth: 3,
        shape:'circle',
        font: {
            align:'center'
        },
    },

    edges: {
        selectionWidth:0.1,
        width:2,
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.3
            }
        },
        shadow:true
    },

    physics: {
        enabled:true,
        hierarchicalRepulsion: {
            nodeDistance:60,
            centralGravity:0.01,
            springLength:10,
            springConstant:0.01,
        },
        maxVelocity:20,
        minVelocity:0.1,
        solver: 'hierarchicalRepulsion'
    },

    layout: {
        hierarchical: {
            enabled:true,
            sortMethod:'directed',
            direction:'LR',
            shakeTowards:'leaves',
            edgeMinimization:false,
            parentCentralization: false
        }
    },

    configure: {
        enabled:false
    },
};

function setup() {
    createCanvas(width, height);
    let innovation = new Innovation();
    net = new Network(4, 4, innovation);    
}

function draw() {
    compileNetwork();
    visualize();
    noLoop();
}

function compileNetwork() {
    nodes = [];
    edges = [];
    for (let i = 0; i < net.nodes.length; i++) {
        let id = net.nodes[i].ID;
        let label = net.nodes[i].isBias? "bias" : str(id);
        nodes.push({id: id, 
                    label: label});
    }

    for (let i = 0; i < net.connections.length; i++) {
        let from = net.connections[i].outNodeID;
        let to = net.connections[i].inNodeID;
        let color = getEdgeColor(net.connections[i].weight);
        let dash = net.connections[i].enabled? false : true;
            edges.push({from: from, 
                    to: to,
                    color: color,
                    dashes: dash});
    }
}

function visualize() {
    let visualizeNodes = new vis.DataSet(nodes);
    let visualizeEdges = new vis.DataSet(edges);

    let container = document.getElementById('mynetwork');

    let data = {
        nodes: visualizeNodes,
        edges: visualizeEdges
    };

    network = new vis.Network(container, data, network_options);
}

function getEdgeColor(weight) {
    let value = str(Math.abs(Math.floor(weight * 255)))
    if (weight <= 0) {
        return "rgb(" + value + ", " + value + ", 255)";
    }

    else {
        return "rgb(255," + value + ", " + value + ")";
    }
}