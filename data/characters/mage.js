'use strict';

// ============================================================
//  MAGE  ― 魔法使いキャラクターデータ
// ============================================================
const MAGE_SKILLS = {
  fireball: {
    name: 'ファイアボール', desc: '炎の魔法（魔法×1.8）',
    mpCost: 8, type: 'magic', power: 1.8, target: 'enemy', charClass: 'mage'
  },
  thunder: {
    name: 'サンダー', desc: '雷撃魔法（魔法×2.2）',
    mpCost: 13, type: 'magic', power: 2.2, target: 'enemy', charClass: 'mage'
  },
  iceSpear: {
    name: 'アイスランス', desc: '氷の槍（魔法×2.8）',
    mpCost: 18, type: 'magic', power: 2.8, target: 'enemy', charClass: 'mage'
  },
  soulBurst: {
    name: 'ソウルバースト', desc: '残HPが低いほど威力上昇（魔法×1.0〜3.0）',
    mpCost: 20, type: 'soul_burst', basePower: 1.0, maxPower: 3.0, target: 'enemy', charClass: 'mage'
  },
  lastResort: {
    name: 'ラストリゾート', desc: 'MP全消費・消費MP×4の固定ダメージ',
    mpCost: 15, type: 'last_resort', mpMultiplier: 4, target: 'enemy', charClass: 'mage'
  }
};

const MAGE_SHOP_SKILLS = {
  fireball:   { ...MAGE_SKILLS.fireball,   price:  80 },
  thunder:    { ...MAGE_SKILLS.thunder,    price: 130 },
  iceSpear:   { ...MAGE_SKILLS.iceSpear,   price: 180 },
  soulBurst:  { ...MAGE_SKILLS.soulBurst,  price: 150 },
  lastResort: { ...MAGE_SKILLS.lastResort, price: 160 },
};

const MAGE_RELICS = {
  // ── シンプルステータス ──
  mageRobe: {
    name: '魔法のローブ', desc: '防御力+8 / 最大MP+20',
    tier: 2, attackBonus: 0, defenseBonus: 8, hpBonus: 0, mpBonus: 20,
    price: 80, charClass: 'mage'
  },
  magicStaff: {
    name: '魔導の杖', desc: '魔法攻撃力+10',
    tier: 1, attackBonus: 0, magicAttackBonus: 10, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 50, charClass: 'mage'
  },
  magicCrystal: {
    name: '魔力の結晶', desc: '魔法攻撃力+22',
    tier: 2, attackBonus: 0, magicAttackBonus: 22, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 110, charClass: 'mage'
  },
  magicOrb: {
    name: '魔力の宝珠', desc: '最大MP+30',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 30,
    price: 50, charClass: 'mage'
  },
  etherStone: {
    name: 'エーテルストーン', desc: '最大MP+60',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 60,
    price: 130, charClass: 'mage'
  },
  magicBracelet: {
    name: '魔力の腕輪', desc: '魔法攻撃力+18',
    tier: 2, attackBonus: 0, magicAttackBonus: 18, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 85, charClass: 'mage'
  },
  abyssStaff: {
    name: '深淵の杖', desc: '魔法攻撃力+40',
    tier: 3, attackBonus: 0, magicAttackBonus: 40, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 165, charClass: 'mage'
  },
  crystalRing: {
    name: '水晶のリング', desc: '最大MP+45 / 魔法攻撃力+12',
    tier: 2, attackBonus: 0, magicAttackBonus: 12, defenseBonus: 0, hpBonus: 0, mpBonus: 45,
    price: 100, charClass: 'mage'
  },

  // ── 魔法スキル強化 ──
  magicCatalystRelic: {
    name: '魔法の触媒', desc: '魔法スキルのダメージ+20%',
    tier: 1, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 70, passive: 'magicCatalyst', charClass: 'mage'
  },
  magicAmplifierRelic: {
    name: '魔力増幅器', desc: '魔法スキルを連続使用するとダメージ+20%ずつ増加（最大+60%）',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150, passive: 'magicAmplifier', charClass: 'mage'
  },
  wisdomRingRelic: {
    name: '智慧の指輪', desc: '最大MPの30%を魔法攻撃力に加算',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 95, passive: 'wisdomRing', charClass: 'mage'
  },
  blackMagicRingRelic: {
    name: '黒魔法の指輪', desc: '魔法スキルのダメージ+15% / 防御力-10',
    tier: 2, attackBonus: 0, defenseBonus: -10, hpBonus: 0, mpBonus: 0,
    price: 85, passive: 'blackMagicRing', charClass: 'mage'
  },
  magicCoreRelic: {
    name: '魔導核', desc: '最大MP+50 / スキルのMP消費+3',
    tier: 2, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 50,
    price: 100, passive: 'magicCore', charClass: 'mage'
  },
  forbiddenBookRelic: {
    name: '封印された禁書', desc: '魔法スキルのMP消費0 / 物理スキル・通常攻撃が使えない',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 145, passive: 'forbiddenBook', charClass: 'mage'
  },

  // ── デメリット付き ──
  demonEye: {
    name: '魔人の眼', desc: '魔法スキル威力+50% / 物理攻撃-30%',
    tier: 3, attackBonus: 0, defenseBonus: 0, hpBonus: 0, mpBonus: 0,
    price: 150, passive: 'demonEye', charClass: 'mage'
  },
};

const MAGE = {
  character: {
    hp:  70, maxHp:  70,
    mp:  60, maxMp:  60,
    attack: 6, defense: 5, magicAttack: 18,
    skills: ['fireball'],
    label: '魔法使い', desc: '魔法特化'
  },
  skills:    MAGE_SKILLS,
  shopSkills: MAGE_SHOP_SKILLS,
  relics:    MAGE_RELICS
};
