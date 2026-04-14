'use strict';

// ============================================================
//  WARRIOR  ― 戦士キャラクターデータ
// ============================================================
const WARRIOR_SKILLS = {
  slash: {
    name: 'スラッシュ', desc: '力強い一撃（物理×1.6）',
    mpCost: 5, type: 'physical', power: 1.6, target: 'enemy', charClass: 'warrior'
  },
  doubleSlash: {
    name: 'ダブルスラッシュ', desc: '物理×1.0を2回ヒット',
    mpCost: 10, type: 'physical_multi', power: 1.0, hits: 2, target: 'enemy', charClass: 'warrior'
  },
  greatSlash: {
    name: '大斬り', desc: '物理×2.5（防御無視）',
    mpCost: 14, type: 'physical_no_def', power: 2.5, target: 'enemy', charClass: 'warrior'
  },
  reckless: {
    name: '捨て身の一撃', desc: '物理×3.0・自分もHP-15',
    mpCost: 8, type: 'physical_sacrifice', power: 3.0, selfDmg: 15, target: 'enemy', charClass: 'warrior'
  },
  counter: {
    name: '見切り', desc: '次の敵通常攻撃を無効化・反撃で物理×1.2',
    mpCost: 4, type: 'counter', power: 1.2, target: 'self', charClass: 'warrior'
  },
  charge: {
    name: '突進', desc: '物理×1.4・クリティカル率+20%（この一撃）',
    mpCost: 7, type: 'physical_high_crit', power: 1.4, critBonus: 0.2, target: 'enemy', charClass: 'warrior'
  },
  blastFist: {
    name: '爆裂拳', desc: '敵に40固定ダメージ（防御無視）',
    mpCost: 11, type: 'fixed', value: 40, target: 'enemy', charClass: 'warrior'
  },
  dualWield: {
    name: '二刀流', desc: '物理×0.8を3回ヒット',
    mpCost: 12, type: 'physical_multi', power: 0.8, hits: 3, target: 'enemy', charClass: 'warrior'
  }
};

const WARRIOR_SHOP_SKILLS = {
  charge:      { ...WARRIOR_SKILLS.charge,      price:  80 },
  reckless:    { ...WARRIOR_SKILLS.reckless,     price:  90 },
  counter:     { ...WARRIOR_SKILLS.counter,      price: 100 },
  doubleSlash: { ...WARRIOR_SKILLS.doubleSlash,  price: 100 },
  blastFist:   { ...WARRIOR_SKILLS.blastFist,    price: 110 },
  dualWield:   { ...WARRIOR_SKILLS.dualWield,    price: 130 },
  greatSlash:  { ...WARRIOR_SKILLS.greatSlash,   price: 140 },
};

const WARRIOR_RELICS = {
  // ── シンプルステータス ──
  ironSword: {
    name: '鉄の剣', desc: '攻撃力+8',
    tier: 1, attackBonus: 8, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 40, charClass: 'warrior'
  },
  steelSword: {
    name: '鋼の剣', desc: '攻撃力+18',
    tier: 2, attackBonus: 18, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, charClass: 'warrior'
  },
  flameSword: {
    name: '炎の剣', desc: '攻撃力+28',
    tier: 3, attackBonus: 28, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150, charClass: 'warrior'
  },
  mithrilSword: {
    name: 'ミスリルの剣', desc: '攻撃力+35',
    tier: 3, attackBonus: 35, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 155, charClass: 'warrior'
  },
  heroBadge: {
    name: '英雄の証', desc: '攻撃力+10 / 防御力+10 / 最大HP+15',
    tier: 2, attackBonus: 10, defenseBonus: 10, hpBonus: 15, mpBonus: 0,
    price: 115, charClass: 'warrior'
  },
  dragonScale: {
    name: '竜鱗の欠片', desc: '攻撃力+12 / 防御力+12',
    tier: 3, attackBonus: 12, defenseBonus: 12, hpBonus: 0, mpBonus: 0,
    price: 120, charClass: 'warrior'
  },
  bloodOath: {
    name: '血の誓い', desc: '攻撃力+25 / 防御力+15 / 最大HP-30',
    tier: 2, attackBonus: 25, defenseBonus: 15, hpBonus: -30, mpBonus: 0,
    price: 95, charClass: 'warrior'
  },

  // ── 通常攻撃強化 ──
  lifeStealFang: {
    name: '吸血の牙', desc: '通常攻撃でダメージの15%をHP吸収',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110, passive: 'lifeSteal', charClass: 'warrior'
  },
  revengeBlade: {
    name: '復讐の刃', desc: '防御コマンド使用後の次の攻撃が1.5倍',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'revengeBlade', charClass: 'warrior'
  },
  doubleHitRing: {
    name: '連撃のリング', desc: '通常攻撃が30%の確率で2回ヒット',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110, passive: 'doubleHit', charClass: 'warrior'
  },
  oddCharm: {
    name: '奇数のお守り', desc: '奇数ターンの攻撃が1.3倍',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'oddCharm', charClass: 'warrior'
  },
  enduranceFlag: {
    name: '持久の旗', desc: '5ターン以上生き残った場合攻撃力+30（その戦闘中）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'enduranceFlag', charClass: 'warrior'
  },
  thunderCrestRelic: {
    name: '雷の紋章', desc: '会心ヒット時に追加15固定ダメージ',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'thunderCrest', charClass: 'warrior'
  },
  shadowBladeRelic: {
    name: '影の刃', desc: '通常攻撃の会心倍率を1.5倍→2.0倍に強化',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'shadowBlade', charClass: 'warrior'
  },
  firstStrikeRelic: {
    name: '先制の剣', desc: '1ターン目の通常攻撃が2.0倍',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'firstStrike', charClass: 'warrior'
  },
  wrathStoneRelic: {
    name: '怒りの石', desc: '被ダメージのたびに攻撃力+5（最大+25、その戦闘中）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 80, passive: 'wrathStone', charClass: 'warrior'
  },
  adversityFlameRelic: {
    name: '逆境の炎', desc: '被ダメージのたびに次の攻撃+12%（攻撃すると解除）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'adversityFlame', charClass: 'warrior'
  },
  tripleHitRelic: {
    name: '連撃の爪', desc: '通常攻撃が15%の確率で3回ヒット（独立クリティカル）',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'tripleHit', charClass: 'warrior'
  },
  hunterEyeRelic: {
    name: '狩人の眼', desc: '敵のHPが30%以下の時、攻撃力+20%',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'hunterEye', charClass: 'warrior'
  },

  // ── 物理スキル強化 ──
  swordsmanOathRelic: {
    name: '剣士の誓い', desc: '物理スキルの会心率+20%',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'swordsmanOath', charClass: 'warrior'
  },
  earthSwordRelic: {
    name: '大地の剣', desc: '物理スキルが敵の防御力を30%無視',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'earthSword', charClass: 'warrior'
  },
  chainStoneRelic: {
    name: '連鎖の石', desc: 'スキルを連続使用するとダメージ+15%ずつ増加（最大+45%、通常攻撃でリセット）',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 145, passive: 'chainStone', charClass: 'warrior'
  },

  // ── デメリット付き ──
  cursedHelm: {
    name: '呪われた兜', desc: '通常攻撃2連打 / スキル使用不可',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'cursedHelm', charClass: 'warrior'
  },
  berserkerProof: {
    name: '狂戦士の証', desc: '攻撃力+30 / 防御コマンド使用不可',
    tier: 2, attackBonus: 30, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'berserker', charClass: 'warrior'
  },
  silenceMask: {
    name: '沈黙の仮面', desc: 'スキルを使わずに勝利すると次の戦闘で攻撃力+20',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'silenceMask', charClass: 'warrior'
  },

  // ── 防御カウンター ──
  shieldCounterRelic: {
    name: '盾返しの腕輪', desc: '防御コマンド後の攻撃が2.0倍（復讐の刃と両立時は高い方を採用）',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'shieldCounter', charClass: 'warrior'
  },
  rebellionSoulRelic: {
    name: '反骨の魂', desc: '防御コマンドを使うたびに攻撃力+8（最大+32、その戦闘中）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'rebellionSoul', charClass: 'warrior'
  },
  fortressProofRelic: {
    name: '城壁の証', desc: '防御力の30%を通常攻撃のダメージに加算',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'fortressProof', charClass: 'warrior'
  },

  // ── 瀕死特化 ──
  bloodDaggerRelic: {
    name: '血染めの短剣', desc: '自分のHP50%以下の時、攻撃力+25',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'bloodDagger', charClass: 'warrior'
  },
  neardieRageRelic: {
    name: '瀕死の怒り', desc: 'HP50%以下の時、攻撃力+15 / 受けるダメージ10%軽減',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'neardieRage', charClass: 'warrior'
  },

  // ── ゴールド投資 ──
  goldSwordRelic: {
    name: '黄金の剣', desc: '所持ゴールド100Gごとに攻撃力+4',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'goldSword', charClass: 'warrior'
  },
  gamblerDiceRelic: {
    name: '賭博師の骰子', desc: '戦闘開始時50%の確率で攻撃力+35、50%の確率で攻撃力-5',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'gamblerDice', charClass: 'warrior'
  },
};

const WARRIOR = {
  character: {
    hp: 100, maxHp: 100,
    mp:  30, maxMp:  30,
    attack: 15, defense: 10, magicAttack: 0,
    skills: ['slash'],
    label: '戦　士', desc: '物理特化'
  },
  skills:    WARRIOR_SKILLS,
  shopSkills: WARRIOR_SHOP_SKILLS,
  relics:    WARRIOR_RELICS
};
