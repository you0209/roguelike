'use strict';

// ============================================================
//  RELICS  ― 担当A が編集
//  ※ 特殊効果（passive）は今後追加予定
// ============================================================
const RELICS = {
  ironSword: {
    name: '鉄の剣',
    desc: '攻撃力+8',
    tier: 1,
    attackBonus: 8, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 40
  },
  steelSword: {
    name: '鋼の剣',
    desc: '攻撃力+18',
    tier: 2,
    attackBonus: 18, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90
  },
  flameSword: {
    name: '炎の剣',
    desc: '攻撃力+28',
    tier: 3,
    attackBonus: 28, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150
  },
  leatherArmor: {
    name: '革の鎧',
    desc: '防御力+6',
    tier: 1,
    attackBonus: 0, defenseBonus: 6, hpBonus: 0, mpBonus: 0,
    price: 35
  },
  ironArmor: {
    name: '鉄の鎧',
    desc: '防御力+18',
    tier: 2,
    attackBonus: 0, defenseBonus: 18, hpBonus: 0, mpBonus: 0,
    price: 95
  },
  lifeRing: {
    name: '生命の指輪',
    desc: '最大HP+35',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 35, mpBonus: 0,
    price: 45
  },
  mageRobe: {
    name: '魔法のローブ',
    desc: '防御力+8 / 最大MP+20',
    tier: 2,
    attackBonus: 0, defenseBonus: 8, hpBonus: 0, mpBonus: 20,
    price: 80
  },
  dragonScale: {
    name: '竜鱗の欠片',
    desc: '攻撃力+12 / 防御力+12',
    tier: 3,
    attackBonus: 12, defenseBonus: 12, hpBonus: 0, mpBonus: 0,
    price: 120
  },

  // ── 単純ステータス増加（MP・魔法向け）──
  magicStaff: {
    name: '魔導の杖',
    desc: '魔法攻撃力+10',
    tier: 1,
    attackBonus: 0, magicAttackBonus: 10, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 50
  },
  magicCrystal: {
    name: '魔力の結晶',
    desc: '魔法攻撃力+22',
    tier: 2,
    attackBonus: 0, magicAttackBonus: 22, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110
  },
  magicOrb: {
    name: '魔力の宝珠',
    desc: '最大MP+30',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 30,
    price: 50
  },
  etherStone: {
    name: 'エーテルストーン',
    desc: '最大MP+60',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 60,
    price: 130
  },
  bloodOath: {
    name: '血の誓い',
    desc: '攻撃力+25 / 防御力+15 / 最大HP-30',
    tier: 2,
    attackBonus: 25, defenseBonus: 15, hpBonus: -30, mpBonus: 0,
    price: 95
  },

  // ── パッシブ：クリティカル・Gold ──
  luckyFoot: {
    name: '幸運のウサギ足',
    desc: 'クリティカル率+15%',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 70, passive: 'luckyFoot'
  },
  merchantRing: {
    name: '商人の指輪',
    desc: '戦闘勝利時ゴールド+20%',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 65, passive: 'merchantRing'
  },

  // ── パッシブ：スキル・MP ──
  mpSaverOrb: {
    name: '節約の宝珠',
    desc: 'スキルのMP消費-2（最低1）',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 60, passive: 'mpSaver'
  },
  magicCatalystRelic: {
    name: '魔法の触媒',
    desc: '魔法スキルのダメージ+20%',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 70, passive: 'magicCatalyst'
  },
  silenceMask: {
    name: '沈黙の仮面',
    desc: 'スキルを使わずに勝利すると次の戦闘で攻撃力+20',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'silenceMask'
  },

  // ── パッシブ：攻撃強化 ──
  greedOrb: {
    name: '貪欲の宝珠',
    desc: '所持レリック1個ごとに攻撃力+3',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'greedOrb'
  },
  expMedal: {
    name: '経験の勲章',
    desc: '同じ階層の戦闘回数×3の攻撃力ボーナス',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'expMedal'
  },
  lifeStealFang: {
    name: '吸血の牙',
    desc: '通常攻撃でダメージの15%をHP吸収',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110, passive: 'lifeSteal'
  },
  revengeBlade: {
    name: '復讐の刃',
    desc: '防御コマンド使用後の次の攻撃が1.5倍',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'revengeBlade'
  },
  doubleHitRing: {
    name: '連撃のリング',
    desc: '通常攻撃が30%の確率で2回ヒット',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110, passive: 'doubleHit'
  },

  // ── パッシブ：ターン依存 ──
  oddCharm: {
    name: '奇数のお守り',
    desc: '奇数ターンの攻撃が1.3倍',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'oddCharm'
  },
  evenCrest: {
    name: '偶数の紋章',
    desc: '偶数ターンに防御力+15',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 75, passive: 'evenCrest'
  },
  hourglassRelic: {
    name: '砂時計',
    desc: '3ターン目以降、全攻撃が1.2倍',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'hourglass'
  },
  enduranceFlag: {
    name: '持久の旗',
    desc: '5ターン以上生き残った場合攻撃力+30（その戦闘中）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'enduranceFlag'
  },

  // ── パッシブ：デメリット付き ──
  cursedHelm: {
    name: '呪われた兜',
    desc: '通常攻撃2連打 / スキル使用不可',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'cursedHelm'
  },
  berserkerProof: {
    name: '狂戦士の証',
    desc: '攻撃力+30 / 防御コマンド使用不可',
    tier: 2,
    attackBonus: 30, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'berserker'
  },
  demonEye: {
    name: '魔人の眼',
    desc: '魔法スキル威力+50% / 物理攻撃-30%',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150, passive: 'demonEye'
  },

  // ── パッシブ：ランダム ──
  chaosStone: {
    name: '混沌の石',
    desc: '戦闘開始時に攻撃力/防御力/会心率のいずれかランダムで+20',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 45, passive: 'chaosStone'
  },

  // ============================================================
  //  新規レリック（v2追加分）
  // ============================================================

  // ── シンプルステータス増加 ──
  ironShield: {
    name: '鉄の盾',
    desc: '防御力+10',
    tier: 1,
    attackBonus: 0, defenseBonus: 10, hpBonus: 0, mpBonus: 0,
    price: 35
  },
  steelArmor: {
    name: '鋼鉄の鎧',
    desc: '防御力+25',
    tier: 2,
    attackBonus: 0, defenseBonus: 25, hpBonus: 0, mpBonus: 0,
    price: 95
  },
  dragonHeart: {
    name: '竜の心臓',
    desc: '最大HP+80',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 80, mpBonus: 0,
    price: 145
  },
  magicBracelet: {
    name: '魔力の腕輪',
    desc: '魔法攻撃力+18',
    tier: 2,
    attackBonus: 0, magicAttackBonus: 18, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85
  },
  abyssStaff: {
    name: '深淵の杖',
    desc: '魔法攻撃力+40',
    tier: 3,
    attackBonus: 0, magicAttackBonus: 40, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 165
  },
  mithrilSword: {
    name: 'ミスリルの剣',
    desc: '攻撃力+35',
    tier: 3,
    attackBonus: 35, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 155
  },
  heroBadge: {
    name: '英雄の証',
    desc: '攻撃力+10 / 防御力+10 / 最大HP+15',
    tier: 2,
    attackBonus: 10, defenseBonus: 10, hpBonus: 15, mpBonus: 0,
    price: 115
  },
  adventurerCloak: {
    name: '冒険者の外套',
    desc: '防御力+12 / 最大HP+25',
    tier: 2,
    attackBonus: 0, defenseBonus: 12, hpBonus: 25, mpBonus: 0,
    price: 90
  },
  crystalRing: {
    name: '水晶のリング',
    desc: '最大MP+45 / 魔法攻撃力+12',
    tier: 2,
    attackBonus: 0, magicAttackBonus: 12, defenseBonus: 0, hpBonus: 0, mpBonus: 45,
    price: 100
  },
  heroShield: {
    name: '勇者の盾',
    desc: '防御力+20 / 最大HP+20',
    tier: 2,
    attackBonus: 0, defenseBonus: 20, hpBonus: 20, mpBonus: 0,
    price: 95
  },

  // ── 通常攻撃強化 ──
  thunderCrestRelic: {
    name: '雷の紋章',
    desc: '会心ヒット時に追加15固定ダメージ',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'thunderCrest'
  },
  shadowBladeRelic: {
    name: '影の刃',
    desc: '通常攻撃の会心倍率を1.5倍→2.0倍に強化',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'shadowBlade'
  },
  firstStrikeRelic: {
    name: '先制の剣',
    desc: '1ターン目の通常攻撃が2.0倍',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'firstStrike'
  },
  flameMaskRelic: {
    name: '炎の仮面',
    desc: '戦闘開始時に敵に20固定ダメージ',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 50, passive: 'flameMask'
  },
  wrathStoneRelic: {
    name: '怒りの石',
    desc: '被ダメージのたびに攻撃力+5（最大+25、その戦闘中）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 80, passive: 'wrathStone'
  },
  adversityFlameRelic: {
    name: '逆境の炎',
    desc: '被ダメージのたびに次の攻撃+12%（攻撃すると解除）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'adversityFlame'
  },
  tripleHitRelic: {
    name: '連撃の爪',
    desc: '通常攻撃が15%の確率で3回ヒット（独立クリティカル）',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'tripleHit'
  },
  hunterEyeRelic: {
    name: '狩人の眼',
    desc: '敵のHPが30%以下の時、攻撃力+20%',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'hunterEye'
  },

  // ── 物理スキル強化 ──
  swordsmanOathRelic: {
    name: '剣士の誓い',
    desc: '物理スキルの会心率+20%',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'swordsmanOath'
  },
  earthSwordRelic: {
    name: '大地の剣',
    desc: '物理スキルが敵の防御力を30%無視',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'earthSword'
  },
  chainStoneRelic: {
    name: '連鎖の石',
    desc: 'スキルを連続使用するとダメージ+15%ずつ増加（最大+45%、通常攻撃でリセット）',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 145, passive: 'chainStone'
  },

  // ── 魔法スキル強化 ──
  magicAmplifierRelic: {
    name: '魔力増幅器',
    desc: '魔法スキルを連続使用するとダメージ+20%ずつ増加（最大+60%）',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150, passive: 'magicAmplifier'
  },
  wisdomRingRelic: {
    name: '智慧の指輪',
    desc: '最大MPの30%を魔法攻撃力に加算',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'wisdomRing'
  },
  blackMagicRingRelic: {
    name: '黒魔法の指輪',
    desc: '魔法スキルのダメージ+15% / 防御力-10',
    tier: 2,
    attackBonus: 0, defenseBonus: -10, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'blackMagicRing'
  },
  magicCoreRelic: {
    name: '魔導核',
    desc: '最大MP+50 / スキルのMP消費+3',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 50,
    price: 100, passive: 'magicCore'
  },
  forbiddenBookRelic: {
    name: '封印された禁書',
    desc: '魔法スキルのMP消費0 / 物理スキル・通常攻撃が使えない',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 145, passive: 'forbiddenBook'
  },

  // ── 防御カウンタービルド ──
  thornArmorRelic: {
    name: '茨の鎧',
    desc: '防御中に受けたダメージの30%を敵に反射',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'thornArmor'
  },
  guardShieldRelic: {
    name: '守護の盾',
    desc: '防御コマンドのダメージ軽減をさらに強化（通常攻撃85%軽減）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'guardShield'
  },
  shieldCounterRelic: {
    name: '盾返しの腕輪',
    desc: '防御コマンド後の攻撃が2.0倍（復讐の刃と両立時は高い方を採用）',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'shieldCounter'
  },
  ironWallRelic: {
    name: '鉄壁の守護',
    desc: '受けるダメージを5軽減（最低1）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 80, passive: 'ironWall'
  },
  patienceTabletRelic: {
    name: '忍耐の石板',
    desc: '連続して防御コマンドを使うたびに防御力+10（最大+30、攻撃でリセット）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'patienceTablet'
  },
  rebellionSoulRelic: {
    name: '反骨の魂',
    desc: '防御コマンドを使うたびに攻撃力+8（最大+32、その戦闘中）',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'rebellionSoul'
  },
  steadyRockRelic: {
    name: '不動の岩',
    desc: 'HP50%以上の間、全ダメージ20%軽減',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'steadyRock'
  },
  fortressProofRelic: {
    name: '城壁の証',
    desc: '防御力の30%を通常攻撃のダメージに加算',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'fortressProof'
  },

  // ── 瀕死特化ビルド ──
  bloodDaggerRelic: {
    name: '血染めの短剣',
    desc: '自分のHP50%以下の時、攻撃力+25',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'bloodDagger'
  },
  deathEyeRelic: {
    name: '死神の眼',
    desc: '自分のHP30%以下の時、全攻撃+40%',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 140, passive: 'deathEye'
  },
  madnessCrestRelic: {
    name: '狂気の紋章',
    desc: 'HP25%以下の時、会心率+30%',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'madnessCrest'
  },
  lifeBetRelic: {
    name: '命の賭け',
    desc: 'HP15%以下の時、スキルのMP消費0',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 130, passive: 'lifeBet'
  },
  lifeHourglassRelic: {
    name: '命の砂時計',
    desc: 'HP25%以下の時、受けるダメージ30%軽減',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 135, passive: 'lifeHourglass'
  },
  deathChallengeRelic: {
    name: '死への挑戦',
    desc: '受けるダメージ30%軽減 / 最大HP-50',
    tier: 3,
    attackBonus: 0, defenseBonus: 0, hpBonus: -50, mpBonus: 0,
    price: 120, passive: 'deathChallenge'
  },
  neardieRageRelic: {
    name: '瀕死の怒り',
    desc: 'HP50%以下の時、攻撃力+15 / 受けるダメージ10%軽減',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'neardieRage'
  },

  // ── ゴールド投資ビルド ──
  goldSwordRelic: {
    name: '黄金の剣',
    desc: '所持ゴールド100Gごとに攻撃力+4',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'goldSword'
  },
  goldArmorRelic: {
    name: '金塊の鎧',
    desc: '所持ゴールド100Gごとに防御力+3',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'goldArmor'
  },
  treasureGuardRelic: {
    name: '財宝の守護者',
    desc: 'ゴールド200G以上保有時、攻撃力+20 / 防御力+10',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 100, passive: 'treasureGuard'
  },
  alchemistRingRelic: {
    name: '錬金術師の指輪',
    desc: '戦闘勝利後にゴールド+25G固定',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 65, passive: 'alchemistRing'
  },
  thiefRingRelic: {
    name: '盗賊の指輪',
    desc: '5ターン以内に勝利するとゴールド+50%',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'thiefRing'
  },
  gemEyeRelic: {
    name: '宝石商の眼',
    desc: 'レリック購入費-15%',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 90, passive: 'gemEye'
  },
  gamblerDiceRelic: {
    name: '賭博師の骰子',
    desc: '戦闘開始時50%の確率で攻撃力+35、50%の確率で攻撃力-5',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'gamblerDice'
  }
};
