// Game logic - Phase 1 (empty initially)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Phase 1: UI interactions only
const startBtn = document.getElementById('startBtn');
const settingsBtn = document.getElementById('settingsBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsPanel = document.getElementById('settingsPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

startBtn.addEventListener('click', () => {
  console.log('Start Game clicked');
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
