<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Roll War - 8bit AI Demo</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #131313;
      color: #fff;
      font-family: monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    #game-wrapper {
      border: 6px solid #444;
      padding: 12px;
      background: #111  no-repeat center center;
      background-size: cover;
      
      width: 720px;
      height: 1280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px #000;
      position: relative;
    }
    #game {
      background: url(https://media.discordapp.net/attachments/1309030075844263997/1372893875110412310/b785a1f51dc9906e.jpg?ex=68286e8e&is=68271d0e&hm=6333cfcdc9b9f7948c6751a51dfb1fca9ab7a2585806665973350ffb9b47f7b9&=&format=webp&width=666&height=1368) no-repeat center center;
      background-size: cover;
      image-rendering: pixelated;
      width: 720px;
      height: 1280px;
    }
    #hud {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 14px;
    }
    #controls {
      display: flex;
      justify-content: center;
      margin-top: 12px;
      gap: 8px;
      flex-wrap: wrap;
    }
    #top-right-buttons {
      position: absolute;
      top: 60px;
      right: 60px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #top-right-buttons button {
      font-size: 18px;
      padding: 8px 16px;
      background: #444;
      border: 2px solid #888;
      color: white;
      cursor: pointer;
    }
    #top-right-buttons button:hover {
      background: #666;
    }
    button {
      font-size: 12px;
      padding: 4px 8px;
      background: #444;
      border: 1px solid #888;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background: #666;
    }
    #challenge-btn {
      display: none;
      font-size: 36px;
      padding: 32px 64px;
      background: #e53935;
      color: #fff;
      border: 4px solid #fff;
      border-radius: 16px;
      font-weight: bold;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      box-shadow: 0 0 40px #e53935;
    }
  </style>
</head>
<body>
<div id="game-wrapper">
  <div id="top-right-buttons">
    <button onclick="toggleSound()">Toggle Sound</button>
  </div>
  <canvas id="game" width="256" height="240"></canvas>
  <div id="hud">
    <span>WAVE: <span id="wave">1/5</span></span>
    <span>GOLD: <span id="gold">1000</span></span>
  </div>
  <div id="controls">
    <button onclick="rollDice('normal')">ROLL (100)</button>
    <button onclick="rollDice('elite')">ELITE DICE (150)</button>
    <button onclick="rollDice('universal')">UNIVERSAL DIE (300)</button>
    <button id="challenge-btn" style="display:none;" onclick="challengeBoss()">CHALLENGE BOSS</button>
  </div>
</div>

<!-- 胜利弹窗 -->
<div id="victory-modal" style="display:none;position:fixed;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:100;justify-content:center;align-items:center;">
  <div style="background:#222;padding:40px 60px;border-radius:20px;box-shadow:0 0 30px #000;text-align:center;">
    <h1 style="color:#FFD700;margin:0 0 20px 0;">胜利！</h1>
    <p style="color:#fff;font-size:20px;">所有怪物已被消灭</p>
  </div>
</div>

<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const goldEl = document.getElementById('gold');
const waveEl = document.getElementById('wave');

const grid = [
  ['GO', 'GEM5', 'GEM10', 'RED'],
  ['GEM5', 'MONSTER', 'MONSTER', 'HOUSE'],
  ['GEM10', 'MONSTER', 'MONSTER', 'GENIE'],
  ['RED', 'HOUSE', 'GEM15', 'GEM5']
];

const tileSize = 48;
let player = { x: 0, y: 0 };
let gold = 1000;
let aiMode = true;
let soundEnabled = true;
let wave = 1;
const towers = [];
let lastRoll = null;
let rollDisplayTimeout = null;
let bossMode = false;
let monsters = [];
let bullets = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const colors = {
  'GO': '#FFD700', 'RED': '#B22222', 'GEM5': '#9932CC', 'GEM10': '#8A2BE2', 'GEM15': '#9400D3',
  'HOUSE': '#708090', 'HOUSE_B': '#4682B4', 'GENIE': '#800080', 'MONSTER': '#556B2F', 'PLAYER': '#FF4500'
};

function updateChallengeButton() {
  const btn = document.getElementById('challenge-btn');
  if (gold < 100) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!bossMode) {
    // 正常模式下绘制格子、玩家、塔等
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const type = grid[y][x];
        ctx.fillStyle = colors[type] || '#333';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 2, tileSize - 2);
        if (player.x === x && player.y === y) {
          ctx.fillStyle = '#FF0';
          ctx.fillRect(x * tileSize + 16, y * tileSize + 16, 16, 16);
        }
      }
    }
    towers.forEach(t => {
      let color = '#fff';
      if (t.level === 2) color = '#2196f3'; // 蓝色
      if (t.level === 3) color = '#9c27b0'; // 紫色
      if (t.level >= 4) color = '#FFD700'; // 金色
      ctx.fillStyle = color;
      ctx.fillRect(t.x * tileSize + 12, t.y * tileSize + 12, 24, 24);
      // 绘制等级数字
      ctx.fillStyle = '#222';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.level, t.x * tileSize + 24, t.y * tileSize + 24);
    });
    if (lastRoll !== null) {
      ctx.fillStyle = '#23ff33';
      ctx.font = '30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lastRoll, canvas.width / 2, canvas.height / 2 + 10);
    }
  }
  // BOSS模式下绘制所有已生成的炮台、子弹和小怪
  if (bossMode) {
    // 炮台
    towers.forEach(t => {
      let color = '#fff';
      if (t.level === 2) color = '#2196f3'; // 蓝色
      if (t.level === 3) color = '#9c27b0'; // 紫色
      if (t.level >= 4) color = '#FFD700'; // 金色
      ctx.fillStyle = color;
      ctx.fillRect(t.x * tileSize + 12, t.y * tileSize + 12, 24, 24);
    });
    // 子弹
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.closePath();
    });
    // 小怪
    monsters.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#4caf50';
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.closePath();
      // 眼睛
      ctx.beginPath();
      ctx.arc(m.x - 4, m.y - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(m.x + 4, m.y - 2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(m.x - 4, m.y - 2, 0.6, 0, Math.PI * 2);
      ctx.arc(m.x + 4, m.y - 2, 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#222';
      ctx.fill();
      ctx.closePath();
    });
  }
}

function rollDice(type) {
  if (aiMode) toggleAI(); // 玩家点击时中断AI
  const cost = { normal: 100, elite: 150, universal: 300 }[type];
  if (gold < cost) return;
  gold -= cost;
  goldEl.textContent = gold;
  updateChallengeButton();
  const steps = Math.ceil(Math.random() * 6);
  lastRoll = steps;
  clearTimeout(rollDisplayTimeout);
  rollDisplayTimeout = setTimeout(() => {
    lastRoll = null;
    drawGrid();
  }, 1000);
  movePlayer(steps);
  if (soundEnabled) playSound('roll');
}

function movePlayer(steps) {
  const path = [
    [0,0], [1,0], [2,0], [3,0],
    [3,1], [3,2], [3,3], [2,3],
    [1,3], [0,3], [0,2], [0,1]
  ];
  let index = path.findIndex(([x, y]) => x === player.x && y === player.y);
  index = (index + steps) % path.length;
  player.x = path[index][0];
  player.y = path[index][1];
  handleTile(grid[player.y][player.x]);
  drawGrid();
}

function handleTile(tile) {
  if (tile.startsWith('GEM')) {
    const amount = parseInt(tile.replace('GEM', ''));
    gold += amount;
    goldEl.textContent = gold;
    updateChallengeButton();
    if (soundEnabled) playSound('gem');
  } else if (tile === 'GENIE') {
    gold += 100;
    goldEl.textContent = gold;
    if (soundEnabled) playSound('event');
  } else if (tile === 'HOUSE') {
    addTowerToCenter();
    if (soundEnabled) playSound('event');
  } else if (tile === 'RED') {
    wave++;
    waveEl.textContent = wave + '/5';
    if (soundEnabled) playSound('wave');
  }
}

function addTowerToCenter() {
  const centerPositions = [
    { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 1, y: 2 }, { x: 2, y: 2 }
  ];
  const available = centerPositions.filter(pos =>
    !towers.some(t => t.x === pos.x && t.y === pos.y)
  );
  if (available.length > 0) {
    const spot = available[Math.floor(Math.random() * available.length)];
    towers.push({ ...spot, level: 1 });
  } else {
    // 如果没有空位，随机选一个已有炮台升级
    const spot = centerPositions[Math.floor(Math.random() * centerPositions.length)];
    const tower = towers.find(t => t.x === spot.x && t.y === spot.y);
    if (tower) tower.level = (tower.level || 1) + 1;
  }
}

function playSound(type) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.1, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  o.type = type === 'gem' ? 'triangle' : 'square';
  o.frequency.value = { roll: 440, gem: 880, wave: 660, event: 330 }[type];
  o.start();
  o.stop(audioCtx.currentTime + 0.5);
}

function toggleAI() {
  aiMode = !aiMode;
  gold = 1000;
  goldEl.textContent = gold;
  updateChallengeButton();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
}

function challengeBoss() {
  bossMode = true;
  document.getElementById('controls').style.display = 'none';
  document.getElementById('top-right-buttons').style.display = 'none';
  document.getElementById('challenge-btn').style.display = 'none';
  if (towers.length === 0) {
    // 默认在中心生成一个炮台
    towers.push({ x: 1, y: 1 });
  }
  spawnMonsters();
  bullets = [];
  animateMonsters();
  fireLoop();
}

function spawnMonsters() {
  monsters = [];
  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  // 四周各放6个小怪
  for (let i = 0; i < 6; i++) {
    // 上
    monsters.push({ x: (i + 1) * canvas.width / 7, y: 0, tx: center.x, ty: center.y, hp: 1 });
    // 下
    monsters.push({ x: (i + 1) * canvas.width / 7, y: canvas.height, tx: center.x, ty: center.y, hp: 1 });
    // 左
    monsters.push({ x: 0, y: (i + 1) * canvas.height / 7, tx: center.x, ty: center.y, hp: 1 });
    // 右
    monsters.push({ x: canvas.width, y: (i + 1) * canvas.height / 7, tx: center.x, ty: center.y, hp: 1 });
  }
}

function fireLoop() {
  if (!bossMode) return;
  towers.forEach(tower => {
    // 炮台像素坐标
    const tx = tower.x * tileSize + tileSize / 2;
    const ty = tower.y * tileSize + tileSize / 2;
    // 找最近的小怪
    let target = null, minDist = Infinity;
    monsters.forEach(m => {
      const dx = m.x - tx, dy = m.y - ty;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        target = m;
      }
    });
    if (target) {
      bullets.push({
        x: tx, y: ty,
        tx: target.x, ty: target.y,
        speed: 12
      });
    }
  });
  setTimeout(fireLoop, 300);
}

function updateBullets() {
  let goldEarned = 0;
  bullets.forEach(bullet => {
    let hitMonster = null;
    monsters.forEach(m => {
      const dx = m.x - bullet.x;
      const dy = m.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 14 && !hitMonster) {
        hitMonster = m;
      }
    });
    if (hitMonster) {
      hitMonster.hp--;
      bullet.hit = true;
      if (hitMonster.hp <= 0) {
        goldEarned += 50;
      }
    }
    const dx = bullet.tx - bullet.x;
    const dy = bullet.ty - bullet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > bullet.speed && !bullet.hit) {
      bullet.x += (dx / dist) * bullet.speed;
      bullet.y += (dy / dist) * bullet.speed;
    } else {
      bullet.x = bullet.tx;
      bullet.y = bullet.ty;
      bullet.hit = true;
    }
  });
  // 移除血量<=0的小怪
  const before = monsters.length;
  monsters = monsters.filter(m => m.hp > 0);
  // 检查碰撞并移除子弹
  bullets = bullets.filter(b => !b.hit);
  // 增加金币并更新显示
  if (goldEarned > 0) {
    gold += goldEarned;
    goldEl.textContent = gold;
  }
  // 如果所有怪物消失，弹出胜利界面，2秒后回到初始界面
  if (bossMode && monsters.length === 0) {
    bossMode = false;
    document.getElementById('victory-modal').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('victory-modal').style.display = 'none';
      document.getElementById('controls').style.display = 'flex';
      document.getElementById('top-right-buttons').style.display = 'flex';
      document.getElementById('challenge-btn').style.display = 'none';
      drawGrid();
    }, 2000);
  }
}

function animateMonsters() {
  if (!bossMode) return;
  let allArrived = true;
  monsters.forEach(m => {
    const dx = m.tx - m.x;
    const dy = m.ty - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      m.x += dx * 0.001;
      m.y += dy * 0.001;
      allArrived = false;
    } else {
      m.x = m.tx;
      m.y = m.ty;
    }
  });
  updateBullets();
  drawGrid();
  if (!allArrived || bossMode) {
    requestAnimationFrame(animateMonsters);
  }
}

window.onload = function() {
  document.getElementById('controls').style.display = 'flex';
  document.getElementById('top-right-buttons').style.display = 'flex';
  bossMode = false;
  updateChallengeButton();
  drawGrid();
};

// 删除或注释掉aiLoop();的调用
// aiLoop();
</script>
</body>
</html>
