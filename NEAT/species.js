class Species {
    constructor() {
        this.members = [];
        this.highestFitness = 0;
        this.numGenerationsSinceImprovement = 0;
    }

    createNextGeneration(speciesSize, disableRate) {
        // if species has more than 5 members, keep the champion for the next generation
        let newMembers = [];
        if (this.members.length > 5) {
            newMembers.push(this.getBestMember())
        }

        this.kill(); // kill off members

        // repopulate until we meet the size quota
        let maxParentIdx = this.members.length - 1;
        while (newMembers.length < speciesSize) {
            let parent1 = this.members[getRandomIntInclusive(0, maxParentIdx)];
            let parent2 = this.members[getRandomIntInclusive(0, maxParentIdx)];

            newMembers.push(this.crossParents(parent1, parent2, disableRate));
        }

        // assign new members of the species
        this.members = newMembers;
    }

    kill() {
        // remove bottom half of the species (if species has 5 or less members, do not kill)
        let numMembers = this.members.length;
        if (numMembers <= 5) {
            return;
        }

        this.sortMembers();
        while (this.members.length > Math.floor(numMembers / 2)) {
            this.members.pop();
        }
    }

    getAdjustedFitness(f) {
        return f / this.members.length;
    }

    getSpeciesFitness() {
        let fitness = 0;
        for (let i = 0; i < this.members.length; i++) {
            fitness += this.getAdjustedFitness(this.members[i].fitness);
        }
        return fitness;
    }

    sortMembers() { // sort members in order of descending fitness
        this.members.sort((a, b) => b.fitness - a.fitness);
    }

    getBestMember() {
        let bestFitness = 0;
        let bestMemberIdx = -1;

        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].fitness > bestFitness) {
                bestFitness = this.members[i].fitness;
                bestMemberIdx = i;
            }
        }

        return bestMemberIdx != -1? this.members[bestMemberIdx] : null;
    }

    extractRandomMember() { // removes a random member from the species
        let randomIdx = getRandomIntInclusive(0, this.members.length - 1);
        return this.members.splice(randomIdx, 1)[0];
    }

    extractAllMembers() { // removes all members from species and returns them
        let members = [];
        
        while (this.members.length) {
            members.push(this.members.pop());
        }
        return members;
    }

    extractMember(member) { // removes a specific member from the species
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i] == member) {
                return this.members.slice(i, 1);
            }
        }
        return null;
    }

    crossParents(p1, p2, disableRate) { // makes babies
        p1.sortConnections(); p2.sortConnections();
        [p1, p2] = p1.fitness > p2.fitness? [p1, p2] : [p2, p1]; // p1 represents more fit parent
        let areParentsEquallyFit = p1.fitness == p2.fitness;

        let p1Idx = 0; // connection pointers
        let p2Idx = 0;
        let maxInnovation = p1.innovation.value - 1;

        let childConnections = [];

        for (let i = 0; i <= maxInnovation; i++) {
            if (p1.connections[p1Idx].innovationNumber == i && p2.connections[p2Idx].innovationNumber == i) { // matching gene
                // choose random parent to inherit gene
                let pConnection = getRandomBool()? p1.connections[p1Idx] : p2.connections[p2Idx];
                
                // random disable the gene if it is disabled in either parent
                let isEnabled = true;
                if (!p1.connections[p1Idx].enabled || !p2.connections[p2Idx].enabled) {
                    if (Math.random() <= disableRate) isEnabled = false;
                }

                childConnections.push(this.createChildConnection(pConnection, isEnabled)); // create and add child gene
                p1Idx++; p2Idx++;
            }

            else if (p1.connections[p1Idx].innovationNumber == i || p2.connections[p2Idx].innovationNumber == i) { // disjoint/excess
                let isP1 = p1.connections[p1Idx].innovationNumber == i? true : false; // flag
                // inherit gene from the fitter parent (p1)
                let shouldInherit = isP1;
                // if parents are equally fit, then inherit randomly
                if (areParentsEquallyFit) {
                   shouldInherit = getRandomBool();
                }

                if (shouldInherit) {
                    let pConnection = isP1? p1.connections[p1Idx] : p2.connections[p2Idx];
                    let isEnabled = true;
                    if (!pConnection.enabled) {
                        if (Math.random() <= disableRate) isEnabled = false;
                    }

                    childConnections.push(this.createChildConnection(pConnection, isEnabled));
                }

                if (isP1) p1Idx++;
                else p2Idx++;
            }

            else { // gene not present in either parent
                p1Idx++; p2Idx++
            }
        }

        let child = this.makeChild(childConnections, p1.innovation, p1.numInputs, p1.numOutputs);
        return child;
    }

    createChildConnection(pConnection, isEnabled) { // creating a child connection
        let cConnection = new Connection(pConnection.inNodeID, pConnection.outNodeID, pConnection.weight, pConnection.innovationNumber);
        cConnection.enabled = isEnabled;
        return cConnection;
    }

    makeChild(childConnections, innovation, numInputs, numOutputs) {
        let innovationValue = innovation.value;
        let child = new Network(numInputs, numOutputs, innovation); // create network

        for (let i = 0; i < childConnections.length; i++) {
            let inNodeID = childConnections[i].inNodeID;
            let outNodeID = childConnections[i].outNodeID;

            if (child.getNodeByID(inNodeID) == null) { // update the nodes
                child.nodes.push(new Node(inNodeID));
            }
            if (child.getNodeByID(outNodeID) == null) {
                child.nodes.push(new Node(outNodeID));
            }
        }
        innovation.value = innovationValue;
        child.connections = childConnections; // update the connections
        child.formatNetwork();
        return child;
    }
}