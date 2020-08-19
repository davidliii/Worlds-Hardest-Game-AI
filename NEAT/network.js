/** 
 * Network class
 */
class Network {
    /**
     * Create network
     * @param {Number} numInputs - Number of inputs to the neural network (excluding bias)
     * @param {Number} numOutputs - Number of outputs to the neural network
     * @param {Innovation} innovation - Innovation class
     */
    constructor(numInputs, numOutputs, innovation) {
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.innovation = innovation;

        this.nodes = [];
        this.inputNodes = [];
        this.outputNodes = [];
        this.biasNode = null;
        this.connections = [];

        this.nextNodeID = 0;
        this.fitness = 0;

        this.newNodeMutationRate = 0.03; // rate of adding new nodes
        this.newConnectionMutationRate = 0.05; // rate of adding new connections
        this.weightMutationRate = 0.8; // rate of mutating weights
        this.randomizeWeightRate = 0.1; // if mutating weights, rate of setting a random weight

        for (let i = 0; i < numInputs; i++) {
            let node = new Node(this.nextNodeID++);
            node.isInput = true;
            node.InOutID = i;
            this.nodes.push(node);
            this.inputNodes.push(node);
        }

        for (let i = 0; i < numOutputs; i++) { 
            let node = new Node(this.nextNodeID++);
            node.isOutput = true;
            node.InOutID = i;
            this.nodes.push(node)
            this.outputNodes.push(node);
        }

        let biasNode = new Node(this.nextNodeID++);
        biasNode.isBias = true;
        this.nodes.push(biasNode);
        this.biasNode = biasNode;

        for (let i = 0; i < this.inputNodes.length; i++) {
            for (let j = 0; j < this.outputNodes.length; j++) {
                let inNodeID = this.outputNodes[j].ID;
                let outNodeID = this.inputNodes[i].ID;
                let weight = getRandomFloatBetween(-1.0, 1.0);

                let innovationNumber;
                if (innovation.doesMutationExist(inNodeID, outNodeID)) {
                    innovationNumber = innovation.getMutationInnovation(inNodeID, outNodeID);
                }
                else {
                    innovationNumber = innovation.value++;
                    innovation.addMutation(inNodeID, outNodeID, innovationNumber);
                }

                let connection = new Connection(inNodeID, outNodeID, weight, innovationNumber, true);
                this.connections.push(connection);
            }
        }

        for (let i = 0; i < this.outputNodes.length; i++) {
            let inNodeID = this.outputNodes[i].ID;
            let outNodeID = biasNode.ID
            let weight = getRandomFloatBetween(-1.0, 1.0);

            let innovationNumber;
            if (innovation.doesMutationExist(inNodeID, outNodeID)) {
                innovationNumber = innovation.getMutationInnovation(inNodeID, outNodeID);
            }
            else {
                innovationNumber = innovation.value++;
                innovation.addMutation(inNodeID, outNodeID, innovationNumber);
            }
            let connection = new Connection(inNodeID, outNodeID, weight, innovationNumber, true);
            this.connections.push(connection);
        }
    }

    clone() {
        let clone = new Network(this.numInputs, this.numOutputs, this.innovation);
        clone.nodes = [];
        clone.connections = [];
        clone.inputNodes = [];
        clone.outputNodes = [];
        clone.biasNode = null;

        for (let i = 0; i < this.nodes.length; i++) {
            let clonedNode = this.nodes[i].clone();
            if (clonedNode.isInput) clone.inputNodes.push(clonedNode);
            if (clonedNode.isOutput) clone.outputNodes.push(clonedNode);
            if (clonedNode.isBias) clone.biasNode = clonedNode;
            clone.nodes.push(clonedNode);
        }

        for (let i = 0; i < this.connections.length; i++) {
            clone.connections.push(this.connections[i].clone());
        }

        return clone;
    }

    /**
     * Convert network metadata to string format which can be logged
     */
    data() {
        let nodeMsg = 'Nodes:\n'
        for (let i = 0; i < this.nodes.length; i++) {
            nodeMsg += 'ID: ' + String(this.nodes[i].ID) + '\n'
        }

        let connectionMsg = '\nConnections:\n'
        for (let i = 0; i < this.connections.length; i++) {
            connectionMsg += 'Innovation #' + String(this.connections[i].innovationNumber) + 
            ' From ' + String(this.connections[i].outNodeID) + ' to ' + String(this.connections[i].inNodeID) +
            ' (Enabled: ' + String(this.connections[i].enabled)[0] + ')' +  ' weight: ' + String(this.connections[i].weight.toFixed(5)) + '\n'
        }

        let msg = '' + nodeMsg + connectionMsg;
        return msg;
    }

    //#region NETWORK EVALUATION
    /**
     * Evaluate network output 
     * @param {Number[]} inputValues - Values to be outputed by this.inputNodes
     * @returns {Number[]} - Values of the this.outputNodes 
     */
    evaluate(inputValues) {
        this.sortNodes();

        for (let i = 0; i < inputValues.length; i++) {
            this.inputNodes[i].output = inputValues[i];
        }

        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node.isBias) node.output = 1;
            else if (!node.isInput) node.activate(this.sumIncomingOutputs(node.ID));
        }

        let outputValues = [];
        for (let i = 0; i < this.outputNodes.length; i++) {
            outputValues.push(this.outputNodes[i].output);
        }
        return outputValues;
    }

    /**
     * Evaluate network output and return the index of the output node with the max value
     * @param {Number[]} inputValues - Values to be outputed by this.inputNodes
     * @returns {Number} - Index of output argmax
     */
    evaluateArgMax(inputValues) {
        let output = this.evaluate(inputValues)
        return output.indexOf(Math.max(...output));
    }

    /**
     * For a given in-node, compute the sum of outputs of its out-nodes
     * @param {Number} nodeID - In-node of interest
     */
    sumIncomingOutputs(nodeID) {
        let connections = this.getConnectionsByInNode(nodeID);

        let total = 0;
        for (let i = 0; i < connections.length; i++) {
            if (connections[i].enabled) {
                let node = this.getNodeByID(connections[i].outNodeID);
                total += node.output * connections[i].weight;
            }
        }
        return total;
    }
    //#endregion 

    //#region DATA STRUCTURE MANAGEMENT

    /**
     * Performs topological sorting on the nodes of the network to determine order of evaluation.
     * Also sorts input and output nodes accordingly
     */
    sortNodes() {
        var convertConnections = function(connections) {
            let newConnections = new Array();
            for (let i = 0; i < connections.length; i++) {
                newConnections.push({inNodeID: connections[i].inNodeID,
                                     outNodeID: connections[i].outNodeID})
            }
            return newConnections;
        }
    
        var getStartingNodes = function(network) {
            let startingNodes = [];
            for (let i = 0; i < network.inputNodes.length; i++) {
                startingNodes.push(network.inputNodes[i]);
            }
            startingNodes.push(network.biasNode);
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

        this.inputNodes.sort((a, b) => a.ID - b.ID);
        this.outputNodes.sort((a, b) => a.ID - b.ID);
        return true;
    }

    /**
     * Sorts network connections in order of increasing innovation number
     */
    sortConnections() {
        this.connections.sort((a, b) => a.innovationNumber - b.innovationNumber)
    }

    /**
     * Determines if two nodes given by ID1, ID2 are connected
     * @param {Number} ID1 - ID of first node
     * @param {Number} ID2 - ID of second node
     * @returns {Boolean} - Whether or not the nodes are connected
     */
    areNodesConnected(ID1, ID2) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == ID1 && this.connections[i].outNodeID == ID2 ||
                this.connections[i].inNodeID == ID2 && this.connections[i].outNodeID == ID1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retrieves the connection object between two nodes
     * @param {Number} inNodeID - ID of in-node
     * @param {Number} outNodeID - ID of out-node
     * @returns {Connection} - Connection between the two nodes
     */
    getConnectionBetweenNodes(inNodeID, outNodeID) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == inNodeID && this.connections[i].outNodeID == outNodeID) {
                return this.connections[i];
            }
        }
        return null;
    }

    /**
     * Finds all connections with a common in-node
     * @param {Number} ID - ID of in-node
     * @returns {Connection []} - Array of connections 
     */
    getConnectionsByInNode(ID) {
        let connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].inNodeID == ID) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    /**
     * Finds all connections with a common out-node
     * @param {Number} ID - ID of out-node
     * @returns {Connection []} - Array of connections 
     */
    getConnectionsByOutNode(ID) {
        let connections = [];
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].outNodeID == ID) {
                connections.push(this.connections[i]);
            }
        }
        return connections;
    }

    /**
     * Finds all connections with a common out-node
     * @param {Number} innovationNumber - Innovation Number
     * @returns {Connection} - Connection with matching innovation number
     */
    getConnectionByInnovationNumber(innovationNumber) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].innovationNumber == innovationNumber) {
                return this.connections[i]
            }
        }
        return null;
    }

    /**
     * Returns all node object pairs [inNode, outNode] that can connect without creating a cycle
     * @returns {[Node, Node] []} - Array of unconnected node pairs that can be connected
     */
    getUnconnectedNodePairs() {
        let nodes = [];
        this.sortNodes(); // topologically sort

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
                // since node2 is at at least index i+1, it must be the in-node
                nodes.push([node2, node1]); 
            }
        }
        return nodes;
    }

    /**
     * Returns all connected node object pairs [inNode, outNode]
     * @param {Boolean} includeDisabledConnections - If set to true, then nodes with disable connections are also included
     * @returns {[Node, Node] []} - Array of unconnected node pairs that can be connected
     */
    getConnectedNodePairs(includeDisabledConnections) {
        let nodes = [];
        for (let i = 0; i < this.connections.length; i++) {
            // push if connection is either 1. enabled or 2. disabled but includeDisabledConnections is true
            if (this.connections[i].enabled || (!this.connections[i].enabled && includeDisabledConnections)) {
                let inNode = this.getNodeByID(this.connections[i].inNodeID);
                let outNode = this.getNodeByID(this.connections[i].outNodeID);
                nodes.push([inNode, outNode]);
            }
        }
        return nodes;
    }

    /**
     * Returns node object with corresponding ID
     * @param {Number} ID - ID of desired node
     * @returns {Node} - Corresponing Node object
     */
    getNodeByID(ID) { // get a node object by its ID
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].ID == ID) {
                return this.nodes[i];
            }
        }
        return null;
    }
    //#endregion

    //#region MUTATIONS

    mutateNetwork() {
        for (let i = 0; i < this.connections.length; i++) {
            if (Math.random() <= this.weightMutationRate) {
                if (Math.random() <= this.randomizeRate) {
                    this.connections[i].mutateRandom();
                }
                else {
                    this.connections[i].mutateUniform();
                }
            }
        }

        if (Math.random() <= this.newNodeMutationRate) {
            this.mutateNewNode();
        }

        if (Math.random() <= this.newConnectionMutationRate) {
            this.mutateNewConnection();
        }
    }

    /**
     * Mutates connection weights according to specified rates
     * @param {Number} mutateRate - Probability of a connection weight being mutated
     * @param {Number} randomizeRate - Probability that the mutation will randomize the weight (otherwise only perturbed)
     */
    mutateConnectionWeights(mutateRate, randomizeRate) {
        for (let i = 0; i < this.connections.length; i++) {
            if (Math.random() <= mutateRate) {
                if (Math.random <= randomizeRate) this.connections[i].mutateRandom();
                else this.connections[i].mutateUniform();
            }
        }
    }

    /**
     * Mutates a new connection between two previously unconnected nodes
     */
    mutateNewConnection() {
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

        this.addConnectionBetween(inNode.ID, outNode.ID, getRandomFloatBetween(-1, 1), innovationNumber);
    }

    /**
     * Mutates a new node and connects it between two previously connected nodes, while disabling the old connection
     */
    mutateNewNode() {
        let connectedNodes = this.getConnectedNodePairs();
        if (connectedNodes.length == 0) return;

        let mutationIdx = getRandomIntInclusive(0, connectedNodes.length - 1); // get a pair of connected nodes
        let [inNode, outNode] = connectedNodes[mutationIdx];

        let newNodeID = this.nextNodeID;
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

    /**
     * Adds a connecting node between nodes denoted by inNodeID and outNodeID
     * @param {Number} inNodeID - Former in-node 
     * @param {Number} outNodeID - Former out-node
     * @param {Number} innovationNumber1 - innovation number of the connection between in-node and the new node (new -> in)
     * @param {Number} innovationNumber2 - innovation number of the connection between out-node and the new node (out -> new)
     */
    addNodeBetween(inNodeID, outNodeID, innovationNumber1, innovationNumber2) {
        if (!this.areNodesConnected(inNodeID, outNodeID)) {
            return;
        }

        let oldConnection = this.getConnectionBetweenNodes(inNodeID, outNodeID);
        oldConnection.disable(); // disable the old connection

        let newNode = new Node(this.nextNodeID++); // add new node
        this.nodes.push(newNode);

        this.addConnectionBetween(inNodeID, newNode.ID, oldConnection.weight, innovationNumber1); 
        this.addConnectionBetween(newNode.ID, outNodeID, 1, innovationNumber2);

    }

    /**
     * Adds a connection between inNodeID and outNodeID
     * @param {Number} inNodeID - In-node's ID
     * @param {Number} outNodeID - out-node's ID 
     * @param {Number} weight - weight of the connection
     * @param {Number} innovationNumber - innovation number of the connection
     */
    addConnectionBetween(inNodeID, outNodeID, weight, innovationNumber) {
        if (this.areNodesConnected(inNodeID, outNodeID)) {
            return;
        }
        let newConnection = new Connection(inNodeID, outNodeID, weight, innovationNumber, true);
        this.connections.push(newConnection);
    }
    //#endregion

}