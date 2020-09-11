/* Ball classes */

// Ball constants
var BALL_COLOR = '#0000FF';
var BALL_SIZE = 25;
var BALL_LINEAR_SPEED = 0.12;
var BALL_STROKE = 4;
var BALL_ANGULAR_SPEED = 0.035;
var BALL_SPECIAL_SPEED = 0.0275;

/**
 * Main ball class
 */
class Ball {
    constructor(x, y, type) {
        // location of where to draw the ball
        this.x = x; 
        this.y = y;

        // ball type
        this.type = type;

        // ball reset location
        this.spawnX = x;
        this.spawnY = y;
    }

    // draw the ball to the canvas
    show() {
        let center = this.getCenter();
        strokeWeight(BALL_STROKE);
        stroke(0);
        fill(BALL_COLOR);
        circle(center[0], center[1], BALL_SIZE);
    }

    // gets pixels corresponding to the bounds of the ball
    getEdges() {
        let [centerX, centerY] = this.getCenter(); // center method depends on the type of ball
        let top = centerY - BALL_SIZE / 2 - BALL_STROKE;
        let bot = centerY + BALL_SIZE / 2 + BALL_STROKE;
        let right = centerX + BALL_SIZE / 2 + BALL_STROKE;
        let left = centerX - BALL_SIZE / 2 - BALL_STROKE;

        return [top, left, bot, right];
    }
}

/**
 * Linear ball class (restricted to vertical/horizontal movement)
 */
class LinearBall extends Ball {
    constructor(x, y, type) {
        super(x, y, type);

        // direction is a unit vector [v_x, v_y] that represents the velocity of the ball
        this.direction = this.type == 'vertical'? [0, 1] : [1, 0];
    }

    // gets [x_center, y_center] of the ball
    getCenter() {
        return [this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2]
    }

    // update the position of the ball 
    update(game) {
        let [top, left, bot, right] = this.getEdges();
        let [centerX, centerY] = this.getCenter();

        // canvas collision detection
        if (top <= 0 || bot >= canvas_y || left <= 0 || right >= canvas_x) {
            this.changeDirection(); this.moveInDirection(); return;
        }

        // create projections of future ball location
        top = top + this.direction[1] * BALL_LINEAR_SPEED;
        bot = bot + this.direction[1] * BALL_LINEAR_SPEED;
        left = left + this.direction[0] * BALL_LINEAR_SPEED;
        right = right + this.direction[0] * BALL_LINEAR_SPEED;

        centerX = centerX + this.direction[0] * BALL_LINEAR_SPEED;
        centerY = centerY + this.direction[1] * BALL_LINEAR_SPEED;

        // wall collision detection
        let tilesToCheck = [
            game.tiles[Math.floor(centerX / TILE_SIZE)][Math.floor(top / TILE_SIZE)],
            game.tiles[Math.floor(centerX / TILE_SIZE)][Math.floor(bot / TILE_SIZE)],
            game.tiles[Math.floor(right / TILE_SIZE)][Math.floor(centerY / TILE_SIZE)],
            game.tiles[Math.floor(left / TILE_SIZE)][Math.floor(centerY / TILE_SIZE)],
        ]

        // if the future ball location is not a board tile, it has to rebound
        for (let i = 0; i < tilesToCheck.length; i++) {
            if (tilesToCheck[i].type == 'back') {
                this.changeDirection(); break;
            }
        }

        this.moveInDirection();
    }

    // invert the direction
    changeDirection() {
        this.direction[0] *= -1;
        this.direction[1] *= -1;
    }

    // update the balls location
    moveInDirection() {
        this.x += this.direction[0] * BALL_LINEAR_SPEED;
        this.y += this.direction[1] * BALL_LINEAR_SPEED;
    }

    // reset the ball location
    reset() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.direction = this.type == 'vertical'? [0, 1] : [1, 0];
    }
}

/**
 * Rotating ball center class
 */
class RotatingBallCenter extends Ball {
    constructor(x, y, type, length, spacing) {
        super(x, y, type);
        this.length = length;
        this.spacing = spacing;
    }

     // create the outer rotating balls
    setup(game) {
        for (let i = 1; i <= this.length; i+=1) {
            game.balls.push( new RotatingBallOuter(this.x + i * this.spacing, this.y, this.type, i * this.spacing, 'r', this.x, this.y) );
            game.balls.push( new RotatingBallOuter(this.x - i, this.y, this.type, i * this.spacing, 'l', this.x, this.y) );
            game.balls.push( new RotatingBallOuter(this.x, this.y + i * this.spacing, this.type, i * this.spacing, 'd', this.x, this.y) );
            game.balls.push( new RotatingBallOuter(this.x, this.y - i * this.spacing, this.type, i * this.spacing, 'u', this.x, this.y) );
        }
    }

    getCenter() {
        return [this.x * TILE_SIZE, this.y * TILE_SIZE];
    }

    update() {
        return;
    }

    reset() {
        return;
    }
}

/**
 * Arms of the rotating balls
 */
class RotatingBallOuter extends Ball {
    constructor(x, y, type, pos, direction, centerX, centerY) {
        super(x, y, type);
        this.pos = pos; // distance away from the center ball
        this.direction = direction;
        this.centerX = centerX; // note: this refers to the location the ball is rotating around
        this.centerY = centerY;

        this.time;
        this.reset();
    }

    getCenter() {
        return [this.x * TILE_SIZE, this.y * TILE_SIZE];
    }

    // rotate the ball around the center in a circle
    update() {
        this.time = this.type == 'cw'? this.time += BALL_ANGULAR_SPEED: this.time -= BALL_ANGULAR_SPEED;

        this.x = this.pos * cos(this.time) + this.centerX;
        this.y = this.pos * sin(this.time) + this.centerY;
    }

    // reset the ball location
    reset() {
        switch(this.direction) {
            case 'r':
                this.time = 0;
                break;
            case 'l':
                this.time = Math.PI;
                break;
            case 'd':
                this.time = Math.PI * 3 / 2;
                break;
            case 'u':
                this.time = Math.PI / 2;
        }
        this.x = this.pos * cos(this.time) + this.centerX;
        this.y = this.pos * sin(this.time) + this.centerY;
    }   
}

// Special ball that moves in a square formation 
class SpecialBall1 extends Ball {
    constructor(x, y, type, time) {
        super(x, y, type);
        this.time = time;
        this.timeReset = time;
        this.dirIdx;
        this.update();
    }

    getCenter() {
        return [this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + TILE_SIZE / 2]
    }

    update() {
        let r = 1.5;
        let s = -1;
        let [c1, c2] = this.calcCoefficient(r, s, this.time);

        this.x = c1 + 12.5;
        this.y = c2 + 6.5;
     
        this.time += BALL_SPECIAL_SPEED;
    }

    // parametric equation for a square
    calcCoefficient(r, s, t) {
        let c1 = r/(2*s)*Math.sqrt(2 + 2*s*Math.sqrt(2)*cos(t) + s**2*cos(2*t)) -
                r/(2*s)*Math.sqrt(2 - 2*s*Math.sqrt(2)*cos(t) + s**2*cos(2*t));
        let c2 = r/(2*s)*Math.sqrt(2 + 2*s*Math.sqrt(2)*sin(t) - s**2*cos(2*t)) -
                r/(2*s)*Math.sqrt(2 - 2*s*Math.sqrt(2)*sin(t) - s**2*cos(2*t));
        
        return [c1, c2];
    }

    reset() {
        this.time = this.timeReset;
    }
}