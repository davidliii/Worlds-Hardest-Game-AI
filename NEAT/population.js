class Population {
    constructor(numMembers, numInputs, numOutputs, innovation) {
        this.numMembers = numMembers;
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.innovation = innovation;

        this.generationsBeforeExtinct = 5;

        this.newNodeMutationRate = 0.03; // rate of adding new nodes
        this.newConnectionMutationRate = 0.05; // rate of adding new connections
        this.weightMutationRate = 0.8; // rate of mutating weights
        this.randomizeWeightRate = 0.1; // if mutating weights, rate of setting a random weight
        this.disableRate = 0.75; // rate at which a inherited gene is disabled if parent's gene was disabled

        this.c1 = 1.0; // excess genes weight
        this.c2 = 1.0; // disjoint genes weight
        this.c3 = 0.4 // weight differences in matching genes
        this.dt = 3.0 // specitation distance threshold

        this.interspeciesMatingrate = 0.001; // probability of members from different species crossing

        this.species = [new Species()];

        this.members = [];
    
        this.initializePopulation();
    }

    initializePopulation() {
        for (let i = 0; i < this.numMembers; i++) {
            this.innovation.value = 0;
            let member = new Network(this.numInputs, this.numOutputs, this.innovation);
            this.species[0].members.push(member);
        }
    }

    createNextGeneration() {
        // remove the bottom-performing members
        // reproduce and mutate the members of each species sequentially until numMembers quota is met
        this.speciate(); // seperate current members into species

        // get rid of the species that are not improving
        for (let i = this.species.length - 1; i >= 0; i--) { // iterating backwards because we may delete some species
            let thisGenFitness = this.species[i].getSpeciesFitness();
            if (thisGenFitness <= this.species[i].highestFitness) { // did not improve
                this.species[i].numGenerationsSinceImprovement++;
            }

            else { // improvement made
                this.species[i].highestFitness = thisGenFitness;
                this.species[i].numGenerationsSinceImprovement = 0
            }

            if (this.species[i].numGenerationsSinceImprovement >= this.generationsBeforeExtinct) {
                this.species.splice(i, 1); // remove species since it failed to improve
            }
        }

        // // determine size for each species
        let totalFitness = 0;
        for (let i = 0; i < this.species.length; i++) {
            totalFitness += this.species[i].highestFitness;
        }

        // kill off and repopulate next generation
        for (let i = 0; i < this.species.length; i++) {
            let speciesSize = Math.ceil(this.species[i].highestFitness / totalFitness * this.numMembers);
            this.species[i].createNextGeneration(speciesSize, this.disableRate);
        }

        // mutations
        for (let i = 0; i < this.species.length; i++) {
            for (let j = 0; j < this.species[i].members.length; j++) {
                if (Math.random() <= this.newNodeMutationRate) {
                    this.species[i].members[j].mutateNewNode();
                }
                if (Math.random() <= this.newConnectionMutationRate) {
                    this.species[i].members[j].mutateNewConnection();
                }
                this.species[i].members[j].mutateConnectionWeights(this.weightMutationRate, this.randomizeWeightRate);
                this.species[i].members[j].formatNetwork();
            }
        }
    }

    calcDistance(m1, m2) {
        let E = 0; // number of excess genes
        let D = 0; // number of disjoint genes
        let W = 0; // sum of weight differences between matching genes
        let N = Math.max(m1.connections.length, m2.connections.length); // max genome size
        if (N < 20) {
            N = 1
        }

        m1.sortConnections();
        m2.sortConnections();

        let m1Innovation = m1.connections[m1.connections.length - 1].innovationNumber;
        let m2Innovation = m2.connections[m2.connections.length - 1].innovationNumber;

        let maxInnovation = Math.max(m1Innovation, m2Innovation);
        let m1Idx = 0;
        let m2Idx = 0;

        for (let i = 0; i <= maxInnovation; i++) {
            if (m1.connections[m1Idx].innovationNumber == i && m2.connections[m2Idx].innovationNumber == i) { // matching gene
                W += Math.abs(m1.connections[m1Idx].weight - m2.connections[m2Idx].weight)
                m1Idx++; m2Idx++;
            }

            else if (m1.connections[m1Idx].innovationNumber == i) {
                if (m1.connections[m1Idx].innovationNumber > m2Innovation) E++;
                else D++;
                m1Idx++;
            }

            else if (m2.connections[m2Idx].innovationNumber == i) {
                if (m2.connections[m2Idx].innovationNumber > m1Innovation) E++;
                else D++;
                m2Idx++;
            }

            else { // gene not present in either parent
                m1Idx++; m2Idx++
            }
        }
        return (this.c1 * E / N) + (this.c2 + D / N) + this.c3 * W;
    }

    isCompatible(m1, m2) {
        let distance = this.calcDistance(m1, m2);
        if (distance >= this.dt) {
            return false;
        }

        return true;
    }

    speciate() {
        let oldMembers = []; // container for old members
        
        // in each existing species, randomly choose one member to represent the species in the next gen
        // and extract all other members
        for (let i = 0; i < this.species.length; i++) {
            let randomMember = this.species[i].extractRandomMember(); // also removes it from its current species
            let otherMembers = this.species[i].extractAllMembers(); // remove remaining members
            this.species[i].members.push(randomMember); // push the representative back into the species
            oldMembers.push(...otherMembers); // collect old members
        }

        while (oldMembers.length) {
            let memberPlaced = false;
            let member = oldMembers.shift(); // remove member from oldMembers

            for (let i = 0; i < this.species.length; i++) { // try to place old member into an existing species
                let speciesRepresentative = this.species[i].members[0]; // 0th element is the representative
                if (this.isCompatible(member, speciesRepresentative)) { // if compatible, place it into the species
                    this.species[i].members.push(member);
                    memberPlaced = true;
                    break;
                }
            }
            if (!memberPlaced) { // member does not fit in any existing species
                let speciesToAdd = new Species(); // make new species
                speciesToAdd.members.push(member) // make this member that species representative
                this.species.push(speciesToAdd); // add it to list of new species
                console.log(speciesToAdd.members)
            }
        }
    }

    flattenSpecies() { // assigns all species members to this.members
        this.members = [];
        for (let i = 0; i < this.species.length; i++) {
            for (let j = 0; j < this.species[i].members.length; j++) {
                this.members.push(this.species[i].members[j]);
            }
        }
    }

    assignFitness(values) { // assigns fitness to members
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].fitness = values[i];
        }   
    }
}