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
  shopLineup: { relics: [], items: [] },

  get atkTotal() {
    let v = GS.player.attack;
    for (const r of GS.player.relics) v += (r.attackBonus || 0);
    v *= GS.player.floorAtkMult;
    v *= GS.player.atkBuffMult;
    if (GS.player.goldPowerActive) v *= GS.player.goldPowerMult;
    return Math.floor(v);
  },
  get defTotal() {
    let v = GS.player.defense;
    for (const r of GS.player.relics) v += (r.defenseBonus || 0);
    if (GS.player.buffDef) v += 22;
    v *= GS.player.floorDefMult;
    v *= GS.player.defBuffMult;
    return Math.floor(v);
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
  GS.floorEventsUsed = new Set();
  GS.forcedEnemy    = null;

  GS.player = {
    hp: 100, maxHp: 100,
    mp:  50, maxMp:  50,
    attack: 15, defense: 10,
    gold: 30,
    relics: [],
    skills: ['slash'],
    inventory: [],
    buffDef: false,
    isDefending: false,
    hasRevival: false,
    // イベントバフ
    atkBuffMult: 1, atkBuffRemain: 0,
    defBuffMult: 1, defBuffRemain: 0,
    floorAtkMult: 1, floorDefMult: 1,
    goldDouble: false,
    mpFree: false, mpFreeRemain: 0,
    goldShield: false,
    nextEnemyPowered: false,
    goldPowerActive: false, goldPowerMult: 1
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
  if (GS.floor === 7) { initBattle(); return; }

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
  else if (chosen === 'event')   initEvent();
  else if (chosen === 'stairs')  showScene('stairs');
}

// ============================================================
//  FLOOR TRANSITION
// ============================================================
function descendFloor(skipShop = false) {
  GS.floor++;
  GS.battleCount    = 0;
  GS.isFirstOfFloor = true;
  GS.lastOption     = null;
  GS.floorEventsUsed = new Set();
  const p = GS.player;
  p.floorAtkMult = 1; p.floorDefMult = 1;
  p.goldDouble = false; p.goldShield = false;
  p.goldPowerActive = false; p.goldPowerMult = 1;
  if (!skipShop) {
    p.hp = p.maxHp; p.mp = p.maxMp;
    initShop();
  } else {
    initFloorSelect();
  }
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

  // Event: choices are rendered dynamically by initEvent()

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
