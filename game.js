/* Game state class */ 
class Game {
    constructor() {
        this.tiles = [];
        this.balls = [];
        this.food = [];
        this.players = [];
        this.clearGame();

        this.generation = 0;
    }

    show() {
        background('#B4B5FE');
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                this.tiles[i][j].show();
            }
        }
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j].type != 'back') this.tiles[i][j].drawStroke();
            }
        }
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j].type != 'back') this.tiles[i][j].show();
            }
        }

        for (let i = 0; i < this.balls.length; i++) this.balls[i].show();
        for (let i = 0; i < this.food.length; i++) this.food[i].show();
        for (let i = 0; i < this.players.length; i++) this.players[i].show();
    }

    update() {
        for (let i = 0; i < this.balls.length; i++) this.balls[i].update(this);
        for (let i = 0; i < this.players.length; i++) this.players[i].update(this);
        for (let i = 0; i < this.food.length; i++) this.food[i].update(this);
    }

    resetGame() {
        for (let i = 0; i < this.balls.length; i++) this.balls[i].reset();
        for (let i = 0; i < this.players.length; i++) this.players[i].reset(this);
        for (let i = 0; i < this.food.length; i++) this.food[i].reset();
    }

    clearGame() {
        this.tiles = Array(max_x);
        for (let i = 0; i < max_x; i++) {
            this.tiles[i] = Array(max_y);
        }

        for (let i = 0; i < max_x; i++) {
            for (let j = 0; j < max_y; j++) {
                this.tiles[i][j] = new Tile(i, j, 'back');
            }
        }

        this.food = [];
        this.balls = [];
        this.players = [];
    }
}