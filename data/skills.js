'use strict';

// ============================================================
//  SKILLS  ― 担当C が編集
// ============================================================
const SKILLS = {
  slash: {
    name: 'スラッシュ',
    desc: '力強い一撃（物理×1.6）',
    mpCost: 5, type: 'physical', power: 1.6, target: 'enemy'
  },
  fireball: {
    name: 'ファイアボール',
    desc: '炎の魔法（魔法×1.8）',
    mpCost: 8, type: 'magic', power: 1.8, target: 'enemy'
  },
  thunder: {
    name: 'サンダー',
    desc: '雷撃魔法（魔法×2.2）',
    mpCost: 13, type: 'magic', power: 2.2, target: 'enemy'
  },
  iceSpear: {
    name: 'アイスランス',
    desc: '氷の槍（魔法×2.8）',
    mpCost: 18, type: 'magic', power: 2.8, target: 'enemy'
  },
  heal: {
    name: 'ヒール',
    desc: 'HPを35回復',
    mpCost: 10, type: 'heal', healAmount: 35, target: 'self'
  },
  ironWill: {
    name: 'アイアンウィル',
    desc: '1ターン防御力を大幅UP',
    mpCost: 6, type: 'buff_def', target: 'self'
  }
};

// ショップで販売するスキル
const SHOP_SKILLS = {
  fireball: { ...SKILLS.fireball, price: 80  },
  thunder:  { ...SKILLS.thunder,  price: 130 },
  iceSpear: { ...SKILLS.iceSpear, price: 180 },
  heal:     { ...SKILLS.heal,     price: 110 },
  ironWill: { ...SKILLS.ironWill, price: 90  }
};
