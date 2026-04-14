'use strict';

// ============================================================
//  SHARED RELICS  ― 両キャラ共通レリック（charClass:'both'）
// ============================================================
const SHARED_RELICS = {
  // ── シンプルステータス増加 ──
  leatherArmor: {
    name: '革の鎧', desc: '防御力+6',
    tier: 1, attackBonus: 0, defenseBonus: 6, hpBonus: 0, mpBonus: 0,
    price: 35, charClass: 'both'
  },
  ironArmor: {
    name: '鉄の鎧', desc: '防御力+18',
    tier: 2, attackBonus: 0, defenseBonus: 18, hpBonus: 0, mpBonus: 0,
    price: 95, charClass: 'both'
  },
  lifeRing: {
    name: '生命の指輪', desc: '最大HP+35',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 35, mpBonus: 0,
    price: 45, charClass: 'both'
  },
  ironShield: {
    name: '鉄の盾', desc: '防御力+10',
    tier: 1, attackBonus: 0, defenseBonus: 10, hpBonus: 0, mpBonus: 0,
    price: 35, charClass: 'both'
  },
  steelArmor: {
    name: '鋼鉄の鎧', desc: '防御力+25',
    tier: 2, attackBonus: 0, defenseBonus: 25, hpBonus: 0, mpBonus: 0,
    price: 95, charClass: 'both'
  },
  dragonHeart: {
    name: '竜の心臓', desc: '最大HP+80',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 80, mpBonus: 0,
    price: 145, charClass: 'both'
  },
  adventurerCloak: {
    name: '冒険者の外套', desc: '防御力+12 / 最大HP+25',
    tier: 2, attackBonus: 0, defenseBonus: 12, hpBonus: 25, mpBonus: 0,
    price: 90, charClass: 'both'
  },
  heroShield: {
    name: '勇者の盾', desc: '防御力+20 / 最大HP+20',
    tier: 2, attackBonus: 0, defenseBonus: 20, hpBonus: 20, mpBonus: 0,
    price: 95, charClass: 'both'
  },

  // ── パッシブ：クリティカル・ゴールド ──
  luckyFoot: {
    name: '幸運のウサギ足', desc: 'クリティカル率+15%',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 70, passive: 'luckyFoot', charClass: 'both'
  },
  merchantRing: {
    name: '商人の指輪', desc: '戦闘勝利時ゴールド+20%',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 65, passive: 'merchantRing', charClass: 'both'
  },

  // ── パッシブ：スキル・MP ──
  mpSaverOrb: {
    name: '節約の宝珠', desc: 'スキルのMP消費-2（最低1）',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 60, passive: 'mpSaver', charClass: 'both'
  },

  // ── パッシブ：攻撃強化 ──
  greedOrb: {
    name: '貪欲の宝珠', desc: '所持レリック1個ごとに攻撃力+3',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'greedOrb', charClass: 'both'
  },
  expMedal: {
    name: '経験の勲章', desc: '同じ階層の戦闘回数×3の攻撃力ボーナス',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'expMedal', charClass: 'both'
  },

  // ── パッシブ：ターン依存 ──
  evenCrest: {
    name: '偶数の紋章', desc: '偶数ターンに防御力+15',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 75, passive: 'evenCrest', charClass: 'both'
  },
  hourglassRelic: {
    name: '砂時計', desc: '3ターン目以降、全攻撃が1.2倍',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'hourglass', charClass: 'both'
  },

  // ── パッシブ：ランダム ──
  chaosStone: {
    name: '混沌の石', desc: '戦闘開始時に攻撃力/防御力/会心率のいずれかランダムで+20',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 45, passive: 'chaosStone', charClass: 'both'
  },

  // ── 通常攻撃 ──
  flameMaskRelic: {
    name: '炎の仮面', desc: '戦闘開始時に敵に20固定ダメージ',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 50, passive: 'flameMask', charClass: 'both'
  },

  // ── 防御カウンタービルド ──
  thornArmorRelic: {
    name: '茨の鎧', desc: '防御中に受けたダメージの30%を敵に反射',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'thornArmor', charClass: 'both'
  },
  guardShieldRelic: {
    name: '守護の盾', desc: '防御コマンドのダメージ軽減をさらに強化（通常攻撃85%軽減）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'guardShield', charClass: 'both'
  },
  ironWallRelic: {
    name: '鉄壁の守護', desc: '受けるダメージを5軽減（最低1）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 80, passive: 'ironWall', charClass: 'both'
  },
  patienceTabletRelic: {
    name: '忍耐の石板', desc: '連続して防御コマンドを使うたびに防御力+10（最大+30、攻撃でリセット）',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'patienceTablet', charClass: 'both'
  },
  steadyRockRelic: {
    name: '不動の岩', desc: 'HP50%以上の間、全ダメージ20%軽減',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'steadyRock', charClass: 'both'
  },

  // ── 瀕死特化ビルド ──
  deathEyeRelic: {
    name: '死神の眼', desc: '自分のHP30%以下の時、全攻撃+40%',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 140, passive: 'deathEye', charClass: 'both'
  },
  madnessCrestRelic: {
    name: '狂気の紋章', desc: 'HP25%以下の時、会心率+30%',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'madnessCrest', charClass: 'both'
  },
  lifeBetRelic: {
    name: '命の賭け', desc: 'HP15%以下の時、スキルのMP消費0',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'lifeBet', charClass: 'both'
  },
  lifeHourglassRelic: {
    name: '命の砂時計', desc: 'HP25%以下の時、受けるダメージ30%軽減',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'lifeHourglass', charClass: 'both'
  },
  deathChallengeRelic: {
    name: '死への挑戦', desc: '受けるダメージ30%軽減 / 最大HP-50',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: -50, mpBonus: 0,
    price: 120, passive: 'deathChallenge', charClass: 'both'
  },

  // ── ゴールド投資ビルド ──
  goldArmorRelic: {
    name: '金塊の鎧', desc: '所持ゴールド100Gごとに防御力+3',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'goldArmor', charClass: 'both'
  },
  treasureGuardRelic: {
    name: '財宝の守護者', desc: 'ゴールド200G以上保有時、攻撃力+20 / 防御力+10',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'treasureGuard', charClass: 'both'
  },
  alchemistRingRelic: {
    name: '錬金術師の指輪', desc: '戦闘勝利後にゴールド+25G固定',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 65, passive: 'alchemistRing', charClass: 'both'
  },
  thiefRingRelic: {
    name: '盗賊の指輪', desc: '5ターン以内に勝利するとゴールド+50%',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'thiefRing', charClass: 'both'
  },
  gemEyeRelic: {
    name: '宝石商の眼', desc: 'レリック購入費-15%',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'gemEye', charClass: 'both'
  },
};
