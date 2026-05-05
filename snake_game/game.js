const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const settingsBtn = document.getElementById('settingsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsPanel = document.getElementById('settingsPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

const gridSizeSelect = document.getElementById('gridSize');
const speedSelect = document.getElementById('speed');
const snakeColorInput = document.getElementById('snakeColor');
const bgColorInput = document.getElementById('bgColor');

let gridSize = 20;
let cellSize = canvas.width / gridSize;
let speed = 'normal';
let snakeColor = '#4CAF50';
let bgColor = '#222222';

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameRunning = false;
let lastMoveTime = 0;
let gameLoopId = null;

const speedMap = { slow: 200, normal: 120, fast: 60 };

function getInterval() {
  return speedMap[speed] || 120;
}

function initSnake() {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  ctx.strokeStyle = bgColor;
  ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function render() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const segment of snake) {
    drawCell(segment.x, segment.y, snakeColor);
  }
}

function update(timestamp) {
  if (!gameRunning) return;

  gameLoopId = requestAnimationFrame(update);

  if (timestamp - lastMoveTime < getInterval()) return;
  lastMoveTime = timestamp;

  direction = { ...nextDirection };

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver();
    return;
  }

  snake.unshift(head);
  snake.pop();

  render();
}

function gameOver() {
  gameRunning = false;
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }
  startBtn.textContent = 'Start Game';
  alert('Game Over! Hit the wall.');
}

function startGame() {
  if (gameRunning) return;

  gridSize = parseInt(gridSizeSelect.value, 10);
  cellSize = canvas.width / gridSize;
  speed = speedSelect.value;
  snakeColor = snakeColorInput.value;
  bgColor = bgColorInput.value;

  canvas.style.backgroundColor = bgColor;

  initSnake();
  render();

  gameRunning = true;
  startBtn.textContent = 'Running...';
  lastMoveTime = 0;
  gameLoopId = requestAnimationFrame(update);
}

startBtn.addEventListener('click', () => {
  if (gameRunning) return;
  startGame();
});

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('hidden');
});

leaderboardBtn.addEventListener('click', () => {
  leaderboardPanel.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

closeLeaderboardBtn.addEventListener('click', () => {
  leaderboardPanel.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;

  const key = e.key.toLowerCase();

  switch (key) {
    case 'w':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'a':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 's':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'd':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
});
