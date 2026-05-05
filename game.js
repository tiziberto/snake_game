const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const settingsBtn = document.getElementById('settingsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsPanel = document.getElementById('settingsPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const gameOverPanel = document.getElementById('gameOverPanel');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const closeGameOverBtn = document.getElementById('closeGameOverBtn');
const leaderboardBody = document.getElementById('leaderboardBody');
const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

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
  apple: null,
  score: 0,
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

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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
    renderFull();
  }
});

store.subscribe('apple', (apple) => {
  if (apple) {
    drawCell(apple.x, apple.y, '#FF5252');
  }
});

store.subscribe('score', (score) => {
  scoreDisplay.textContent = `Score: ${score}`;
});

store.subscribe('gameStatus', (status) => {
  if (status === 'idle') {
    startBtn.textContent = 'Start Game';
  } else if (status === 'running') {
    startBtn.textContent = 'Running...';
    gameOverPanel.classList.add('hidden');
  } else if (status === 'gameover') {
    startBtn.textContent = 'Start Game';
  }
});

let gameRunning = false;
let lastMoveTime = 0;
let gameLoopId = null;
let currentDirection = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let startTime = 0;
let timerIntervalId = null;
let elapsedSeconds = 0;

function generateApple(snakeBody) {
  let apple;
  let onSnake;
  do {
    apple = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    onSnake = snakeBody.some(seg => seg.x === apple.x && seg.y === apple.y);
  } while (onSnake);
  return apple;
}

function renderFull() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const state = store.getState();
  for (const segment of state.snake) {
    drawCell(segment.x, segment.y, snakeColor);
  }
  if (state.apple) {
    drawCell(state.apple.x, state.apple.y, '#FF5252');
  }
}

function updateTimer() {
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `Time: ${formatTime(elapsedSeconds)}`;
}

function initGame() {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  const initialSnake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  currentDirection = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  elapsedSeconds = 0;
  startTime = Date.now();
  store.setState('score', 0);
  store.setState('snake', initialSnake);
  store.setState('apple', generateApple(initialSnake));
  timerDisplay.textContent = `Time: ${formatTime(0)}`;
  renderFull();
}

function triggerGameOver() {
  gameRunning = false;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  if (timerIntervalId) clearInterval(timerIntervalId);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  finalScore.textContent = store.getState().score;
  finalTime.textContent = formatTime(elapsedSeconds);
  store.setState('gameStatus', 'gameover');
  gameOverPanel.classList.remove('hidden');
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
    triggerGameOver();
    return;
  }

  const hitSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);
  if (hitSelf) {
    triggerGameOver();
    return;
  }

  const apple = state.apple;
  const ateApple = head.x === apple.x && head.y === apple.y;

  let newSnake;
  if (ateApple) {
    newSnake = [head, ...snake];
    const newApple = generateApple(newSnake);
    store.setState('apple', newApple);
    store.setState('score', state.score + 10);
  } else {
    newSnake = [head, ...snake.slice(0, -1)];
  }

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

  initGame();
  store.setState('gameStatus', 'running');

  gameRunning = true;
  lastMoveTime = 0;
  gameLoopId = requestAnimationFrame(gameLoop);
  timerIntervalId = setInterval(updateTimer, 1000);
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

playAgainBtn.addEventListener('click', () => {
  gameOverPanel.classList.add('hidden');
  startGame();
});

function getLeaderboard() {
  return JSON.parse(sessionStorage.getItem('snakeLeaderboard') || '[]');
}

function renderLeaderboard() {
  const scores = getLeaderboard();
  leaderboardBody.innerHTML = '';
  if (scores.length === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">No scores yet</td></tr>';
    return;
  }
  scores.forEach((entry, index) => {
    const row = document.createElement('tr');
    const date = new Date(entry.date).toLocaleString();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.score}</td>
      <td>${entry.time}</td>
      <td>${date}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

leaderboardBtn.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardPanel.classList.remove('hidden');
});

clearLeaderboardBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the leaderboard?')) {
    sessionStorage.removeItem('snakeLeaderboard');
    renderLeaderboard();
  }
});

saveScoreBtn.addEventListener('click', () => {
  const name = prompt('Enter your name:');
  if (!name) return;
  const entry = {
    name,
    score: store.getState().score,
    time: formatTime(elapsedSeconds),
    date: new Date().toISOString()
  };
  let scores = getLeaderboard();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  sessionStorage.setItem('snakeLeaderboard', JSON.stringify(scores));
  alert('Score saved!');
});

closeGameOverBtn.addEventListener('click', () => {
  gameOverPanel.classList.add('hidden');
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
