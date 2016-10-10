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

Grid.prototype.addBall = function(ball) {
    this.cells[ball.cell.x][ball.cell.y] = ball;
};