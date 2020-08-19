class Network {
    constructor(numInputs, numOutputs, innovation) {
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.innovation = innovation;

        this.nodes = [];
        this.connections = [];

        this.nextNodeID = 0;
        this.fitness = 1; // testing

        // create input nodes
        for (let i = 0; i < numInputs; i++) { 
            let node = new Node(this.nextNodeID++);
            node.isInput = true;
            node.InOutID = i;
            this.nodes.push(node);
        }

        // create output nodes
        for (let i = 0; i < numOutputs; i++) { 
            let node = new Node(this.nextNodeID++);
            node.isOutput = true;
            node.InOutID = i;
            this.nodes.push(node)
        }

        // create bias unit
        let biasNode = new Node(this.nextNodeID++);
        biasNode.isBias = true;
        biasNode.output = 1.0;
        this.nodes.push(biasNode);

        // connect
        let inputNodes = this.getInputNodes();
        let outputNodes = this.getOutputNodes();

        for (let i = 0; i < inputNodes.length; i++) {
            for (let j = 0; j < outputNodes.length; j++) {
                let inNodeID = outputNodes[j].ID;
                let outNodeID = inputNodes[i].ID;
                let weight = getRandomFloatBetween(-1.0, 1.0);
                let connection = new Connection(inNodeID, outNodeID, weight, innovation.value++);
                this.connections.push(connection);
            }
        }

        for (let i = 0; i < outputNodes.length; i++) {
            let inNodeID = outputNodes[i].ID;
            let outNodeID = biasNode.ID
            let weight = getRandomFloatBetween(-1.0, 1.0);
            let connection = new Connection(inNodeID, outNodeID, weight, innovation.value++);
            this.connections.push(connection);
        }

        this.formatNetwork();
    }

    formatNetwork() { // sorts nodes and connnections
        this.sortNodes();
        this.sortConnections();
    }
    
    sortNodes() { // perform topological sort on network to determine order of evaluation
        this.runKahns();
    }

    sortConnections() { // sort connections by innovation number
        this.connections.sort((a,b) => a.innovationNumber - b.innovationNumber);
    }

    evaluate(inputValues) { // evaluate the neural network
        this.sortNodes();
        let inputNodes = this.getInputNodes();
        for (let i = 0; i < inputNodes.length; i++) { // load input values
            inputNodes[i].output = inputValues[i];
        }

        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node.isInput) node.output = inputValues[node.InOutID]; // load in input values 

            else if (node.isBias) node.output = 1.0; // bias nodes also have an output of 1

            else {
                node.output = node.activate(this.sumIncomingOutputs(node.ID)); // sum up incoming outputs and pass through activation
            }
        }

        let outputValues = [];
        let outputNodes = this.getOutputNodes();

        for (let i = 0; i < outputNodes.length; i++) {
            outputValues.push(outputNodes[i].output);
        }
        return outputValues;
    }

    evaluateArgMax(inputValues) { // evalute the neural network and return the index of the highest output
        let output = this.evaluate(inputValues);
        let argMax = output.indexOf(Math.max(...output));
        return argMax;
    }

    sumIncomingOutputs(nodeID) {
        let total = 0;
        let connections = this.getConnectionsByInNode(nodeID);

        for (let i = 0; i < connections.length; i++) {
            if (connections[i].enabled) {
                let node = this.getNodeByID(connections[i].outNodeID);
                total += node.output * connections[i].weight;
            }
        }

        return total;
    }

    mutateConnectionWeights(mutateRate, randomizeRate) { // mutate connection weights according to rates
        for (let i = 0; i < this.connections.length; i++) {
            if (Math.random() <= mutateRate) {
                if (Math.random <= randomizeRate) {
                    this.connections[i].mutateRandom();
                }
                else {
                    this.connections[i].mutateUniform();
                }
            }
        }
    }

    mutateNewConnection() { // adds a connection to two previously unconnected nodes
        let unconnectedNodes = this.getUnconnectedNodePairs();
        if (unconnectedNodes.length == 0) return;

        let mutationIdx = getRandomIntInclusive(0, unconnectedNodes.length - 1); // get a pair of unconnected nodes
        let [inNode, outNode] = unconnectedNodes[mutationIdx];

        let innovationNumber; // determine the innovation number 
        if (this.innovation.doesMutationExist(inNode.ID, outNode.ID)) {
            innovationNumber = this.innovation.getMutationInnovation(inNode.ID, outNode.ID);
        }
        else {
            innovationNumber = this.innovation.value++;
            this.innovation.addMutation(inNode.ID, outNode.ID, innovationNumber);
        }
        this.addConnectionBetween(inNode.ID, outNode.ID, innovationNumber);
    }

    mutateNewNode() { // disable a connection between two connected nodes and inserts new node connected between them
        let connectedNodes = this.getConnectedNodePairs();
        if (connectedNodes.length == 0) return;

        let mutationIdx = getRandomIntInclusive(0, connectedNodes.length - 1);  // get a pair of connected nodes
        let [inNode, outNode] = connectedNodes[mutationIdx];

        let newNodeID = this.nextNodeID + 1;
        let innovationNumber1; // need to find two innovation numbers because we are making two connections
        let innovationNumber2;

        if (this.innovation.doesMutationExist(inNode.ID, newNodeID)) {
            innovationNumber1 = this.innovation.getMutationInnovation(inNode.ID, newNodeID);
        }
        else {
            innovationNumber1 = this.innovation.value++;
            this.innovation.addMutation(inNode.ID, newNodeID, innovationNumber1);
        }

        if (this.innovation.doesMutationExist(newNodeID, outNode.ID)) {
            innovationNumber2 = this.innovation.getMutationInnovation(newNodeID, outNode.ID);
        }
        else {
            innovationNumber2 = this.innovation.value++;
            this.innovation.addMutation(newNodeID, outNode.ID, innovationNumber2);
        }

        this.addNodeBetween(inNode.ID, outNode.ID, innovationNumber1, innovationNumber2);
    }

    addNodeBetween(inNodeID, outNodeID, innovationNumber1, innovationNumber2) { // add a node between two previously connected nodes
        if (!this.areNodesConnected(inNodeID, outNodeID)) {
            return;
        }

        let oldConnection = this.getConnectionBetweenNodes(inNodeID, outNodeID);
        oldConnection.disable(); // disable the old connection

        let newNode = new Node(this.nextNodeID++); // add new node
        this.nodes.push(newNode);

        this.addConnectionBetween(newNode.ID, outNodeID, 1, innovationNumber1); // connect previously connected nodes through newNode
        this.addConnectionBetween(inNodeID, newNode.ID, oldConnection.weight, innovationNumber2); 
    }

    addConnectionBetween(inNodeID, outNodeID, innovationNumber) { // add a connection between two nodes
        if (this.areNodesConnected(inNodeID, outNodeID)) {
            return;
        }

        let newConnection = new Connection(inNodeID, outNodeID, getRandomFloatBetween(-1, 1), innovationNumber);
        this.connections.push(newConnection);
    }

    areNodesConnected(ID1, ID2) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == ID1 && this.connections[i].outNodeID == ID2 ||
                this.connections[i].inNodeID == ID2 && this.connections[i].outNodeID == ID1) {
                return true;
            }
        }
        return false;
    }

    getConnectionBetweenNodes(inNodeID, outNodeID) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == inNodeID && this.connections[i].outNodeID == outNodeID) {
                return this.connections[i];
            }
        }
        return null;
    }

    getConnectionsByInNode(ID) {
        let connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == ID) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    getConnectionsByOutNode(ID) {
        let connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].outNodeID == ID) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    getUnconnectedNodePairs() { // return node pairs (inNode, outNode) that can connect without creating a cycle
        // can probably optimize further, but this works for now
        let nodes = [];
        this.runKahns(); // topologically sort

        for (let i = 0; i < this.nodes.length; i++) { // iterate through unique nodes
            for (let j = i+1; j < this.nodes.length; j++) {
                let node1 = this.nodes[i];
                let node2 = this.nodes[j];

                // do not connect input-input, output-output, bias-input nodes
                if (node1.isInput && node2.isInput || node1.isOutput && node2.isOutput ||
                    node1.isInput && node2.isBias || node1.isBias && node2.isInput) {
                    continue;
                }
                
                if (this.areNodesConnected(node1.ID, node2.ID)) {
                    continue;
                }
                // node with higher index value must be in-node
                if (this.nodes.indexOf(node1) > this.nodes.indexOf(node2)) { 
                    nodes.push([node1, node2]);
                }

                else {
                    nodes.push([node2, node1]);
                }
            }
        }
        return nodes;
    }

    getConnectedNodePairs(filterDisabledNodes) { // return node pairs (inNode, outNode) that are connected.
        let nodes = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (!this.connections[i].enabled && filterDisabledNodes) { // only push disabled connections if specified
                let inNode = this.getNodeByID(this.connections[i].inNodeID);
                let outNode = this.getNodeByID(this.connections[i].outNodeID);
                
                nodes.push([inNode, outNode]);
            }
            else if (this.connections[i].enabled) {
                let inNode = this.getNodeByID(this.connections[i].inNodeID);
                let outNode = this.getNodeByID(this.connections[i].outNodeID);
                nodes.push([inNode, outNode]);
            }
        }

        return nodes;
    }

    getNodeByID(ID) { // get a node object by its ID
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].ID == ID) {
                return this.nodes[i];
            }
        }
        return null;
    }

    getInputNodes() {
        let inputNodes = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].isInput) inputNodes.push(this.nodes[i]);
        }

        inputNodes.sort((a, b) => a.InOutID - b.InOutID);
        return inputNodes;
    }

    getOutputNodes() {
        let outputNodes = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].isOutput) outputNodes.push(this.nodes[i]);
        }

        outputNodes.sort((a, b) => a.InOutID - b.InOutID);
        return outputNodes;
    }

    getBiasNode() {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].isBias) return this.nodes[i];
        }
    }

    runKahns() { // algorithm to topologically sort the network nodes and/or detect cycles
        var convertConnections = function(connections) {
            let newConnections = new Array();
            for (let i = 0; i < connections.length; i++) {
                newConnections.push({inNodeID: connections[i].inNodeID,
                                     outNodeID: connections[i].outNodeID})
            }
            return newConnections;
        }
    
        var getStartingNodes = function(network) {
            let startingNodes = network.getInputNodes()
            startingNodes.push(network.getBiasNode());
            return startingNodes;
        }

        var getConnectedNodesAndEdgeIndeces = function(edges, nodeID) {
            let nodesAndIndeces = [];
            for (let i = 0; i < edges.length; i++) {
                if (edges[i].outNodeID == nodeID) {
                    nodesAndIndeces.push([edges[i].inNodeID, i]);
                }
            }
            nodesAndIndeces.sort((a, b) => b[1] - a[1]);
            return nodesAndIndeces;
        }

        var hasIncomingEdges = function(edges, nodeID) {
            for (let i = 0; i < edges.length; i++) {
                if (edges[i].inNodeID == nodeID) {
                    return true;
                }
            }
            return false;
        }

        var getNodeByID = function(network, ID) {
            for (let i = 0; i < network.nodes.length; i++) {
                if (network.nodes[i].ID == ID) {
                    return network.nodes[i];
                }
            }
        }

        let edges = convertConnections(this.connections);
        let sortedNodes = [];
        let nodesWithNoIncomingEdges = getStartingNodes(this);

        while (nodesWithNoIncomingEdges.length) {
            let n = nodesWithNoIncomingEdges.shift();
            sortedNodes.push(n);

            let connectedNodesAndEdges = getConnectedNodesAndEdgeIndeces(edges, n.ID);
            for (let [m, idx] of connectedNodesAndEdges) {
                edges.splice(idx, 1);
                if (!hasIncomingEdges(edges, m)) {
                    nodesWithNoIncomingEdges.push(getNodeByID(this, m));
                }
            }
        }

        if (edges.length) return false;
        this.nodes = sortedNodes;
        return true;
    }
}