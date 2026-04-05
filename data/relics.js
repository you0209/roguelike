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
  }
};
