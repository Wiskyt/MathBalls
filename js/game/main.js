/**
 * Created by Wiskyt on 07/10/2016.
 */

var CANVAS_WIDTH = document.getElementById("canvas").getContext("2d").canvas.width;
var CANVAS_HEIGHT = document.getElementById("canvas").getContext("2d").canvas.height;
var TILE_SIZE = 90;
var TILE_SIZE_HALF = 45;
var MIN_LINE_LENGTH = 5;
var gameManager = new GameManager(document.getElementById("canvas"));