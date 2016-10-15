/**
 * Created by Wiskyt on 08/10/2016.
 */

function Vector2D (x, y) {
    this.x = x;
    this.y = y;
}

Vector2D.prototype.compareV = function (v) {
    if (this.x == v.x && this.y == v.y) {
        return true;
    } else return false;
};

Vector2D.prototype.compare = function (x, y) {
    if (this.x == x && this.y == y) {
        return true;
    } else return false;
};

Vector2D.prototype.set = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector2D.prototype.reset = function () {
    this.x = -1;
    this.y = -1;
};

Vector2D.prototype.log = function () {
    return "[" + this.x + ", " + this.y + "]";
};

Vector2D.prototype.heuristic = function(v) {
    return Math.abs(v.x - this.x) + Math.abs (v.y - this.y);
};

Vector2D.prototype.toDirectionalVector = function(target) {
    var rV = new Vector2D(0, 0);
    if (target.x - this.x > 0) rV.x = 1; else if (target.x - this.x < 0) rV.x = -1;
    if (target.y - this.y > 0) rV.y = 1; else if (target.y - this.y < 0) rV.y = -1;
    return rV;
};

Vector2D.prototype.copy = function (target) {
    this.x = target.x;
    this.y = target.y;
};

Vector2D.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};