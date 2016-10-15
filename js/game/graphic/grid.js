/**
 * Created by Wiskyt on 07/10/2016.
 */
function Grid(width, height) {
    this.width = width;
    this.height = height;
    this.cells = this.emptyGrid();
}

Grid.prototype.emptyGrid = function () {
    var cells = [];

    for (var x = 0; x < this.width; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.height; y++) {
            row.push(null);
        }
    }

    return cells;
};

Grid.prototype.availableCells = function () {
    var available = [];
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.cells[x][y] == null)  available.push({x: x, y: y});
        }
    }

    return available;
};

Grid.prototype.getRandomAvailableCell = function () {
    var available = this.availableCells();

    return available[Math.floor(Math.random() * available.length)];
};

Grid.prototype.addBall = function(ball) {
    this.cells[ball.cell.x][ball.cell.y] = ball;
};

Grid.prototype.isGrownBallThere = function(x, y) {
    return this.cells[x][y] != null && !this.cells[x][y].smallie;
};

Grid.prototype.isSmallieBallThere = function(x, y) {
    return this.cells[x][y] != null && this.cells[x][y].smallie;
};

Grid.prototype.moveBall = function (x, y, x2, y2) {
    this.cells[x2][y2] = this.cells[x][y];
    this.cells[x][y] = null;
};

Grid.prototype.removeBall = function (x, y) {
    this.cells[x][y] = null;
};

/**
 * Recursive function that returns the number of neighbors in a specified direction
 * @param vNode  The starting node in Vector2D coordinates
 * @param vDirection Direction wanted in directional vector type (still Vector2D)
 */

Grid.prototype.checkNeighbors = function(vNode, vDirection) {
    if (vNode.x + vDirection.x >= 0 && vNode.x + vDirection.x < this.width &&
        vNode.y + vDirection.y >= 0 && vNode.y + vDirection.y < this.height &&
        this.cells[vNode.x + vDirection.x][vNode.y + vDirection.y] != null &&
        this.cells[vNode.x + vDirection.x][vNode.y + vDirection.y].color == this.cells[vNode.x][vNode.y].color) {
            vNode.add(vDirection);
            return 1 + this.checkNeighbors(vNode, vDirection);
    } else return 0;
};