class Connection {
    constructor(inNodeID, outNodeID, weight, innovationNumber) {
        this.inNodeID = inNodeID;
        this.outNodeID = outNodeID;
        this.weight = weight;
        this.innovationNumber = innovationNumber;

        this.enabled = true;

        this.ub = 1;
        this.lb = -1;
    }

    mutateUniform() {
        this.weight += getRandomFloatBetween(this.ub, this.lb);
        if (this.weight > this.ub) this.weight = this.ub;
        else if (this.weight < this.lb) this.weight = this.lb;
    }

    mutateRandom() {
        this.weight = getRandomFloatBetween(this.ub, this.lb);
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}