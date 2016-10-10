/**
 * Created by Wiskyt on 07/10/2016.
 */

function Draw(ctx) {
    this.ctx = ctx;
    console.log(ctx.scale);
    this.path = null;
    this.valid = false; // when set to false, the canvas will redraw everything
}

Draw.prototype.draw = function () {
    if (!this.validate) {
        this.ctx.strokeStyle = "#CDC1B4";
        this.ctx.fillStyle = "#FAF8EF";

        this.roundRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 6, true, false);
        this.drawGrid();
        this.drawPath();
        this.drawAllBalls();

        if (gameManager.inputManager.startTileSelected.x >= 0) {
            this.drawSelectedTile(gameManager.inputManager.startTileSelected.x, gameManager.inputManager.startTileSelected.y, 0);
        }
        if (gameManager.inputManager.endTileSelected.x >= 0) {
            this.drawSelectedTile(gameManager.inputManager.endTileSelected.x, gameManager.inputManager.endTileSelected.y, this.path == null ? 2 : 1);
        }


        this.validate = true;
    }
};

Draw.prototype.drawAllBalls = function () {
    var cells = gameManager.grid.cells;
    for (var x = 0, w = gameManager.grid.width; x < w; x++) {
        for (var y = 0, h = gameManager.grid.height; y < h; y++) {
            if (cells[x][y] != null) {
                this.drawBall(cells[x][y]);
            }
        }
    }
};

Draw.prototype.drawBall = function (ball) {
    this.ctx.beginPath();
    this.ctx.fillStyle = ball.color;

    this.ctx.ellipse(ball.pos.x, ball.pos.y, 30 + ball.speedEffect.x, 30 + ball.speedEffect.y, 0, 0, 2 * Math.PI);
    this.ctx.fill();

    //this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(""+ ball.value, ball.pos.x, ball.pos.y);
  //  this.ctx.fill();
};

Draw.prototype.drawSelectedTile = function(x, y, colorNumber) {
    this.ctx.lineWidth = 10;
    switch (colorNumber) {
        case 0:
            this.ctx.strokeStyle = "#5F9F9F";
            break;
        case 1:
            this.ctx.strokeStyle = "#006600";
            break;
        case 2:
            this.ctx.strokeStyle = "#6F4242";
            break;
    }

    var offset = 4.5;
    this.roundRect(x * 90 + offset, y * 90 + offset, TILE_SIZE - (offset*2), TILE_SIZE - (offset*2), 2, false, true);
};

Draw.prototype.drawLine = function(x, y, dX, dY, style) {
    this.ctx.beginPath();
    if (typeof style !== 'undefined') {
        style();
    } else {
        this.ctx.lineWidth = 15;
        this.ctx.strokeStyle = "black";
        this.ctx.lineCap = 'round';
    }

    this.ctx.moveTo(x,y);
    this.ctx.lineTo(x + dX, y + dY);
    this.ctx.stroke();
};

Draw.prototype.drawBend = function(x, y, dX, dY, radius) {
    if (typeof radius == "undefined") radius = 45;

    this.ctx.beginPath();
    this.ctx.lineWidth = 15;
    this.ctx.strokeStyle = "black";
    this.ctx.lineCap = 'round';
    this.ctx.moveTo(x, y);           // Create a starting point
    this.ctx.arcTo(x + dX, y, x + dX, y + dY, radius); // Create an arc
    this.ctx.stroke();
};

Draw.prototype.drawGrid = function() {
    for (var x = TILE_SIZE; x < gameManager.grid.width * TILE_SIZE; x += TILE_SIZE) {
        this.drawLine(x, 0, 0, CANVAS_HEIGHT, function() {this.ctx.lineWidth = 1;}.bind(this));
    }

    for (var y = TILE_SIZE; y < gameManager.grid.height * TILE_SIZE; y += TILE_SIZE) {
        this.drawLine(0, y, CANVAS_WIDTH, 0, function() {this.ctx.lineWidth = 1;}.bind(this));
    }
};

Draw.prototype.drawPath = function() {
    if (this.path != null) {
        for (var i = 1, pl = this.path.length - 1; i < pl; i++) {
            var pos = this.path[i].pos;
            var v = this.path[i - 1].pos.toDirectionalVector(this.path[i + 1].pos);
            var v2 = this.path[i-1].pos.toDirectionalVector(pos);

            if (v.compare(-1, 0) || v.compare(1, 0)) { // Left or Right
                this.drawLine(pos.x * TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, TILE_SIZE, 0);
            } else if (v.compare(0, -1) || v.compare(0, 1)) { // Top or Bottom
                this.drawLine(pos.x * TILE_SIZE + TILE_SIZE_HALF, pos.y * TILE_SIZE, 0, TILE_SIZE);
            } else if (v.compare(-1, 1)) { // Bottom Left
                if (v2.x < 0) {
                    this.drawBend(pos.x * TILE_SIZE + TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, -TILE_SIZE_HALF, TILE_SIZE_HALF);
                } else {
                    this.drawBend(pos.x * TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, TILE_SIZE_HALF, -TILE_SIZE_HALF);
                }

            } else if (v.compare(-1, -1)) { // Top Left
                if (v2.x < 0) {
                    this.drawBend(pos.x * TILE_SIZE + TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, -TILE_SIZE_HALF, -TILE_SIZE_HALF);
                } else {
                    this.drawBend(pos.x * TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF);
                }

            } else if (v.compare(1, -1)) { // Top right
                if (v2.x > 0) {
                    this.drawBend(pos.x * TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, TILE_SIZE_HALF, -TILE_SIZE_HALF);
                } else {
                    this.drawBend(pos.x * TILE_SIZE + TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, -TILE_SIZE_HALF, TILE_SIZE_HALF);
                }
            } else if (v.compare(1, 1)) { // Bottom right
                if (v2.x > 0) {
                    this.drawBend(pos.x * TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF);
                } else {
                    this.drawBend(pos.x * TILE_SIZE + TILE_SIZE, pos.y * TILE_SIZE + TILE_SIZE_HALF, -TILE_SIZE_HALF, -TILE_SIZE_HALF);
                }

            }
        }
    }
};


/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */

Draw.prototype.roundRect = function(x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.tl, y);
    this.ctx.lineTo(x + width - radius.tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.ctx.lineTo(x + width, y + height - radius.br);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    this.ctx.lineTo(x + radius.bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.ctx.lineTo(x, y + radius.tl);
    this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    this.ctx.closePath();
    if (fill) {
        this.ctx.fill();
    }
    if (stroke) {
        this.ctx.stroke();
    }
};