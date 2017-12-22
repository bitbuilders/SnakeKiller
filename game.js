var canvas;
var ctx;

var shield = new Image(25, 10);

var inPlayerAnimation = false;
var inSnakeAnimation = false;

var mouseX = 0;
var mouseY = 0;
var prevX = 0;
var prevY = 0;
var tilesHorizontal = 30;
var tilesVertical = 14;
var tileSize = 30;
var x = tilesHorizontal / 2;
var y = tilesVertical / 2;

var snakeX = tilesHorizontal - 5;
var snakeY = 5;
var snakePrevX = 0;
var snakePrevY = 0;
var snakeCurrTime = 0;
var snakeGrowthTime = 15;
var snakeGrowthCurrentTime = 0;
var snakeDirChange = 3; // millis, but will change every time
var snakeDirPossibilities = ["left", "up", "right", "down"];
var snakeCurrentDir = "left";
var snakeBody = [];

var timer;

window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    canvas.width = tilesHorizontal * tileSize;
    canvas.height = tilesVertical * tileSize;

    document.addEventListener("keydown", move);
    document.addEventListener("keyup", stop);
    canvas.addEventListener("mousemove", mouseMove);
    // var success = true;
    // while (success)
    // {
    //     success = gameLoop();
    // }
    timer = setInterval(gameLoop,10);
    drawPlayer();
    // var img = new Image();
    // img.onload = function() {
    //   ctx.drawImage(img, 0, 0);
    // };
    shield.src = 'Images/shield.png';

    createGrid();
}

var leftKey = 37;
var upKey = 38;
var rightKey = 39;
var downKey = 40;
var aKey = 65;
var wKey = 87;
var dKey = 68;
var sKey = 83;

var leftDown = false;
var upDown = false;
var rightDown = false;
var downDown = false;

var gunLDown = false;
var gunUDown = false;
var gunRDown = false;
var gunDDown = false;

var playerSpeed = 150; // millis

function gameLoop()
{
    update();
    render();
    return true;
}

function update()
{
    if (!inPlayerAnimation) {
        applyMovement();
        fireBullet();
    }
    if (!inSnakeAnimation) {
        moveSnake();
        preUpdateSnakeBody();
        growSnake();
        updateSnakeBody();
    }
}

function render() {
    clearCanvas();

    var playerMoved = prevY - y != 0 || prevX - x != 0;
    var snakeMoved = snakePrevY - snakeY != 0 || snakePrevX - snakeX != 0;

    if (playerMoved) {
        inPlayerAnimation = true;
    }
    if (snakeMoved) {
        inSnakeAnimation = true;
    }

    animate();

    if (prevX == x && prevY == y && !inPlayerAnimation)
    {
        drawPlayer();
    }
    if (snakePrevX == x && snakePrevY == y && !inSnakeAnimation)
    {
        drawSnake();
    }
}

function animate() {
    clearCanvas();
    createGrid();

    //console.log('first');
    
    if (prevY - y != 0) {
        animatePlayer(true, prevY - y);
    }

    if (prevX - x != 0) {
        animatePlayer(false, prevX - x);
    }

    if (snakePrevX - snakeX != 0) {
        animateSnake(false, snakePrevX - snakeX);
    }

    if (snakePrevY - snakeY != 0) {
        animateSnake(true, snakePrevY - snakeY);
    }

    if (snakePrevX - snakeX != 0 || snakePrevY - snakeY != 0) {
        drawSnakeBody();
    }
}

function preUpdateSnakeBody() {

    // for (var i = snakeBody.length - 1; i > 0; --i) {
    //     var currSnake = snakeBody[i];
        
    //     currSnake.prevX = currSnake.x;
    //     currSnake.prevY = currSnake.y;
    // }
}

function updateSnakeBody() {
    if (snakeBody.length > 0) {
        snakeBody[0].prevX = snakeBody[0].x;
        snakeBody[0].prevY = snakeBody[0].y;

        snakeBody[0].x = snakePrevX;
        snakeBody[0].y = snakePrevY;
    }

    for (var i = 1; i < snakeBody.length - 1; ++i) {
        var newX = snakeBody[i - 1].prevX;
        var newY = snakeBody[i - 1].prevY;
    
        snakeBody[i].prevX = snakeBody[i].x;
        snakeBody[i].prevY = snakeBody[i].y;
    
        snakeBody[i].x = newX;
        snakeBody[i].y = newY;
    }
    //console.log(snakeBody);
}

var bodyTime = 0;

function drawSnakeBody() {
    bodyTime += 10;

    for (var i = 0; i < snakeBody.length; ++i) {
        var currSnake = snakeBody[i];

        var distX = currSnake.prevX - currSnake.x;
        var distY = currSnake.prevY - currSnake.y;
        if (currSnake.x - currSnake.prevX != 0 && (distX < 5 && distX > -5)) {
            animateIndividualPartHoriz(currSnake.prevX, currSnake.prevY, distX, bodyTime);
        }
        if (currSnake.y - currSnake.prevY != 0 && (distY < 5 && distY > -5)) {
            animateIndividualPartVert(currSnake.prevX, currSnake.prevY, distY, bodyTime);
        }
    }

    if (bodyTime >= playerSpeed) {
        bodyTime = 0;
    }
}

function animateIndividualPartVert(oldX, oldY, distance, time)
{
    var pos = distance * (time / playerSpeed);
    var dist = pos * tileSize;
    
    ctx.fillStyle = "rgb(0, 200, 50)";
    ctx.fillRect(oldX * tileSize, oldY * tileSize - dist, tileSize, tileSize);
}

function animateIndividualPartHoriz(oldX, oldY, distance, time)
{
    var pos = distance * (time / playerSpeed);
    var dist = pos * tileSize;
    
    ctx.fillStyle = "rgb(0, 200, 50)";
    ctx.fillRect(oldX * tileSize - dist, oldY * tileSize, tileSize, tileSize);
}

function clearCanvas()
{
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyMovement() {
    prevX = x;
    prevY = y;
    if (leftDown)
    {
        moveLeft();
    }
    if (rightDown)
    {
        moveRight();
    }
    if (!leftDown && !rightDown)
    {
        if (upDown)
        {
            moveUp();
        }
        if (downDown)
        {
            moveDown();
        }
    }

    checkPosition();
}

function moveSnake() {
    snakePrevX = snakeX;
    snakePrevY = snakeY;

    snakeCurrTime += 1;

    if (snakeCurrTime >= snakeDirChange) {
        snakeCurrTime = 0;

        var dir = "";

        while (isOpposite(snakeCurrentDir, dir) || dir == "") {
            var x = Math.ceil(Math.random() * 4) - 1;
            dir = snakeDirPossibilities[x];
        }
        
        snakeCurrentDir = dir;

        snakeDirChange = Math.floor(Math.random() * 4) + 1;
    }

    switch (snakeCurrentDir) {
        case "left":
            moveSnakeLeft();
        break;
        case "right":
            moveSnakeRight();
        break;
        case "up":
            moveSnakeUp();
        break;
        case "down":
            moveSnakeDown();
        break;
        default:
            moveSnakeLeft();
        break;
    }
}

function growSnake() {
    snakeGrowthCurrentTime += 1;

    if (snakeGrowthCurrentTime >= snakeGrowthTime) {
        snakeGrowthCurrentTime = 0;

        var i = snakeBody.push({x: snakePrevX, y:snakePrevY,prevX: snakePrevX, prevY: snakePrevY});

        console.log(snakeBody[snakeBody.length - 1].x, snakeBody.length);
    }
}

function isOpposite(curr, temp) {
    var opposite = false;

    if (temp == "left" && curr == "right") {
        opposite = true;
    }
    else if (temp == "right" && curr == "left") {
        opposite = true;
    }
    else if (temp == "up" && curr == "down") {
        opposite = true;
    }
    else if (temp == "down" && curr == "up") {
        opposite = true;
    }

    return opposite;
}

function moveSnakeLeft() {
    snakeX -= 1;
    
    if (snakeX < 0) {
        snakeX = tilesHorizontal - 1;
        snakePrevX = tilesHorizontal;
    }
}

function moveSnakeRight() {
    snakeX += 1;
    
    if (snakeX > tilesHorizontal - 1) {
        snakeX = 0;
        snakePrevX = -1;
    }
}

function moveSnakeUp() {
    snakeY -= 1;
    
    if (snakeY < 0) {
        snakeY = tilesVertical - 1;
        snakePrevY = tilesVertical;
    }
}

function moveSnakeDown() {
    snakeY += 1;
    
    if (snakeY > tilesVertical - 1) {
        snakeY = 0;
        snakePrevY = -1;
    }
}

function fireBullet() {
    if (gunLDown)
    {
        shootLeft();
    }
    if (gunRDown)
    {
        shootRight();
    }
    if (!gunLDown && !gunRDown)
    {
        if (gunUDown)
        {
            shootUp();
        }
        if (gunDDown)
        {
            shootDown();
        }
    }
}

function move(event) {
    if (event.which == aKey || leftDown)
    {
        leftDown = true;
    }
    if (event.which == wKey || upDown)
    {
        upDown = true;
    }
    if (event.which == dKey || rightDown)
    {
        rightDown = true;
    }
    if (event.which == sKey || downDown)
    {
        downDown = true;
    }

    if (event.which == leftKey || gunLDown)
    {
        gunLDown = true;
    }
    if (event.which == upKey || gunUDown)
    {
        gunUDown = true;
    }
    if (event.which == rightKey || gunRDown)
    {
        gunRDown = true;
    }
    if (event.which == downKey || gunDDown)
    {
        gunDDown = true;
    }
}

function stop(event) {
    if (event.which == leftKey || event.which == aKey)
    {
        leftDown = false;
    }
    if (event.which == upKey || event.which == wKey)
    {
        upDown = false;
    }
    if (event.which == rightKey || event.which == dKey)
    {
        rightDown = false;
    }
    if (event.which == downKey || event.which == sKey)
    {
        downDown = false;
    }
}

function moveLeft() {
    x -= 1;
}

function moveRight() {
    x += 1;
}

function moveUp() {
    y -= 1;
}

function moveDown() {
    y += 1;
}

function shootLeft() {
    x -= 1;
}

function shootRight() {
    x += 1;
}

function shootUp() {
    y -= 1;
}

function shootDown() {
    y += 1;
}

function checkPosition()
{
    if (x > tilesHorizontal - 1)
    {
        x = 0;
        prevX = -1;
    }
    else if (x < 0)
    {
        x = tilesHorizontal - 1;
        prevX = tilesHorizontal;
    }
    if (y > tilesVertical - 1)
    {
        y = 0;
        prevY = -1;
    }
    else if (y < 0)
    {
        y = tilesVertical - 1;
        prevY = tilesVertical;
    }
}

function mouseMove(event)
{
    var rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left - 0.5;
    mouseY = event.clientY - rect.top - 0.066665649414064;
}

var vertTimer;
var horizTimer;

function animatePlayer(vertical, distance)
{
    if (vertical) {
        if (distance != 0) {
            animateVertically(distance);
        }
    }
    else {
        if (distance != 0) {
            animateHorizontally(distance);
        }
    }
}

function animateSnake(vert, distance) {
    if (vert) {
        if (distance != 0) {
            animateSnakeVert(distance);
        }
    }
    else {
        if (distance != 0) {
            animateSnakeHoriz(distance);
        }
    }
}

var time = 0;

function animateVertically(distance)
{
    time += 10;

    var pos = distance * (time / playerSpeed);
    var dist = pos * tileSize;
    
    ctx.fillStyle = "rgb(100, 50, 200)";
    ctx.fillRect(prevX * tileSize, prevY * tileSize - dist, tileSize, tileSize);
    //ctx.drawImage(shield, mouseX, mouseY);
    
    if ((distance > 0 && pos >= distance) || (distance < 0 && pos <= distance))
    {
        resetPlayerAnimation(true);
    }
}

var snakeTime = 0;

function animateSnakeVert(distance)
{
    snakeTime += 10;

    var pos = distance * (snakeTime / playerSpeed);
    var dist = pos * tileSize;

    ctx.fillStyle = "rgb(0, 150, 50)";
    ctx.fillRect(snakePrevX * tileSize, snakePrevY * tileSize - dist, tileSize, tileSize);
    
    if ((distance > 0 && pos >= distance) || (distance < 0 && pos <= distance))
    {
        resetSnakeAnimation(true);
    }
}

function animateHorizontally(distance, snakeDistance)
{
    time += 10;
    
    var pos = distance * (time / playerSpeed);
    var dist = pos * tileSize;

    ctx.fillStyle = "rgb(100, 50, 200)";
    ctx.fillRect(prevX * tileSize - dist, prevY * tileSize, tileSize, tileSize);
    
    if ((distance > 0 && pos >= distance) || (distance < 0 && pos <= distance))
    {
        resetPlayerAnimation(false);
    }
}

function animateSnakeHoriz(distance)
{
    snakeTime += 10;

    var pos = distance * (snakeTime / playerSpeed);
    var dist = pos * tileSize;
    
    ctx.fillStyle = "rgb(0, 150, 50)";
    ctx.fillRect(snakePrevX * tileSize - dist, snakePrevY * tileSize, tileSize, tileSize);
    
    if ((distance > 0 && pos >= distance) || (distance < 0 && pos <= distance))
    {
        resetSnakeAnimation(false);
    }
}

function resetPlayerAnimation(vert)
{
    inPlayerAnimation = false;
    time = 0;

    //drawPlayer();
}

function resetSnakeAnimation(vert)
{
    inSnakeAnimation = false;
    snakeTime = 0;

    //drawSnake();
}

function drawPlayer() {
    ctx.fillStyle = "rgb(100, 50, 200)";
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

function drawSnake() {
    ctx.fillStyle = "rgb(0, 120, 50)";
    ctx.fillRect(snakeX * tileSize, snakeY * tileSize, tileSize, tileSize);
}

function drawPreviousSnake() {
    ctx.fillStyle = "rgb(0, 120, 50)";
    ctx.fillRect(snakePrevX * tileSize, snakePrevY * tileSize, tileSize, tileSize);
}

function createGrid() {
    // Vertical lines
    for (var i = 1; i < tilesHorizontal; ++i) {
        var x = i * tileSize;
        var y = canvas.height;
        drawLine(x, 0, x, y);
    }
    // Horizontal Lines
    for (var i = 1; i < tilesVertical; ++i) {
        var x = canvas.width;
        var y = i * tileSize;
        drawLine(0, y, x, y);
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = "rgb(0, 90, 120)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawPreviousPlayer()
{
    ctx.fillStyle = "rgb(100, 50, 200)";
    ctx.fillRect(prevX * tileSize, prevY * tileSize, tileSize, tileSize);
}