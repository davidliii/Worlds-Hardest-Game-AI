/* Tile class */

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

    // returns pair of colors for tile (checkerboard pattern)
    getColor() {
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


    // draws tile to canvas
    show() {
        let colorIdx = (this.x + this.y) % 2 // checkerboard pattern for board tiles
        fill(this.color[colorIdx]);
        noStroke();
        rectMode(CORNER);
        rect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

     // draws outline on the tile
    drawStroke() {
        strokeWeight(TILE_STROKE);
        stroke(0);
        rectMode(CORNER);
        rect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}