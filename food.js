var FOOD_COLOR = '#FFFF00';
var FOOD_SIZE = 25;
var FOOD_STROKE = 4;

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.numPlayersEaten = 0;
        this.display = true;
    }

    show() {
        if (this.display) {
            let center = this.getCenter();
            fill(FOOD_COLOR);
            strokeWeight(FOOD_STROKE);
            stroke(0);
            circle(center[0], center[1], FOOD_SIZE);
        }
    }

    update(game) {
        if (this.numPlayersEaten == game.players.length && game.players.length != 0) {
            this.display = false;
        }

        else {
            this.display = true;
        }
    }

    reset() {
        this.numPlayersEaten = 0;
    }

    getCenter() {
        return [this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2]
    }

    getEdges() {
        let [centerX, centerY] = this.getCenter();
        let top = centerY - FOOD_SIZE / 2 - FOOD_STROKE;
        let bot = centerY + FOOD_SIZE / 2 + FOOD_STROKE;
        let right = centerX + FOOD_SIZE / 2 + FOOD_STROKE;
        let left = centerX - FOOD_SIZE / 2 - FOOD_STROKE;

        return [top, left, bot, right];
    }
}