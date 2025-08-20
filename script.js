const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize = 20;
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    // Keep 16:9 ratio
    let width = window.innerWidth;
    let height = window.innerHeight - 60;

    if (width / height > 16 / 9) {
        height = Math.floor(height / tileSize) * tileSize;
        width = Math.floor((height * 16 / 9) / tileSize) * tileSize;
    } else {
        width = Math.floor(width / tileSize) * tileSize;
        height = Math.floor((width * 9 / 16) / tileSize) * tileSize;
    }

    canvas.width = width;
    canvas.height = height;
}

// Snake
class Snake {
    constructor() {
        this.body = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
    }

    move() {
        let head = {...this.body[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;

        this.body.unshift(head);
        this.body.pop();
    }

    grow() {
        let tail = {...this.body[this.body.length - 1]};
        this.body.push(tail);
    }

    draw() {
        ctx.fillStyle = "lime";
        this.body.forEach(part => {
            ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
        });
    }

    checkCollision() {
        let head = this.body[0];
        if (head.x < 0 || head.y < 0 || head.x >= canvas.width / tileSize || head.y >= canvas.height / tileSize) {
            return true;
        }
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
}

// Fruit
class Fruit {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.pickLocation();
    }

    pickLocation() {
        this.x = Math.floor(Math.random() * (canvas.width / tileSize));
        this.y = Math.floor(Math.random() * (canvas.height / tileSize));
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
    }
}

// Game logic
let snake = new Snake();
let fruit = new Fruit();
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highscore');
highScoreDisplay.innerText = 'High Score: ' + highScore;

const startScreen = document.getElementById('startScreen');
const gameoverScreen = document.getElementById('gameoverScreen');
const finalScore = document.getElementById('finalScore');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.addEventListener('keydown', e => {
    if (e.key === "ArrowUp" && snake.direction.y === 0) snake.direction = {x: 0, y: -1};
    if (e.key === "ArrowDown" && snake.direction.y === 0) snake.direction = {x: 0, y: 1};
    if (e.key === "ArrowLeft" && snake.direction.x === 0) snake.direction = {x: -1, y: 0};
    if (e.key === "ArrowRight" && snake.direction.x === 0) snake.direction = {x: 1, y: 0};
});

let gameInterval;

function startGame() {
    score = 0;
    scoreDisplay.innerText = 'Score: ' + score;
    highScoreDisplay.innerText = 'High Score: ' + highScore;

    snake = new Snake();
    fruit = new Fruit();

    startScreen.classList.remove('active');
    gameoverScreen.classList.remove('active');

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.move();
    if (snake.checkCollision()) {
        gameOver();
        return;
    }

    if (snake.body[0].x === fruit.x && snake.body[0].y === fruit.y) {
        snake.grow();
        fruit.pickLocation();
        score++;
        scoreDisplay.innerText = 'Score: ' + score;
    }

    snake.draw();
    fruit.draw();
}

function gameOver() {
    clearInterval(gameInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    finalScore.innerText = 'Your Score: ' + score;
    highScoreDisplay.innerText = 'High Score: ' + highScore;
    gameoverScreen.classList.add('active');
}
