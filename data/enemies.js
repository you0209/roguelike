'use strict';

// ============================================================
//  ENEMIES  ― 担当B が編集
// ============================================================
const ENEMIES = {
  // ----- Floor 1 -----
  slime: {
    name: 'スライム', sprite: 'slime', color: '#4aaf4a',
    hp: 35, maxHp: 35, mp: 0, maxMp: 0,
    attack: 8, defense: 3,
    goldReward: 12, isBoss: false, bossSkills: []
  },
  bat: {
    name: 'コウモリ', sprite: 'bat', color: '#6644aa',
    hp: 28, maxHp: 28, mp: 0, maxMp: 0,
    attack: 11, defense: 2,
    goldReward: 14, isBoss: false, bossSkills: []
  },
  goblin: {
    name: 'ゴブリン', sprite: 'goblin', color: '#44aa44',
    hp: 45, maxHp: 45, mp: 0, maxMp: 0,
    attack: 13, defense: 5,
    goldReward: 18, isBoss: false, bossSkills: []
  },

  // ----- Floor 2 -----
  wolf: {
    name: 'ウルフ', sprite: 'wolf', color: '#8888aa',
    hp: 60, maxHp: 60, mp: 0, maxMp: 0,
    attack: 20, defense: 7,
    goldReward: 24, isBoss: false, bossSkills: []
  },
  orc: {
    name: 'オーク', sprite: 'orc', color: '#558855',
    hp: 78, maxHp: 78, mp: 0, maxMp: 0,
    attack: 22, defense: 12,
    goldReward: 28, isBoss: false, bossSkills: []
  },
  skeleton: {
    name: 'スケルトン', sprite: 'skeleton', color: '#ddddcc',
    hp: 55, maxHp: 55, mp: 10, maxMp: 10,
    attack: 18, defense: 8,
    goldReward: 26, isBoss: false, bossSkills: []
  },

  // ----- Floor 3 -----
  troll: {
    name: 'トロル', sprite: 'troll', color: '#887744',
    hp: 110, maxHp: 110, mp: 0, maxMp: 0,
    attack: 30, defense: 16,
    goldReward: 38, isBoss: false, bossSkills: []
  },
  darkMage: {
    name: 'ダークメイジ', sprite: 'mage', color: '#9933cc',
    hp: 75, maxHp: 75, mp: 30, maxMp: 30,
    attack: 35, defense: 9,
    goldReward: 44, isBoss: false, bossSkills: []
  },
  darkKnight: {
    name: 'ダークナイト', sprite: 'knight', color: '#333366',
    hp: 95, maxHp: 95, mp: 0, maxMp: 0,
    attack: 27, defense: 22,
    goldReward: 48, isBoss: false, bossSkills: []
  },

  // ----- Floor 4 BOSS -----
  dragon: {
    name: '龍神 ヴァルムドラグ', sprite: 'dragon', color: '#cc2222',
    hp: 320, maxHp: 320, mp: 60, maxMp: 60,
    attack: 48, defense: 28,
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
