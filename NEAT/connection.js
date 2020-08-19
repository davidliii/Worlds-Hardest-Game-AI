/** 
 * Connection class
 */
class Connection {
    /**
     * Creates a connection
     * @param {Number} inNodeID - Node that the connection is going into
     * @param {Number} outNodeID - Node the that connection is coming out of
     * @param {Number} weight - Weight of the connection
     * @param {Number} innovationNumber - Historical innovation tracking
     */
    constructor(inNodeID, outNodeID, weight, innovationNumber, enabled) {
        this.inNodeID = inNodeID;
        this.outNodeID = outNodeID;
        this.weight = weight;
        this.innovationNumber = innovationNumber;

        this.enabled = enabled;
        
        this.ub = 1;
        this.lb = -1;
    }

    mutateUniform() {
        this.weight += getRandomFloatBetween(this.lb, this.ub) / 5;
        if (this.weight > this.ub) this.weight = this.ub;
        else if (this.weight < this.lb) this.weight = this.lb;
    }

    mutateRandom() {
        this.weight = getRandomFloatBetween(this.lb, this.ub);
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    clone() {
        return new Connection(this.inNodeID, this.outNodeID, this.weight, this.innovationNumber, this.enabled);
    }
}