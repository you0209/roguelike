'use strict';

// ============================================================
//  SKILLS  ― 担当C が編集
// ============================================================
const SKILLS = {
  slash: {
    name: 'スラッシュ',
    desc: '力強い一撃（物理×1.6）',
    mpCost: 5, type: 'physical', power: 1.6, target: 'enemy', charClass: 'warrior'
  },
  fireball: {
    name: 'ファイアボール',
    desc: '炎の魔法（魔法×1.8）',
    mpCost: 8, type: 'magic', power: 1.8, target: 'enemy', charClass: 'mage'
  },
  thunder: {
    name: 'サンダー',
    desc: '雷撃魔法（魔法×2.2）',
    mpCost: 13, type: 'magic', power: 2.2, target: 'enemy', charClass: 'mage'
  },
  iceSpear: {
    name: 'アイスランス',
    desc: '氷の槍（魔法×2.8）',
    mpCost: 18, type: 'magic', power: 2.8, target: 'enemy', charClass: 'mage'
  },

  // ── 物理系 ──
  doubleSlash: {
    name: 'ダブルスラッシュ',
    desc: '物理×1.0を2回ヒット',
    mpCost: 10, type: 'physical_multi', power: 1.0, hits: 2, target: 'enemy', charClass: 'warrior'
  },
  greatSlash: {
    name: '大斬り',
    desc: '物理×2.5（防御無視）',
    mpCost: 14, type: 'physical_no_def', power: 2.5, target: 'enemy', charClass: 'warrior'
  },
  reckless: {
    name: '捨て身の一撃',
    desc: '物理×3.0・自分もHP-15',
    mpCost: 8, type: 'physical_sacrifice', power: 3.0, selfDmg: 15, target: 'enemy', charClass: 'warrior'
  },
  counter: {
    name: '見切り',
    desc: '次の敵通常攻撃を無効化・反撃で物理×1.2',
    mpCost: 4, type: 'counter', power: 1.2, target: 'self', charClass: 'warrior'
  },
  charge: {
    name: '突進',
    desc: '物理×1.4・クリティカル率+20%（この一撃）',
    mpCost: 7, type: 'physical_high_crit', power: 1.4, critBonus: 0.2, target: 'enemy', charClass: 'warrior'
  },

  // ── 固定ダメージ・特殊系 ──
  blastFist: {
    name: '爆裂拳',
    desc: '敵に40固定ダメージ（防御無視）',
    mpCost: 11, type: 'fixed', value: 40, target: 'enemy', charClass: 'warrior'
  },
  lastResort: {
    name: 'ラストリゾート',
    desc: 'MP全消費・消費MP×4の固定ダメージ',
    mpCost: 15, type: 'last_resort', mpMultiplier: 4, target: 'enemy', charClass: 'mage'
  },
  soulBurst: {
    name: 'ソウルバースト',
    desc: '残HPが低いほど威力上昇（魔法×1.0〜3.0）',
    mpCost: 20, type: 'soul_burst', basePower: 1.0, maxPower: 3.0, target: 'enemy', charClass: 'mage'
  },
  dualWield: {
    name: '二刀流',
    desc: '物理×0.8を3回ヒット',
    mpCost: 12, type: 'physical_multi', power: 0.8, hits: 3, target: 'enemy', charClass: 'warrior'
  }
};

// ショップで販売するスキル
const SHOP_SKILLS = {
  fireball:    { ...SKILLS.fireball,    price:  80 },
  thunder:     { ...SKILLS.thunder,     price: 130 },
  iceSpear:    { ...SKILLS.iceSpear,    price: 180 },
  soulBurst:   { ...SKILLS.soulBurst,   price: 150 },
  lastResort:  { ...SKILLS.lastResort,  price: 160 },
  charge:      { ...SKILLS.charge,      price:  80 },
  reckless:    { ...SKILLS.reckless,    price:  90 },
  counter:     { ...SKILLS.counter,     price: 100 },
  doubleSlash: { ...SKILLS.doubleSlash, price: 100 },
  blastFist:   { ...SKILLS.blastFist,   price: 110 },
  dualWield:   { ...SKILLS.dualWield,   price: 130 },
  greatSlash:  { ...SKILLS.greatSlash,  price: 140 },
};
