/**
 * Feature extractor class that "sees" the environment the player is in
 */
class PlayerFeatureExtractor {
    constructor(player) {
        this.player = player;

        this.goalPath = [];
        this.stepToGoal = []; // f

        this.foodPath = [];
        this.stepToFood = []; // f

        this.distUp;   // f
        this.distDown;  // f
        this.distLeft;  // f
        this.distRight;  // f

        this.ballDistUp;  // f
        this.ballDistDown;  // f
        this.ballDistLeft;  // f
        this.ballDistRight;  // f
    }

    show() {
        let stepIsSame = false;
        if (this.stepToFood[0] == this.stepToGoal[0] && this.stepToFood[1] == this.stepToGoal[1]) stepIsSame = true;

        let [cx, cy] = this.player.getCenter();
        this.showGoalPath();
        this.showStepToGoal(cx, cy, stepIsSame);

        this.showFoodPath();
        this.showStepToFood(cx, cy, stepIsSame);

        this.showDistToWalls(cx, cy);
        this.showDistToBalls(cx, cy);
    }

    update(game) {
        let [cx, cy] = this.player.getCenter();
        this.goalPath = this.getShortestPathToGoal(game, cx, cy);
        this.stepToGoal = this.getStepToGoal();

        this.foodPath = this.getShortestPathToFood(game, cx, cy);
        this.stepToFood = this.getStepToFood();

        this.distUp = this.getDistUp(game, cx, cy);
        this.distDown = this.getDistDown(game, cx, cy);
        this.distLeft = this.getDistLeft(game, cx, cy);
        this.distRight = this.getDistRight(game, cx, cy);

        this.ballDistUp = this.getBallDistUp(game, cx, cy);
        this.ballDistDown = this.getBallDistDown(game, cx, cy);
        this.ballDistLeft = this.getBallDistLeft(game, cx, cy);
        this.ballDistRight = this.getBallDistRight(game, cx, cy);
    }

    getFeatures() {
        let featureList = [];
        featureList.push(...this.stepToGoal, ...this.stepToFood);

        let m = Math.max(this.distUp, this.distDown, this.distLeft, this.distRight);
        featureList.push(this.distUp / m, this.distDown / m, this.distLeft / m, this.distRight / m);

        m = Math.max(this.ballDistUp, this.ballDistDown, this.ballDistLeft, this.ballDistRight);
        featureList.push(this.ballDistUp / m, this.ballDistDown / m, this.ballDistLeft / m, this.ballDistRight / m);

        return featureList;
    }

    getShortestPathToGoal(game, centerX, centerY) {
        let startTile = game.tiles[Math.floor(centerX / TILE_SIZE)][Math.floor(centerY / TILE_SIZE)];
        startTile.parent = null;

        let q = [];
        let visited = [];
        let tile;
        let adj;

        q.push(startTile);

        while (q.length != 0) {
            tile = q.shift();
            if (tile.type == 'goal') {
                break;
            }
            adj = this.getAdjacentTiles(tile, game);

            for (let i = 0; i < adj.length; i++) {
                if (!visited.includes(adj[i]) && !q.includes(adj[i])) {
                    adj[i].parent = tile;
                    q.push(adj[i]);
                }
            }

            visited.push(tile);
        }

        let path = [];
        while (tile != null) {
            path.push([tile.x, tile.y]);
            tile = tile.parent;
        }

        return path.reverse();
    }

    getShortestPathToFood(game, centerX, centerY) {
        let foodTileCoordinates = [];
        for (let i = 0; i < game.food.length; i++) {
            if (!this.player.foodEaten.includes(i)) {
                foodTileCoordinates.push([Math.floor(game.food[i].x), Math.floor(game.food[i].y)])
            }
        }

        if (foodTileCoordinates.length == 0) {
            return [];
        }


        let startTile = game.tiles[Math.floor(centerX / TILE_SIZE)][Math.floor(centerY / TILE_SIZE)];
        startTile.parent = null;

        let q = [];
        let visited = [];
        let tile;
        let adj;
        let found = false;

        q.push(startTile);

        while (q.length != 0) {
            tile = q.shift();
            for (let i = 0; i < foodTileCoordinates.length; i++) {
                if (foodTileCoordinates[i][0] == tile.x && foodTileCoordinates[i][1] == tile.y) {
                    found = true;
                    break;
                }
            }

            if (found) break;
            
            adj = this.getAdjacentTiles(tile, game);

            for (let i = 0; i < adj.length; i++) {
                if (!visited.includes(adj[i]) && !q.includes(adj[i])) {
                    adj[i].parent = tile;
                    q.push(adj[i]);
                }
            }

            visited.push(tile);
        }

        let path = [];
        while (tile != null) {
            path.push([tile.x, tile.y]);
            tile = tile.parent;
        }

        return path.reverse();
    }

    getAdjacentTiles(tile, game) {
        let adjacent = [];
        let x = tile.x;
        let y = tile.y;

        for (let i of [-1, 1]) {
            if (x+i >= 0 && x+i < max_x) {
                if (game.tiles[x+i][y].type != 'back') {
                    adjacent.push(game.tiles[x+i][y]);
                }
            }
        }

        for (let i of [-1, 1]) {
            if (y+i >= 0 && y+i < max_y) {
                if (game.tiles[x][y+i].type != 'back') {
                    adjacent.push(game.tiles[x][y+i]);
                }
            }
        }

        return adjacent;
    }

    showGoalPath() {
        fill("rgba(255, 252, 87, 0.3)");
        noStroke();
        rectMode(CORNER)

        for (let i = 0; i < this.goalPath.length; i++) {
            rect(this.goalPath[i][0] * TILE_SIZE, this.goalPath[i][1] * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    showFoodPath() {
        fill("rgba(255, 36, 248, 0.3)");
        noStroke();
        rectMode(CORNER)

        for (let i = 0; i < this.foodPath.length; i++) {
            rect(this.foodPath[i][0] * TILE_SIZE, this.foodPath[i][1] * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    showStepToGoal(cx, cy, tri) {
        fill("rgba(255, 252, 87, 0.5)");
        noStroke();
        rectMode(CORNER)

        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        if (tri) {
            triangle((this.stepToGoal[0] + x + 1) * TILE_SIZE, (this.stepToGoal[1] + y + 1) * TILE_SIZE, 
            (this.stepToGoal[0] + x + 1) * TILE_SIZE, (this.stepToGoal[1] + y) * TILE_SIZE,
            (this.stepToGoal[0] + x) * TILE_SIZE, (this.stepToGoal[1] + y+1) * TILE_SIZE);
        }

        else {
            rect((this.stepToGoal[0] + x) * TILE_SIZE, (this.stepToGoal[1] + y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    showStepToFood(cx, cy, tri) {
        fill("rgba(255, 36, 248, 0.5)");
        noStroke();
        rectMode(CORNER)

        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        if (tri) {
            triangle((this.stepToFood[0] + x) * TILE_SIZE, (this.stepToFood[1] + y) * TILE_SIZE, 
            (this.stepToFood[0] + x + 1) * TILE_SIZE, (this.stepToFood[1] + y) * TILE_SIZE,
            (this.stepToFood[0] + x) * TILE_SIZE, (this.stepToFood[1] + y+1) * TILE_SIZE);
        }

        else {
            rect((this.stepToFood[0] + x) * TILE_SIZE, (this.stepToFood[1] + y) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } 
    }

    getStepToFood() {
        if (this.foodPath.length <= 1) {
            return [0, 0];
        }

        let [x1, y1] = this.foodPath[0];
        let [x2, y2] = this.foodPath[1];
        
        return [x2-x1, y2-y1];
    }

    getStepToGoal() {
        if (this.goalPath.length <= 1) {
            return [0, 0];
        }

        let [x1, y1] = this.goalPath[0];
        let [x2, y2] = this.goalPath[1];
        
        return [x2-x1, y2-y1];
    }

    getDistUp(game, cx, cy) {
        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        while (game.tiles[x][y].type != 'back') {
            y--;
            if (y == -1) break;
        }

        let dist = Math.abs((y+1) * TILE_SIZE - cy);
        return dist;
    }
    getDistDown(game, cx, cy) {
        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        while (game.tiles[x][y].type != 'back') {
            y++;
            if (y == max_y) break;
        }

        let dist = Math.abs(y * TILE_SIZE - cy);
        return dist;
    }

    getDistLeft(game, cx, cy) {
        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        while (game.tiles[x][y].type != 'back') {
            x--;
            if (x == -1) break;
        }

        let dist = Math.abs((x+1) * TILE_SIZE - cx);
        return dist;
    }

    getDistRight(game, cx, cy) {
        let x = Math.floor(cx / TILE_SIZE);
        let y = Math.floor(cy / TILE_SIZE);

        while (game.tiles[x][y].type != 'back') {
            x++;
            if (x == max_x) break;
        }

        let dist = Math.abs(x * TILE_SIZE - cx);
        return dist;
    }


    showDistToWalls(cx, cy) {
        stroke('#0ad0fc');
        strokeWeight(2);

        line(cx, cy, cx, cy - this.distUp);
        line(cx, cy, cx, cy + this.distDown);
        line(cx, cy, cx - this.distLeft, cy);
        line(cx, cy, cx + this.distRight, cy);


        strokeWeight(8);
        point(cx, cy - this.distUp);
        point(cx, cy + this.distDown);
        point(cx - this.distLeft, cy);
        point(cx + this.distRight, cy);
    }

    getBallDistUp(game, cx, cy) {
        for (let i = cy; i > cy - this.distUp; i -= 2) {
            for (let j = 0; j < game.balls.length; j++) {
                let [ballTop, ballLeft, ballBot, ballRight] = game.balls[j].getEdges();
                if (cx <= ballRight && cx >= ballLeft && i <= ballBot && i >= ballTop) {
                    return cy - i;
                }
            }
        }

        return this.distUp;
    }

    getBallDistDown(game, cx, cy) {
        for (let i = cy; i < cy + this.distDown; i++) {
            for (let j = 0; j < game.balls.length; j++) {
                let [ballTop, ballLeft, ballBot, ballRight] = game.balls[j].getEdges();
                if (cx <= ballRight && cx >= ballLeft && i <= ballBot && i >= ballTop) {
                    return i - cy;
                }
            }
        }

        return this.distDown;
    }

    getBallDistLeft(game, cx, cy) {
        for (let i = cx; i > cx - this.distLeft; i--) {
            for (let j = 0; j < game.balls.length; j++) {
                let [ballTop, ballLeft, ballBot, ballRight] = game.balls[j].getEdges();
                if (i <= ballRight && i >= ballLeft && cy <= ballBot && cy >= ballTop) {
                    return cx - i;
                }
            }
        }

        return this.distLeft;
        
    }

    getBallDistRight(game, cx, cy) {
        for (let i = cx; i < cx + this.distRight; i++) {
            for (let j = 0; j < game.balls.length; j++) {
                let [ballTop, ballLeft, ballBot, ballRight] = game.balls[j].getEdges();
                if (i <= ballRight && i >= ballLeft && cy <= ballBot && cy >= ballTop) {
                    return i - cx;
                }
            }
        }

        return this.distRight;
    }

    showDistToBalls(cx, cy) {
        strokeWeight(2);
        stroke('#ff1100');

        if (this.ballDistUp != this.distUp) {
            line(cx, cy, cx, cy - this.ballDistUp);
        }
        if (this.ballDistDown != this.distDown) {
            line(cx, cy, cx, cy + this.ballDistDown);
        }
        if (this.ballDistLeft != this.distLeft) {
            line(cx, cy, cx - this.ballDistLeft, cy);
        }
        if (this.ballDistRight != this.distRight) {
            line(cx, cy, cx + this.ballDistRight, cy);
        }
    }
}