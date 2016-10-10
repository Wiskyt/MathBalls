/**
 * Created by Wiskyt on 08/10/2016.
 */

function Pathfinder() {}

Pathfinder.prototype.init = function() {
    this.grid = [];
    for(var x = 0; x < gameManager.grid.cells.length; x++) {
        this.grid.push([]);
        for(var y = 0; y < gameManager.grid.cells[x].length; y++) {
            this.grid[x].push({});
            this.grid[x][y].f = 0;
            this.grid[x][y].g = 0;
            this.grid[x][y].h = 0;
            this.grid[x][y].debug = "";
            this.grid[x][y].parent = null;
            this.grid[x][y].pos = null;
            this.grid[x][y].status = "unknown";
        }
    }
};

Pathfinder.prototype.find = function(vStart, vEnd) {
    this.init();

   // console.log("Pathfinding from : " + vStart.log() + " to " + vEnd.log());

    var openList   = [],
        closedList = [],
        ret        = [];

    var startNode = this.grid[vStart.x][vStart.y];
    startNode.pos = vStart;
    startNode.status = "open";
    openList.push(startNode);

    while(openList.length > 0) {
        var lowInd = 0;
        var i = 0;
        for(i=0; i<openList.length; i++) {
            if(openList[i].f < openList[lowInd].f) { lowInd = i; }
        }

        var currentNode = openList[lowInd];

      //  console.log("Analyzed node : " + currentNode.pos.log() + " // LF: " + vEnd.log() + " || " + currentNode.pos.compareV(vEnd));

        // End case -- result has been found, return the traced path
        if(currentNode.pos.compareV(vEnd)) {
            var curr = currentNode;
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }

            ret.push(startNode);
            return ret.reverse();
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors
        openList.splice(openList.indexOf(currentNode), 1);
        closedList.push(currentNode);
        currentNode.status = "closed";


        var neighbors = this.neighbors(currentNode);

        for(i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];
            if(neighbor.status == "closed" || gameManager.grid.cells[neighbor.pos.x][neighbor.pos.y] != null) {
                // not a valid node to process, skip to next neighbor
                continue;
            }

            // g score is the shortest distance from start to current node, we need to check if
            //	 the path we have arrived at this neighbor is the shortest one we have seen yet
            var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;

            if(neighbor.status == "unknown") {
                // This the the first time we have arrived at this node, it must be the best
                // Also, we need to take the h (heuristic) score since we haven't done so yet

                gScoreIsBest = true;
                neighbor.h = neighbor.pos.heuristic(vEnd);
                neighbor.status = "open";
                openList.push(neighbor);
            }
            else if(neighbor.status == "open" && gScore < neighbor.g) {
                // We have already seen the node, but last time it had a worse g (distance from start)
                gScoreIsBest = true;
            }

            if(gScoreIsBest) {
                // Found an optimal (so far) path to this node.	 Store info on how we got here and
                //	just how good it really is...
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            //    console.log("F: " + neighbor.f + "\nG: " + neighbor.g + "\nH: " + neighbor.h);
            }
        }
    }

    // No result found
    return null;
};

Pathfinder.prototype.neighbors = function(node) {
    var ret = [];
    var x = node.pos.x;
    var y = node.pos.y;

    if(this.grid[x-1] && this.grid[x-1][y]) {
        this.grid[x-1][y].pos= new Vector2D(x-1, y);
        ret.push(this.grid[x-1][y]);
    }
    if(this.grid[x+1] && this.grid[x+1][y]) {
        this.grid[x+1][y].pos= new Vector2D(x+1, y);
        ret.push(this.grid[x+1][y]);
    }
    if(this.grid[x][y-1] && this.grid[x][y-1]) {
        this.grid[x][y-1].pos= new Vector2D(x, y-1);
        ret.push(this.grid[x][y-1]);
    }
    if(this.grid[x][y+1] && this.grid[x][y+1]) {
        this.grid[x][y+1].pos= new Vector2D(x, y+1);
        ret.push(this.grid[x][y+1]);
    }
    return ret;
};