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

  // ----- Floor 4 -----
  golem: {
    name: 'ゴーレム', sprite: 'golem', color: '#888899',
    hp: 145, maxHp: 145, mp: 0, maxMp: 0,
    attack: 40, defense: 28,
    goldReward: 65, isBoss: false, bossSkills: []
  },
  vampire: {
    name: 'ヴァンパイア', sprite: 'vampire', color: '#221133',
    hp: 120, maxHp: 120, mp: 0, maxMp: 0,
    attack: 44, defense: 18,
    goldReward: 72, isBoss: false, bossSkills: []
  },
  lizardman: {
    name: 'リザードマン', sprite: 'lizardman', color: '#3a6633',
    hp: 135, maxHp: 135, mp: 0, maxMp: 0,
    attack: 38, defense: 24,
    goldReward: 60, isBoss: false, bossSkills: []
  },

  // ----- Floor 5 -----
  demon: {
    name: 'デーモン', sprite: 'demon', color: '#881122',
    hp: 185, maxHp: 185, mp: 0, maxMp: 0,
    attack: 52, defense: 30,
    goldReward: 88, isBoss: false, bossSkills: []
  },
  medusa: {
    name: 'メデューサ', sprite: 'medusa', color: '#335544',
    hp: 160, maxHp: 160, mp: 0, maxMp: 0,
    attack: 56, defense: 22,
    goldReward: 95, isBoss: false, bossSkills: []
  },
  wyvern: {
    name: 'ワイバーン', sprite: 'wyvern', color: '#446633',
    hp: 175, maxHp: 175, mp: 0, maxMp: 0,
    attack: 50, defense: 28,
    goldReward: 82, isBoss: false, bossSkills: []
  },

  // ----- Floor 6 -----
  deathKnight: {
    name: 'デスナイト', sprite: 'deathKnight', color: '#0a0a1a',
    hp: 240, maxHp: 240, mp: 0, maxMp: 0,
    attack: 62, defense: 46,
    goldReward: 125, isBoss: false, bossSkills: []
  },
  archMage: {
    name: 'アークメイジ', sprite: 'archMage', color: '#331155',
    hp: 200, maxHp: 200, mp: 0, maxMp: 0,
    attack: 70, defense: 30,
    goldReward: 138, isBoss: false, bossSkills: []
  },
  chimera: {
    name: 'キマイラ', sprite: 'chimera', color: '#885522',
    hp: 255, maxHp: 255, mp: 0, maxMp: 0,
    attack: 60, defense: 40,
    goldReward: 118, isBoss: false, bossSkills: []
  },

  // ----- Floor 7 BOSS -----
  dragon: {
    name: '龍神 ヴァルムドラグ', sprite: 'dragon', color: '#cc2222',
    hp: 500, maxHp: 500, mp: 60, maxMp: 60,
    attack: 65, defense: 38,
    goldReward: 500, isBoss: true,
    bossSkills: ['dragonBreath', 'tailSwipe', 'dragonRoar']
  }
};

const FLOOR_ENEMIES = {
  1: ['slime', 'bat', 'goblin'],
  2: ['wolf', 'orc', 'skeleton'],
  3: ['troll', 'darkMage', 'darkKnight'],
  4: ['golem', 'vampire', 'lizardman'],
  5: ['demon', 'medusa', 'wyvern'],
  6: ['deathKnight', 'archMage', 'chimera'],
  7: ['dragon']
};
