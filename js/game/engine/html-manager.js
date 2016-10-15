/**
 * Created by Wiskyt on 13/10/2016.
 */

function HTMLManager() {
    this.scoreContainer   = document.querySelector(".actual-score-container");
    this.bestContainer    = document.querySelector(".best-score-container");
    this.score = 0;
}

HTMLManager.prototype.updateScore = function (newScore) {
    this.clearContainer(this.scoreContainer);

    var diff = newScore - this.score;
    this.score = newScore;

    this.scoreContainer.textContent = this.score;

    if (diff > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + diff;

        this.scoreContainer.appendChild(addition);
    }
};

HTMLManager.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};