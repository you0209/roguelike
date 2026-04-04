'use strict';

// ============================================================
//  GAME STATE  ― 全ファイルから参照される共有オブジェクト
// ============================================================
const GS = {
  scene: 'title',
  floor: 1,
  battleCount:  0,
  totalBattles: 0,
  totalGold:    0,

  player: null,
  enemy:  null,

  get atkTotal() {
    let v = GS.player.attack;
    if (GS.player.weapon) v += GS.player.weapon.attackBonus;
    return v;
  },
  get defTotal() {
    let v = GS.player.defense;
    if (GS.player.armor)   v += GS.player.armor.defenseBonus;
    if (GS.player.buffDef) v += 22;
    return v;
  }
};

function resetGame() {
  GS.floor          = 1;
  GS.battleCount    = 0;
  GS.totalBattles   = 0;
  GS.totalGold      = 0;
  GS.enemy          = null;
  GS.isFirstOfFloor = true;
  GS.lastOption     = null;

  GS.player = {
    hp: 100, maxHp: 100,
    mp:  50, maxMp:  50,
    attack: 15, defense: 10,
    gold: 30,
    weapon: null, armor: null,
    skills: ['slash'],
    inventory: [],
    buffDef: false,
    isDefending: false,
    hasRevival: false
  };
}

// ============================================================
//  SCENE MANAGEMENT
// ============================================================
function showScene(name) {
  document.querySelectorAll('.scene').forEach(s => s.classList.add('hidden'));
  document.getElementById('scene-' + name).classList.remove('hidden');
  GS.scene = name;
}

// ============================================================
//  TITLE
// ============================================================
function initTitle() {
  showScene('title');
  drawTitleCanvas();
}

function drawTitleCanvas() {
  const canvas = document.getElementById('title-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000010';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const rng = mulberry32(42);
  for (let i = 0; i < 120; i++) {
    const x = rng() * canvas.width;
    const y = rng() * canvas.height;
    const r = rng() * 1.5 + 0.3;
    const a = rng() * 0.8 + 0.2;
    ctx.fillStyle = `rgba(200,200,255,${a.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = '#0a0a18';
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(80, 60);  ctx.lineTo(100, 80);
  ctx.lineTo(160, 30); ctx.lineTo(180, 50);
  ctx.lineTo(220, 20); ctx.lineTo(240, 50);
  ctx.lineTo(280, 10); ctx.lineTo(300, 40);
  ctx.lineTo(360, 25); ctx.lineTo(380, 50);
  ctx.lineTo(420, 15); ctx.lineTo(440, 45);
  ctx.lineTo(490, 30); ctx.lineTo(510, 60);
  ctx.lineTo(560, 40); ctx.lineTo(580, 70);
  ctx.lineTo(640, 50); ctx.lineTo(640, 120);
  ctx.closePath(); ctx.fill();
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ============================================================
//  FLOOR SELECT  ― ランダムで即座に次シーンへ
// ============================================================
function initFloorSelect() {
  if (GS.floor === 4) { initBattle(); return; }

  if (GS.isFirstOfFloor) {
    GS.isFirstOfFloor = false;
    GS.lastOption     = 'battle';
    initBattle();
    return;
  }

  const pool   = GS.lastOption === 'stairs' ? ['battle', 'event'] : ['battle', 'event', 'stairs'];
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  GS.lastOption = chosen;

  if (chosen === 'battle')       initBattle();
  else if (chosen === 'event')   showScene('event');
  else if (chosen === 'stairs')  showScene('stairs');
}

// ============================================================
//  FLOOR TRANSITION
// ============================================================
function descendFloor() {
  GS.floor++;
  GS.battleCount    = 0;
  GS.isFirstOfFloor = true;
  GS.lastOption     = null;
  GS.player.hp = GS.player.maxHp;
  GS.player.mp = GS.player.maxMp;
  initShop();
}

// ============================================================
//  GAME OVER / VICTORY
// ============================================================
function gotoGameOver() {
  const score = calcScore();
  document.getElementById('go-floor').textContent   = `到達階層：第${GS.floor}階層`;
  document.getElementById('go-battles').textContent = `総戦闘回数：${GS.totalBattles}回`;
  document.getElementById('go-gold').textContent    = `獲得ゴールド：${GS.totalGold}G`;
  document.getElementById('go-score').textContent   = `スコア：${score}`;
  showScene('gameover');
}

function gotoVictory() {
  const score = calcScore() + 5000;
  document.getElementById('vc-battles').textContent = `総戦闘回数：${GS.totalBattles}回`;
  document.getElementById('vc-gold').textContent    = `獲得ゴールド：${GS.totalGold}G`;
  document.getElementById('vc-score').textContent   = `スコア：${score}`;
  showScene('victory');
}

function calcScore() {
  return (GS.floor - 1) * 600 + GS.totalGold * 2 + GS.totalBattles * 60;
}

// ============================================================
//  HELPERS  ― 全ファイルから使用
// ============================================================
function pct(cur, max) {
  return Math.max(0, Math.min(100, (cur / max) * 100)).toFixed(1) + '%';
}

function makeMenuBtn(label, disabled, handler, extraCls = '') {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.disabled    = disabled;
  if (extraCls) btn.className = extraCls;
  if (handler && !disabled) btn.onclick = handler;
  return btn;
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // Title
  document.getElementById('btn-start').onclick = () => { resetGame(); initFloorSelect(); };

  // Stairs
  document.getElementById('btn-stairs-down').onclick = () => descendFloor();
  document.getElementById('btn-stairs-stay').onclick = () => initFloorSelect();

  // Event
  document.getElementById('btn-event-continue').onclick = () => initFloorSelect();

  // Battle commands
  document.getElementById('cmd-attack').onclick = () => doAttack();
  document.getElementById('cmd-defend').onclick = () => doDefend();
  document.getElementById('cmd-skill').onclick  = () => openSkillMenu();
  document.getElementById('cmd-item').onclick   = () => openItemMenu();

  // Shop tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      shopTab = btn.dataset.tab;
      renderShop();
    };
  });

  // Shop leave
  document.getElementById('btn-shop-leave').onclick = () => initFloorSelect();

  // Game over / Victory
  document.getElementById('btn-title').onclick         = () => initTitle();
  document.getElementById('btn-victory-title').onclick = () => initTitle();

  // Boot
  initTitle();
});
