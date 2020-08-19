var PLAYER_SIZE = 30;
var PLAYER_COLOR = '#FF0000';
var PLAYER_SPEED = 0.075;
var PLAYER_STROKE = 3;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.spawnX = x;
        this.spawnY = y;
        this.featureExtractor = new PlayerFeatureExtractor(this);

        this.disable = false;
        this.foodEaten = [];
    }

    show() {
        if (!this.disable) {
            let center = this.getCenter();
            strokeWeight(PLAYER_STROKE);
            stroke(0);
            rectMode(CENTER);
            fill(PLAYER_COLOR);
            rect(center[0], center[1], PLAYER_SIZE, PLAYER_SIZE);
    
            if (playerFeaturesVisible) {
                this.featureExtractor.show();
            }
        }  
    }

    update(game) {
        if (!this.disable) {
            this.featureExtractor.update(game);

            let move = this.getMove();
            if (this.isMoveValid([0, move[1]], game)) {
                this.y += move[1] * PLAYER_SPEED;
            }

            if (this.isMoveValid([move[0], 0], game)) {
                this.x += move[0] * PLAYER_SPEED;
            }
            
            if (this.hasTouchedBall(game)) {
                this.runWhenDead(game);
            }

            this.checkFoodTouched(game);
        }
    }

    isMoveValid(singleDirectionMove, game) {
        let [top, left, bot, right] = this.getEdges();

        top += singleDirectionMove[1] * PLAYER_SPEED * TILE_SIZE + PLAYER_STROKE;
        bot += singleDirectionMove[1] * PLAYER_SPEED * TILE_SIZE - PLAYER_STROKE;
        left += singleDirectionMove[0] * PLAYER_SPEED * TILE_SIZE + PLAYER_STROKE;
        right += singleDirectionMove[0] * PLAYER_SPEED * TILE_SIZE - PLAYER_STROKE;

        let tilesToCheck = [
            game.tiles[Math.floor(right / TILE_SIZE)][Math.floor(top / TILE_SIZE)],
            game.tiles[Math.floor(left / TILE_SIZE)][Math.floor(top / TILE_SIZE)],
            game.tiles[Math.floor(right / TILE_SIZE)][Math.floor(bot / TILE_SIZE)],
            game.tiles[Math.floor(left / TILE_SIZE)][Math.floor(bot / TILE_SIZE)],
        ]

        for (let i = 0; i < tilesToCheck.length; i++) {
            if (tilesToCheck[i].type == 'back') return false; 
        }

        return true;
    }

    getCenter() {
        return [this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2];
    }

    getEdges() {
        let [centerX, centerY] = this.getCenter();

        let top = centerY - PLAYER_SIZE / 2 - PLAYER_STROKE;
        let bot = centerY + PLAYER_SIZE / 2 + PLAYER_STROKE;
        let right = centerX + PLAYER_SIZE / 2 + PLAYER_STROKE;
        let left = centerX - PLAYER_SIZE / 2 - PLAYER_STROKE;

        return [top, left, bot, right];
    }

    reset(game) {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.disable = false;
        
        for (let i = 0; i < this.foodEaten.length; i++) {
            game.food[this.foodEaten[i]].numPlayersEaten -= 1;
        }
        this.foodEaten = [];
    }

    hasTouchedBall(game) {
        for (let i = 0; i < game.balls.length; i++) {
            let ballData = [game.balls[i].getCenter(), BALL_SIZE];
            let playerData = this.getEdges();

            if (intersectCircleSquare(ballData, playerData)) return true;
        }

        return false;
    }

    checkFoodTouched(game) {
        for (let i = 0; i < game.food.length; i++) {
            if (!this.foodEaten.includes(i)) {
                let foodData = [game.food[i].getCenter(), FOOD_SIZE];
                let playerData = this.getEdges();
                if (intersectCircleSquare(foodData, playerData)) {
                    this.foodEaten.push(i);
                    game.food[i].numPlayersEaten++;
                }
            }
        }
    }
}

class HumanPlayer extends Player {
    constructor(x, y) {
        super(x, y);
    }

    getMove() {
        let move = [0, 0];
        if (keyIsDown(up_arrow)) move[1] -= 1;
        if (keyIsDown(down_arrow)) move[1] += 1;
        if (keyIsDown(left_arrow)) move[0] -= 1;
        if (keyIsDown(right_arrow)) move[0] += 1;
        return move;
    }

    runWhenDead(game) {
        this.reset(game);
    }
}

class AIPlayer extends Player {
    constructor(x, y, network) {
        super(x, y);
        this.network = network;
    }

    getMove() {
        let input = this.featureExtractor.getFeatures();
        let moves = [[0, 0], 
                     [0, 1], [0, -1], // right, left
                     [1, 0], [-1, 0], // down, up
                     [1, 1], [-1, -1], // diagonal
                     [-1, 1], [1, -1]]; // diagonal
        let output = this.network.evaluateArgMax(input);
        return moves[output];
    }

    runWhenDead() {
        this.disable = true;
    }

    calculateFitness(game) {
        let goalFitness = 6*Math.exp(-0.2 * (this.featureExtractor.goalPath.length)); // reward for getting close to goal
        let foodFitness = game.food.length == 0? 1 : this.foodEaten / game.food.length; // reward for eating food
        let notInHomeFitness = this.currentTileType(game) != 'home'? 10 : 0; // reward for not in home
        let goalReachedFitness = this.currentTileType(game) == 'goal'? 10 : 0;
        let fitness = goalFitness + foodFitness + notInHomeFitness + goalReachedFitness;

        console.log(goalFitness,foodFitness, notInHomeFitness, goalReachedFitness)
        return fitness;
    }

    currentTileType(game) {
        let [x, y] = this.getCenter();
        [x, y] = [Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE)]
        return game.tiles[x][y].type;
    }
}