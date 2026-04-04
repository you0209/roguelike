'use strict';

// ============================================================
//  ENEMIES
// ============================================================
const ENEMIES = {
  // ----- Floor 1 -----
  slime: {
    name: 'スライム', sprite: 'slime', color: '#4aaf4a',
    hp: 35, maxHp: 35, mp: 0, maxMp: 0,
    attack: 8, defense: 3, speed: 5,
    goldReward: 12, isBoss: false, bossSkills: []
  },
  bat: {
    name: 'コウモリ', sprite: 'bat', color: '#6644aa',
    hp: 28, maxHp: 28, mp: 0, maxMp: 0,
    attack: 11, defense: 2, speed: 14,
    goldReward: 14, isBoss: false, bossSkills: []
  },
  goblin: {
    name: 'ゴブリン', sprite: 'goblin', color: '#44aa44',
    hp: 45, maxHp: 45, mp: 0, maxMp: 0,
    attack: 13, defense: 5, speed: 8,
    goldReward: 18, isBoss: false, bossSkills: []
  },

  // ----- Floor 2 -----
  wolf: {
    name: 'ウルフ', sprite: 'wolf', color: '#8888aa',
    hp: 60, maxHp: 60, mp: 0, maxMp: 0,
    attack: 20, defense: 7, speed: 15,
    goldReward: 24, isBoss: false, bossSkills: []
  },
  orc: {
    name: 'オーク', sprite: 'orc', color: '#558855',
    hp: 78, maxHp: 78, mp: 0, maxMp: 0,
    attack: 22, defense: 12, speed: 6,
    goldReward: 28, isBoss: false, bossSkills: []
  },
  skeleton: {
    name: 'スケルトン', sprite: 'skeleton', color: '#ddddcc',
    hp: 55, maxHp: 55, mp: 10, maxMp: 10,
    attack: 18, defense: 8, speed: 10,
    goldReward: 26, isBoss: false, bossSkills: []
  },

  // ----- Floor 3 -----
  troll: {
    name: 'トロル', sprite: 'troll', color: '#887744',
    hp: 110, maxHp: 110, mp: 0, maxMp: 0,
    attack: 30, defense: 16, speed: 5,
    goldReward: 38, isBoss: false, bossSkills: []
  },
  darkMage: {
    name: 'ダークメイジ', sprite: 'mage', color: '#9933cc',
    hp: 75, maxHp: 75, mp: 30, maxMp: 30,
    attack: 35, defense: 9, speed: 12,
    goldReward: 44, isBoss: false, bossSkills: []
  },
  darkKnight: {
    name: 'ダークナイト', sprite: 'knight', color: '#333366',
    hp: 95, maxHp: 95, mp: 0, maxMp: 0,
    attack: 27, defense: 22, speed: 8,
    goldReward: 48, isBoss: false, bossSkills: []
  },

  // ----- Floor 4 BOSS -----
  dragon: {
    name: '龍神 ヴァルムドラグ', sprite: 'dragon', color: '#cc2222',
    hp: 320, maxHp: 320, mp: 60, maxMp: 60,
    attack: 48, defense: 28, speed: 10,
    goldReward: 300, isBoss: true,
    bossSkills: ['dragonBreath', 'tailSwipe', 'dragonRoar']
  }
};

const FLOOR_ENEMIES = {
  1: ['slime', 'bat', 'goblin'],
  2: ['wolf', 'orc', 'skeleton'],
  3: ['troll', 'darkMage', 'darkKnight'],
  4: ['dragon']
};

// ============================================================
//  SKILLS  (player)
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

// ============================================================
//  CONSUMABLE ITEMS
// ============================================================
const ITEMS = {
  potion: {
    name: 'ポーション',       desc: 'HPを50回復',            type: 'heal_hp', value: 50,  price: 50
  },
  hiPotion: {
    name: 'ハイポーション',   desc: 'HPを120回復',           type: 'heal_hp', value: 120, price: 100
  },
  ether: {
    name: 'エーテル',         desc: 'MPを30回復',            type: 'heal_mp', value: 30,  price: 40
  },
  bomb: {
    name: '爆弾',             desc: '敵に60固定ダメージ',    type: 'damage',  value: 60,  price: 38
  },
  poisonVial: {
    name: '毒の小瓶',         desc: '敵を毒状態にする（毎ターン8ダメージ）', type: 'poison', value: 8, price: 32
  },
  revivalHerb: {
    name: '蘇生草',           desc: '戦闘不能時HP1で復活（使用済で保持）', type: 'revival', price: 160
  }
};

// ============================================================
//  WEAPONS
// ============================================================
const WEAPONS = {
  ironSword: {
    name: '鉄の剣',   desc: '攻撃力+8',          attackBonus: 8,  defenseBonus: 0, speedBonus: 0, mpBonus: 0, price: 60
  },
  steelSword: {
    name: '鋼の剣',   desc: '攻撃力+16',         attackBonus: 16, defenseBonus: 0, speedBonus: 0, mpBonus: 0, price: 120
  },
  flameSword: {
    name: '炎の剣',   desc: '攻撃力+26',         attackBonus: 26, defenseBonus: 0, speedBonus: 0, mpBonus: 0, price: 220
  },
  shadowBlade: {
    name: '影の刃',   desc: '攻撃力+20 / 速さ+6', attackBonus: 20, defenseBonus: 0, speedBonus: 6, mpBonus: 0, price: 200
  }
};

// ============================================================
//  ARMORS
// ============================================================
const ARMORS = {
  leatherArmor: {
    name: '革の鎧',       desc: '防御力+5',              attackBonus: 0, defenseBonus: 5,  speedBonus: 0, mpBonus: 0,  price: 50
  },
  chainMail: {
    name: 'チェインメイル', desc: '防御力+12',            attackBonus: 0, defenseBonus: 12, speedBonus: 0, mpBonus: 0,  price: 100
  },
  ironArmor: {
    name: '鉄の鎧',       desc: '防御力+22',             attackBonus: 0, defenseBonus: 22, speedBonus: 0, mpBonus: 0,  price: 180
  },
  mageRobe: {
    name: '魔法のローブ', desc: '防御力+8 / MP上限+20',  attackBonus: 0, defenseBonus: 8,  speedBonus: 0, mpBonus: 20, price: 160
  }
};

// ============================================================
//  SHOP SKILL ITEMS  (skills sold in shop)
// ============================================================
const SHOP_SKILLS = {
  fireball: { ...SKILLS.fireball, price: 80 },
  thunder:  { ...SKILLS.thunder,  price: 130 },
  iceSpear: { ...SKILLS.iceSpear, price: 180 },
  heal:     { ...SKILLS.heal,     price: 110 },
  ironWill: { ...SKILLS.ironWill, price: 90  }
};
