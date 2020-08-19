/** 
 * Node class
 */
class Node {
    /**
     * Creates a node
     * @param {Number} ID - Node number
     */
    constructor(ID) {
        this.ID = ID;
        this.output = 0;
        this.activation = this.modifiedSigmoid; // testing

        // special parameters for input/output neurons only
        this.isInput = false;
        this.isOutput = false;
        this.isBias = false;
    }

    /**
     * Sets the output of the node
     * @param {Number} input - Input value
     */
    activate(input) {
        this.output = this.activation(input);
    }

    // activation functions
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    u_step(x) {
        return x < 0? 0 : 1;
    }
    
    tanh(x) {
        return Math.tanh(x);
    }
    
    reLU(x) {
        return Math.max(0, x);
    }
    
    identity(x) {
        return x;
    }

    modifiedSigmoid(x) { // phi function used in stantley's research paper
        return 1 / (1 + Math.exp(-4.9 * x));
    }

    clone() {
        let node = new Node(this.ID);
        node.isInput = this.isInput;
        node.isOutput = this.isOutput;
        node.isBias = this.isBias;
        return node;
    }
}