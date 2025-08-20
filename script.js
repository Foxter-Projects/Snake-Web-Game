const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize = 20;
resizeCanvas();

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
  let width = window.innerWidth;
  let height = window.innerHeight - 60; // space for scoreboard

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

// DOM elements
const startScreen = document.getElementById("startScreen");
const gameoverScreen = document.getElementById("gameoverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highscore");
highScoreDisplay.innerText = "High Score: " + highScore;

let snake, fruit, gameInterval;

// --- Snake Class ---
class Snake {
  constructor() {
    this.body = [{ x: 5, y: 5 }];
    this.xSpeed = 1;
    this.ySpeed = 0;
    this.grow = false;
  }

  draw() {
    ctx.fillStyle = "lime";
    this.body.forEach(part => {
      ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
    });
  }

  update() {
    const head = { x: this.body[0].x + this.xSpeed, y: this.body[0].y + this.ySpeed };
    this.body.unshift(head);

    if (this.grow) {
      this.grow = false;
    } else {
      this.body.pop();
    }
  }

  changeDirection(dir) {
    switch (dir) {
      case "ArrowUp":
        if (this.ySpeed === 0) { this.xSpeed = 0; this.ySpeed = -1; }
        break;
      case "ArrowDown":
        if (this.ySpeed === 0) { this.xSpeed = 0; this.ySpeed = 1; }
        break;
      case "ArrowLeft":
        if (this.xSpeed === 0) { this.xSpeed = -1; this.ySpeed = 0; }
        break;
      case "ArrowRight":
        if (this.xSpeed === 0) { this.xSpeed = 1; this.ySpeed = 0; }
        break;
    }
  }

  eat(fruit) {
    if (this.body[0].x === fruit.x && this.body[0].y === fruit.y) {
      this.grow = true;
      score++;
      scoreDisplay.innerText = "Score: " + score;
      return true;
    }
    return false;
  }

  checkCollision() {
    const head = this.body[0];
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

// --- Fruit Class ---
class Fruit {
  constructor() {
    this.x = 0;
    this.y = 0;
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

// --- Game Functions ---
function startGame() {
  score = 0;
  scoreDisplay.innerText = "Score: " + score;
  highScoreDisplay.innerText = "High Score: " + highScore;

  snake = new Snake();
  fruit = new Fruit();
  fruit.pickLocation();

  startScreen.classList.remove("active");
  gameoverScreen.classList.remove("active");

  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 120);
}

function gameOver() {
  clearInterval(gameInterval);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
  }

  finalScore.innerText = "Your Score: " + score;
  highScoreDisplay.innerText = "High Score: " + highScore;
  gameoverScreen.classList.add("active");
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake.update();
  snake.draw();
  fruit.draw();

  if (snake.eat(fruit)) {
    fruit.pickLocation();
  }

  if (snake.checkCollision()) {
    gameOver();
  }
}

// --- Controls ---
window.addEventListener("keydown", e => snake.changeDirection(e.key));
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
