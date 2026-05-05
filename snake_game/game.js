const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const settingsBtn = document.getElementById('settingsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsPanel = document.getElementById('settingsPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const scoreArea = document.getElementById('scoreArea');

const gridSizeSelect = document.getElementById('gridSize');
const speedSelect = document.getElementById('speed');
const snakeColorInput = document.getElementById('snakeColor');
const bgColorInput = document.getElementById('bgColor');

let gridSize = 20;
let cellSize = canvas.width / gridSize;
let speed = 'normal';
let snakeColor = '#4CAF50';
let bgColor = '#222222';

const speedMap = { slow: 200, normal: 120, fast: 60 };

function getInterval() {
  return speedMap[speed] || 120;
}

function createReactiveStore(initialState) {
  const state = { ...initialState };
  const listeners = {};

  function subscribe(key, callback) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(callback);
  }

  function setState(key, value) {
    const previous = state[key];
    state[key] = value;
    if (listeners[key]) {
      listeners[key].forEach(cb => cb(value, previous));
    }
  }

  function getState() {
    return { ...state };
  }

  return { subscribe, setState, getState };
}

const store = createReactiveStore({
  snake: [],
  direction: { x: 1, y: 0 },
  gameStatus: 'idle'
});

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  ctx.strokeStyle = bgColor;
  ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function clearCell(x, y) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

store.subscribe('snake', (newSnake, oldSnake) => {
  if (oldSnake && oldSnake.length > 0 && newSnake.length > 0) {
    const oldTail = oldSnake[oldSnake.length - 1];
    const isNewTailStillInSnake = newSnake.some(
      seg => seg.x === oldTail.x && seg.y === oldTail.y
    );
    if (!isNewTailStillInSnake) {
      clearCell(oldTail.x, oldTail.y);
    }
    const newHead = newSnake[0];
    drawCell(newHead.x, newHead.y, snakeColor);
  } else if (newSnake.length > 0) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const segment of newSnake) {
      drawCell(segment.x, segment.y, snakeColor);
    }
  }
});

store.subscribe('gameStatus', (status) => {
  if (status === 'idle') {
    startBtn.textContent = 'Start Game';
  } else if (status === 'running') {
    startBtn.textContent = 'Running...';
  } else if (status === 'gameover') {
    startBtn.textContent = 'Start Game';
  }
});

let gameRunning = false;
let lastMoveTime = 0;
let gameLoopId = null;
let currentDirection = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

function initSnake() {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  const initialSnake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  currentDirection = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  store.setState('snake', initialSnake);
}

function gameOver() {
  gameRunning = false;
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }
  store.setState('gameStatus', 'gameover');
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  gameLoopId = requestAnimationFrame(gameLoop);

  if (timestamp - lastMoveTime < getInterval()) return;
  lastMoveTime = timestamp;

  currentDirection = { ...nextDirection };
  const state = store.getState();
  const snake = state.snake;

  const head = { x: snake[0].x + currentDirection.x, y: snake[0].y + currentDirection.y };

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver();
    return;
  }

  const newSnake = [head, ...snake.slice(0, -1)];
  store.setState('snake', newSnake);
  store.setState('direction', currentDirection);
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
  store.setState('gameStatus', 'running');

  gameRunning = true;
  lastMoveTime = 0;
  gameLoopId = requestAnimationFrame(gameLoop);
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
      if (currentDirection.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'a':
      if (currentDirection.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 's':
      if (currentDirection.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'd':
      if (currentDirection.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
  }
});
