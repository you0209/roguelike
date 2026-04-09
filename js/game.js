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
  debugMode: false,

  player: null,
  enemy:  null,
  shopLineup: { relics: [], skills: [], items: [] },

  get atkTotal() {
    let v = GS.player.attack;
    for (const r of GS.player.relics) v += (r.attackBonus || 0);
    v *= GS.player.floorAtkMult;
    v *= GS.player.atkBuffMult;
    if (GS.player.goldPowerActive) {
      // 動的計算：現時点のゴールド量に基づく（25Gにつき×1.1、最大×2）
      const stacks = Math.min(Math.floor(GS.player.gold / 25), 10);
      v *= Math.min(2, Math.pow(1.1, stacks));
    }
    if (GS.player.hpLowAtkActive) {
      // HPが低いほど攻撃力が上昇（最大×2）
      const hpRatio = GS.player.hp / GS.player.maxHp;
      v *= (1 + (1 - hpRatio));
    }
    // 貪欲の宝珠
    if (GS.player.relics.some(r => r.passive === 'greedOrb')) v += GS.player.relics.length * 3;
    // 経験の勲章
    if (GS.player.relics.some(r => r.passive === 'expMedal')) v += GS.battleCount * 3;
    // 沈黙の仮面ボーナス（前の戦闘でスキル未使用の場合）
    if (GS.player.silenceMaskBonus) v += GS.player.silenceMaskBonus;
    // 持久の旗（5ターン以上生存でATK+30）
    if (GS.player.relics.some(r => r.passive === 'enduranceFlag') && GS.player.battleTurn >= 5) v += 30;
    // 混沌の石（ATK）
    if (GS.player.chaosAtkBonus) v += GS.player.chaosAtkBonus;
    return Math.floor(v);
  },
  get defTotal() {
    let v = GS.player.defense;
    for (const r of GS.player.relics) v += (r.defenseBonus || 0);
    if (GS.player.buffDef) v += 22;
    v *= GS.player.floorDefMult;
    v *= GS.player.defBuffMult;
    // 偶数の紋章（偶数ターンにDEF+15）
    if (GS.player.relics.some(r => r.passive === 'evenCrest') && GS.player.battleTurn % 2 === 0 && GS.player.battleTurn > 0) v += 15;
    // 混沌の石（DEF）
    if (GS.player.chaosDefBonus) v += GS.player.chaosDefBonus;
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
  GS.stairsStep     = 0;

  GS.player = {
    hp: 100, maxHp: 100,
    mp:  50, maxMp:  50,
    attack: 15, defense: 10,
    gold: 50,
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
    goldPowerActive: false, goldPowerMult: 1,
    critRate: 0.1,
    critBuffRemain: 0,
    damageTakenMult: 1,
    turnDmg: 0,
    skillPowerMult: 1,
    skillDisabled: false,
    mpCostMult: 1,
    hpLowAtkActive: false,
    challengeBattle: false,
    // レリックパッシブ用
    battleTurn: 0,
    revengeBladeReady: false,
    usedSkillThisBattle: false,
    silenceMaskBonus: 0,
    chaosAtkBonus: 0,
    chaosDefBonus: 0,
    chaosMaxHpBonus: 0,
    chaosMaxMpBonus: 0,
    counterActive: false,
    counterPower: 0
  };
  GS._challengeVictory = false;

  if (GS.debugMode) {
    const p = GS.player;
    p.hp = 9999; p.maxHp = 9999;
    p.mp = 999;  p.maxMp = 999;
    p.attack = 200; p.defense = 100;
    p.gold = 9999;
    p.skills = Object.keys(SKILLS);
  }
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
  _updateDebugBadge();
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

  // 各フロア1戦目は必ず戦闘
  if (GS.isFirstOfFloor) {
    GS.isFirstOfFloor = false;
    GS.lastOption     = 'battle';
    initBattle();
    return;
  }

  // 階段判定（stairsStep × 10%、最大100%）
  if (Math.random() < Math.min(GS.stairsStep * 0.1, 1)) {
    GS.stairsStep = 0;
    GS.lastOption = 'stairs';
    const p = GS.player;
    document.getElementById('stairs-hp').textContent   = `${p.hp}/${p.maxHp}`;
    document.getElementById('stairs-mp').textContent   = `${p.mp}/${p.maxMp}`;
    document.getElementById('stairs-gold').textContent = p.gold;
    showScene('stairs');
    return;
  }

  // 階段なし → 戦闘75% / イベント25%、カウンター+1
  GS.stairsStep++;
  const chosen = Math.random() < 0.75 ? 'battle' : 'event';
  GS.lastOption = chosen;
  if (chosen === 'battle') initBattle();
  else                     initEvent();
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
  GS.stairsStep     = 0;
  const p = GS.player;
  p.floorAtkMult = 1; p.floorDefMult = 1;
  p.goldDouble = false; p.goldShield = false;
  p.goldPowerActive = false; p.goldPowerMult = 1;
  p.damageTakenMult = 1;
  p.turnDmg = 0;
  p.skillPowerMult = 1;
  p.skillDisabled = false;
  p.mpCostMult = 1;
  p.hpLowAtkActive = false;
  p.challengeBattle = false;
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
//  DEBUG HELPERS
// ============================================================
function _updateDebugBadge() {
  let badge = document.getElementById('debug-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'debug-badge';
    badge.style.cssText = 'position:fixed;top:8px;right:8px;background:#f00;color:#fff;font-size:11px;padding:2px 8px;border-radius:4px;font-family:monospace;z-index:9999;pointer-events:none;';
    document.body.appendChild(badge);
  }
  badge.textContent  = 'DEBUG MODE';
  badge.style.display = GS.debugMode ? 'block' : 'none';
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // Title
  document.getElementById('btn-start').onclick = () => { resetGame(); initFloorSelect(); };

  // Debug mode toggle: タイトル画面で D キー
  document.addEventListener('keydown', e => {
    if (GS.scene === 'title' && e.key === 'd') {
      GS.debugMode = !GS.debugMode;
      _updateDebugBadge();
    }
  });

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
