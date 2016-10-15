/**
 * Created by Wiskyt on 08/10/2016.
 */

function Ball(x, y, value, color, isSmallie) {
    this.value = value;
    this.color = color;
    this.smallie = isSmallie;

    if (this.smallie) this.radius = 15;
    else this.radius = 30;

    this.speed = 0; // Pixels per second
    this.baseSpeed = 600;
    this.acceleration = 1800;
    this.maxSpeed = 1600;

    this.growSpeed = 10;
    this.growAcceleration = 400;
    this.maxGrowSpeed = 200;

    this.blobEffectPercent = 30000; // Per second, not in % but in proba style :  value for a 1/15 second blob

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

    this.blobAnim = new Anim(this, function (obj, ellapsed, params) {
        var effect = (obj.blobEffectPercent * (ellapsed /1000) / 100);
        if (effect < 0) return true;

        if (params[0] == "+x" || params[0] == "-x") {
            obj.speedEffect.x -= effect;
            obj.speedEffect.y += effect;
            if (obj.speedEffect.x < -obj.maxSpeedEffect) {
                obj.speedEffect.x = -obj.maxSpeedEffect;
                obj.speedEffect.y = obj.maxSpeedEffect;
                return true;
            }
        } else if (params[0] == "+y" || params[0] == "-y") {
            obj.speedEffect.x += effect;
            obj.speedEffect.y -= effect;
            if (obj.speedEffect.y < -obj.maxSpeedEffect) {
                obj.speedEffect.x = obj.maxSpeedEffect;
                obj.speedEffect.y = -obj.maxSpeedEffect;
                return true;
            }
        }
        return false;
    });

    this.growAnim = new Anim(this, function (obj, ellapsed, params) {
        // We use speedEffect instead of creating a new variable that'd serve the same purpose
        if (!this.params[0]) { // If we didnt pop yet
            obj.speedEffect.x += obj.growSpeed * (ellapsed / 1000);
            obj.speedEffect.y += obj.growSpeed * (ellapsed / 1000);

            if (obj.speedEffect.x > obj.radius + 5) {
                this.params[0] = true;
            } else {
                if (obj.growSpeed < obj.maxGrowSpeed) {
                    obj.growSpeed += obj.growAcceleration * (ellapsed / 1000);
                } else {
                    obj.growSpeed = obj.maxGrowSpeed;
                }
            }
        } else {
            obj.speedEffect.x -= obj.growSpeed * (ellapsed / 1000);
            obj.speedEffect.y -= obj.growSpeed * (ellapsed / 1000);

            if (obj.speedEffect.x < obj.radius) {
                return true;
            } else {
                obj.growSpeed -= 2 * (obj.growAcceleration * (ellapsed / 1000));
            }
        }
        return false;
    });

    this.blobbing = false;
    this.moving = false;
    this.growing = false;
    this.cPath = null;
    this.animStep = 0;
    this.anim = null;
}

Ball.prototype.update = function () {
    if (this.anim != null && this.anim.running) {
        var ended = this.anim.update();

        if (this.moving) {
            if (ended) {
                this.pos.x = Math.floor(this.pos.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE_HALF; // Too much speed cell correction
                this.pos.y = Math.floor(this.pos.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE_HALF;

                gameManager.unvalidate();

                this.animStep++;

                if (this.animStep < this.cPath.length) {
                    this.moving = false;
                    this.blobbing = true;
                    this.blobAnim.params = this.moveAnim.params;
                    this.anim = this.blobAnim;
                    this.anim.start();
                } else {
                    this.speedEffect.set(0, 0);
                    this.anim.running = false;
                    this.moving = false;
                    gameManager.notifyBallArrival(this);
                }
            }
        } else if (this.blobbing) {
            if (ended) {
                this.anim = this.moveAnim;
                this.moving = true;
                this.blobbing = false;
                this.move();
                this.anim.start();
            }
        } else if (this.growing) {
            if (ended) {
                this.radius = 30;
                this.speedEffect.set(0, 0);
                this.anim.running = false;
                this.growing = false;
                gameManager.tryScoring(this);
            }
        }
        return this.anim.running;
    }

    return false;
};

Ball.prototype.grow = function () {
    this.smallie = false;
    this.growing = true;
    this.anim = this.growAnim;
    this.anim.params[0] = false;
    this.anim.start();
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

Ball.prototype.moveToCell = function (x, y) {
    this.cell.set(x, y);
    this.pos.set(x * TILE_SIZE + TILE_SIZE_HALF, y * TILE_SIZE + TILE_SIZE_HALF);
};