var TILE_SIZE = 50;
var TILE_STROKE = 8;

class Tile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = this.getColor();
        this.parent;
    }

    getColor() { // returns pair of colors for tile type
        if (this.type == 'home' || this.type == 'goal') {
            return ['#B5FEB4', '#B5FEB4'];
        }

        else if (this.type == 'board') {
            return ['#F7F7FF', '#E6E6FF'];
        }

        else if (this.type == 'back'){
            return ['#B4B5FE', '#B4B5FE'];
        }
    }

    show() { // draws tile
        let colorIdx = (this.x + this.y) % 2 // checkerboard pattern for board tiles
        fill(this.color[colorIdx]);
        noStroke();
        rectMode(CORNER);
        rect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    drawStroke() { // draws outline on the tile
        strokeWeight(TILE_STROKE);
        stroke(0);
        rectMode(CORNER);
        rect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}