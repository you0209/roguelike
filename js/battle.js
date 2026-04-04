'use strict';

// ============================================================
//  BATTLE  ― 担当B が編集
// ============================================================

// ----- state -----
let battleLog  = [];
let playerTurn = true;
let battleOver = false;
let rafId      = null;
let flash      = { enemy: 0, player: 0 };

// ---- spawn scaled enemy ----
function spawnEnemy() {
  const keys = FLOOR_ENEMIES[GS.floor];
  const key  = keys[Math.floor(Math.random() * keys.length)];
  const base = ENEMIES[key];
  const s    = 1 + GS.battleCount * 0.12;
  const as   = 1 + GS.battleCount * 0.06;

  return {
    ...base,
    hp:      Math.floor(base.maxHp * s),
    maxHp:   Math.floor(base.maxHp * s),
    attack:  Math.floor(base.attack * as),
    defense: Math.floor(base.defense * (1 + GS.battleCount * 0.04)),
    poisoned: false, poisonDmg: 0
  };
}

function initBattle() {
  document.querySelector('.command-grid').style.display = '';
  const oldBtn = document.getElementById('battle-proceed-btn');
  if (oldBtn) oldBtn.remove();

  GS.enemy   = spawnEnemy();
  battleLog  = [];
  playerTurn = true;
  battleOver = false;
  GS.player.buffDef     = false;
  GS.player.isDefending = false;
  flash = { enemy: 0, player: 0 };

  showScene('battle');

  const e = GS.enemy;
  document.getElementById('battle-floor-info').textContent =
    GS.floor === 4 ? '💀 ボス戦！' : `第${GS.floor}階層`;
  document.getElementById('battle-gold').textContent = `G: ${GS.player.gold}`;
  document.getElementById('enemy-name').textContent  = e.name + (e.isBoss ? ' 👑' : '');

  addLog(`${e.name}が現れた！`, 'log-system');
  updateBattleUI();
  enableCmds();
  startBattleAnim();
}

// ---- UI helpers ----
function updateBattleUI() {
  const p = GS.player, e = GS.enemy;
  document.getElementById('battle-player-hp-text').textContent = `${p.hp}/${p.maxHp}`;
  document.getElementById('battle-player-mp-text').textContent = `${p.mp}/${p.maxMp}`;
  document.getElementById('battle-player-hp-bar').style.width  = pct(p.hp, p.maxHp);
  document.getElementById('battle-player-mp-bar').style.width  = pct(p.mp, p.maxMp);
  document.getElementById('enemy-hp-text').textContent = `${Math.max(0,e.hp)}/${e.maxHp}`;
  document.getElementById('enemy-hp-bar').style.width  = pct(Math.max(0,e.hp), e.maxHp);
  document.getElementById('enemy-hp-bar').style.background =
    e.isBoss ? 'linear-gradient(90deg,#881111,#ff3333)' : 'linear-gradient(90deg,#22bb22,#44ff44)';
  document.getElementById('battle-gold').textContent = `G: ${p.gold}`;

  document.getElementById('player-status-icon').textContent =
    p.isDefending ? '🛡 防御中' : p.buffDef ? '🛡 防御UP' : '';
  document.getElementById('enemy-status-icon').textContent =
    e.poisoned ? '☠ 毒' : '';
}

function addLog(msg, cls = '') {
  const div = document.getElementById('battle-log');
  const p   = document.createElement('p');
  p.textContent = msg;
  if (cls) p.className = cls;
  div.appendChild(p);
  div.scrollTop = div.scrollHeight;
}

function enableCmds() {
  document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = false);
  document.getElementById('battle-commands').style.display = '';
  document.getElementById('skill-menu').classList.add('hidden');
  document.getElementById('item-menu').classList.add('hidden');
}
function disableCmds() {
  document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = true);
}

// ============================================================
//  PLAYER ACTIONS
// ============================================================
function doAttack() {
  if (!playerTurn || battleOver) return;
  disableCmds();

  const dmg = calcPhysDmg(GS.atkTotal, GS.enemy.defense, 1.0);
  GS.enemy.hp -= dmg;
  addLog(`勇者の攻撃！　${GS.enemy.name}に ${dmg} ダメージ！`, 'log-damage');
  flash.enemy = 10;
  updateBattleUI();
  afterPlayerAction();
}

function doDefend() {
  if (!playerTurn || battleOver) return;
  disableCmds();

  GS.player.isDefending = true;
  GS.player.buffDef     = true;
  addLog('勇者は防御態勢をとった！　ダメージを大幅軽減。', 'log-system');
  updateBattleUI();
  afterPlayerAction();
}

function openSkillMenu() {
  const menu = document.getElementById('skill-menu');
  menu.innerHTML = '';
  menu.classList.remove('hidden');
  document.getElementById('item-menu').classList.add('hidden');

  menu.appendChild(makeMenuBtn('← 戻る', false, () => menu.classList.add('hidden'), 'back-btn'));

  GS.player.skills.forEach(id => {
    const sk = SKILLS[id];
    if (!sk) return;
    const noMp  = GS.player.mp < sk.mpCost;
    const label = `${sk.name}  [${sk.mpCost}MP]  ${sk.desc}`;
    menu.appendChild(makeMenuBtn(label, noMp, () => {
      menu.classList.add('hidden');
      doSkill(id);
    }));
  });
}

function doSkill(id) {
  if (!playerTurn || battleOver) return;
  disableCmds();

  const sk = SKILLS[id];
  const p  = GS.player;
  const e  = GS.enemy;

  if (p.mp < sk.mpCost) { addLog('MPが足りない！', 'log-system'); enableCmds(); return; }
  p.mp -= sk.mpCost;

  if (sk.type === 'physical') {
    const dmg = calcPhysDmg(GS.atkTotal, e.defense, sk.power);
    e.hp -= dmg;
    addLog(`${sk.name}！　${e.name}に ${dmg} ダメージ！`, 'log-damage');
    flash.enemy = 10;
  } else if (sk.type === 'magic') {
    const dmg = calcMagicDmg(GS.atkTotal, sk.power);
    e.hp -= dmg;
    addLog(`${sk.name}！　魔法で ${e.name}に ${dmg} ダメージ！`, 'log-special');
    flash.enemy = 10;
  } else if (sk.type === 'heal') {
    const healed = Math.min(sk.healAmount, p.maxHp - p.hp);
    p.hp += healed;
    addLog(`${sk.name}！　HPが ${healed} 回復した。`, 'log-heal');
  } else if (sk.type === 'buff_def') {
    p.buffDef = true;
    addLog(`${sk.name}！　防御力が大幅に上昇した！`, 'log-system');
  }

  updateBattleUI();
  afterPlayerAction();
}

function openItemMenu() {
  const menu = document.getElementById('item-menu');
  menu.innerHTML = '';
  menu.classList.remove('hidden');
  document.getElementById('skill-menu').classList.add('hidden');

  menu.appendChild(makeMenuBtn('← 戻る', false, () => menu.classList.add('hidden'), 'back-btn'));

  if (GS.player.inventory.length === 0) {
    menu.appendChild(makeMenuBtn('アイテムがない', true, null));
    return;
  }

  GS.player.inventory.forEach((entry, idx) => {
    const it = ITEMS[entry.id];
    if (!it) return;
    const label = `${it.name} x${entry.count}  ／  ${it.desc}`;
    menu.appendChild(makeMenuBtn(label, false, () => {
      menu.classList.add('hidden');
      doItem(idx, entry.id);
    }));
  });
}

function doItem(idx, id) {
  if (!playerTurn || battleOver) return;
  disableCmds();

  const it = ITEMS[id];
  const p  = GS.player;
  const e  = GS.enemy;

  p.inventory[idx].count--;
  if (p.inventory[idx].count <= 0) p.inventory.splice(idx, 1);

  if (it.type === 'heal_hp') {
    const h = Math.min(it.value, p.maxHp - p.hp);
    p.hp += h;
    addLog(`${it.name}を使った！　HPが ${h} 回復！`, 'log-heal');
  } else if (it.type === 'heal_mp') {
    const h = Math.min(it.value, p.maxMp - p.mp);
    p.mp += h;
    addLog(`${it.name}を使った！　MPが ${h} 回復！`, 'log-heal');
  } else if (it.type === 'damage') {
    e.hp -= it.value;
    addLog(`${it.name}を投げた！　${e.name}に ${it.value} ダメージ！`, 'log-damage');
    flash.enemy = 10;
  } else if (it.type === 'poison') {
    e.poisoned  = true;
    e.poisonDmg = it.value;
    addLog(`${it.name}を使った！　${e.name}は毒状態になった！`, 'log-special');
  } else if (it.type === 'revival') {
    p.hasRevival = true;
    addLog(`${it.name}を使った！　戦闘不能になっても一度復活できる！`, 'log-system');
  }

  updateBattleUI();
  afterPlayerAction();
}

// ============================================================
//  BATTLE FLOW
// ============================================================
function afterPlayerAction() {
  if (checkWin()) return;
  setTimeout(() => doEnemyTurn(), 700);
}

function checkWin() {
  if (GS.enemy.hp > 0) return false;
  battleOver = true;

  const gold = GS.enemy.goldReward;
  GS.player.gold += gold;
  GS.totalGold   += gold;
  GS.battleCount++;
  GS.totalBattles++;

  addLog(`${GS.enemy.name}を倒した！　${gold}G を得た！`, 'log-special');
  disableCmds();

  if (GS.enemy.isBoss) {
    setTimeout(() => { stopBattleAnim(); gotoVictory(); }, 1800);
  } else {
    setTimeout(() => { stopBattleAnim(); showReturnBtn(); }, 1200);
  }
  return true;
}

function checkLose() {
  if (GS.player.hp > 0) return false;
  if (GS.player.hasRevival) {
    GS.player.hp = 1;
    GS.player.hasRevival = false;
    addLog('蘇生草の力で復活した！', 'log-special');
    updateBattleUI();
    return false;
  }
  battleOver = true;
  addLog('勇者は倒れた…', 'log-system');
  disableCmds();
  setTimeout(() => { stopBattleAnim(); gotoGameOver(); }, 1800);
  return true;
}

function doEnemyTurn() {
  if (battleOver) return;
  playerTurn = false;

  const e = GS.enemy;
  const p = GS.player;

  if (e.poisoned) {
    e.hp -= e.poisonDmg;
    addLog(`${e.name}は毒のダメージを受けた！ (-${e.poisonDmg})`, 'log-damage');
    if (checkWin()) return;
  }

  let action = 'attack';
  if (e.isBoss && e.bossSkills.length > 0 && Math.random() < 0.38) {
    action = e.bossSkills[Math.floor(Math.random() * e.bossSkills.length)];
  }

  let dmg = 0;
  if (action === 'dragonBreath') {
    dmg = Math.max(1, Math.floor(e.attack * 1.6 - p.defense * 0.2));
    dmg = p.isDefending ? Math.floor(dmg * 0.35) : dmg;
    p.hp -= dmg;
    addLog(`${e.name}のドラゴンブレス！　勇者に ${dmg} ダメージ！`, 'log-damage');
    flash.player = 10;
  } else if (action === 'tailSwipe') {
    dmg = Math.max(1, Math.floor(e.attack * 1.3 - p.defense * 0.4));
    dmg = p.isDefending ? Math.floor(dmg * 0.35) : dmg;
    p.hp -= dmg;
    addLog(`${e.name}の尻尾攻撃！　勇者に ${dmg} ダメージ！`, 'log-damage');
    flash.player = 10;
  } else if (action === 'dragonRoar') {
    addLog(`${e.name}の咆哮！　勇者は怯んだ！`, 'log-special');
    p.roarDebuff = true;
  } else {
    dmg = Math.max(1, Math.floor(e.attack - GS.defTotal * 0.55));
    if (p.isDefending) dmg = Math.floor(dmg * 0.25);
    p.hp -= dmg;
    addLog(
      p.isDefending
        ? `${e.name}の攻撃！　防御した！　勇者に ${dmg} ダメージ。`
        : `${e.name}の攻撃！　勇者に ${dmg} ダメージ！`,
      'log-damage'
    );
    flash.player = 10;
  }

  p.isDefending = false;
  p.buffDef     = false;
  updateBattleUI();

  setTimeout(() => {
    playerTurn = true;
    if (!checkLose() && !battleOver) enableCmds();
  }, 500);
}

function showReturnBtn() {
  document.querySelector('.command-grid').style.display = 'none';
  const btn = document.createElement('button');
  btn.id            = 'battle-proceed-btn';
  btn.className     = 'pixel-btn';
  btn.textContent   = '進　む';
  btn.style.cssText = 'display:block; margin: 12px auto;';
  btn.onclick = () => initFloorSelect();
  document.getElementById('battle-commands').appendChild(btn);
}

// ============================================================
//  DAMAGE FORMULAS
// ============================================================
function calcPhysDmg(atk, def, power) {
  const base = atk * power - def * 0.5;
  return Math.max(1, Math.floor(base * (0.9 + Math.random() * 0.2)));
}
function calcMagicDmg(atk, power) {
  const base = (atk * 0.7 + 12) * power;
  return Math.max(1, Math.floor(base * (0.88 + Math.random() * 0.24)));
}

// ============================================================
//  CANVAS ANIMATION  ― スプライト差し替えはここ
// ============================================================
function startBattleAnim() {
  const canvas = document.getElementById('battle-canvas');
  const ctx    = canvas.getContext('2d');
  let   frame  = 0;

  function loop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#090912';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e1e38';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 162); ctx.lineTo(canvas.width, 162); ctx.stroke();

    const pFlash = flash.player > 0;
    if (flash.player > 0) flash.player--;
    drawPlayer(ctx, 110, 110, pFlash, frame);

    const eFlash = flash.enemy > 0;
    if (flash.enemy > 0) flash.enemy--;
    if (GS.enemy) drawEnemy(ctx, GS.enemy, 340, 100, eFlash, frame);

    rafId = requestAnimationFrame(loop);
  }
  loop();
}

function stopBattleAnim() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

// ---- pixel helpers ----
function px(ctx, x, y, w, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
}
function flashCol(orig, isFlash) {
  return isFlash ? '#ffffff' : orig;
}

// ---- PLAYER sprite ----
function drawPlayer(ctx, cx, cy, fl, frame) {
  const bob = Math.sin(frame * 0.06) * 1.5;
  const by  = cy + bob;
  const c   = (col) => flashCol(col, fl);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx, cy + 22, 22, 5, 0, 0, Math.PI * 2); ctx.fill();

  px(ctx, cx-11, by+4,  9, 6, c('#443322'));
  px(ctx, cx+2,  by+4,  9, 6, c('#443322'));
  px(ctx, cx-9,  by-12, 7, 16, c('#334488'));
  px(ctx, cx+2,  by-12, 7, 16, c('#334488'));
  px(ctx, cx-10, by-32, 20, 20, c('#4466aa'));
  px(ctx, cx-14, by-32, 6, 8, c('#5577bb'));
  px(ctx, cx+8,  by-32, 6, 8, c('#5577bb'));
  px(ctx, cx-8,  by-48, 16, 14, c('#ffcc88'));
  px(ctx, cx-10, by-54, 20, 10, c('#666688'));
  px(ctx, cx-6,  by-60, 12,  8, c('#8888aa'));
  px(ctx, cx-7,  by-50, 14,  4, c('#222244'));
  px(ctx, cx-20, by-32, 10, 16, c('#886644'));
  px(ctx, cx-22, by-30,  5, 12, c('#aabb66'));
  px(ctx, cx+12, by-42,  5, 28, c('#bbbbcc'));
  px(ctx, cx+9,  by-36, 11,  5, c('#887766'));
  px(ctx, cx+13, by-46,  4,  6, c('#ddddee'));
}

// ---- ENEMY sprites ----
function drawEnemy(ctx, e, cx, cy, fl, frame) {
  const sprite = e.sprite || 'default';
  const bob    = Math.sin(frame * 0.05 + 1) * 1.2;
  const by     = cy + bob;

  const sr = { dragon: 46, troll: 28, orc: 24, wolf: 26 }[sprite] || 20;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(cx, cy + 22, sr, 5, 0, 0, Math.PI * 2); ctx.fill();

  const c = (col) => flashCol(col, fl);
  switch (sprite) {
    case 'slime':    drawSlime(ctx, cx, by, c, e.color); break;
    case 'bat':      drawBat(ctx, cx, by, c, e.color, frame); break;
    case 'goblin':   drawGoblin(ctx, cx, by, c, e.color); break;
    case 'wolf':     drawWolf(ctx, cx, by, c, e.color); break;
    case 'orc':      drawOrc(ctx, cx, by, c, e.color); break;
    case 'skeleton': drawSkeleton(ctx, cx, by, c, e.color); break;
    case 'troll':    drawTroll(ctx, cx, by, c, e.color); break;
    case 'mage':     drawMage(ctx, cx, by, c, e.color, frame); break;
    case 'knight':   drawDarkKnight(ctx, cx, by, c, e.color); break;
    case 'dragon':   drawDragon(ctx, cx, by, c, e.color, frame); break;
    default: px(ctx, cx-18, by-36, 36, 44, c(e.color || '#888'));
  }
}

function drawSlime(ctx, cx, cy, c, col) {
  ctx.fillStyle = c(col);
  ctx.beginPath(); ctx.ellipse(cx, cy+2, 24, 19, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = c('#66ff66');
  ctx.beginPath(); ctx.ellipse(cx-6, cy-8, 8, 6, -0.3, 0, Math.PI*2); ctx.fill();
  px(ctx, cx-10, cy-9, 7, 7, c('#ffffff'));
  px(ctx, cx+3,  cy-9, 7, 7, c('#ffffff'));
  px(ctx, cx-8,  cy-7, 4, 4, c('#000000'));
  px(ctx, cx+5,  cy-7, 4, 4, c('#000000'));
}

function drawBat(ctx, cx, cy, c, col, frame) {
  const flap = Math.sin(frame * 0.22) * 8;
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx, cy-8);
  ctx.lineTo(cx-36, cy-22+flap); ctx.lineTo(cx-18, cy+6); ctx.lineTo(cx, cy+4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy-8);
  ctx.lineTo(cx+36, cy-22+flap); ctx.lineTo(cx+18, cy+6); ctx.lineTo(cx, cy+4); ctx.fill();
  ctx.fillStyle = c('#3a3344');
  ctx.beginPath(); ctx.ellipse(cx, cy-4, 13, 16, 0, 0, Math.PI*2); ctx.fill();
  px(ctx, cx-7, cy-12, 5, 5, c('#ff2222'));
  px(ctx, cx+2, cy-12, 5, 5, c('#ff2222'));
}

function drawGoblin(ctx, cx, cy, c, col) {
  px(ctx, cx-13, cy-26, 26, 30, c(col));
  px(ctx, cx-15, cy-48, 30, 26, c(col));
  px(ctx, cx-22, cy-46,  9, 12, c(col));
  px(ctx, cx+13, cy-46,  9, 12, c(col));
  px(ctx, cx-10, cy-42, 6, 6, c('#ffff00'));
  px(ctx, cx+4,  cy-42, 6, 6, c('#ffff00'));
  px(ctx, cx-8,  cy-40, 3, 4, c('#000'));
  px(ctx, cx+6,  cy-40, 3, 4, c('#000'));
  px(ctx, cx-8,  cy-26, 5, 5, c('#ffffcc'));
  px(ctx, cx+3,  cy-26, 5, 5, c('#ffffcc'));
  px(ctx, cx+14, cy-36, 6, 32, c('#887755'));
  px(ctx, cx+10, cy-42,14, 10, c('#887755'));
  px(ctx, cx-13, cy+4,10, 14, c('#335522'));
  px(ctx, cx+3,  cy+4,10, 14, c('#335522'));
}

function drawWolf(ctx, cx, cy, c, col) {
  px(ctx, cx-28, cy-20, 52, 24, c(col));
  px(ctx, cx+14, cy-38, 22, 22, c(col));
  px(ctx, cx+24, cy-30, 17, 16, c(col));
  px(ctx, cx+28, cy-18, 10,  5, c('#ff2222'));
  px(ctx, cx+12, cy-52,  9, 18, c(col));
  px(ctx, cx+25, cy-52,  9, 18, c(col));
  px(ctx, cx+15, cy-35,  6,  6, c('#ffaa00'));
  px(ctx, cx-24, cy+4,  9, 17, c('#555566'));
  px(ctx, cx-11, cy+4,  9, 17, c('#555566'));
  px(ctx, cx+6,  cy+4,  9, 17, c('#555566'));
  px(ctx, cx+19, cy+4,  9, 17, c('#555566'));
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-28, cy-12); ctx.lineTo(cx-52, cy-36); ctx.lineTo(cx-42, cy-10); ctx.fill();
}

function drawOrc(ctx, cx, cy, c, col) {
  px(ctx, cx-22, cy-38, 44, 44, c(col));
  px(ctx, cx-20, cy-64, 40, 30, c(col));
  px(ctx, cx-16, cy-38,  8, 12, c('#ffffcc'));
  px(ctx, cx+8,  cy-38,  8, 12, c('#ffffcc'));
  px(ctx, cx-13, cy-56,  9,  9, c('#ff4400'));
  px(ctx, cx+4,  cy-56,  9,  9, c('#ff4400'));
  px(ctx, cx-20, cy-30, 40, 24, c('#554433'));
  px(ctx, cx+20, cy-68,  7, 56, c('#887766'));
  px(ctx, cx+20, cy-74, 20, 18, c('#aabbcc'));
  px(ctx, cx+20, cy-52, 20, 18, c('#aabbcc'));
  px(ctx, cx-20, cy+6,  18, 20, c('#334422'));
  px(ctx, cx+2,  cy+6,  18, 20, c('#334422'));
}

function drawSkeleton(ctx, cx, cy, c, col) {
  px(ctx, cx-11, cy-32, 22, 26, c(col));
  for (let i=0; i<4; i++) px(ctx, cx-11, cy-30+i*6, 22, 3, c('#aaaaaa'));
  px(ctx, cx-14, cy-56, 28, 26, c(col));
  px(ctx, cx-10, cy-50,  9, 10, c('#000'));
  px(ctx, cx+1,  cy-50,  9, 10, c('#000'));
  px(ctx, cx-4,  cy-38,  4,  4, c('#000'));
  px(ctx, cx+1,  cy-38,  4,  4, c('#000'));
  px(ctx, cx-11, cy-32, 22,  7, c(col));
  for (let i=0; i<4; i++) px(ctx, cx-9+i*5, cy-32, 4, 5, c('#ffffff'));
  px(ctx, cx-24, cy-30,  9, 22, c(col));
  px(ctx, cx+15, cy-30,  9, 22, c(col));
  px(ctx, cx+25, cy-48,  5, 32, c('#aabbcc'));
  px(ctx, cx+19, cy-40, 14,  5, c('#887766'));
  px(ctx, cx-11, cy-6,   9, 26, c(col));
  px(ctx, cx+2,  cy-6,   9, 26, c(col));
}

function drawTroll(ctx, cx, cy, c, col) {
  px(ctx, cx-30, cy-54, 60, 58, c(col));
  px(ctx, cx-24, cy-82, 48, 32, c(col));
  px(ctx, cx-22, cy-98, 12, 20, c(col));
  px(ctx, cx+10, cy-98, 12, 20, c(col));
  px(ctx, cx-18, cy-72, 12, 12, c('#ff6600'));
  px(ctx, cx+6,  cy-72, 12, 12, c('#ff6600'));
  px(ctx, cx-14, cy-64, 28,  9, c('#441111'));
  px(ctx, cx-12, cy-64,  7,  7, c('#ffffcc'));
  px(ctx, cx+5,  cy-64,  7,  7, c('#ffffcc'));
  px(ctx, cx-50, cy-60, 12, 56, c('#665544'));
  px(ctx, cx-58, cy-68, 30, 20, c('#665544'));
  px(ctx, cx-28, cy+4,  24, 22, c('#665533'));
  px(ctx, cx+4,  cy+4,  24, 22, c('#665533'));
}

function drawMage(ctx, cx, cy, c, col, frame) {
  const glow = Math.sin(frame * 0.1) * 0.3 + 0.7;
  ctx.fillStyle = c('#330044');
  ctx.beginPath();
  ctx.moveTo(cx-18, cy-32); ctx.lineTo(cx+18, cy-32);
  ctx.lineTo(cx+22, cy+26); ctx.lineTo(cx-22, cy+26); ctx.fill();
  px(ctx, cx-11, cy-52, 22, 24, c('#ffcc88'));
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx, cy-76); ctx.lineTo(cx-20, cy-52); ctx.lineTo(cx+20, cy-52); ctx.fill();
  px(ctx, cx-22, cy-56, 44,  6, c(col));
  px(ctx, cx-8,  cy-46,  6,  6, c('#dd44ff'));
  px(ctx, cx+2,  cy-46,  6,  6, c('#dd44ff'));
  px(ctx, cx+16, cy-66,  6, 84, c('#886644'));
  const orbCol = c('#000') === '#ffffff' ? '255,255,255' : '170,34,255';
  ctx.fillStyle = `rgba(${orbCol}, ${glow.toFixed(2)})`;
  ctx.beginPath(); ctx.arc(cx+19, cy-70, 10, 0, Math.PI*2); ctx.fill();
  px(ctx, cx+15, cy-74,  5,  5, c('#ff88ff'));
  px(ctx, cx-24, cy-30,  9, 22, c('#330044'));
  px(ctx, cx+15, cy-30,  9, 22, c('#330044'));
}

function drawDarkKnight(ctx, cx, cy, c, col) {
  px(ctx, cx-20, cy-40, 40, 46, c('#222233'));
  px(ctx, cx-28, cy-40, 10, 18, c('#333344'));
  px(ctx, cx+18, cy-40, 10, 18, c('#333344'));
  px(ctx, cx-18, cy-66, 36, 30, c(col));
  px(ctx, cx-14, cy-58, 28, 10, c('#111122'));
  px(ctx, cx-10, cy-55,  6,  6, c('#ff0044'));
  px(ctx, cx+4,  cy-55,  6,  6, c('#ff0044'));
  ctx.fillStyle = c('#110011');
  ctx.beginPath();
  ctx.moveTo(cx-20, cy-38); ctx.lineTo(cx-32, cy+22); ctx.lineTo(cx-16, cy+22); ctx.fill();
  px(ctx, cx+18, cy-76, 10, 88, c('#4444aa'));
  px(ctx, cx+18, cy-62, 10,  6, c('#6666cc'));
  px(ctx, cx+12, cy-60, 24,  6, c('#6666cc'));
  px(ctx, cx-18, cy+6,  16, 22, c('#333344'));
  px(ctx, cx+2,  cy+6,  16, 22, c('#333344'));
}

function drawDragon(ctx, cx, cy, c, col, frame) {
  const wb = Math.sin(frame * 0.07) * 6;
  ctx.fillStyle = c('#880011');
  ctx.beginPath();
  ctx.moveTo(cx-12, cy-32); ctx.lineTo(cx-90, cy-80+wb);
  ctx.lineTo(cx-65, cy-8);  ctx.lineTo(cx-22, cy-8); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+12, cy-32); ctx.lineTo(cx+90, cy-80+wb);
  ctx.lineTo(cx+65, cy-8);  ctx.lineTo(cx+22, cy-8); ctx.fill();
  px(ctx, cx-32, cy-44, 64, 58, c(col));
  px(ctx, cx-14, cy-74, 28, 34, c(col));
  px(ctx, cx-22, cy-96, 54, 28, c(col));
  px(ctx, cx+20, cy-90, 28, 20, c(col));
  px(ctx, cx+22, cy-86,  7,  5, c('#ff2200'));
  px(ctx, cx+35, cy-86,  7,  5, c('#ff2200'));
  px(ctx, cx-16, cy-92, 16, 16, c('#ffdd00'));
  px(ctx, cx+4,  cy-92, 16, 16, c('#ffdd00'));
  px(ctx, cx-12, cy-89,  8, 10, c('#000000'));
  px(ctx, cx+8,  cy-89,  8, 10, c('#000000'));
  ctx.fillStyle = c('#882200');
  ctx.beginPath();
  ctx.moveTo(cx-18, cy-96); ctx.lineTo(cx-28, cy-124); ctx.lineTo(cx-8, cy-96); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+4, cy-96);  ctx.lineTo(cx+14, cy-124); ctx.lineTo(cx+24, cy-96); ctx.fill();
  px(ctx, cx-30, cy+14, 22, 24, c(col));
  px(ctx, cx+8,  cy+14, 22, 24, c(col));
  px(ctx, cx-35, cy+35, 12,  7, c('#331100'));
  px(ctx, cx-26, cy+37,  9,  5, c('#331100'));
  px(ctx, cx+6,  cy+35, 12,  7, c('#331100'));
  px(ctx, cx+20, cy+37,  9,  5, c('#331100'));
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-32, cy+10); ctx.lineTo(cx-82, cy+34); ctx.lineTo(cx-60, cy+14); ctx.fill();
  ctx.fillStyle = c('#ee1111');
  for (let i=0; i<4; i++)
    for (let j=0; j<3; j++) {
      ctx.beginPath(); ctx.arc(cx-18+i*16, cy-30+j*17, 5, 0, Math.PI*2); ctx.fill();
    }
}
