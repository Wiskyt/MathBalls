/**
 * Created by Wiskyt on 09/10/2016.
 */

function Anim(obj, exec) {
    this.obj = obj;
    this.exec = exec;
    this.running = false;
    this.lastExec = 0;
    this.params = [];
}

Anim.prototype.start = function () {
    this.running = true;
    this.lastExec = +new Date();
};

Anim.prototype.update = function () {
    if (this.running) {
        var now = +new Date();
        var ellapsed = now - this.lastExec;
        this.lastExec = now;
        return this.exec(this.obj, ellapsed, this.params);
    }

    return false;
};
