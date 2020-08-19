/** 
 *  Class to keep track of and manage innovative mutations through evolution
 */
class Innovation {
    /**
     * Create innovation object
     */
    constructor() {
        this.value = 0;
        this.mutations = [];
    }

    /**
     * Adds a mutation to the innovation history
     * @param {Number} inNodeID - Node that the mutated connection is connecting towards
     * @param {Number} outNodeID - Node that is sending mutated connection
     * @param {Number} innovationNumber - Historical tracking mark of the mutation
     */
    addMutation(inNodeID, outNodeID, innovationNumber) {
        this.mutations.push(new Mutation(inNodeID, outNodeID, innovationNumber));
    }

    /**
     * Determines whether or not a mutation affecting two given nodes exists
     * @param {Number} inNodeID - Node that the mutated connection is connecting towards
     * @param {Number} outNodeID - Node that is sending mutated connection
     * @returns {Boolean} - Whether or not the mutation exists
     */
    doesMutationExist(inNodeID, outNodeID) {
        for (let i = 0; i < this.mutations.length; i++) {
            if (inNodeID == this.mutations[i].inNodeID && outNodeID == this.mutations[i].outNodeID) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns the innovation number that characterizes a specific mutation
     * @param {Number} inNodeID - Node that the mutated connection is connecting towards
     * @param {Number} outNodeID - Node that is sending mutated connection
     * @returns {Number} - Innovation number of the mutation
     */
    getMutationInnovation(inNodeID, outNodeID) {
        for (let i = 0; i < this.mutations.length; i++) {
            if (inNodeID == this.mutations[i].inNodeID && outNodeID == this.mutations[i].outNodeID) {
                return this.mutations[i].innovationNumber;
            }
        }
    }
}

/** 
 *  Class that characterizes mutations
 */
class Mutation {
    /**
     * Create mutation object
     * @param {Number} inNodeID - Node that the mutated connection is connecting towards
     * @param {Number} outNodeID - Node that is sending mutated connection
     * @param {Number} innovationNumber - Historical tracking mark of the mutation
     */
    constructor(inNodeID, outNodeID, innovationNumber) {
        this.inNodeID = inNodeID;
        this.outNodeID = outNodeID;
        this.innovationNumber = innovationNumber
    }
}