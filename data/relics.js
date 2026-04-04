'use strict';

// ============================================================
//  RELICS（武器・防具）  ― 担当A が編集
//  ※ 現在は武器・防具として実装。レリックシステムへの改変予定。
// ============================================================
const WEAPONS = {
  ironSword: {
    name: '鉄の剣',   desc: '攻撃力+8',           attackBonus: 8,  defenseBonus: 0, mpBonus: 0, price: 60
  },
  steelSword: {
    name: '鋼の剣',   desc: '攻撃力+16',          attackBonus: 16, defenseBonus: 0, mpBonus: 0, price: 120
  },
  flameSword: {
    name: '炎の剣',   desc: '攻撃力+26',          attackBonus: 26, defenseBonus: 0, mpBonus: 0, price: 220
  },
  shadowBlade: {
    name: '影の刃',   desc: '攻撃力+20',          attackBonus: 20, defenseBonus: 0, mpBonus: 0, price: 200
  }
};

const ARMORS = {
  leatherArmor: {
    name: '革の鎧',         desc: '防御力+5',          attackBonus: 0, defenseBonus: 5,  mpBonus: 0,  price: 50
  },
  chainMail: {
    name: 'チェインメイル', desc: '防御力+12',         attackBonus: 0, defenseBonus: 12, mpBonus: 0,  price: 100
  },
  ironArmor: {
    name: '鉄の鎧',         desc: '防御力+22',         attackBonus: 0, defenseBonus: 22, mpBonus: 0,  price: 180
  },
  mageRobe: {
    name: '魔法のローブ',   desc: '防御力+8 / MP+20',  attackBonus: 0, defenseBonus: 8,  mpBonus: 20, price: 160
  }
};
