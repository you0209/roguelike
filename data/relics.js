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
    desc: '攻撃力+10',
    tier: 1,
    attackBonus: 10, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 50
  },
  magicCrystal: {
    name: '魔力の結晶',
    desc: '攻撃力+22',
    tier: 2,
    attackBonus: 22, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
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
    desc: 'スキルを使わずに勝利すると次の戦闘でATK+20',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'silenceMask'
  },

  // ── パッシブ：攻撃強化 ──
  greedOrb: {
    name: '貪欲の宝珠',
    desc: '所持レリック1個ごとにATK+3',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 55, passive: 'greedOrb'
  },
  expMedal: {
    name: '経験の勲章',
    desc: '同じ階層の戦闘回数×3のATKボーナス',
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
    desc: '通常攻撃が10%の確率で2回ヒット',
    tier: 2,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 120, passive: 'doubleHit'
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
    desc: '5ターン以上生き残った場合ATK+30（その戦闘中）',
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
    price: 80, passive: 'cursedHelm'
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
    desc: '戦闘開始時にATK/DEF/HP/MPのいずれかランダムで+20',
    tier: 1,
    attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 45, passive: 'chaosStone'
  }
};
