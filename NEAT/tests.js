function testNetwork1() {
    // test initialized network
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();
    let net = new Network(2, 2, innovation);

    let conditions = [];

    var modifiedSigmoid = (x) => 1 / (1 + Math.exp(-4.9 * x));
    
    for (let i = 0; i < 50; i++) {
        let w1 = Math.random();
        let w2 = Math.random();
        let w3 = Math.random();
        let w4 = Math.random();
        let w5 = Math.random();
        let w6 = Math.random();

        let i1 = Math.random();
        let i2 = Math.random();

        net.getConnectionBetweenNodes(2, 0).weight = w1;
        net.getConnectionBetweenNodes(3, 0).weight = w2;
        net.getConnectionBetweenNodes(2, 1).weight = w3;
        net.getConnectionBetweenNodes(3, 1).weight = w4;
        net.getConnectionBetweenNodes(2, 4).weight = w5;
        net.getConnectionBetweenNodes(3, 4).weight = w6;

        let output = net.evaluate([i1, i2]);
        let expectedOut = [modifiedSigmoid(w1*i1 + w3*i2 + w5), modifiedSigmoid(w2*i1 + w4*i2 + w6)]

        if (output[0].toFixed(5) == expectedOut[0].toFixed(5) && output[1].toFixed(5) == expectedOut[1].toFixed(5)) {
            conditions.push(true);
        }

        else {
            conditions.push(false);
        }
    }
    let t1 = performance.now();

    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testNetwork2() {
    // test network with node mutation
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();
    let net = new Network(2, 2, innovation);
    net.addNodeBetween(2, 0, innovation.value++, innovation.value++);

    let conditions = [];

    var modifiedSigmoid = (x) => 1 / (1 + Math.exp(-4.9 * x));
    
    for (let i = 0; i < 50; i++) {
        let w1 = Math.random();
        let w2 = Math.random();
        let w3 = Math.random();
        let w4 = Math.random();
        let w5 = Math.random();
        let w6 = Math.random();
        let w7 = Math.random();

        let i1 = Math.random();
        let i2 = Math.random();

        net.getConnectionBetweenNodes(5, 0).weight = w1;
        net.getConnectionBetweenNodes(2, 5).weight = w2;
        net.getConnectionBetweenNodes(3, 0).weight = w3;
        net.getConnectionBetweenNodes(2, 1).weight = w4;
        net.getConnectionBetweenNodes(3, 1).weight = w5;
        net.getConnectionBetweenNodes(2, 4).weight = w6;
        net.getConnectionBetweenNodes(3, 4).weight = w7;

        let output = net.evaluate([i1, i2]);
        let expectedOut = [modifiedSigmoid(w2*modifiedSigmoid(w1*i1) + w4*i2 + w6), modifiedSigmoid(w3*i1 + w5*i2 + w7)]

        if (output[0].toFixed(5) == expectedOut[0].toFixed(5) && output[1].toFixed(5) == expectedOut[1].toFixed(5)) {
            conditions.push(true);
        }

        else {
            conditions.push(false);
        }
    }
    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testNetwork3() {
    // test network with node and connection mutation
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();
    let net = new Network(2, 2, innovation);
    net.addNodeBetween(2, 0, innovation.value++, innovation.value++);
    net.addConnectionBetween(3, 5, getRandomFloatBetween(-1, 1), innovation.value++);

    let conditions = [];
    var modifiedSigmoid = (x) => 1 / (1 + Math.exp(-4.9 * x));
    
    for (let i = 0; i < 50; i++) {
        let w1 = Math.random();
        let w2 = Math.random();
        let w3 = Math.random();
        let w4 = Math.random();
        let w5 = Math.random();
        let w6 = Math.random();
        let w7 = Math.random();
        let w8 = Math.random();

        let i1 = Math.random();
        let i2 = Math.random();

        net.getConnectionBetweenNodes(5, 0).weight = w1;
        net.getConnectionBetweenNodes(2, 5).weight = w2;
        net.getConnectionBetweenNodes(3, 0).weight = w3;
        net.getConnectionBetweenNodes(2, 1).weight = w4;
        net.getConnectionBetweenNodes(3, 1).weight = w5;
        net.getConnectionBetweenNodes(2, 4).weight = w6;
        net.getConnectionBetweenNodes(3, 4).weight = w7;
        net.getConnectionBetweenNodes(3, 5).weight = w8;

        let output = net.evaluate([i1, i2]);
        let expectedOut = [modifiedSigmoid(w2*modifiedSigmoid(w1*i1) + w4*i2 + w6), modifiedSigmoid(w8*modifiedSigmoid(w1*i1) + w3*i1 + w5*i2 + w7)]

        if (output[0].toFixed(5) == expectedOut[0].toFixed(5) && output[1].toFixed(5) == expectedOut[1].toFixed(5)) {
            conditions.push(true);
        }

        else {
            conditions.push(false);
        }
    }
    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testNetwork4() {
    // test network with a bunch of mutations
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();
    let net = new Network(2, 2, innovation);
    net.addNodeBetween(3, 1, innovation.value++, innovation.value++);
    net.addConnectionBetween(2, 5, getRandomFloatBetween(-1, 1), innovation.value++);
    net.addNodeBetween(3, 4, innovation.value++, innovation.value++);
    net.addConnectionBetween(6, 1, getRandomFloatBetween(-1, 1), innovation.value++);
    net.addConnectionBetween(6, 5, getRandomFloatBetween(-1, 1), innovation.value++);
    
    let conditions = [];
    var modifiedSigmoid = (x) => 1 / (1 + Math.exp(-4.9 * x));
    
    for (let i = 0; i < 50; i++) {
        let w1 = Math.random();
        let w2 = Math.random();
        let w3 = Math.random();
        let w4 = Math.random();
        let w5 = Math.random();
        let w6 = Math.random();
        let w7 = Math.random();
        let w8 = Math.random();
        let w9 = Math.random();
        let w10 = Math.random();
        let w11 = Math.random();

        let i1 = Math.random();
        let i2 = Math.random();

        net.getConnectionBetweenNodes(2, 0).weight = w1;
        net.getConnectionBetweenNodes(3, 0).weight = w2;
        net.getConnectionBetweenNodes(2, 1).weight = w3;
        net.getConnectionBetweenNodes(5, 1).weight = w4;
        net.getConnectionBetweenNodes(6, 1).weight = w5;
        net.getConnectionBetweenNodes(2, 4).weight = w6;
        net.getConnectionBetweenNodes(6, 4).weight = w7;
        net.getConnectionBetweenNodes(2, 5).weight = w8;
        net.getConnectionBetweenNodes(3, 5).weight = w9;
        net.getConnectionBetweenNodes(3, 6).weight = w10;
        net.getConnectionBetweenNodes(6, 5).weight = w11;

        let o5 = modifiedSigmoid(w4*i2);
        let o6 = modifiedSigmoid(w7 + w11*o5 + w5*i2);

        let o2 = modifiedSigmoid(w1*i1 + w3*i2 + w8*o5 + w6);
        let o3 = modifiedSigmoid(w2*i1 + w9*o5 + w10*o6);
        let output = net.evaluate([i1, i2]);
        let expectedOut = [o2, o3];

        if (output[0].toFixed(5) == expectedOut[0].toFixed(5) && output[1].toFixed(5) == expectedOut[1].toFixed(5)) {
            conditions.push(true);
        }

        else {
            conditions.push(false);
        }
    }
    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testMutation1() {
    // test mutation and innovation tracker
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let nets = [];
    for (let i = 0; i < 50; i++) {
        nets.push(new Network(2, 2, innovation));
    }

    for (let i = 0; i < nets.length; i++) {
        nets[i].mutateNewNode();
        nets[i].mutateNewNode();
        nets[i].mutateNewNode();
        nets[i].mutateNewConnection();
        nets[i].mutateNewConnection();
        nets[i].mutateNewNode();
        nets[i].mutateNewConnection();
    }

    let conditions = [];
    for (let i = 0; i < nets.length; i++) {
        for (let j = 0; j < nets[i].connections.length; j++) {
            if (nets[i].connections[j].innovationNumber >= 6) {
                inNodeID = nets[i].connections[j].inNodeID;
                outNodeID = nets[i].connections[j].outNodeID;
                no = nets[i].connections[j].innovationNumber;
                if (innovation.doesMutationExist(inNodeID, outNodeID) && 
                    innovation.getMutationInnovation(inNodeID, outNodeID) == no) {
                        conditions.push(true);
                }
                else {
                    conditions.push(false);
                }
            }
        }
    }
    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testSpecies1() {
    // test matching, disjoint, excess connection pairs getters
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let member1 = new Network(2, 2, innovation);
    let member2 = new Network(2, 2, innovation);
    let member3 = new Network(2, 2, innovation);

    let species = new Species();
    member3.mutateNewNode();

    let conditions = [];

    if (species.getMatchingConnections(member1, member2).length == 6) {
        conditions.push(true)
    }
    if (species.getDisjointConnections(member1, member2).length == 0) {
        conditions.push(true)
    }
    if (species.getExcessConnections(member1, member2).length == 0) {
        conditions.push(true)
    }
    if (species.getMatchingConnections(member1, member3).length == 6) {
        conditions.push(true)
    }
    if (species.getDisjointConnections(member1, member3).length == 0) {
        conditions.push(true)
    }
    if (species.getExcessConnections(member1, member3).length == 2) {
        conditions.push(true)
    }

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testSpecies2() {
    // test species distance formula
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let species = new Species();
    let member1 = new Network(2, 2, innovation);
    let member2 = new Network(2, 2, innovation);
    let member3 = new Network(2, 2, innovation);
    let member4 = new Network(2, 2, innovation);
    let member5 = new Network(2, 2, innovation);

    for (let x of [member1, member2, member3, member4, member5]) {
        x.getConnectionBetweenNodes(2, 0).weight = 1;
        x.getConnectionBetweenNodes(3, 0).weight = 1;
        x.getConnectionBetweenNodes(2, 1).weight = 1;
        x.getConnectionBetweenNodes(3, 1).weight = 1;
        x.getConnectionBetweenNodes(2, 4).weight = 1;
        x.getConnectionBetweenNodes(3, 4).weight = 1;
    }

    member3.addNodeBetween(2, 0, innovation.value++, innovation.value++);
    member4.addNodeBetween(3, 0, innovation.value++, innovation.value++);
    member5.addNodeBetween(3, 1, innovation.value++, innovation.value++);
    
    let conditions = [];

    if (species.calcDistance(member1, member2) == 0) conditions.push(true);
    else conditions.push(false);

    if (species.calcDistance(member1, member3) == 2) conditions.push(true);
    else conditions.push(false);

    if (species.calcDistance(member1, member4) == 2) conditions.push(true);
    else conditions.push(false);

    if (species.calcDistance(member3, member4) == 4) conditions.push(true);
    else conditions.push(false);

    if (species.calcDistance(member3, member5) == 4) conditions.push(true);
    else conditions.push(false);

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testSpecies3() {
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let species = new Species();
    let member1 = new Network(2, 2, innovation);
    let member2 = new Network(2, 2, innovation);
    let member3 = new Network(2, 2, innovation);
    let member4 = new Network(2, 2, innovation);
    let member5 = new Network(2, 2, innovation);
    let member6 = new Network(2, 2, innovation);
    let member7 = new Network(2, 2, innovation);
    let member8 = new Network(2, 2, innovation);
    let member9 = new Network(2, 2, innovation);
    let member10 = new Network(2, 2, innovation);

    member1.fitness = 1;
    member2.fitness = 2;
    member3.fitness = 3;
    member4.fitness = 4;
    member5.fitness = 5;
    member6.fitness = 6;
    member7.fitness = 7;
    member8.fitness = 8;
    member9.fitness = 9;
    member10.fitness = 10;

    species.members.push(member1, member2, member3, member4, member5, member6, member7, member8, member9, member10);
    let conditions = [];

    if (species.getSpeciesFitness().toFixed(5) == 5.5.toFixed(5)) conditions.push(true);
    else conditions.push(false);

    species.eliminateBadMembers();

    if (species.members.length == 5) conditions.push(true);
    else conditions.push(false);

    if (species.getSpeciesFitness().toFixed(5) == 8.0.toFixed(5)) conditions.push(true);
    else conditions.push(false);

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testMakeChild1() {
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let species = new Species();
    let member1 = new Network(2, 2, innovation);
    member1.fitness = 5;
    let member2 = new Network(2, 2, innovation);

    let child = species.makeChild(member1, member2);
    
    let conditions = [
        child.biasNode.ID == 4,
        child.getNodeByID(0).isInput == true,
        child.getNodeByID(1).isInput == true,
        child.getNodeByID(2).isOutput == true,
        child.getNodeByID(3).isOutput == true,
        child.getNodeByID(4).isBias == true,
        child.biasNode = child.getNodeByID(4),
        child.inputNodes.includes(child.getNodeByID(0)),
        child.inputNodes.includes(child.getNodeByID(1)),
        child.outputNodes.includes(child.getNodeByID(2)),
        child.outputNodes.includes(child.getNodeByID(3)),
        child.nodes.length == 5,
        child.connections.length == 6,
    ];

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testMakeChild2() {
    let t0 = performance.now();
    let e = new Error('');
    let innovation = new Innovation();

    let species = new Species();
    let member1 = new Network(2, 2, innovation);
    let member2 = new Network(2, 2, innovation);

    member1.fitness = 5;
    member1.addNodeBetween(2, 0, innovation.value++, innovation.value++);
    member2.addNodeBetween(2, 1, innovation.value++, innovation.value++);

    let child = species.makeChild(member1, member2);
    
    let conditions = [
        child.biasNode.ID == 4,
        child.getNodeByID(0).isInput == true,
        child.getNodeByID(1).isInput == true,
        child.getNodeByID(2).isOutput == true,
        child.getNodeByID(3).isOutput == true,
        child.getNodeByID(4).isBias == true,

        child.nodes.length == 6,
        child.connections.length == 8,

        child.getConnectionByInnovationNumber(0).weight == member1.getConnectionByInnovationNumber(0).weight ||
        child.getConnectionByInnovationNumber(0).weight == member2.getConnectionByInnovationNumber(0).weight,

        child.getConnectionByInnovationNumber(1).weight == member1.getConnectionByInnovationNumber(1).weight ||
        child.getConnectionByInnovationNumber(1).weight == member2.getConnectionByInnovationNumber(1).weight,

        child.getConnectionByInnovationNumber(2).weight == member1.getConnectionByInnovationNumber(2).weight ||
        child.getConnectionByInnovationNumber(2).weight == member2.getConnectionByInnovationNumber(2).weight,

        child.getConnectionByInnovationNumber(3).weight == member1.getConnectionByInnovationNumber(3).weight ||
        child.getConnectionByInnovationNumber(3).weight == member2.getConnectionByInnovationNumber(3).weight,

        child.getConnectionByInnovationNumber(4).weight == member1.getConnectionByInnovationNumber(4).weight ||
        child.getConnectionByInnovationNumber(4).weight == member2.getConnectionByInnovationNumber(4).weight,

        child.getConnectionByInnovationNumber(5).weight == member1.getConnectionByInnovationNumber(5).weight ||
        child.getConnectionByInnovationNumber(5).weight == member2.getConnectionByInnovationNumber(5).weight,

        child.getConnectionByInnovationNumber(6).weight == member1.getConnectionByInnovationNumber(6).weight,

        child.getConnectionByInnovationNumber(7).weight == member1.getConnectionByInnovationNumber(7).weight
    ];

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testNEAT1() {
    let t0 = performance.now();
    let e = new Error('');
    
    
    let conditions = [
    ];

    let t1 = performance.now();
    try {
        if (conditions.includes(false)) throw e;   

        print_green(getFuncName() + " Passed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
    catch(err) {
        print_red(getFuncName() + " Failed (took " + String((t1-t0).toFixed(5)) + " ms)");
    }
}

function testXOR() {
    let input1 = [0, 0];
    let input2 = [0, 1];
    let input3 = [1, 0];
    let input4 = [1, 1];

    let expectedOutput1 = 0;
    let expectedOutput2 = 1;
    let expectedOutput3 = 1;
    let expectedOutput4 = 0;

    let acceptableError = 0.1;

    let population = new NEAT(2, 1, 150);
    let solutionFound = false;
    let solutionIdx = -1;
    let bestFitness = 0;

    while (solutionFound == false && population.generation < 100) {
        console.log("Current Generation: ", population.generation, 
                    "Population Size: ", population.members.length, 
                    "Number of Species: ", population.species.length,
                    "Best fitness: ", bestFitness);

        bestFitness = 0;

        let outputValues1 = population.getPopulationOutput(input1);
        let outputValues2 = population.getPopulationOutput(input2);
        let outputValues3 = population.getPopulationOutput(input3);
        let outputValues4 = population.getPopulationOutput(input4);

        // compute fitness
        let fitnessValues = [];
        for (let i = 0; i < population.members.length; i++) {
            let error1 = Math.abs(outputValues1[i][0] - expectedOutput1);
            let error2 = Math.abs(outputValues2[i][0] - expectedOutput2);
            let error3 = Math.abs(outputValues3[i][0] - expectedOutput3);
            let error4 = Math.abs(outputValues4[i][0] - expectedOutput4);

            let fitness = errorToFitness(error1 + error2 + error3 + error4);
            if (fitness > bestFitness) {
                bestFitness = fitness;
            }

            fitnessValues.push(fitness);
        }

        // check if solution was found
        for (let i = 0; i < population.members.length; i++) {
            let error1 = Math.abs(outputValues1[i][0] - expectedOutput1[0]);
            let error2 = Math.abs(outputValues2[i][0] - expectedOutput2[0]);
            let error3 = Math.abs(outputValues3[i][0] - expectedOutput3[0]);
            let error4 = Math.abs(outputValues4[i][0] - expectedOutput4[0]);

            if (error1 <= acceptableError && error2 <= acceptableError && error3 <= acceptableError && error4 <= acceptableError) {
                solutionFound = true;
                solutionIdx = i;
                break;
            }
        }

        if (solutionFound) break;
        population.createNextGeneration(fitnessValues);
    }

    console.log(solutionIdx);
    console.log(population)
}

function errorToFitness(error) {
    return 4 - error;
}