/* Editting Methods */

// detects and applies user edits
function editMain(game) {
    let x = Math.floor(pmouseX / TILE_SIZE);
    let y = Math.floor(pmouseY / TILE_SIZE);

    if (keyIsPressed) {
        if (x >= 0 && x < max_x && y >= 0 && y < max_y) {
            switch(keyCode) {
                case home_button:
                    setHome(game, x, y);
                    break;
                case goal_button:
                    setGoal(game, x, y);
                    break;
                case board_button:
                    setBoard(game, x, y);
                    break;
                case back_button:
                    setBackground(game, x, y);
                    break;
                case clear_board_button:
                    game.clearGame();
                    break;
                case player_button:
                    addPlayer(game, x, y);
                    break;
                case ball_button:
                    addBall(game, x, y);
                    break;
                case food_button:
                    addFood(game, x, y);
                    break;
            }
        }
    }
}

// adding elements to the game
function setHome(game, x, y) {
    game.tiles[x][y] = new Tile(x, y, 'home');
}

function setGoal(game, x, y) {
    game.tiles[x][y] = new Tile(x, y, 'goal');
}

function setBoard(game, x, y) {
    game.tiles[x][y] = new Tile(x, y, 'board');
}

function setBackground(game, x, y) {
    game.tiles[x][y] = new Tile(x, y, 'back');
}

function addPlayer(game, x, y) {
    for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].x == x && game.players[i].y == y) {
            return;
        }
    }
    game.players.push( new HumanPlayer(x, y) );
}

function addFood(game, x, y) {
    for (let i = 0; i < game.food.length; i++) {
        if (game.food[i].x == x && game.food[i].y == y) {
            return;
        }
    }
    game.food.push( new Food(x, y) );
}

function addBall(game, x, y) {
    for (let i = 0; i < game.balls.length; i++) {
        if (game.balls[i].x == x && game.balls[i].y == y) {
            return;
        }
    }
    let type = getBallTypeSelection();
    let ballLength = getBallRotateLengthInput();
    if (type == 'horizontal' || type == 'vertical') {
        game.balls.push( new LinearBall(x, y, type));
    }

    else if (type == 'ccw' || type == 'cw') {
        let rotatingBallCenter = new RotatingBallCenter(x, y, type, ballLength, 1);
        rotatingBallCenter.setup(game);
        game.balls.push(rotatingBallCenter);
    }
}


// specific level creation
function setLevel1(game) {
    for (let i = 2; i <= 4; i++) {
        for (let j = 6; j <= 11; j++) {
            setHome(game, i, j);
        }
    }

    for (let i = 18; i <= 20; i++) {
        for (let j = 6; j <= 11; j++) {
            setGoal(game, i, j);
        }
    }

    setBoard(game, 5, 11);
    setBoard(game, 6, 11);

    setBoard(game, 17, 6);
    setBoard(game, 16, 6);

    for (let i = 6; i <= 16; i++) {
        for (let j = 7; j <= 10; j++) {
            setBoard(game, i, j);
        }
    }

    game.balls.push(new LinearBall(6, 7, 'horizontal'));
    game.balls.push(new LinearBall(16, 8, 'horizontal'));
    game.balls.push(new LinearBall(6, 9, 'horizontal'));
    game.balls.push(new LinearBall(16, 10, 'horizontal'));
}

function setLevel2(game) {
    for (let i = 6; i <= 17; i++) {
        for (let j = 5; j <= 10; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 3; i <= 5; i++) {
        for (let j = 7; j <= 8; j++) {
            setHome(game, i, j);
        }
    }

    for (let i = 18; i <= 20; i++) {
        for (let j = 7; j <= 8; j++) {
            setGoal(game, i, j);
        }
    }

    game.balls.push(new LinearBall(6, 5, 'vertical'));
    game.balls.push(new LinearBall(7, 10, 'vertical'));
    game.balls.push(new LinearBall(8, 5, 'vertical'));
    game.balls.push(new LinearBall(9, 10, 'vertical'));
    game.balls.push(new LinearBall(10, 5, 'vertical'));
    game.balls.push(new LinearBall(11, 10, 'vertical'));
    game.balls.push(new LinearBall(12, 5, 'vertical'));
    game.balls.push(new LinearBall(13, 10, 'vertical'));
    game.balls.push(new LinearBall(14, 5, 'vertical'));
    game.balls.push(new LinearBall(15, 10, 'vertical'));
    game.balls.push(new LinearBall(16, 5, 'vertical'));
    game.balls.push(new LinearBall(17, 10, 'vertical'));

    game.food.push(new Food(11.5, 7.5));
}

function setLevel3(game) {
    for (let i = 11; i <= 14; i++) {
        setBoard(game, i, 5);
    }

    for (let i = 11; i <= 14; i++) {
        setBoard(game, i, 8);
    }

    for (let j = 4; j <= 8; j++) {
        setBoard(game, 11, j);
    }

    for (let j = 5; j <= 8; j++) {
        setBoard(game, 14, j);
    }

    setHome(game, 12, 6);
    setHome(game, 13, 6);
    setHome(game, 12, 7);
    setGoal(game, 13, 7);

    game.food.push(new Food(11, 4));
    
    for (let i = 0; i < 11; i++) {
        let ball = new SpecialBall1(14, 8, "", i / 1.975) ;
        game.balls.push(ball);
    }    
}

function setLevel4(game) {
    for (let i = 10; i <= 15; i++) {
        for (let j = 5; j <= 10; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 11; i <= 14; i++) {
        for (let j = 4; j <= 4; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 11; i <= 14; i++) {
        for (let j = 11; j <= 11; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 16; i <= 16; i++) {
        for (let j = 6; j <= 9; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 9; i <= 9; i++) {
        for (let j = 6; j <= 9; j++) {
            setBoard(game, i, j);
        }
    }

    for (let i = 12; i <= 13; i++) {
        for (let j = 1; j <= 3; j++) {
            setHome(game, i, j);
        }
    }

    for (let i = 6; i <= 8; i++) {
        for (let j = 7; j <= 8; j++) {
            setGoal(game, i, j);
        }
    }
    let ball = new RotatingBallCenter(13, 8, 'cw', 5, 0.75);
    game.balls.push(ball);
    ball.setup(game);

    game.food.push(new Food(12.5, 4.5));
    game.food.push(new Food(15.5, 7.5));
    game.food.push(new Food(12.5, 10.5));
}

function setLevel5(game) {
    for (let i = 5; i <= 19; i++) {
        setBoard(game, i, 3);
    }

    for (let j = 3; j <= 12; j++) {
        setBoard(game, 18, j);
    }

    for (let i = 5; i <= 18; i++) {
        setBoard(game, i, 12);
    }

    for (let j = 5; j <= 12; j++) {
        setBoard(game, 5, j);
    }

    for (let i = 4; i <= 16; i++) {
        setBoard(game, i, 5);
    }

    for (let j = 5; j <= 10; j++) {
        setBoard(game, 16, j);
    }

    for (let i = 7; i <= 16; i++) {
        setBoard(game, i, 10);
    }

    for (let j = 7; j <= 9; j++) {
        setBoard(game, 7, j);
    }

    for (let i = 7; i <= 13; i++) {
        setBoard(game, i, 7);
    }

    for (let i = 9; i <= 13; i++) {
        setBoard(game, i, 8);
    }

    setHome(game, 3, 5);
    setHome(game, 3, 3);
    setHome(game, 4, 3);

    setHome(game, 20, 3);

    setGoal(game, 14, 7);
    setGoal(game, 14, 8);

    let ball = new RotatingBallCenter(12, 8, 'cw', 4, 1.88);
    ball.setup(game);
}

function setLevel6(game) {
    for (let i = 6; i <= 21; i++) {
        for (let j = 2; j <= 11; j++) {
            if (j != 6 && j != 7) {
                setBoard(game, i, j);
            }
        }
    }

    for (let i = 4; i <= 5; i++) {
        for (let j = 2; j <= 3; j++) {
            setHome(game, i, j);
        }
    }

    for (let i = 4; i <= 5; i++) {
        for (let j = 10; j <= 11; j++) {
            setGoal(game, i, j);
        }
    }

    for (let i = 18; i <= 21; i++) {
        for (let j = 6; j <= 7; j++) {
            setHome(game, i, j);
        }
    }

    for (let i = 8; i < 22; i+= 4) {
        for (let j = 4; j < 11; j += 6) {
            let ball = new RotatingBallCenter(i, j, 'cw', 2, 0.85);
            game.balls.push(ball);
            ball.setup(game);
        }
    }
    
    game.food.push(new Food(6, 8));
    game.food.push(new Food(10, 8));
    game.food.push(new Food(14, 8));
    game.food.push(new Food(18, 8));
}    
