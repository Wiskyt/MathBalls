/**
 * Created by Wiskyt on 07/10/2016.
 */

var BALLS_COLOR = [];
var BALLS_RANDOM_PICKER = [];
var SCORE_MULTIPLIERS = [];

function GameManager(canvas) {
    this.grid = new Grid(11, 8);
    this.inputManager = new InputManager(canvas);

    this.draw = new Draw(canvas.getContext("2d"));

    this.pathfinder = new Pathfinder();

    this.htmlManager = new HTMLManager();

    this.moves = 0;
    this.score = 0;

    BALLS_COLOR["blue"] = "#0000ff";
    BALLS_COLOR["red"] = "#ff0000";
    BALLS_COLOR["green"] = "#00ff00";
    BALLS_COLOR["gray"] = "#dddddd";
    BALLS_COLOR["black"] = "#000000";

    BALLS_RANDOM_PICKER = Object.keys(BALLS_COLOR);

    SCORE_MULTIPLIERS["line5"] = "1";
    SCORE_MULTIPLIERS["line6"] = "1.5";
    SCORE_MULTIPLIERS["line7"] = "2";
    SCORE_MULTIPLIERS["line8"] = "3";
    SCORE_MULTIPLIERS["line9"] = "4";
    SCORE_MULTIPLIERS["line10"] = "5";
    SCORE_MULTIPLIERS["line11"] = "8";

    this.smallies = [];
    this.spawnRandomBalls(5, false);
    this.spawnRandomBalls(3, true);

    this.unvalidate();

    setInterval(this.gameLoop.bind(this), 20);
}

GameManager.prototype.gameLoop = function () {
    for (var x = 0; x < this.grid.width; x++) {
        for (var y = 0; y < this.grid.height; y++) {
            if (this.grid.cells[x][y] != null) {
                if (this.grid.cells[x][y].update()) {
                    this.unvalidate();
                }
            }
        }
    }

    this.draw.draw();
};

GameManager.prototype.moveBall = function (pos, path) {
    this.moves++;
    this.resetPath();
    var ball = this.grid.cells[pos.x][pos.y];
    this.grid.cells[pos.x][pos.y] = null;
    this.grid.cells[path[path.length-1].pos.x][path[path.length-1].pos.y] = ball;
    ball.startMoving(path);
};

GameManager.prototype.grow = function () {
    for (var i = 0; i < this.smallies.length;) {
        var s = this.smallies.shift();
        s.grow();

        if (this.inputManager.endTileSelected.compare(s.cell.x, s.cell.y)) {
            this.inputManager.switchFocus = true;
            this.resetPath();
        }
    }
    this.spawnRandomBalls(3, true);

    this.unvalidate();
};

GameManager.prototype.setup = function () {

};

GameManager.prototype.unvalidate = function () {
    this.draw.valid = false;
};

GameManager.prototype.newPath = function (path) {
    this.draw.path = path;
};

GameManager.prototype.spawnRandomBalls = function (howMany, isSmallie) {
    var cells = this.grid.availableCells();

    for (var i = 0; i < howMany; i++) {
        var random = Math.floor(Math.random() * cells.length);
        var ball = new Ball(cells[random].x, cells[random].y, 4, this.getRandomColorHexa(), isSmallie);

        if (isSmallie) {
            this.smallies.push(ball);
        }

        this.grid.addBall(ball);
        cells.splice(random, random+1);
    }
};

GameManager.prototype.moveSmallie = function (x, y) {
    for (var i = 0; i < this.smallies.length; i++) {
        var smallie = this.smallies[i];

        if (smallie.cell.x == x && smallie.cell.y == y) {
            var r = this.grid.getRandomAvailableCell();
            smallie.moveToCell(r.x, r.y);

            this.grid.moveBall(x, y, r.x, r.y);
            break;
        }
    }
};

GameManager.prototype.notifyBallArrival = function (ball) {
    if (!this.tryScoring(ball)) {
        this.grow();
    }
};

GameManager.prototype.tryScoring = function (ball) {
    var neighbors = {
        left: this.grid.checkNeighbors(new Vector2D(ball.cell.x, ball.cell.y), new Vector2D(-1, 0)),
        top: this.grid.checkNeighbors(new Vector2D(ball.cell.x, ball.cell.y), new Vector2D(0, -1)),
        right: this.grid.checkNeighbors(new Vector2D(ball.cell.x, ball.cell.y), new Vector2D(1, 0)),
        bot: this.grid.checkNeighbors(new Vector2D(ball.cell.x, ball.cell.y), new Vector2D(0, 1))
    };

    if (neighbors.left + neighbors.right >= neighbors.top + neighbors.bot && neighbors.left + neighbors.right >= MIN_LINE_LENGTH - 1) { // -1 because starting ball isnt counted
        this.doLine(ball, neighbors.left, neighbors.right, "horizontal");
        return true;
    } else if (neighbors.top + neighbors.bot >= MIN_LINE_LENGTH - 1) {
        this.doLine(ball, neighbors.top, neighbors.bot, "vertical");
        return true;
    }

    return false;
};

GameManager.prototype.doLine = function (ball, n1, n2, direction) {
    // Ball.eat(n1, n2, direction);
    // When we add animation need to make Smallies grow at the same time

    var highestScore = ball.value;
    var value;

    if (direction == "horizontal") {
        for (var x = ball.cell.x - n1; x <= ball.cell.x + n2; x++) {
            if (x != ball.cell.x) {
                value = this.grid.cells[x][ball.cell.y].value;
                ball.value += value;
                if (value > highestScore) highestScore =  value;
            }
            this.grid.removeBall(x, ball.cell.y);
        }
    } else if (direction == "vertical") {
        for (var y = ball.cell.y - n1; y <= ball.cell.y + n2; y++) {
            if (y != ball.cell.y) {
                value = this.grid.cells[ball.cell.x][y].value;
                ball.value += value;
                if (value > highestScore) highestScore = value;
            }
            this.grid.removeBall(ball.cell.x, y);
        }
    }

    this.grid.addBall(ball);
    this.updateScore(ball.value - highestScore, "line", n1+n2+1);
    this.unvalidate();
};

GameManager.prototype.updateScore = function (score, type, length) {
    if (type == "line") {
        score *= SCORE_MULTIPLIERS[type+length];
    }

    this.score += score;
    this.htmlManager.updateScore(this.score);
};

GameManager.prototype.getRandomColorHexa = function () {
    // return BALLS_COLOR["blue"];
    return BALLS_COLOR[BALLS_RANDOM_PICKER[Math.floor(Math.random() * BALLS_RANDOM_PICKER.length)]];
};

GameManager.prototype.resetPath = function () {
    this.draw.path = null;
};