/**
 * Created by Wiskyt on 07/10/2016.
 */

var BALLS_COLOR = [];
var BALLS_RANDOM_PICKER = [];

function GameManager(canvas) {
    this.grid = new Grid(11, 8);
    this.inputManager = new InputManager(canvas);

    this.draw = new Draw(canvas.getContext("2d"));

    this.pathfinder = new Pathfinder();

    // 0 - 9 a - f

    BALLS_COLOR["blue"] = "#0000ff";
    BALLS_COLOR["red"] = "#ff0000";
    BALLS_COLOR["green"] = "#00ff00";
    BALLS_COLOR["gray"] = "#dddddd";
    BALLS_COLOR["black"] = "#000000";

    BALLS_RANDOM_PICKER = Object.keys(BALLS_COLOR);

    this.spawnBall(new Ball(1, 1, 4, this.getRandomColorHexa()));
    this.spawnBall(new Ball(1, 3, 4, this.getRandomColorHexa()));
    this.spawnBall(new Ball(2, 3, 4, this.getRandomColorHexa()));
    this.spawnBall(new Ball(3, 1, 4, this.getRandomColorHexa()));
    this.spawnBall(new Ball(3, 2, 4, this.getRandomColorHexa()));
    this.spawnBall(new Ball(3, 3, 4, this.getRandomColorHexa()));

    this.interval = 30;
    setInterval(this.gameLoop.bind(this));
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
    this.draw.path = null;
    var ball = this.grid.cells[pos.x][pos.y];
    this.grid.cells[pos.x][pos.y] = null;
    this.grid.cells[path[path.length-1].pos.x][path[path.length-1].pos.y] = ball;
    ball.startMoving(path);
};

GameManager.prototype.setup = function () {

};

GameManager.prototype.unvalidate = function () {
    this.draw.validate = false;
};

GameManager.prototype.newPath = function (path) {
    this.draw.path = path;
};

GameManager.prototype.spawnBall = function (ball) {
    this.grid.addBall(ball);

    this.unvalidate();
};

GameManager.prototype.getRandomColorHexa = function () {
    return BALLS_COLOR[BALLS_RANDOM_PICKER[Math.floor(Math.random() * BALLS_RANDOM_PICKER.length)]];
};