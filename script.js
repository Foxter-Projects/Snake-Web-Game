const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize = 20;
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    // Fit screen but keep 16:9 ratio
    let width = window.innerWidth;
    let height = window.innerHeight - 60; // leave space for scoreboard

    if (width / height > 16 / 9) {
        // Too wide → limit by height
        height = Math.floor(height / tileSize) * tileSize;
        width = Math.floor((height * 16 / 9) / tileSize) * tileSize;
    } else {
        // Too tall → limit by width
        width = Math.floor(width / tileSize) * tileSize;
        height = Math.floor((width * 9 / 16) / tileSize) * tileSize;
    }

    canvas.width = width;
    canvas.height = height;
}

// ================= Snake Class =================
class Snake {
    constructor() {
        this.body = [{ x: 5, y: 5 }];
        this.direction = { x: 1, y: 0 };
    }

    draw() {
        ctx.fillStyle = "lime";
        this.body.forEach(segment => {
            ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
        });
    }

    update() {
        const head = { 
            x: this.body[0].x + this.direction.x, 
            y: this.body[0].y + this.direction.y 
        };

        // Collision with wall
        if (
            head.x < 0 || head.y < 0 ||
            head.x >= canvas.width / tileSize ||
            head.y >= canvas.height / tileSize
        ) {
            gameOver();
            return;
        }

        // Collision with self
        for (let part of this.body) {
            if (head.x === part.x && head.y === part.y) {
                gameOver();
                return;
            }
        }

        this.body.unshift(head);

        // Eat fruit
        if (head.x === fruit.position.x && head.y === fruit.position.y) {
            score++;
            scoreDisplay.innerText = "Score: " + score;
            fruit.pickLocation();
            eatSound.play();
        } else {
            this.body.pop();
        }
    }

    changeDirection(dir) {
        if (dir.x !== -this.direction.x || dir.y !== -this.direction.y) {
            this.direction = dir;
        }
    }
}

// ================= Fruit Class =================
class Fruit {
    constructor() {
        this.position = { x: 10, y: 10 };
    }

    pickLocation() {
        this.position = {
            x: Math.floor(Math.random() * (canvas.width / tileSize)),
            y: Math.floor(Math.random() * (canvas.height / tileSize))
        };
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x * tileSize, this.position.y * tileSize, tileSize, tileSize);
    }
}

// ================= Game State =================
let snake;
let fruit;
let gameInterval;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
const startScreen = document.getElementById("startScreen");
const gameoverScreen = document.getElementById("gameoverScreen");
const finalScore = document.getElementById("finalScore");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

highScoreDisplay.innerText = "High Score: " + highScore;

// Sounds (you can replace with your own)
const eatSound = new Audio("eat.mp3");
const gameOverSound = new Audio("gameover.mp3");
const bgm = new Audio("bgm.mp3");
bgm.loop = true;

// ================= Game Functions =================
function startGame() {
    score = 0;
    scoreDisplay.innerText = "Score: " + score;
    highScoreDisplay.innerText = "High Score: " + highScore;
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    startScreen.classList.remove("active");
    gameoverScreen.classList.remove("active");

    bgm.currentTime = 0;
    bgm.play();

    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruit.draw();
    snake.update();
    snake.draw();
}

function gameOver() {
    clearInterval(gameInterval);
    bgm.pause();
    gameOverSound.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }

    finalScore.innerText = "Your Score: " + score;
    highScoreDisplay.innerText = "High Score: " + highScore;
    gameoverScreen.classList.add("active");
}

// ================= Controls =================
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp": snake.changeDirection({ x: 0, y: -1 }); break;
        case "ArrowDown": snake.changeDirection({ x: 0, y: 1 }); break;
        case "ArrowLeft": snake.changeDirection({ x: -1, y: 0 }); break;
        case "ArrowRight": snake.changeDirection({ x: 1, y: 0 }); break;
    }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
