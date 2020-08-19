class Innovation {
    constructor() {
        this.value = 0;
        this.mutationsMadeThisGeneration = [];
    }

    doesMutationExist(inNodeID, outNodeID) {
        for (let i = 0; i < this.mutationsMadeThisGeneration.length; i++) {
            if (inNodeID == this.mutationsMadeThisGeneration[i].inNodeID && 
                outNodeID == this.mutationsMadeThisGeneration[i].outNodeID) {
                return true;
            }
        }
        return false;
    }

    clearMutations() {
        this.mutationsMadeThisGeneration = [];
    }

    getMutationInnovation(inNodeID, outNodeID) {
        for (let i = 0; i < this.mutationsMadeThisGeneration.length; i++) {
            if (inNodeID == this.mutationsMadeThisGeneration[i].inNodeID && 
                outNodeID == this.mutationsMadeThisGeneration[i].outNodeID) {
                return this.mutationsMadeThisGeneration[i].innovationNumber;
            }
        }
        return -1;
    }

    addMutation(inNodeID, outNodeID, innovationNumber) {
        let mutation = new Mutation(inNodeID, outNodeID, innovationNumber);
        this.mutationsMadeThisGeneration.push(mutation);
    }
}

class Mutation {
    constructor(inNodeID, outNodeID, innovationNumber) {
        this.inNodeID = inNodeID;
        this.outNodeID = outNodeID;
        this.innovationNumber = innovationNumber; // list of innovation numbers associated with change (1 in case of connection, 2 in case node)
    }
}