/**
 * Created by Wiskyt on 07/10/2016.
 */
function Grid(width, height) {
    this.width = width;
    this.height = height;
    this.cells = this.empty();
    createGrid();
}

Grid.prototype.empty = function () {
    var cells = [];

    for (var x = 0; x < this.width; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.height; y++) {
            row.push(null);
        }
    }

    return cells;
};

Grid.prototype.createGrid(strokeWidth) {
   // var pX = (CANVAS_WIDTH - (TILE_SIZE * this.width)) / (this.width - 2);
    for (var x = TILE_SIZE; x < (this.width * TILE_SIZE); x += TILE_SIZE) {

    }
}