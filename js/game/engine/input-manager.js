/**
 * Created by Wiskyt on 08/10/2016.
 */

function InputManager(canvas) {
    this.canvas = canvas;

    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    this.switchFocus = false;
    this.startTileSelected = new Vector2D(-1, -1);
    this.endTileSelected = new Vector2D(-1, -1);

    this.canvas.addEventListener('click', this.onClick.bind(this), false);
    this.canvas.addEventListener('mousemove', this.onMove.bind(this), false);
}

InputManager.prototype.onClick = function(event) {

/*    var x = event.pageX - this.pad.left,
        y = event.pageY - this.pad.top;*/
    var mouse = this.getMouse(event);

    var cellX = Math.floor(mouse.x / TILE_SIZE);
    var cellY = Math.floor(mouse.y / TILE_SIZE);

    if (this.switchFocus) {
        this.startTileSelected.copy(this.endTileSelected);
        this.endTileSelected.reset();
        this.switchFocus = false;
    }
    else if (this.startTileSelected.x >= 0) {
        if (this.startTileSelected.compare(cellX, cellY)) {
            this.startTileSelected.reset();
            this.endTileSelected.reset();
        } else {
            if (this.endTileSelected.x >= 0 && gameManager.draw.path != null &&
                this.endTileSelected.compare(cellX, cellY) &&
                (gameManager.grid.cells[cellX][cellY] == null || gameManager.grid.cells[cellX][cellY].smallie)) {
                    if (gameManager.grid.isSmallieBallThere(cellX, cellY)) {
                        gameManager.moveSmallie(cellX, cellY);
                    }

                    var path = gameManager.pathfinder.find(gameManager.inputManager.startTileSelected, gameManager.inputManager.endTileSelected);

                    if (path != null) {
                        gameManager.moveBall(gameManager.inputManager.startTileSelected, path);
                    }
                    gameManager.inputManager.startTileSelected.reset();
                    gameManager.inputManager.endTileSelected.reset();

            }
        }
    } else if (gameManager.grid.cells[cellX][cellY] != null && !gameManager.grid.cells[cellX][cellY].smallie  &&
                !(gameManager.grid.cells[cellX][cellY].moving || gameManager.grid.cells[cellX][cellY].blobbing)) {
        this.startTileSelected.set(cellX, cellY);
    }

    gameManager.unvalidate();
};

InputManager.prototype.onMove = function(event) {
    var mouse = this.getMouse(event);

    var cellX = Math.floor(mouse.x / TILE_SIZE);
    var cellY = Math.floor(mouse.y / TILE_SIZE);

    var change = false;

    if (this.startTileSelected.x >= 0 && !this.startTileSelected.compare(cellX, cellY)) {
        if (!this.endTileSelected.compare(cellX, cellY)) {
            this.endTileSelected.set(cellX, cellY);
            if (gameManager.grid.isGrownBallThere(cellX, cellY)) {
                this.switchFocus = true;
                gameManager.resetPath();
            } else {
                var path = gameManager.pathfinder.find(gameManager.inputManager.startTileSelected, gameManager.inputManager.endTileSelected);
                gameManager.newPath(path);
                this.switchFocus = false;
            }
            change = true;
        }
    }

    if (change) gameManager.unvalidate();
};

InputManager.prototype.getMouse = function(e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    if (mx < 0) mx = 0; if(my < 0) my = 0; if (mx > CANVAS_WIDTH) mx = CANVAS_WIDTH; if (my > CANVAS_HEIGHT) my = CANVAS_HEIGHT;

    // We return a simple javascript object (a hash) with x and y defined
    return {x: mx, y: my};
};