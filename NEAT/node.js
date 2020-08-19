class Node {
    constructor(ID) {
        this.ID = ID;
        this.output = 0;
        this.activation = this.identity; // testing

        // special parameters for input/output neurons
        this.isInput = false;
        this.isOutput = false;
        this.isBias = false;
        this.InOutID = null;
    }

    activate(input) {
        return this.activation(input);
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
}