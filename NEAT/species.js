/** 
 * Class to contain members of the same species
 * This is where the genetic algorithm mostly takes place
 * (ie killing off lower-performing members, crossover, 
 * mutation handling, etc.)
 */
class Species {
    /**
     * Creates the species. If a representative is provided, species
     * is modeled after it.
     * @param {Network} representative - Representative of the species
     */
    constructor(representative) {
        this.recordFitness = 0;
        this.numGenerationsSinceImprovement = 0

        this.distanceThreshold = 3.0;
        this.disjointCoefficient = 1.0;
        this.excessCoefficient = 1.0;
        this.matchingWeightDifferenceCoefficient = 0.4;
        this.disableRate = 0.75;

        this.members = [];
        this.champion = null;
        this.representative = representative;

        if (representative) {
            this.members.push(representative);
            this.champion = representative;
        }
    }

    /**
     * Sets the representative of this species and empties rest of this.members
     * @returns {Network[]} - Remaining members of the species
     */
    prepareForSpeciation() {
        let randomIdx = getRandomIntInclusive(0, this.members.length - 1);
        this.representative  = this.members.splice(randomIdx, 1)[0]; // remove representative from members

        let leftOver = [];
        while (this.members.length) { // empty out rest of members
            leftOver.push(this.members.pop())
        }

        this.members.push(this.representative) // reintroduce representative to members
        this.setChampion();
        return leftOver;
    }

    /**
     * Removes the bottom performing members of the species
     * If species has 5 of less members, then they all live
     */
    eliminateBadMembers() {
        this.sortMembers();

        if (this.members.length <= 5) return;

        let numDesired = Math.ceil(this.members.length / 2);
        while (this.members.length > numDesired) {
            this.members.pop();
        }
    }

    /**
     * Produces new members by crossing old members and adds them to the species 
     * until the number of members in the population equals numMembers. 
     * no reproduction occurs
     */
    repopulate(numMembers) {
        let newMembers = [];

        // keep a copy of the champion
        if (this.members.length >= 5) {
            this.setChampion();
            newMembers.push(this.champion);
        }
        
        let maxParentIdx = this.members.length - 1;

        // 25% of next generation are mutated old members
        while (newMembers.length < numMembers * 0.25) {
            let child = this.members[getRandomIntInclusive(0, maxParentIdx)].clone();
            child.mutateNetwork();
            newMembers.push(child)
        }

        while (newMembers.length < numMembers) {
            let parent1 = this.members[getRandomIntInclusive(0, maxParentIdx)];
            let parent2 = this.members[getRandomIntInclusive(0, maxParentIdx)];

            let child = this.makeChild(parent1, parent2);
            child.mutateNetwork();
            newMembers.push(child);
        }

        this.members = newMembers;
        this.setChampion();
    }

    /**
     * Calculates the adjusted fitness of the entire species
     */
    getSpeciesFitness() {
        let total = 0;
        for (let i = 0; i < this.members.length; i++) {
            total += this.members[i].fitness;
        }

        return total / this.members.length;
    }

    /**
     * Produces a new member by crossing old members and adds it to the species
     * @param {Network} parent1 - first parent
     * @param {Network} parent2 - second parent
     * @returns {Network} - child as a result of crossing parent 1 with parent 2
     */
    makeChild(parent1, parent2) {
        let isFitnessEqual = parent1.fitness == parent2.fitness;
        let betterParentIdx = parent1.fitness > parent2.fitness? 0 : 1;

        let matchingConnections = this.getMatchingConnections(parent1, parent2);
        let disjointConnections = this.getDisjointConnections(parent1, parent2);
        let excessConnections = this.getExcessConnections(parent1, parent2);

        let childConnections = [];

        for (let i = 0; i < matchingConnections.length; i++) {
            // inherit matching genes randomly
            let connection = matchingConnections[i][getRandomIntInclusive(0, 1)].clone();
            if (matchingConnections[i][0].enabled == false || matchingConnections[i][1].enabled == false) {
                if (Math.random() <= this.disableRate) {
                    connection.disable();
                }
            }
            childConnections.push(connection);
        }

        for (let i = 0; i < disjointConnections.length; i++) {
            // always inherit disjoint connections from more fit parent
            if (!isFitnessEqual) {
                if (disjointConnections[i][betterParentIdx] != null) {
                    childConnections.push(disjointConnections[i][betterParentIdx].clone());
                }
            }

            // inherit randomly if parents have equal fitness
            else {
                let connection = disjointConnections[i][getRandomIntInclusive(0, 1)];
                if (connection != null) childConnections.push(connection.clone());
            }
        }

        for (let i = 0; i < excessConnections.length; i++) {
            // always inherit disjoint connections from more fit parent
            if (!isFitnessEqual) {
                if (excessConnections[i][betterParentIdx] != null) {
                    childConnections.push(excessConnections[i][betterParentIdx].clone());
                }
            }

            // inherit randomly if parents have equal fitness
            else {
                let connection = excessConnections[i][getRandomIntInclusive(0, 1)];
                if (connection != null) childConnections.push(connection.clone());
            }
        }

        // make nodes
        let childNodeNumbers = [];
        let childNodes = [];
        for (let i = 0; i < childConnections.length; i++) {
            if (!childNodeNumbers.includes(childConnections[i].inNodeID)) {
                childNodeNumbers.push(childConnections[i].inNodeID);
                childNodes.push(new Node(childConnections[i].inNodeID));
            }

            if (!childNodeNumbers.includes(childConnections[i].outNodeID)) {
                childNodeNumbers.push(childConnections[i].outNodeID);
                childNodes.push(new Node(childConnections[i].outNodeID));
            }
        }

        let child = new Network(parent1.numInputs, parent1.numOutputs, parent1.innovation);
        child.inputNodes = [];
        child.outputNodes = [];
        child.biasNode = null;
        child.nextNodeID = Math.max(...childNodeNumbers) + 1;

        child.connections = childConnections;
        child.nodes = childNodes;

        for (let i = 0; i < child.nodes.length; i++) {
            if (child.nodes[i].ID < child.numInputs) {
                child.nodes[i].isInput = true;
                child.inputNodes.push(child.nodes[i])
            }

            else if (child.nodes[i].ID < child.numInputs + child.numOutputs) {
                child.nodes[i].isOutput = true;
                child.outputNodes.push(child.nodes[i])
            }

            else if (child.nodes[i].ID == child.numInputs + child.numOutputs) {
                child.nodes[i].isBias = true;
                child.biasNode = child.nodes[i];
            }
        }

        child.sortNodes();
        child.sortConnections();

        return child;
    }

    /**
     * Determines if input network is compatible with this species
     * @param {Network} member - Member to be compared with species representative
     * @returns {Boolean} - Whether or not member is compatible with species
     */
    isCompatible(member) {
        let distance = this.calcDistance(member, this.representative);
        return distance >= this.distanceThreshold? false : true;
    }

    /**
     * Compute the genetic distance between two members
     * @param {Network} member1 - First member
     * @param {Network} member1 - Second member
     * @returns {Number} - Distance between members
     */
    calcDistance(member1, member2) {
        member1.sortConnections();
        member2.sortConnections();

        let numGenes = Math.max(member1.connections.length, member2.connections.length);
        if (numGenes < 20) {
            numGenes = 1;
        }

        let matchingConnections = this.getMatchingConnections(member1, member2);
        let matchingWeightDifference = 0;
        for (let i = 0; i < matchingConnections.length; i++) {
            let weight1 = matchingConnections[i][0].weight;
            let weight2 = matchingConnections[i][1].weight;
            matchingWeightDifference += Math.abs(weight1 - weight2);
        }

        let numDisjoint = this.getDisjointConnections(member1, member2).length;
        let numExcess = this.getExcessConnections(member1, member2).length;

        return matchingWeightDifference * this.matchingWeightDifferenceCoefficient / numGenes + 
        numDisjoint * this.disjointCoefficient + numExcess * this.excessCoefficient;
    }

    /**
     * Get a list of matching connection pairs between two networks
     * @param {Network} member1 - First member
     * @param {Network} member1 - Second member
     * @returns {[Connection, Connection] []} - List of matching connection pairs
     */
    getMatchingConnections(member1, member2) {
        let matchingConnections = [];

        let m1Idx = 0;
        let m2Idx = 0;
        let m1Bound = member1.connections.length;
        let m2Bound = member2.connections.length;

        while (true) {
            let connection1 = member1.connections[m1Idx];
            let connection2 = member2.connections[m2Idx];

            if (connection1.innovationNumber == connection2.innovationNumber) {
                matchingConnections.push([connection1, connection2]);
                m1Idx++;
                m2Idx++;
            }

            else if (connection1.innovationNumber > connection2.innovationNumber) {
                m2Idx++;
            }

            else if (connection2.innovationNumber > connection1.innovationNumber) {
                m1Idx++;
            }


            if (m1Idx >= m1Bound || m2Idx >= m2Bound) {
                break;
            }
        }

        return matchingConnections;
    }

    /**
     * Get a list of excess connection pairs between two networks. One element in the pair will always be null
     * @param {Network} member1 - First member
     * @param {Network} member1 - Second member
     * @returns {[Connection, Connection] []} - List of excess connection pairs
     */
    getExcessConnections(member1, member2) {
        let member1MaxInnovation = member1.connections[member1.connections.length - 1].innovationNumber;
        let member2MaxInnovation = member2.connections[member2.connections.length - 1].innovationNumber;

        if (member1MaxInnovation == member2MaxInnovation) {
            return [];
        }

        let threshold = Math.min(member1MaxInnovation, member2MaxInnovation);
        let [idx, excessMember] = member1MaxInnovation > member2MaxInnovation? [0, member1] : [1, member2];

        let excessConnections = [];
        for (let i = excessMember.connections.length - 1; i >= 0; i--) {
            if (excessMember.connections[i].innovationNumber > threshold) {
                if (idx == 0) excessConnections.push([excessMember.connections[i], null])
                else excessConnections.push([null, excessMember.connections[i]])
            }

            else {
                break;
            }
        }
        return excessConnections;
    }

    /**
     * Get a list of disjoint connection pairs between two networks. One element in the pair will always be null
     * @param {Network} member1 - First member
     * @param {Network} member1 - Second member
     * @returns {[Connection, Connection] []} - List of disjoint connection pairs
     */
    getDisjointConnections(member1, member2) {
        let member1MaxInnovation = member1.connections[member1.connections.length - 1].innovationNumber;
        let member2MaxInnovation = member2.connections[member2.connections.length - 1].innovationNumber;

        let threshold = Math.min(member1MaxInnovation, member2MaxInnovation);
        let disjointConnections = [];

        for (let i = 0; i < member1.connections.length; i++) {
            let innovationNumber = member1.connections[i].innovationNumber;
            if (innovationNumber <= threshold) {
                if (member2.getConnectionByInnovationNumber(innovationNumber) == null) {
                    disjointConnections.push([member1.connections[i], null])
                }
            }
            else {
                break;
            }
        }

        for (let i = 0; i < member2.connections.length; i++) {
            let innovationNumber = member2.connections[i].innovationNumber;
            if (innovationNumber <= threshold) {
                if (member1.getConnectionByInnovationNumber(innovationNumber) == null) {
                    disjointConnections.push([null, member2.connections[i]])
                }
            }
            else {
                break;
            }
        }

        return disjointConnections;
    }

    /**
     * Determines the champion of the species
     */
    setChampion() {
        this.sortMembers();
        if (this.members.length) this.champion = this.members[0];
        else this.champion = null;
    }

    /**
     * Sorts members in order of decreasing fitness
     */
    sortMembers() {
        this.members.sort((a, b) => b.fitness - a.fitness);
    }

    /**
     * Adds a member into the species
     */
    addMember(member) {
        this.members.push(member);
    }
}