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
  if (GS.forcedEnemy) {
    const e = GS.forcedEnemy;
    GS.forcedEnemy = null;
    return e;
  }
  const keys = FLOOR_ENEMIES[GS.floor];
  const key  = keys[Math.floor(Math.random() * keys.length)];
  const base = ENEMIES[key];
  const s    = 1 + GS.battleCount * 0.12;
  const as   = 1 + GS.battleCount * 0.06;

  const enemy = {
    ...base,
    hp:      Math.floor(base.maxHp * s),
    maxHp:   Math.floor(base.maxHp * s),
    attack:  Math.floor(base.attack * as),
    defense: Math.floor(base.defense * (1 + GS.battleCount * 0.04)),
    poisoned: false, poisonDmg: 0,
    chargedSkill: null, isDefending: false
  };

  if (GS.player.nextEnemyPowered) {
    enemy.hp      = Math.floor(enemy.hp * 1.3);
    enemy.maxHp   = Math.floor(enemy.maxHp * 1.3);
    enemy.attack  = Math.floor(enemy.attack * 1.3);
    enemy.goldReward = Math.floor(enemy.goldReward * 2);
    GS.player.nextEnemyPowered = false;
  }
  if (GS.player.challengeBattle) {
    enemy.attack  = Math.floor(enemy.attack  * 1.5);
    enemy.defense = Math.floor(enemy.defense * 1.5);
    GS.player.challengeBattle = false;
    GS._challengeVictory = true;
  }
  return enemy;
}

function initBattle() {
  document.querySelector('.command-grid').style.display = '';
  const oldBtn = document.getElementById('battle-proceed-btn');
  if (oldBtn) oldBtn.remove();

  GS.enemy   = spawnEnemy();
  battleLog  = [];
  playerTurn = true;
  battleOver = false;
  GS.player.buffDef          = false;
  GS.player.isDefending      = false;
  GS.player.battleTurn       = 0;
  GS.player.revengeBladeReady    = false;
  GS.player.usedSkillThisBattle  = false;
  GS.player.counterActive        = false;
  GS.player.chaosAtkBonus    = 0;
  GS.player.chaosDefBonus    = 0;
  // 前の戦闘の混沌の石HP/MP/CRITボーナスをリセット
  if (GS.player.chaosMaxHpBonus)  { GS.player.maxHp    -= GS.player.chaosMaxHpBonus;  GS.player.chaosMaxHpBonus  = 0; }
  if (GS.player.chaosMaxMpBonus)  { GS.player.maxMp    -= GS.player.chaosMaxMpBonus;  GS.player.chaosMaxMpBonus  = 0; }
  if (GS.player.chaosCritBonus)   { GS.player.critRate -= GS.player.chaosCritBonus;   GS.player.chaosCritBonus   = 0; }
  GS.player.hp = Math.min(GS.player.hp, GS.player.maxHp);
  GS.player.mp = Math.min(GS.player.mp, GS.player.maxMp);
  flash = { enemy: 0, player: 0 };

  // バフカウントダウンは戦闘終了時（checkWin）に行う

  showScene('battle');

  const e = GS.enemy;
  document.getElementById('battle-floor-info').textContent =
    GS.floor === 7 ? '💀 ボス戦！' : `第${GS.floor}階層`;
  document.getElementById('battle-gold').textContent = `G: ${GS.player.gold}`;
  document.getElementById('enemy-name').textContent  = e.name + (e.isBoss ? ' 👑' : '');

  addLog(`${e.name}が現れた！`, 'log-system');

  // 混沌の石
  if (GS.player.relics.some(r => r.passive === 'chaosStone')) {
    const roll = Math.floor(Math.random() * 3);
    const labels = ['攻撃力+20', '防御力+20', '会心率+20%'];
    const p = GS.player;
    if      (roll === 0) { p.chaosAtkBonus  = 20;  }
    else if (roll === 1) { p.chaosDefBonus  = 20;  }
    else                 { p.chaosCritBonus = 0.2; p.critRate += 0.2; }
    addLog(`混沌の石が発動！　${labels[roll]}！`, 'log-special');
  }

  // 新レリックパッシブリセット
  {
    const p = GS.player;
    p.wrathBonus = 0; p.adversityBonus = 0;
    p.patienceDefBonus = 0; p.rebellionAtkBonus = 0;
    p.chainCount = 0; p.magicChainCount = 0;
    p.gamblerBonus = 0; p.shieldCounterReady = false;
    // 炎の仮面：戦闘開始時に敵に20固定ダメージ
    if (p.relics.some(r => r.passive === 'flameMask')) {
      e.hp -= 20;
      addLog('炎の仮面！　敵に20ダメージ！', 'log-special');
    }
    // 賭博師の骰子：50%でボーナス+35、50%で-5
    if (p.relics.some(r => r.passive === 'gamblerDice')) {
      p.gamblerBonus = Math.random() < 0.5 ? 35 : -5;
      addLog(`賭博師の骰子！　攻撃力${p.gamblerBonus > 0 ? '+' : ''}${p.gamblerBonus}！`, 'log-special');
    }
  }

  updateBattleUI();
  logTurnRelics(GS.player);
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
    e.chargedSkill ? `⚠ ${e.chargedSkill.name}溜め中` :
    e.isDefending  ? '🛡 防御中' :
    e.poisoned     ? '☠ 毒' : '';
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
  // 封印された禁書：通常攻撃不可
  if (GS.player.relics.some(r => r.passive === 'forbiddenBook')) {
    addLog('封印された禁書！　通常攻撃は使えない！', 'log-system');
    return;
  }
  disableCmds();

  const p = GS.player;
  const e = GS.enemy;
  p.battleTurn++;

  // 攻撃倍率の計算
  let attackMult = 1;
  // 先制の剣（1ターン目2倍）
  if (p.relics.some(r => r.passive === 'firstStrike') && p.battleTurn === 1) attackMult *= 2.0;
  // revengeBlade / shieldCounter（最大値採用）
  const wasRevenge = p.revengeBladeReady;
  const wasShield  = p.shieldCounterReady;
  let defCounterMult = 1;
  if (p.revengeBladeReady)  { defCounterMult = Math.max(defCounterMult, 1.5); p.revengeBladeReady  = false; }
  if (p.shieldCounterReady) { defCounterMult = Math.max(defCounterMult, 2.0); p.shieldCounterReady = false; }
  attackMult *= defCounterMult;
  // 逆境の炎（被ダメ蓄積を消費）
  if (p.adversityBonus > 0) { attackMult *= (1 + p.adversityBonus); p.adversityBonus = 0; }
  if (p.relics.some(r => r.passive === 'oddCharm')   && p.battleTurn % 2 === 1) attackMult *= 1.3;
  if (p.relics.some(r => r.passive === 'hourglass')  && p.battleTurn >= 3)      attackMult *= 1.2;
  if (p.relics.some(r => r.passive === 'demonEye'))  attackMult *= 0.7;

  const critRate = p.critRate + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0);
  const isCrit   = Math.random() < critRate;
  const critMult = p.relics.some(r => r.passive === 'shadowBlade') ? 2.0 : 1.5;
  const power    = (isCrit ? critMult : 1.0) * attackMult;
  let dmg        = calcPhysDmg(GS.atkTotal, e.defense, power);
  if (e.isDefending) {
    dmg = Math.floor(dmg * 0.5);
    e.isDefending = false;
    addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system');
  }
  // 狩人の眼（敵HP30%以下で+20%）
  if (p.relics.some(r => r.passive === 'hunterEye') && e.hp / e.maxHp <= 0.3)
    dmg = Math.floor(dmg * 1.2);
  // 城壁の証（防御力の30%を加算）
  if (p.relics.some(r => r.passive === 'fortressProof'))
    dmg += Math.floor(GS.defTotal * 0.3);
  // 死神の眼（HP30%以下で+40%）
  if (p.relics.some(r => r.passive === 'deathEye') && p.hp / p.maxHp <= 0.3)
    dmg = Math.floor(dmg * 1.4);
  e.hp -= dmg;

  const critPart    = isCrit ? '会心の一撃！　' : '';
  const revengePart = wasRevenge ? '復讐の刃！　' : '';
  const shieldPart  = wasShield  ? '盾返し！　'   : '';
  addLog(`${revengePart}${shieldPart}${critPart}勇者の攻撃！　${e.name}に ${dmg} ダメージ！`, isCrit ? 'log-special' : 'log-damage');
  flash.enemy = 10;

  // 雷の紋章（会心時+15固定）
  if (isCrit && p.relics.some(r => r.passive === 'thunderCrest') && e.hp > 0) {
    e.hp -= 15;
    addLog('雷の紋章！　追加15ダメージ！', 'log-special');
  }

  // 吸血の牙（1打目）
  if (p.relics.some(r => r.passive === 'lifeSteal')) {
    const heal = Math.max(1, Math.floor(dmg * 0.15));
    p.hp = Math.min(p.maxHp, p.hp + heal);
    addLog(`吸血の牙！　${heal}HP吸収！`, 'log-heal');
  }

  // チェーン系リセット（通常攻撃でスタック破棄）
  if (p.relics.some(r => r.passive === 'chainStone'))    p.chainCount = 0;
  if (p.relics.some(r => r.passive === 'magicAmplifier')) p.magicChainCount = 0;
  if (p.relics.some(r => r.passive === 'patienceTablet')) p.patienceDefBonus = 0;

  updateBattleUI();

  // 多段攻撃チェック
  const hasCursedHelm = p.relics.some(r => r.passive === 'cursedHelm');
  let extraHits = 0;
  if (hasCursedHelm) extraHits = 1;
  else if (p.relics.some(r => r.passive === 'doubleHit') && Math.random() < 0.3) extraHits = 1;
  if (p.relics.some(r => r.passive === 'tripleHit') && Math.random() < 0.15)
    extraHits = Math.max(extraHits, 2);

  if (extraHits > 0 && e.hp > 0 && !battleOver) {
    function doExtraHit(n) {
      if (battleOver) return;
      const cr2 = p.critRate + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0);
      const ic2 = Math.random() < cr2;
      const cm2 = p.relics.some(r => r.passive === 'shadowBlade') ? 2.0 : 1.5;
      let pow2 = ic2 ? cm2 : 1.0;
      if (p.relics.some(r => r.passive === 'oddCharm')  && p.battleTurn % 2 === 1) pow2 *= 1.3;
      if (p.relics.some(r => r.passive === 'hourglass') && p.battleTurn >= 3)      pow2 *= 1.2;
      if (p.relics.some(r => r.passive === 'demonEye')) pow2 *= 0.7;
      let dmg2 = calcPhysDmg(GS.atkTotal, e.defense, pow2);
      if (p.relics.some(r => r.passive === 'hunterEye') && e.hp / e.maxHp <= 0.3) dmg2 = Math.floor(dmg2 * 1.2);
      if (p.relics.some(r => r.passive === 'fortressProof')) dmg2 += Math.floor(GS.defTotal * 0.3);
      if (p.relics.some(r => r.passive === 'deathEye') && p.hp / p.maxHp <= 0.3) dmg2 = Math.floor(dmg2 * 1.4);
      e.hp -= dmg2;
      const prefix = n === 1 ? (hasCursedHelm ? '呪われた兜の連撃！　' : '連撃！　') : `${n + 1}撃目！　`;
      addLog(`${prefix}${ic2 ? '会心！　' : ''}${e.name}に ${dmg2} ダメージ！`, ic2 ? 'log-special' : 'log-damage');
      flash.enemy = 10;
      if (ic2 && p.relics.some(r => r.passive === 'thunderCrest') && e.hp > 0) {
        e.hp -= 15; addLog('雷の紋章！　追加15ダメージ！', 'log-special');
      }
      if (p.relics.some(r => r.passive === 'lifeSteal')) {
        const h2 = Math.max(1, Math.floor(dmg2 * 0.15));
        p.hp = Math.min(p.maxHp, p.hp + h2);
        addLog(`吸血の牙！　${h2}HP吸収！`, 'log-heal');
      }
      updateBattleUI();
      if (n < extraHits && e.hp > 0) {
        setTimeout(() => doExtraHit(n + 1), 350);
      } else {
        afterPlayerAction();
      }
    }
    setTimeout(() => doExtraHit(1), 350);
    return;
  }

  afterPlayerAction();
}

function doDefend() {
  if (!playerTurn || battleOver) return;

  // 狂戦士の証
  if (GS.player.relics.some(r => r.passive === 'berserker')) {
    addLog('狂戦士の証の力で防御できない！', 'log-system');
    enableCmds();
    return;
  }
  disableCmds();

  GS.player.battleTurn++;
  GS.player.isDefending = true;
  GS.player.buffDef     = true;
  if (GS.player.relics.some(r => r.passive === 'revengeBlade')) {
    GS.player.revengeBladeReady = true;
  }
  // 盾返しの腕輪
  if (GS.player.relics.some(r => r.passive === 'shieldCounter')) GS.player.shieldCounterReady = true;
  // 忍耐の石板（連続防御で防御力スタック）
  if (GS.player.relics.some(r => r.passive === 'patienceTablet')) {
    GS.player.patienceDefBonus = Math.min(30, GS.player.patienceDefBonus + 10);
    addLog(`忍耐の石板！　防御力+10（累計+${GS.player.patienceDefBonus}）`, 'log-special');
  }
  // 反骨の魂（防御するたびに攻撃力スタック）
  if (GS.player.relics.some(r => r.passive === 'rebellionSoul')) {
    GS.player.rebellionAtkBonus = Math.min(32, GS.player.rebellionAtkBonus + 8);
    addLog(`反骨の魂！　攻撃力+8（累計+${GS.player.rebellionAtkBonus}）`, 'log-special');
  }
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

  if (GS.player.skillDisabled || GS.player.relics.some(r => r.passive === 'cursedHelm')) {
    menu.appendChild(makeMenuBtn('スキルが使用できない！（呪い中）', true, null));
    return;
  }

  const p2 = GS.player;
  const mpSaverBonus  = p2.relics.some(r => r.passive === 'mpSaver')   ? 2 : 0;
  const magicCoreCost = p2.relics.some(r => r.passive === 'magicCore') ? 3 : 0;
  const hasForbidden  = p2.relics.some(r => r.passive === 'forbiddenBook');
  const hasLifeBet    = p2.relics.some(r => r.passive === 'lifeBet') && p2.hp / p2.maxHp <= 0.15;
  p2.skills.forEach(id => {
    const sk = SKILLS[id];
    if (!sk) return;
    const isPhysical = sk.type.startsWith('physical') || sk.type === 'counter';
    let actualCost = p2.mpFree ? 0 : Math.max(1, Math.ceil(sk.mpCost * (p2.mpCostMult || 1)) - mpSaverBonus + magicCoreCost);
    if (hasForbidden && !isPhysical) actualCost = 0;
    if (hasLifeBet) actualCost = 0;
    const disabled = hasForbidden && isPhysical;
    const noMp  = p2.mp < actualCost;
    const label = `${sk.name}  [${actualCost}MP]  ${sk.desc}${disabled ? '  ※封印中' : ''}`;
    menu.appendChild(makeMenuBtn(label, noMp || disabled, () => {
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

  // 封印された禁書：物理スキル・カウンター使用不可
  if (p.relics.some(r => r.passive === 'forbiddenBook') && (sk.type.startsWith('physical') || sk.type === 'counter')) {
    addLog('封印された禁書！　物理スキルは使えない！', 'log-system');
    enableCmds(); return;
  }

  p.battleTurn++;
  p.usedSkillThisBattle = true;

  const mpSaverBonus  = p.relics.some(r => r.passive === 'mpSaver') ? 2 : 0;
  const magicCoreCost = p.relics.some(r => r.passive === 'magicCore') ? 3 : 0;
  let mpCost = p.mpFree ? 0 : Math.max(1, Math.ceil(sk.mpCost * (p.mpCostMult || 1)) - mpSaverBonus + magicCoreCost);
  if (p.relics.some(r => r.passive === 'forbiddenBook')) mpCost = 0; // 魔法スキルコスト0
  if (p.relics.some(r => r.passive === 'lifeBet') && p.hp / p.maxHp <= 0.15) mpCost = 0;
  if (p.mp < mpCost) { addLog('MPが足りない！', 'log-system'); enableCmds(); return; }
  p.mp -= mpCost;

  if (sk.type === 'physical') {
    const critRate = p.critRate
      + (p.relics.some(r => r.passive === 'luckyFoot')     ? 0.15 : 0)
      + (p.relics.some(r => r.passive === 'swordsmanOath') ? 0.20 : 0)
      + (p.relics.some(r => r.passive === 'madnessCrest') && p.hp / p.maxHp <= 0.25 ? 0.30 : 0);
    const isCrit   = Math.random() < critRate;
    const critMult = p.relics.some(r => r.passive === 'shadowBlade') ? 2.0 : 1.5;
    let physMult   = (isCrit ? sk.power * critMult : sk.power) * (p.skillPowerMult || 1);
    if (p.relics.some(r => r.passive === 'oddCharm')  && p.battleTurn % 2 === 1) physMult *= 1.3;
    if (p.relics.some(r => r.passive === 'hourglass') && p.battleTurn >= 3)      physMult *= 1.2;
    if (p.relics.some(r => r.passive === 'demonEye')) physMult *= 0.7;
    // 連鎖の石：連続スキルでダメージ+15%/スタック
    if (p.relics.some(r => r.passive === 'chainStone')) physMult *= (1 + Math.min(3, p.chainCount) * 0.15);
    // 大地の剣：防御力0.7倍で計算
    const defVal = p.relics.some(r => r.passive === 'earthSword') ? Math.floor(e.defense * 0.7) : e.defense;
    let dmg = calcPhysDmg(GS.atkTotal, defVal, physMult);
    if (p.relics.some(r => r.passive === 'fortressProof')) dmg += Math.floor(GS.defTotal * 0.3);
    if (p.relics.some(r => r.passive === 'deathEye') && p.hp / p.maxHp <= 0.3) dmg = Math.floor(dmg * 1.4);
    if (e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
    e.hp -= dmg;
    const msg = isCrit
      ? `会心の${sk.name}！　${e.name}に ${dmg} ダメージ！`
      : `${sk.name}！　${e.name}に ${dmg} ダメージ！`;
    addLog(msg, isCrit ? 'log-special' : 'log-damage');
    flash.enemy = 10;
    // チェーンスタック更新
    if (p.relics.some(r => r.passive === 'chainStone'))    p.chainCount = Math.min(3, p.chainCount + 1);
    if (p.relics.some(r => r.passive === 'magicAmplifier')) p.magicChainCount = 0;
  } else if (sk.type === 'magic') {
    let magicMult = p.skillPowerMult || 1;
    if (p.relics.some(r => r.passive === 'magicCatalyst')) magicMult *= 1.2;
    if (p.relics.some(r => r.passive === 'demonEye'))      magicMult *= 1.5;
    if (p.relics.some(r => r.passive === 'hourglass') && p.battleTurn >= 3) magicMult *= 1.2;
    // 魔力増幅器：連続magic使用でダメージ+20%/スタック
    if (p.relics.some(r => r.passive === 'magicAmplifier')) magicMult *= (1 + Math.min(3, p.magicChainCount) * 0.2);
    // 黒魔法の指輪：+15%
    if (p.relics.some(r => r.passive === 'blackMagicRing')) magicMult *= 1.15;
    let dmg = calcMagicDmg(GS.magicAtkTotal, sk.power * magicMult);
    if (p.relics.some(r => r.passive === 'deathEye') && p.hp / p.maxHp <= 0.3) dmg = Math.floor(dmg * 1.4);
    if (e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
    e.hp -= dmg;
    addLog(`${sk.name}！　魔法で ${e.name}に ${dmg} ダメージ！`, 'log-special');
    flash.enemy = 10;
    // チェーンスタック更新
    if (p.relics.some(r => r.passive === 'magicAmplifier')) p.magicChainCount = Math.min(3, p.magicChainCount + 1);
    if (p.relics.some(r => r.passive === 'chainStone'))    p.chainCount = 0;
  } else if (sk.type === 'heal') {
    const healed = Math.min(Math.floor(sk.healAmount * (p.skillPowerMult || 1)), p.maxHp - p.hp);
    p.hp += healed;
    addLog(`${sk.name}！　HPが ${healed} 回復した。`, 'log-heal');
  } else if (sk.type === 'buff_def') {
    p.buffDef = true;
    addLog(`${sk.name}！　防御力が大幅に上昇した！`, 'log-system');

  } else if (sk.type === 'physical_multi') {
    function doHit(hitIndex) {
      if (battleOver) return;
      const critRate = p.critRate + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0);
      const isCrit   = Math.random() < critRate;
      let power = (isCrit ? sk.power * 1.5 : sk.power) * (p.skillPowerMult || 1);
      if (p.relics.some(r => r.passive === 'demonEye')) power *= 0.7;
      let dmg = calcPhysDmg(GS.atkTotal, e.defense, power);
      if (hitIndex === 0 && e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
      e.hp -= dmg;
      addLog(`${sk.name} ${hitIndex + 1}撃目！　${isCrit ? '会心！　' : ''}${e.name}に ${dmg} ダメージ！`, isCrit ? 'log-special' : 'log-damage');
      flash.enemy = 10;
      updateBattleUI();
      if (hitIndex + 1 < sk.hits && e.hp > 0) {
        setTimeout(() => doHit(hitIndex + 1), 350);
      } else {
        afterPlayerAction();
      }
    }
    doHit(0);
    return;

  } else if (sk.type === 'physical_no_def') {
    const critRate = p.critRate + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0);
    const isCrit   = Math.random() < critRate;
    let power = (isCrit ? sk.power * 1.5 : sk.power) * (p.skillPowerMult || 1);
    const dmg = calcPhysDmg(GS.atkTotal, 0, power);
    e.hp -= dmg;
    addLog(`${sk.name}！　防御を無視して ${e.name}に ${dmg} ダメージ！`, isCrit ? 'log-special' : 'log-damage');
    flash.enemy = 10;

  } else if (sk.type === 'physical_sacrifice') {
    const critRate = p.critRate + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0);
    const isCrit   = Math.random() < critRate;
    let power = (isCrit ? sk.power * 1.5 : sk.power) * (p.skillPowerMult || 1);
    if (p.relics.some(r => r.passive === 'demonEye')) power *= 0.7;
    let dmg = calcPhysDmg(GS.atkTotal, e.defense, power);
    if (e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
    e.hp -= dmg;
    p.hp = Math.max(1, p.hp - sk.selfDmg);
    addLog(`${sk.name}！　${e.name}に ${dmg} ダメージ！　自分も ${sk.selfDmg} ダメージ。`, isCrit ? 'log-special' : 'log-damage');
    flash.enemy = 10;

  } else if (sk.type === 'physical_high_crit') {
    const critRate = Math.min(1, p.critRate + (sk.critBonus || 0) + (p.relics.some(r => r.passive === 'luckyFoot') ? 0.15 : 0));
    const isCrit   = Math.random() < critRate;
    let power = (isCrit ? sk.power * 1.5 : sk.power) * (p.skillPowerMult || 1);
    if (p.relics.some(r => r.passive === 'demonEye')) power *= 0.7;
    let dmg = calcPhysDmg(GS.atkTotal, e.defense, power);
    if (e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
    e.hp -= dmg;
    addLog(isCrit ? `会心の${sk.name}！　${e.name}に ${dmg} ダメージ！` : `${sk.name}！　${e.name}に ${dmg} ダメージ！`, isCrit ? 'log-special' : 'log-damage');
    flash.enemy = 10;

  } else if (sk.type === 'counter') {
    p.counterActive = true;
    p.counterPower  = sk.power * (p.skillPowerMult || 1);
    addLog(`${sk.name}！　次の攻撃を見切る構えをとった！`, 'log-system');

  } else if (sk.type === 'fixed') {
    const dmg = Math.floor(sk.value * (p.skillPowerMult || 1));
    e.hp -= dmg;
    addLog(`${sk.name}！　${e.name}に ${dmg} 固定ダメージ！`, 'log-damage');
    flash.enemy = 10;

  } else if (sk.type === 'last_resort') {
    const remainMp   = p.mp;
    const totalMp    = mpCost + remainMp;
    p.mp = 0;
    const dmg = Math.floor(totalMp * sk.mpMultiplier * (p.skillPowerMult || 1));
    e.hp -= dmg;
    addLog(`${sk.name}！　MP${totalMp}を全消費！　${e.name}に ${dmg} ダメージ！`, 'log-special');
    flash.enemy = 10;

  } else if (sk.type === 'soul_burst') {
    const hpRatio = p.hp / p.maxHp;
    const power   = (sk.basePower + (sk.maxPower - sk.basePower) * (1 - hpRatio)) * (p.skillPowerMult || 1);
    let dmg       = calcMagicDmg(GS.magicAtkTotal, power);
    if (e.isDefending) { dmg = Math.floor(dmg * 0.5); e.isDefending = false; addLog(`${e.name}は防御した！　ダメージ半減！`, 'log-system'); }
    e.hp -= dmg;
    addLog(`${sk.name}！　魔法で ${e.name}に ${dmg} ダメージ！`, 'log-special');
    flash.enemy = 10;
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

  GS.player.battleTurn++;
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
function logTurnRelics(p) {
  const t = p.battleTurn + 1; // これから始まるターン番号
  if (p.relics.some(r => r.passive === 'oddCharm') && t % 2 === 1)
    addLog('奇数のお守り！　奇数ターンにつき攻撃力1.3倍！', 'log-special');
  if (p.relics.some(r => r.passive === 'evenCrest') && t % 2 === 0)
    addLog('偶数の紋章！　偶数ターンにつき防御力+15！', 'log-special');
  if (p.relics.some(r => r.passive === 'hourglass') && t === 3)
    addLog('砂時計発動！　3ターン目以降、全攻撃1.2倍！', 'log-special');
  if (p.relics.some(r => r.passive === 'enduranceFlag') && t === 5)
    addLog('持久の旗発動！　攻撃力+30！', 'log-special');
}

function afterPlayerAction() {
  if (checkWin()) return;
  setTimeout(() => doEnemyTurn(), 700);
}

function checkWin() {
  if (GS.enemy.hp > 0) return false;
  battleOver = true;

  const merchantMult = GS.player.relics.some(r => r.passive === 'merchantRing') ? 1.2 : 1;
  const thiefMult    = (GS.player.relics.some(r => r.passive === 'thiefRing') && GS.player.battleTurn <= 5) ? 1.5 : 1;
  const gold = Math.floor(GS.enemy.goldReward * (GS.player.goldDouble ? 2 : 1) * merchantMult * thiefMult);
  GS.player.gold += gold;
  GS.totalGold   += gold;
  GS.battleCount++;
  GS.totalBattles++;

  addLog(`${GS.enemy.name}を倒した！　${gold}G を得た！`, 'log-special');
  // 錬金術師の指輪：追加+25G
  if (GS.player.relics.some(r => r.passive === 'alchemistRing')) {
    GS.player.gold += 25;
    GS.totalGold   += 25;
    addLog('錬金術師の指輪！　+25G！', 'log-special');
  }

  // バフカウントダウン（戦闘終了時）
  const _p = GS.player;
  if (_p.atkBuffRemain  > 0) { _p.atkBuffRemain--;  if (_p.atkBuffRemain  === 0) _p.atkBuffMult = 1; }
  if (_p.defBuffRemain  > 0) { _p.defBuffRemain--;  if (_p.defBuffRemain  === 0) _p.defBuffMult = 1; }
  if (_p.mpFreeRemain   > 0) { _p.mpFreeRemain--;   if (_p.mpFreeRemain   === 0) _p.mpFree = false; }
  if (_p.critBuffRemain > 0) { _p.critBuffRemain--;  if (_p.critBuffRemain === 0) _p.critRate = 0.1; }

  // 沈黙の仮面（スキル未使用で勝利→次の戦闘で攻撃力+20）
  if (_p.relics.some(r => r.passive === 'silenceMask')) {
    if (!_p.usedSkillThisBattle) {
      _p.silenceMaskBonus = 20;
      addLog('沈黙の仮面の力が宿った！　次の戦闘で攻撃力+20！', 'log-special');
    } else {
      _p.silenceMaskBonus = 0;
    }
  }

  // 6層挑戦戦闘の勝利ボーナス
  if (GS._challengeVictory) {
    GS._challengeVictory = false;
    _p.attack  = Math.floor(_p.attack  * 1.3);
    _p.defense = Math.floor(_p.defense * 1.3);
    addLog('強敵を撃破！　自身のステータスが上昇した！', 'log-special');
  }

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

function applyDmgToPlayer(dmg, logMsg) {
  const p = GS.player;
  dmg = Math.ceil(dmg * p.damageTakenMult);
  if (p.goldShield && dmg > 0) {
    const absorbed = Math.min(p.gold, dmg);
    p.gold -= absorbed;
    dmg -= absorbed;
    if (absorbed > 0) addLog(`ゴールドがダメージを肩代わり！ (-${absorbed}G)`, 'log-special');
  }
  // 鉄壁の守護：固定5軽減
  if (p.relics.some(r => r.passive === 'ironWall')) dmg = Math.max(1, dmg - 5);
  // 不動の岩：HP50%以上で20%軽減
  if (p.relics.some(r => r.passive === 'steadyRock') && p.hp / p.maxHp >= 0.5)
    dmg = Math.floor(dmg * 0.8);
  // 死への挑戦：常時30%軽減
  if (p.relics.some(r => r.passive === 'deathChallenge')) dmg = Math.floor(dmg * 0.7);
  // 命の砂時計：HP25%以下でさらに30%軽減
  if (p.relics.some(r => r.passive === 'lifeHourglass') && p.hp / p.maxHp <= 0.25)
    dmg = Math.floor(dmg * 0.7);
  p.hp -= dmg;
  addLog(logMsg.replace('{dmg}', dmg), 'log-damage');
  flash.player = 10;
  // 茨の鎧：防御中に30%反射
  if (p.isDefending && p.relics.some(r => r.passive === 'thornArmor') && GS.enemy) {
    const ref = Math.max(1, Math.floor(dmg * 0.3));
    GS.enemy.hp -= ref;
    addLog(`茨の鎧！　${ref} ダメージを反射！`, 'log-special');
    flash.enemy = 10;
  }
  // 怒りの石：被ダメ時に攻撃力スタック
  if (p.relics.some(r => r.passive === 'wrathStone'))
    p.wrathBonus = Math.min(25, p.wrathBonus + 5);
  // 逆境の炎：被ダメ時に攻撃倍率蓄積
  if (p.relics.some(r => r.passive === 'adversityFlame'))
    p.adversityBonus += 0.12;
}

// ---- 敵行動ヘルパー ----
function selectEnemyAction(e) {
  if (!e.actions || e.actions.length === 0) return { type: 'attack' };
  const r = Math.random();
  let cum = 0;
  for (const a of e.actions) {
    cum += a.prob;
    if (r < cum) return a;
  }
  return e.actions[e.actions.length - 1];
}

function executeEnemySkill(skill) {
  const e = GS.enemy;
  const p = GS.player;
  let dmg;
  if (skill.dmgType === 'fixed') {
    dmg = skill.power;
  } else {
    // physical: e.attack * power - defTotal * 0.4 (with randomness)
    const base = e.attack * skill.power - GS.defTotal * 0.4;
    dmg = Math.max(1, Math.floor(Math.max(1, base) * (0.9 + Math.random() * 0.2)));
    if (p.isDefending) {
      const skillDefMult = p.relics.some(r => r.passive === 'guardShield') ? 0.25 : 0.35;
      dmg = Math.floor(dmg * skillDefMult);
    }
  }
  applyDmgToPlayer(dmg, `${e.name}の${skill.name}！　勇者に {dmg} ダメージ！`);
  if (checkWin()) return;
  if (skill.lifesteal) {
    const healed = Math.floor(dmg * 0.3);
    e.hp = Math.min(e.maxHp, e.hp + healed);
    addLog(`${e.name}はHPを ${healed} 吸収した！`, 'log-system');
  }
}

function doEnemyTurn() {
  if (battleOver) return;
  playerTurn = false;

  const e = GS.enemy;
  const p = GS.player;

  // 毎ターン追加ダメージ（5層血の鎧効果）
  if (p.turnDmg > 0) {
    applyDmgToPlayer(p.turnDmg, `呪いの炎！　勇者に {dmg} ダメージ！`);
    updateBattleUI();
    if (checkLose()) return;
  }

  if (e.poisoned) {
    e.hp -= e.poisonDmg;
    addLog(`${e.name}は毒のダメージを受けた！ (-${e.poisonDmg})`, 'log-damage');
    if (checkWin()) return;
  }

  // チャージ済みスキル発動
  if (e.chargedSkill) {
    const sk = e.chargedSkill;
    e.chargedSkill = null;
    addLog(`${e.name}の${sk.name}！`, 'log-special');
    executeEnemySkill(sk);
    if (battleOver) return;
    p.isDefending = false;
    p.buffDef     = false;
    updateBattleUI();
    setTimeout(() => {
      playerTurn = true;
      if (!checkLose() && !battleOver) {
        logTurnRelics(p);
        enableCmds();
      }
    }, 500);
    return;
  }

  // 行動選択（actions がある敵 = 4層以降）
  const selectedAction = selectEnemyAction(e);

  if (selectedAction.type === 'skill') {
    // チャージ開始（次のターンに発動）
    e.chargedSkill = selectedAction;
    addLog(`${e.name}：${selectedAction.warning}`, 'log-system');
    p.isDefending = false;
    p.buffDef     = false;
    updateBattleUI();
    setTimeout(() => {
      playerTurn = true;
      if (!battleOver) {
        logTurnRelics(p);
        enableCmds();
      }
    }, 500);
    return;
  }

  if (selectedAction.type === 'defend') {
    e.isDefending = true;
    addLog(`${e.name}は防御態勢をとった！`, 'log-system');
    p.isDefending = false;
    p.buffDef     = false;
    updateBattleUI();
    setTimeout(() => {
      playerTurn = true;
      if (!battleOver) {
        logTurnRelics(p);
        enableCmds();
      }
    }, 500);
    return;
  }

  // 通常攻撃（ボス特殊技も含む既存ロジック）
  let bossAction = 'attack';
  if (e.isBoss && e.bossSkills.length > 0 && Math.random() < 0.38) {
    bossAction = e.bossSkills[Math.floor(Math.random() * e.bossSkills.length)];
  }

  if (bossAction === 'dragonBreath') {
    let dmg = Math.max(1, Math.floor(e.attack * 1.6 - p.defense * 0.2));
    const bossDefMult = p.isDefending ? (p.relics.some(r => r.passive === 'guardShield') ? 0.25 : 0.35) : 1;
    dmg = Math.floor(dmg * bossDefMult);
    applyDmgToPlayer(dmg, `${e.name}のドラゴンブレス！　勇者に {dmg} ダメージ！`);
    if (checkWin()) return;
  } else if (bossAction === 'tailSwipe') {
    let dmg = Math.max(1, Math.floor(e.attack * 1.3 - p.defense * 0.4));
    const bossDefMult = p.isDefending ? (p.relics.some(r => r.passive === 'guardShield') ? 0.25 : 0.35) : 1;
    dmg = Math.floor(dmg * bossDefMult);
    applyDmgToPlayer(dmg, `${e.name}の尻尾攻撃！　勇者に {dmg} ダメージ！`);
    if (checkWin()) return;
  } else if (bossAction === 'dragonRoar') {
    addLog(`${e.name}の咆哮！　勇者は怯んだ！`, 'log-special');
    p.roarDebuff = true;
  } else {
    // 見切り発動チェック（通常攻撃のみ有効）
    if (p.counterActive) {
      p.counterActive = false;
      const counterDmg = calcPhysDmg(GS.atkTotal, e.defense, p.counterPower);
      e.hp -= counterDmg;
      addLog(`見切り！　${e.name}の攻撃を躱し ${counterDmg} の反撃ダメージ！`, 'log-special');
      flash.enemy = 10;
      updateBattleUI();
      if (checkWin()) return;
    } else {
      let dmg = Math.max(1, Math.floor(e.attack - GS.defTotal * 0.55));
      if (p.isDefending) {
        const normDefMult = p.relics.some(r => r.passive === 'guardShield') ? 0.15 : 0.25;
        dmg = Math.floor(dmg * normDefMult);
      }
      applyDmgToPlayer(
        dmg,
        p.isDefending
          ? `${e.name}の攻撃！　防御した！　勇者に {dmg} ダメージ。`
          : `${e.name}の攻撃！　勇者に {dmg} ダメージ！`
      );
      if (checkWin()) return;
    }
  }

  p.isDefending = false;
  p.buffDef     = false;
  updateBattleUI();

  setTimeout(() => {
    playerTurn = true;
    if (!checkLose() && !battleOver) {
      logTurnRelics(p);
      enableCmds();
    }
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

  const sr = { dragon: 46, troll: 28, orc: 24, wolf: 26, golem: 32, demon: 32, chimera: 38, wyvern: 36 }[sprite] || 20;
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
    case 'dragon':      drawDragon(ctx, cx, by, c, e.color, frame); break;
    case 'golem':       drawGolem(ctx, cx, by, c, e.color); break;
    case 'vampire':     drawVampire(ctx, cx, by, c, e.color); break;
    case 'lizardman':   drawLizardman(ctx, cx, by, c, e.color); break;
    case 'demon':       drawDemon(ctx, cx, by, c, e.color, frame); break;
    case 'medusa':      drawMedusa(ctx, cx, by, c, e.color, frame); break;
    case 'wyvern':      drawWyvern(ctx, cx, by, c, e.color, frame); break;
    case 'deathKnight': drawDeathKnight2(ctx, cx, by, c, e.color); break;
    case 'archMage':    drawArchMage(ctx, cx, by, c, e.color, frame); break;
    case 'chimera':     drawChimera(ctx, cx, by, c, e.color, frame); break;
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

// ============================================================
//  FLOOR 4 SPRITES
// ============================================================
function drawGolem(ctx, cx, cy, c, col) {
  // legs
  px(ctx, cx-20, cy+2,  18, 22, c(col));
  px(ctx, cx+2,  cy+2,  18, 22, c(col));
  // torso
  px(ctx, cx-28, cy-50, 56, 52, c(col));
  // arms
  px(ctx, cx-44, cy-48, 16, 44, c(col));
  px(ctx, cx+28, cy-48, 16, 44, c(col));
  // head
  px(ctx, cx-22, cy-76, 44, 30, c(col));
  // crack lines
  px(ctx, cx-4,  cy-44,  4, 28, c('#667788'));
  px(ctx, cx-14, cy-28, 12,  3, c('#667788'));
  px(ctx, cx+6,  cy-58,  8,  3, c('#667788'));
  // glowing eyes
  px(ctx, cx-14, cy-64,  8,  8, c('#ffaa00'));
  px(ctx, cx+6,  cy-64,  8,  8, c('#ffaa00'));
  px(ctx, cx-12, cy-62,  5,  5, c('#ffdd44'));
  px(ctx, cx+8,  cy-62,  5,  5, c('#ffdd44'));
  // stone texture dots
  for (let i=0; i<3; i++) px(ctx, cx-20+i*16, cy-40, 6, 6, c('#777788'));
}

function drawVampire(ctx, cx, cy, c, col) {
  // cape outer
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-8, cy-52); ctx.lineTo(cx-32, cy+24);
  ctx.lineTo(cx-16, cy+24); ctx.lineTo(cx-6, cy-20); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+8, cy-52); ctx.lineTo(cx+32, cy+24);
  ctx.lineTo(cx+16, cy+24); ctx.lineTo(cx+6, cy-20); ctx.fill();
  // cape inner (red lining)
  ctx.fillStyle = c('#880011');
  ctx.beginPath();
  ctx.moveTo(cx-6, cy-20); ctx.lineTo(cx-20, cy+24);
  ctx.lineTo(cx+20, cy+24); ctx.lineTo(cx+6, cy-20); ctx.fill();
  // body
  px(ctx, cx-10, cy-20, 20, 44, c('#220022'));
  // head - pale face
  px(ctx, cx-10, cy-52, 20, 24, c('#ffddcc'));
  // slicked hair
  px(ctx, cx-12, cy-60, 24, 14, c('#111111'));
  px(ctx, cx-14, cy-52,  6, 10, c('#111111'));
  px(ctx, cx+8,  cy-52,  6, 10, c('#111111'));
  // glowing red eyes
  px(ctx, cx-7, cy-46, 5, 4, c('#ff0000'));
  px(ctx, cx+2, cy-46, 5, 4, c('#ff0000'));
  // fangs
  px(ctx, cx-4, cy-34, 3, 5, c('#ffffff'));
  px(ctx, cx+1, cy-34, 3, 5, c('#ffffff'));
  // hands
  px(ctx, cx-22, cy-16, 8, 18, c('#ffddcc'));
  px(ctx, cx+14, cy-16, 8, 18, c('#ffddcc'));
}

function drawLizardman(ctx, cx, cy, c, col) {
  // tail
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-8, cy+2); ctx.lineTo(cx-44, cy+16);
  ctx.lineTo(cx-30, cy+24); ctx.lineTo(cx-4, cy+10); ctx.fill();
  // legs
  px(ctx, cx-14, cy+2,  12, 22, c(col));
  px(ctx, cx+2,  cy+2,  12, 22, c(col));
  px(ctx, cx-18, cy+20, 16,  8, c('#224422'));
  px(ctx, cx+2,  cy+20, 16,  8, c('#224422'));
  // torso + scale pattern
  px(ctx, cx-14, cy-32, 28, 34, c(col));
  for (let i=0; i<3; i++) px(ctx, cx-10+i*8, cy-26, 6, 6, c('#2a5525'));
  for (let i=0; i<2; i++) px(ctx, cx-6+i*8,  cy-16, 6, 6, c('#2a5525'));
  // arms
  px(ctx, cx-24, cy-30, 10, 22, c(col));
  px(ctx, cx+14, cy-30, 10, 22, c(col));
  // head
  px(ctx, cx-12, cy-54, 24, 24, c(col));
  px(ctx, cx-18, cy-46, 10, 12, c(col));
  px(ctx, cx+8,  cy-46, 10, 12, c(col));
  px(ctx, cx-16, cy-38, 32,  8, c('#224422'));
  // eyes
  px(ctx, cx-9,  cy-50, 6, 6, c('#ffdd00'));
  px(ctx, cx+3,  cy-50, 6, 6, c('#ffdd00'));
  px(ctx, cx-7,  cy-48, 4, 4, c('#000000'));
  px(ctx, cx+5,  cy-48, 4, 4, c('#000000'));
  // head spines
  for (let i=0; i<4; i++) px(ctx, cx-8+i*6, cy-62, 4, 10, c('#228833'));
  // spear
  px(ctx, cx+20, cy-60, 4, 70, c('#886644'));
  px(ctx, cx+18, cy-68, 10, 12, c('#aabbcc'));
}

// ============================================================
//  FLOOR 5 SPRITES
// ============================================================
function drawDemon(ctx, cx, cy, c, col, frame) {
  const wb = Math.sin(frame * 0.08) * 5;
  // wings
  ctx.fillStyle = c('#550011');
  ctx.beginPath();
  ctx.moveTo(cx-10, cy-40); ctx.lineTo(cx-70, cy-70+wb);
  ctx.lineTo(cx-50, cy-10); ctx.lineTo(cx-18, cy-10); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+10, cy-40); ctx.lineTo(cx+70, cy-70+wb);
  ctx.lineTo(cx+50, cy-10); ctx.lineTo(cx+18, cy-10); ctx.fill();
  // legs
  px(ctx, cx-18, cy+2,  14, 24, c(col));
  px(ctx, cx+4,  cy+2,  14, 24, c(col));
  px(ctx, cx-20, cy+22, 16, 10, c('#331100'));
  px(ctx, cx+4,  cy+22, 16, 10, c('#331100'));
  // torso - muscular
  px(ctx, cx-20, cy-44, 40, 46, c(col));
  px(ctx, cx-4,  cy-38,  4, 20, c('#aa1133'));
  px(ctx, cx+2,  cy-38,  4, 20, c('#aa1133'));
  // arms
  px(ctx, cx-34, cy-42, 14, 36, c(col));
  px(ctx, cx+20, cy-42, 14, 36, c(col));
  // claws
  for (let i=0; i<3; i++) px(ctx, cx-36+i*5, cy-8, 4, 8, c('#331100'));
  for (let i=0; i<3; i++) px(ctx, cx+20+i*5, cy-8, 4, 8, c('#331100'));
  // head
  px(ctx, cx-16, cy-72, 32, 30, c(col));
  // horns
  ctx.fillStyle = c('#331100');
  ctx.beginPath(); ctx.moveTo(cx-12, cy-70); ctx.lineTo(cx-22, cy-100); ctx.lineTo(cx-4, cy-70); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+4,  cy-70); ctx.lineTo(cx+22, cy-100); ctx.lineTo(cx+12, cy-70); ctx.fill();
  // glowing eyes
  px(ctx, cx-11, cy-62, 8, 7, c('#ff4400'));
  px(ctx, cx+3,  cy-62, 8, 7, c('#ff4400'));
  px(ctx, cx-9,  cy-60, 5, 4, c('#ffaa00'));
  px(ctx, cx+5,  cy-60, 5, 4, c('#ffaa00'));
  // teeth
  px(ctx, cx-8, cy-48, 16, 6, c('#330000'));
  for (let i=0; i<4; i++) px(ctx, cx-7+i*4, cy-46, 3, 5, c('#ffffff'));
}

function drawMedusa(ctx, cx, cy, c, col, frame) {
  const sway = Math.sin(frame * 0.07) * 2;
  // snake lower body
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-12, cy+2);
  ctx.quadraticCurveTo(cx-30, cy+20, cx-10+sway, cy+40);
  ctx.quadraticCurveTo(cx+20, cy+50, cx+30, cy+30);
  ctx.quadraticCurveTo(cx+20, cy+10, cx+12, cy+2);
  ctx.fill();
  // scale pattern on tail
  for (let i=0; i<4; i++) px(ctx, cx-6, cy+6+i*8, 12, 5, c('#224433'));
  // torso
  px(ctx, cx-14, cy-30, 28, 32, c('#cc9977'));
  px(ctx, cx-16, cy-18, 32, 14, c('#225544'));
  // arms
  px(ctx, cx-26, cy-28, 12, 24, c('#cc9977'));
  px(ctx, cx+14, cy-28, 12, 24, c('#cc9977'));
  // head
  px(ctx, cx-12, cy-52, 24, 26, c('#cc9977'));
  // snake hair
  for (let i=0; i<5; i++) {
    const sx  = cx - 16 + i * 8;
    const sw  = Math.sin(frame * 0.1 + i) * 3;
    px(ctx, sx+sw, cy-72, 5, 22, c('#228844'));
    px(ctx, sx+sw-2, cy-76, 4, 6, c('#33aa55'));
    px(ctx, sx+sw,   cy-74, 2, 3, c('#ff3300'));
  }
  // petrifying gold eyes
  px(ctx, cx-8, cy-46, 6, 5, c('#ffcc00'));
  px(ctx, cx+2, cy-46, 6, 5, c('#ffcc00'));
  px(ctx, cx-6, cy-44, 3, 3, c('#886600'));
  px(ctx, cx+4, cy-44, 3, 3, c('#886600'));
  // mouth
  px(ctx, cx-6, cy-36, 12, 3, c('#994455'));
}

function drawWyvern(ctx, cx, cy, c, col, frame) {
  const wb = Math.sin(frame * 0.09) * 7;
  // wings outer
  ctx.fillStyle = c('#334422');
  ctx.beginPath();
  ctx.moveTo(cx-8, cy-30); ctx.lineTo(cx-75, cy-60+wb);
  ctx.lineTo(cx-55, cy-4); ctx.lineTo(cx-16, cy-4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+8, cy-30); ctx.lineTo(cx+75, cy-60+wb);
  ctx.lineTo(cx+55, cy-4); ctx.lineTo(cx+16, cy-4); ctx.fill();
  // wings inner membrane
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-8, cy-30); ctx.lineTo(cx-60, cy-52+wb);
  ctx.lineTo(cx-44, cy-4); ctx.lineTo(cx-14, cy-4); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx+8, cy-30); ctx.lineTo(cx+60, cy-52+wb);
  ctx.lineTo(cx+44, cy-4); ctx.lineTo(cx+14, cy-4); ctx.fill();
  // body
  px(ctx, cx-18, cy-38, 36, 46, c(col));
  // hind legs
  px(ctx, cx-16, cy+8,  12, 20, c(col));
  px(ctx, cx+4,  cy+8,  12, 20, c(col));
  px(ctx, cx-20, cy+24, 14,  8, c('#334422'));
  px(ctx, cx+6,  cy+24, 14,  8, c('#334422'));
  // neck + head
  px(ctx, cx-8, cy-60, 16, 24, c(col));
  px(ctx, cx-14, cy-80, 28, 24, c(col));
  px(ctx, cx+8,  cy-72, 18, 10, c(col));
  px(ctx, cx+22, cy-68,  8,  4, c('#ff2200'));
  // eyes
  px(ctx, cx-8, cy-74, 6, 6, c('#ff8800'));
  px(ctx, cx+4, cy-74, 6, 6, c('#ff8800'));
  // back spines
  for (let i=0; i<4; i++) px(ctx, cx-4+i*5, cy-44, 4, 10, c('#334422'));
  // tail
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-18, cy+10); ctx.lineTo(cx-60, cy+30); ctx.lineTo(cx-50, cy+14); ctx.fill();
}

// ============================================================
//  FLOOR 6 SPRITES
// ============================================================
function drawDeathKnight2(ctx, cx, cy, c, col) {
  // legs - heavy dark armor
  px(ctx, cx-18, cy+2,  16, 24, c('#111122'));
  px(ctx, cx+2,  cy+2,  16, 24, c('#111122'));
  px(ctx, cx-20, cy+22, 20,  6, c('#222233'));
  px(ctx, cx+0,  cy+22, 20,  6, c('#222233'));
  // torso
  px(ctx, cx-22, cy-44, 44, 46, c('#111122'));
  px(ctx, cx-18, cy-40, 36, 10, c('#1a1a33'));
  px(ctx, cx-18, cy-24, 36, 10, c('#1a1a33'));
  px(ctx, cx-16, cy-8,  32, 10, c('#1a1a33'));
  // shoulder pads
  px(ctx, cx-34, cy-44, 14, 18, c('#222244'));
  px(ctx, cx+20, cy-44, 14, 18, c('#222244'));
  // arms
  px(ctx, cx-32, cy-28, 12, 32, c('#111122'));
  px(ctx, cx+20, cy-28, 12, 32, c('#111122'));
  // helm
  px(ctx, cx-16, cy-70, 32, 28, c('#111122'));
  px(ctx, cx-18, cy-68, 36,  8, c('#1a1a33'));
  // helm horns
  ctx.fillStyle = c('#222244');
  ctx.beginPath(); ctx.moveTo(cx-14, cy-68); ctx.lineTo(cx-22, cy-94); ctx.lineTo(cx-6, cy-68); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+6,  cy-68); ctx.lineTo(cx+22, cy-94); ctx.lineTo(cx+14, cy-68); ctx.fill();
  // glowing green eyes
  px(ctx, cx-10, cy-60,  8, 6, c('#00ff88'));
  px(ctx, cx+2,  cy-60,  8, 6, c('#00ff88'));
  px(ctx, cx-8,  cy-58,  5, 3, c('#88ffcc'));
  px(ctx, cx+4,  cy-58,  5, 3, c('#88ffcc'));
  // dark cape
  ctx.fillStyle = c('#220033');
  ctx.beginPath();
  ctx.moveTo(cx-20, cy-40); ctx.lineTo(cx-30, cy+28); ctx.lineTo(cx-14, cy+28); ctx.fill();
  // great sword
  px(ctx, cx+22, cy-84,  8, 100, c('#334455'));
  px(ctx, cx+14, cy-72, 24,   8, c('#445566'));
  px(ctx, cx+24, cy-96,  6,  14, c('#aabbcc'));
}

function drawArchMage(ctx, cx, cy, c, col, frame) {
  const o1 = Math.sin(frame * 0.08)     * 10;
  const o2 = Math.sin(frame * 0.08 + 2) * 10;
  const o3 = Math.sin(frame * 0.08 + 4) * 10;
  // staff
  px(ctx, cx+14, cy-80, 5, 100, c('#886644'));
  px(ctx, cx+6,  cy-86, 20, 10, c('#997755'));
  // floating orbs
  ctx.fillStyle = c('#ff44ff');
  ctx.beginPath(); ctx.arc(cx-28, cy-50+o1, 9, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = c('#44aaff');
  ctx.beginPath(); ctx.arc(cx+32, cy-40+o2, 9, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = c('#ffaa00');
  ctx.beginPath(); ctx.arc(cx-4,  cy-82+o3, 9, 0, Math.PI*2); ctx.fill();
  // orb centers
  ctx.fillStyle = c('#ffffff');
  ctx.beginPath(); ctx.arc(cx-28, cy-50+o1, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+32, cy-40+o2, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx-4,  cy-82+o3, 4, 0, Math.PI*2); ctx.fill();
  // robe
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx-16, cy-48); ctx.lineTo(cx-28, cy+28);
  ctx.lineTo(cx+28, cy+28); ctx.lineTo(cx+16, cy-48); ctx.fill();
  px(ctx, cx-28, cy+20, 56, 6, c('#aa8822'));
  px(ctx, cx-16, cy-48, 32, 6, c('#aa8822'));
  px(ctx, cx-10, cy-48, 20, 76, c('#442277'));
  // arms
  px(ctx, cx-26, cy-44, 10, 28, c(col));
  px(ctx, cx+16, cy-44, 10, 28, c(col));
  // head
  px(ctx, cx-11, cy-68, 22, 24, c('#ffddbb'));
  // pointed hat
  ctx.fillStyle = c(col);
  ctx.beginPath();
  ctx.moveTo(cx, cy-100); ctx.lineTo(cx-18, cy-68); ctx.lineTo(cx+18, cy-68); ctx.fill();
  px(ctx, cx-20, cy-72, 40, 8, c('#aa8822'));
  // beard
  ctx.fillStyle = c('#dddddd');
  ctx.beginPath();
  ctx.moveTo(cx-8, cy-52); ctx.lineTo(cx-12, cy-20);
  ctx.lineTo(cx+12, cy-20); ctx.lineTo(cx+8, cy-52); ctx.fill();
  // eyes
  px(ctx, cx-7, cy-60, 5, 5, c('#cc44ff'));
  px(ctx, cx+2, cy-60, 5, 5, c('#cc44ff'));
}

function drawChimera(ctx, cx, cy, c, col, frame) {
  const ts = Math.sin(frame * 0.1) * 8;
  // snake tail
  ctx.fillStyle = c('#557733');
  ctx.beginPath();
  ctx.moveTo(cx-28, cy+10); ctx.lineTo(cx-70, cy-10+ts);
  ctx.lineTo(cx-62, cy+4);  ctx.lineTo(cx-26, cy+20); ctx.fill();
  px(ctx, cx-76, cy-14+ts, 14, 8, c('#557733'));
  px(ctx, cx-74, cy-12+ts,  4, 3, c('#ff2200'));
  // main body
  px(ctx, cx-30, cy-28, 58, 42, c(col));
  // four legs
  px(ctx, cx-28, cy+14, 14, 22, c(col));
  px(ctx, cx-12, cy+14, 14, 22, c(col));
  px(ctx, cx+4,  cy+14, 14, 22, c(col));
  px(ctx, cx+18, cy+14, 14, 22, c(col));
  // paws
  px(ctx, cx-32, cy+32, 18, 8, c('#774411'));
  px(ctx, cx-14, cy+32, 18, 8, c('#774411'));
  px(ctx, cx+2,  cy+32, 18, 8, c('#774411'));
  px(ctx, cx+18, cy+32, 18, 8, c('#774411'));
  // lion mane
  ctx.fillStyle = c('#553311');
  ctx.beginPath(); ctx.arc(cx+22, cy-38, 28, 0, Math.PI*2); ctx.fill();
  // lion head (front)
  px(ctx, cx+8,  cy-58, 30, 28, c(col));
  px(ctx, cx+12, cy-52,  7,  6, c('#ffaa00'));
  px(ctx, cx+24, cy-52,  7,  6, c('#ffaa00'));
  px(ctx, cx+14, cy-50,  4,  4, c('#000000'));
  px(ctx, cx+26, cy-50,  4,  4, c('#000000'));
  px(ctx, cx+14, cy-38, 18,  5, c('#553311'));
  for (let i=0; i<3; i++) px(ctx, cx+14+i*5, cy-36, 4, 6, c('#ffffff'));
  // goat head (back, smaller)
  px(ctx, cx-22, cy-56, 18, 20, c('#aabbaa'));
  ctx.fillStyle = c('#888877');
  ctx.beginPath(); ctx.moveTo(cx-20, cy-56); ctx.lineTo(cx-28, cy-74); ctx.lineTo(cx-16, cy-56); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-10, cy-56); ctx.lineTo(cx-6,  cy-74); ctx.lineTo(cx-4,  cy-56); ctx.fill();
  px(ctx, cx-20, cy-50, 5, 4, c('#ffee00'));
  px(ctx, cx-10, cy-50, 5, 4, c('#ffee00'));
}
