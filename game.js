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

let snake = [];
let apple = {};
let score = 0;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameRunning = false;
let gameLoopId = null;
let lastMoveTime = 0;
let startTime = 0;
let timerIntervalId = null;
let elapsedSeconds = 0;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function generateApple(snakeBody) {
  let pos;
  let onSnake;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    onSnake = snakeBody.some(seg => seg.x === pos.x && seg.y === pos.y);
  } while (onSnake);
  return pos;
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
  if (apple) {
    drawCell(apple.x, apple.y, '#FF5252');
  }
}

function updateTimer() {
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `Time: ${formatTime(elapsedSeconds)}`;
}

function initGame() {
  gridSize = parseInt(gridSizeSelect.value, 10);
  cellSize = canvas.width / gridSize;
  speed = speedSelect.value;
  snakeColor = snakeColorInput.value;
  bgColor = bgColorInput.value;
  canvas.style.backgroundColor = bgColor;

  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);
  snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  apple = generateApple(snake);
  score = 0;
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  elapsedSeconds = 0;
  startTime = Date.now();
  scoreDisplay.textContent = 'Score: 0';
  timerDisplay.textContent = 'Time: 00:00';
  render();
}

function gameOver() {
  gameRunning = false;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  if (timerIntervalId) clearInterval(timerIntervalId);
  finalScore.textContent = score;
  finalTime.textContent = formatTime(elapsedSeconds);
  startBtn.textContent = 'Start Game';
  gameOverPanel.classList.remove('hidden');
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  gameLoopId = requestAnimationFrame(gameLoop);

  const speedValue = speedMap[speed] || 120;
  if (timestamp - lastMoveTime < speedValue) return;
  lastMoveTime = timestamp;

  direction = { ...nextDirection };
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    gameOver();
    return;
  }

  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  const ateApple = head.x === apple.x && head.y === apple.y;

  snake.unshift(head);
  if (ateApple) {
    apple = generateApple(snake);
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
  } else {
    snake.pop();
  }

  render();
}

function startGame() {
  if (gameRunning) return;

  gameOverPanel.classList.add('hidden');
  initGame();
  startBtn.textContent = 'Running...';

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
  renderLeaderboard();
  leaderboardPanel.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

closeLeaderboardBtn.addEventListener('click', () => {
  leaderboardPanel.classList.add('hidden');
});

playAgainBtn.addEventListener('click', () => {
  startGame();
});

saveScoreBtn.addEventListener('click', () => {
  const name = prompt('Enter your name:');
  if (!name) return;
  const entry = {
    name,
    score,
    time: formatTime(elapsedSeconds),
    date: new Date().toISOString()
  };
  let scores = JSON.parse(sessionStorage.getItem('snakeLeaderboard') || '[]');
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

clearLeaderboardBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the leaderboard?')) {
    sessionStorage.removeItem('snakeLeaderboard');
    renderLeaderboard();
  }
});
