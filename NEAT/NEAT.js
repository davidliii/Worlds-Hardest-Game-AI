/** 
 * Main class for NEAT algorithm
 */
class NEAT {
    /**
     * @param {Number} numInputs - Number of inputs to the neural network (excluding bias)
     * @param {Number} numOutputs - Number of outputs to the neural network
     * @param {Number} populationSize - Total number of members within the population (during evolution may fluctuate due to speciation)
     */
    constructor(numInputs, numOutputs, populationSize) {
        this.numInputs = numInputs;
        this.numOutputs = numOutputs;
        this.populationSize = populationSize;

        this.innovation = new Innovation();
        this.generation = 0;

        this.generationsBeforeExtinct = 15; // if improvements are not made within generationsBeforeExtinct, then a species is eliminated


        this.members = []; // list of members
        this.species = []; // list of species

        this.initializePopulation();
    }

    /**
     * Creates the first generation of the population
     */
    initializePopulation() {
        let startSpecies = new Species();
        for (let i = 0; i < this.populationSize; i++) {
            let member = new Network(this.numInputs, this.numOutputs, this.innovation);
            startSpecies.members.push(member);
        }

        this.species.push(startSpecies);
        this.flattenSpecies();
    }

    /**
     * Creates the next generation of the population
     */
    createNextGeneration(fitnessValues) {
        this.importFitness(fitnessValues);

        // Set representative of each species in the population
        let leftOverMembers = [];
        for (let i = 0; i < this.species.length; i++) {
            leftOverMembers.push(...this.species[i].prepareForSpeciation());
        }

        // Place members into appropriate species
        for (let i = 0; i < leftOverMembers.length; i++) {
            let placed = false;
            let member = leftOverMembers[i];

            // Try to place into an existing speciess
            for (let j = 0; j < this.species.length; j++) {
                if (this.species[j].isCompatible(member)) {
                    this.species[j].addMember(member);
                    placed = true;
                    break;
                }
            }

            // Make a new species if it was not placed
            if (!placed) this.species.push(new Species(member))
        }

        // remove any species with 0 members
        for (let i = this.species.length - 1; i >= 0; i--) {
            if (this.species[i].members.length == 0) {
                this.species.splice(i, 1);
            }
        }

        // check if species has improved within that last few generations, remove otherwise
        for (let i = this.species.length - 1; i >= 0; i--) {
            let currentFitness = this.species[i].getSpeciesFitness()
            if (currentFitness > this.species[i].recordFitness) {
                this.species[i].recordFitness = currentFitness;
                this.species[i].numGenerationsSinceImprovement = 0;
            }

            else {
                this.species[i].numGenerationsSinceImprovement++;
            }

            if (this.species[i].numGenerationsSinceImprovement >= this.generationsBeforeExtinct) {
                this.species.splice(i, 1);
            }
        }
        
        // kill off poor performers
        for (let i = 0; i < this.species.length; i++) {
            this.species[i].eliminateBadMembers();
        }

        // determine quotas for each species in next generation
        // and repopulate each species
        let totalSpeciesFitness = 0;
        for (let i = 0; i < this.species.length; i++) {
            totalSpeciesFitness += this.species[i].getSpeciesFitness();
        }

        for (let i = 0; i < this.species.length; i++) {
            let numMembers = Math.round(this.species[i].getSpeciesFitness() / totalSpeciesFitness * this.populationSize);
            this.species[i].repopulate(numMembers);
        }

        this.flattenSpecies();
        this.generation++;
    }

    /**
     * Places members in within each species sequentially into this.members
     */
    flattenSpecies() {
        this.members = [];
        for (let i = 0; i < this.species.length; i++) {
            for (let j = 0; j < this.species[i].members.length; j++) {
                this.members.push(this.species[i].members[j]);
            }
        }
    }

    /**
     * @param {Number[]} fitnessValues - Array of fitness values for each member
     */
    importFitness(fitnessValues) {
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].fitness = fitnessValues[i];
        }
    }

    /**
     * Compute the output of each member in the population
     * @param {Number[]} inputValues - Inputs to the neural network for each member
     * @returns {Number[][]} - Values outputed by member output nodes
     */
    getPopulationOutput(inputValues) {
        this.flattenSpecies();

        let outputValues = [];
        for (let i = 0; i < this.members.length; i++) {
            outputValues.push(this.members[i].evaluate(inputValues));
        }
        
        return outputValues;
    }

    /**
     * Compute the argmax output of each member in the population
     * @param {Number[]} inputValues - Inputs to the neural network for each member
     * @returns {Number[]} - Indeces of argmax values outputed by member output nodes
     */
    getPopulationOutputArgMax(inputValues) {
        this.flattenSpecies();

        let outputValues = [];
        for (let i = 0; i < this.members.length; i++) {
            outputValues.push(this.members[i].evaluateArgMax(inputValues));
        }

        return outputValues;
    }
}