/**
 * Created by Wiskyt on 08/10/2016.
 */

function Ball(x, y, value, color) {
    this.value = value;
    this.color = color;

    this.speed = 0; // Pixels per second
    this.baseSpeed = 600;
    this.acceleration = 1500;
    this.maxSpeed = 1200;

    this.maxSpeedEffect = 10;
    this.speedEffect = new Vector2D(0, 0);

    this.cell = new Vector2D(x, y);
    this.pos = new Vector2D(x * TILE_SIZE + TILE_SIZE_HALF, y * TILE_SIZE + TILE_SIZE_HALF);

    // Function given to anim should return true when its ended
    this.moveAnim = new Anim(this, function (obj, ellapsed, params) {

        var effect = obj.speed / obj.maxSpeed * obj.maxSpeedEffect;

        if (params[0] == "+x") {
            if (obj.pos.x < params[1]) {
                obj.pos.x += obj.speed * (ellapsed / 1000);
                obj.speedEffect.y = -effect;
                obj.speedEffect.x = effect;
            } else return true;
        } else if (params[0] == "-x"){
            if (obj.pos.x > params[1]) {
                obj.pos.x -= obj.speed * (ellapsed / 1000);
                obj.speedEffect.y = -effect;
                obj.speedEffect.x = effect;
            } else return true;
        } else if (params[0] == "+y"){
            if (obj.pos.y < params[1]) {
                obj.pos.y += obj.speed * (ellapsed / 1000);
                obj.speedEffect.y = effect;
                obj.speedEffect.x = -effect;
            } else return true;
        } else if (params[0] == "-y"){
            if (obj.pos.y > params[1]) {
                obj.pos.y -= obj.speed * (ellapsed / 1000);
                obj.speedEffect.y = effect;
                obj.speedEffect.x = -effect;
            } else return true;
        }

        if (obj.speed < obj.maxSpeed) {
            obj.speed += obj.acceleration * (ellapsed / 1000);
        } else {
            obj.speed = obj.maxSpeed;
        }

        return false;
    });

    this.moving = false;
    this.cPath = null;
    this.animStep = 0;
    this.anim = null;
}

Ball.prototype.update = function () {
    if (this.anim != null && this.anim.running) {
        var ended = this.anim.update();

        if (ended) {
            this.pos.x = Math.floor(this.pos.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE_HALF; // Too much speed cell correction
            this.pos.y = Math.floor(this.pos.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE_HALF;
            gameManager.unvalidate();

            this.animStep++;
            if (this.animStep < this.cPath.length) {
                this.move();
            } else {
                this.speedEffect.set(0, 0);
                this.anim.running = false;
                this.moving = false;
            }
        }

        return this.anim.running;
    }

    return false;
};

Ball.prototype.move = function () {
    if (typeof this.cPath[this.animStep].x === "undefined") {
        this.moveAnim.params[0] = this.cPath[this.animStep].y > 0 ? "+y" : "-y";
        this.moveAnim.params[1] = this.pos.y + TILE_SIZE * this.cPath[this.animStep].y;
    } else {
        this.moveAnim.params[0] = this.cPath[this.animStep].x > 0 ? "+x" : "-x";
        this.moveAnim.params[1] = this.pos.x + TILE_SIZE * this.cPath[this.animStep].x;
    }
};

Ball.prototype.startMoving = function (path) {
    this.moving = true;
    this.cPath = this.computePath(path);
    this.cell = path[path.length-1].pos;
    this.animStep = 0;

    this.speed = this.baseSpeed;

    this.move();

    this.anim = this.moveAnim;
    this.anim.start();
};

// Turns the cell by cell path into line by line path for ball movement purposes
// Could be coded better imo but yolo
Ball.prototype.computePath = function (path) {
    var pos = path[0].pos.toDirectionalVector(path[1].pos);
    var iB = 0;
    var cPath = [pos.x != 0 ? {x: pos.x} : {y: pos.y}];
    var prev = pos;

    for (var i = 1; i < path.length-1; i++) {
        var v = path[i].pos.toDirectionalVector(path[i+1].pos);
      //  console.log(i + " / " + v.log() + ", " + prev.log());
        if (v.compareV(prev)) {
            if (typeof cPath[iB].x === "undefined") cPath[iB].y += v.y;
            else cPath[iB].x += v.x;
        } else {
            cPath.push(v.x != 0 ? {x: v.x} : {y: v.y});
            iB++;
        }

        prev = v;
    }

    return cPath;
};