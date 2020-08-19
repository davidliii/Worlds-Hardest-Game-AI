var GAME = null;
var population = null;
var innovation = null;
var AISize = 10;

var isAI = false;

function setup() {
    createCanvas(canvas_x, canvas_y);
    setupUserInput();
    
    GAME = new Game();
}

function draw() {
    if (isEditMode) {
        editMain(GAME);
    }

    else {
        GAME.update();
    }
    GAME.show();
}

function setupAI() {
    GAME.players = [];
    population = new NEAT(12, 9, AISize);

    for (let i = 0; i < population.members.length; i++) {
        GAME.players.push(new AIPlayer(...findAIStart(), population.members[i]))
    }

    isEditMode = false;
    isAI = true;
    GAME.resetGame();
}

function makeNextGeneration() {
    let fitnessValues = [];

    for (let i = 0; i < GAME.players.length; i++) {
        fitnessValues.push(GAME.players[i].calculateFitness(GAME))
    }

    population.createNextGeneration(fitnessValues);

    GAME.players = [];
    for (let i = 0; i < population.members.length; i++) {
        GAME.players.push(new AIPlayer(...findAIStart(), population.members[i]))
    }

    GAME.resetGame();
}

function findAIStart() {
    for (let i = 0; i < GAME.tiles.length; i++) {
        for (let j = 0; j < GAME.tiles[i].length; j++) {
            if (GAME.tiles[i][j].type == 'home') {
                return [i, j];
            }
        }
    }
}

function isGameOver() {
    
}
