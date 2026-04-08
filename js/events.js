'use strict';

// ============================================================
//  EVENTS  ― 担当C が編集
//  各階層のイベントプールと処理
// ============================================================

// ミミック敵データ
const MIMIC_ENEMY = {
  name: 'ミミック', sprite: 'default', color: '#cc8800',
  hp: 90, maxHp: 90, attack: 25, defense: 10,
  goldReward: 50, isBoss: false, bossSkills: [],
  poisoned: false, poisonDmg: 0
};

// ---- 乱数ヘルパー ----
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---- 階層別イベントプール ----
const FLOOR_EVENTS = {

  // ==================== 1 階層 ====================
  1: [
    {
      id: 'f1_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '古びた宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(5, 50);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f1_def_buff',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　守護の気配　！',
          desc: 'ダンジョンの加護を感じた。\n次の2戦闘の間，防御力が強化される。',
          choices: [
            {
              text: '進　む',
              disabled: false,
              effect() {
                GS.player.defBuffMult = 1.3;
                GS.player.defBuffRemain = 2;
                return '防御力が強化された！（次の2戦闘）';
              }
            }
          ]
        };
      }
    },

    {
      id: 'f1_rng_stat',
      oncePerFloor: false,
      getContent() {
        const isBuff = Math.random() < 0.5;
        const mult   = isBuff ? 1.4 : 0.7;
        const label  = isBuff ? '強化（×1.4）' : '弱体化（×0.7）';
        return {
          title: '！　運命の輝き　！',
          desc: `謎めいた光があなたを包もうとしている。\n受け入れると全ステータスが強化または弱体化される。\n（この階層にいる間のみ）`,
          choices: [
            {
              text: '受け入れる',
              disabled: false,
              effect() {
                GS.player.floorAtkMult = mult;
                GS.player.floorDefMult = mult;
                return isBuff
                  ? `全ステータスが強化された！（×${mult}）`
                  : `全ステータスが弱体化した…（×${mult}）`;
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '光をかわした。何も起きなかった。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f1_atk_buff',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　戦士の覚醒　！',
          desc: '戦意が高まってきた。\n次の2戦闘の間，攻撃力が強化される。',
          choices: [
            {
              text: '進　む',
              disabled: false,
              effect() {
                GS.player.atkBuffMult = 1.2;
                GS.player.atkBuffRemain = 2;
                return '攻撃力が強化された！（次の2戦闘）';
              }
            }
          ]
        };
      }
    },

    {
      id: 'f1_trap',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '古びた宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const dmg = 7;
                GS.player.hp = Math.max(1, GS.player.hp - dmg);
                return `トラップだった！　${dmg} ダメージを受けた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    }
  ],

  // ==================== 2 階層 ====================
  2: [
    {
      id: 'f2_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '重厚な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(10, 50);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f2_hp_gold',
      oncePerFloor: true,
      getContent() {
        const cost = Math.floor(GS.player.maxHp * 0.2);
        return {
          title: '！　血の盟約　！',
          desc: `悪魔がささやく。「HP${cost}と引き換えに，\nこの階層の全ゴールド報酬を2倍にしてやろう。」\n（この階層にいる間のみ）`,
          choices: [
            {
              text: '契約する',
              disabled: false,
              effect() {
                GS.player.hp = Math.max(1, GS.player.hp - cost);
                GS.player.goldDouble = true;
                return `HP${cost}を失った。ゴールド報酬が2倍になった！`;
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '悪魔の誘いを断った。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f2_strong_enemy',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　強敵の予感　！',
          desc: '前方から強大な気配を感じる。\n次の敵のHP・攻撃が1.3倍になるが，\nゴールド報酬も2倍になる。',
          choices: [
            {
              text: '受け入れる',
              disabled: false,
              effect() {
                GS.player.nextEnemyPowered = true;
                return '覚悟を決めた。次の敵は強化されているが，報酬も大きい！';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '引き返した。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f2_mp_free',
      oncePerFloor: false,
      getContent() {
        const cost = 20;
        const canAfford = GS.player.gold >= cost;
        return {
          title: '！　魔力解放の石　！',
          desc: `光る石を発見した。${cost}G で購入すると，\n次の3戦闘の間，MPを消費せずにスキルが使える。`,
          choices: [
            {
              text: `購入する（${cost}G）`,
              disabled: !canAfford,
              disabledMsg: 'G不足',
              effect() {
                GS.player.gold -= cost;
                GS.player.mpFree = true;
                GS.player.mpFreeRemain = 3;
                return `${cost}G を支払った。次の3戦闘はMP消費なし！`;
              }
            },
            {
              text: '購入しない',
              disabled: false,
              effect() { return '石を置いていった。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f2_trap_fall',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '重厚な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                // 効果は afterEffect で処理（descendFloor を呼ぶ）
                GS._trapFall = true;
                return '落とし穴だった！　次の階層へ落下した！\nHP・MPの回復なし，ショップなし。';
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f2_gold_shield',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　黄金の盾　！',
          desc: '金色に輝く魔方陣を発見した。\nこの階層にいる間，攻撃によるダメージを\nゴールドで肩代わりしてくれる。',
          choices: [
            {
              text: '受け入れる',
              disabled: false,
              effect() {
                GS.player.goldShield = true;
                return 'ゴールドシールドが発動した！（この階層中）';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '魔方陣を踏まずに進んだ。'; }
            }
          ]
        };
      }
    }
  ],

  // ==================== 3 階層 ====================
  3: [
    {
      id: 'f3_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '豪華な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(15, 80);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f3_gold_power_buff',
      oncePerFloor: true,
      getContent() {
        const cost = Math.floor(GS.player.gold * 0.3);
        return {
          title: '！　覇者の契約　！',
          desc: `古代の祭壇が光り輝く。\nゴールドの30%（${cost}G）を捧げると，\nこの階層の攻撃力・防御力が2倍になる！`,
          choices: [
            {
              text: `捧げる（${cost}G）`,
              disabled: cost === 0,
              disabledMsg: 'G不足',
              effect() {
                GS.player.gold -= cost;
                GS.player.floorAtkMult = 2;
                GS.player.floorDefMult = 2;
                return `${cost}G を捧げた！　攻撃力・防御力が2倍になった！`;
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '祭壇の前を通り過ぎた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f3_item_swap',
      oncePerFloor: false,
      getContent() {
        const hasItems = GS.player.inventory.length > 0;
        return {
          title: '！　奇妙な商人　！',
          desc: hasItems
            ? '怪しげな商人が現れた。\nアイテムを1つ渡すと，別のアイテムをくれるという。'
            : '怪しげな商人が現れた。\n…しかしアイテムを持っていないため，商談にならない。',
          choices: [
            {
              text: '交換する',
              disabled: !hasItems,
              disabledMsg: 'アイテムなし',
              effect() {
                // ランダムにアイテムを1つ消失
                const idx = Math.floor(Math.random() * GS.player.inventory.length);
                const lost = GS.player.inventory[idx];
                const lostItem = ITEMS[lost.id];
                lost.count--;
                if (lost.count <= 0) GS.player.inventory.splice(idx, 1);

                // ランダムに別のアイテムを獲得
                const itemKeys = Object.keys(ITEMS);
                const newId = itemKeys[Math.floor(Math.random() * itemKeys.length)];
                const ex = GS.player.inventory.find(e => e.id === newId);
                if (ex) ex.count++; else GS.player.inventory.push({ id: newId, count: 1 });

                return `${lostItem.name}を渡し，${ITEMS[newId].name}を手に入れた！`;
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '商人と別れた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f3_mimic',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '豪華な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                GS.forcedEnemy = { ...MIMIC_ENEMY };
                GS._mimicBattle = true;
                return 'ミミックだった！　戦闘開始！';
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f3_gold_power',
      oncePerFloor: true,
      getContent() {
        const stacks = Math.min(Math.floor(GS.player.gold / 25), 10);
        const mult   = Math.min(2, parseFloat(Math.pow(1.1, stacks).toFixed(3)));
        return {
          title: '！　富の力　！',
          desc: `ゴールドが力に変わる碑文を発見した。\n所持ゴールド${GS.player.gold}G → 現在攻撃力×${mult}（最大×2）\n（25Gにつき×1.1，ゴールド量に連動して変動，この階層中）`,
          choices: [
            {
              text: '力を得る',
              disabled: stacks === 0,
              disabledMsg: 'G不足（25G必要）',
              effect() {
                GS.player.goldPowerActive = true;
                return `碑文の力を得た！　ゴールド量に応じて攻撃力が変動する！（この階層中）`;
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '碑文の前を通り過ぎた。'; }
            }
          ]
        };
      }
    }
  ],

  // ==================== 4 階層 ====================
  4: [
    {
      id: 'f4_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '輝く宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(15, 80);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f4_mp_allstat',
      oncePerFloor: true,
      getContent() {
        const canUse = GS.player.mp > 0;
        return {
          title: '！　魔力解放　！',
          desc: `封印された魔方陣が輝いている。\nMP全てを解放すると，この階層の全ステータスが3倍になる！\n（この階層にいる間のみ）`,
          choices: [
            {
              text: '魔力を解放する',
              disabled: !canUse,
              disabledMsg: 'MPがない',
              effect() {
                GS.player.mp = 0;
                GS.player.floorAtkMult = 3;
                GS.player.floorDefMult = 3;
                return 'MPを全て解放した！　全ステータスが3倍になった！（この階層中）';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '魔方陣の前を通り過ぎた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f4_crit_buff',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　覇者の瞳　！',
          desc: '不思議な宝石が輝いている。\nこれを使うと次の2戦闘の間，\nクリティカル率が30%に上昇する！',
          choices: [
            {
              text: '宝石を使う',
              disabled: false,
              effect() {
                GS.player.critRate = 0.3;
                GS.player.critBuffRemain = 2;
                return '目が鋭くなった！　クリティカル率が30%に上昇！（次の2戦闘）';
              }
            }
          ]
        };
      }
    },

    {
      id: 'f4_trap_dmg',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '輝く宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                GS.player.damageTakenMult = Math.round(GS.player.damageTakenMult * 1.1 * 100) / 100;
                return `トラップだった！　呪いを受けた…受けるダメージが増加した！（この階層中）`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f4_pickpocket',
      oncePerFloor: false,
      getContent() {
        const lost = Math.floor(GS.player.gold * 0.5);
        return {
          title: '！　スリに遭った！　！',
          desc: `気づいたら財布が軽くなっていた。\nスリに遭ってしまった！\n所持ゴールドの50%（${lost}G）を失った！`,
          choices: [
            {
              text: '悔しい…',
              disabled: false,
              effect() {
                GS.player.gold -= lost;
                return `${lost}G を盗まれた！`;
              }
            }
          ]
        };
      }
    }
  ],

  // ==================== 5 階層 ====================
  5: [
    {
      id: 'f5_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '重厚な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(15, 80);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f5_atk_curse',
      oncePerFloor: true,
      getContent() {
        return {
          title: '！　血の鎧　！',
          desc: '呪われた鎧が置かれている。\n装備すると攻撃力が2倍になるが，\n毎ターン10ダメージを受け続ける。\n（この階層にいる間のみ）',
          choices: [
            {
              text: '装備する',
              disabled: false,
              effect() {
                GS.player.floorAtkMult *= 2;
                GS.player.turnDmg += 10;
                return '呪われた鎧を装備した！　攻撃力が2倍になったが，毎ターン10ダメージを受ける！';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '鎧を置いていった。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f5_atk_def_trade',
      oncePerFloor: true,
      getContent() {
        return {
          title: '！　攻の契約　！',
          desc: '古代の契約書が見つかった。\n攻撃力が1.5倍になるが，防御力は0.7倍になる。\n（この階層にいる間のみ）',
          choices: [
            {
              text: '契約する',
              disabled: false,
              effect() {
                GS.player.floorAtkMult *= 1.5;
                GS.player.floorDefMult *= 0.7;
                return '攻の契約を結んだ！　攻撃力×1.5，防御力×0.7！（この階層中）';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '契約書を破り捨てた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f5_def_atk_trade',
      oncePerFloor: true,
      getContent() {
        return {
          title: '！　守の契約　！',
          desc: '古代の契約書が見つかった。\n防御力が2倍になるが，攻撃力は0.7倍になる。\n（この階層にいる間のみ）',
          choices: [
            {
              text: '契約する',
              disabled: false,
              effect() {
                GS.player.floorAtkMult *= 0.7;
                GS.player.floorDefMult *= 2;
                return '守の契約を結んだ！　防御力×2，攻撃力×0.7！（この階層中）';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '契約書を破り捨てた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f5_trap_equip',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '重厚な宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                if (GS.player.relics.length === 0) {
                  return 'トラップだった！　しかし装備がなく，難を逃れた。';
                }
                const idx  = Math.floor(Math.random() * GS.player.relics.length);
                const lost = GS.player.relics.splice(idx, 1)[0];
                if (lost.hpBonus) {
                  GS.player.maxHp -= lost.hpBonus;
                  GS.player.hp = Math.min(GS.player.hp, GS.player.maxHp);
                }
                if (lost.mpBonus) {
                  GS.player.maxMp -= lost.mpBonus;
                  GS.player.mp = Math.min(GS.player.mp, GS.player.maxMp);
                }
                return `トラップだった！　${lost.name}を失った！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    }
  ],

  // ==================== 6 階層 ====================
  6: [
    {
      id: 'f6_treasure',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '古びた宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                const gold = randInt(15, 80);
                GS.player.gold += gold;
                GS.totalGold += gold;
                return `宝箱を開けた！　${gold}G を手に入れた！`;
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f6_challenge',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　強敵の試練　！',
          desc: '前方から圧倒的な気配を感じる。\n次の敵の攻撃・防御が1.5倍になるが，\n勝利すれば自身のステータスが永続的に1.3倍になる！',
          choices: [
            {
              text: '試練を受ける',
              disabled: false,
              effect() {
                GS.player.challengeBattle = true;
                return '覚悟を決めた。次の強敵を倒せば，ステータスが永続上昇する！';
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '気配を避けて進んだ。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f6_hp_low_atk',
      oncePerFloor: true,
      getContent() {
        return {
          title: '！　瀕死の覚醒　！',
          desc: '血で書かれた魔法陣を発見した。\nHPが低くなるほど攻撃力が上がる呪いを受ける。\n（HP0で最大×2，この階層にいる間のみ）',
          choices: [
            {
              text: '魔法陣を踏む',
              disabled: false,
              effect() {
                GS.player.hpLowAtkActive = true;
                return '魔法陣の呪いを受けた！　HPが低いほど攻撃力が上がる！（この階層中）';
              }
            },
            {
              text: '踏まない',
              disabled: false,
              effect() { return '魔法陣を避けて進んだ。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f6_skill_gamble',
      oncePerFloor: true,
      getContent() {
        return {
          title: '！　スキルの賭け　！',
          desc: '謎めいた像が立っている。\n50%の確率でスキル効果が2倍になるが，\n50%の確率でスキルが使えなくなる。\n（この階層にいる間のみ）',
          choices: [
            {
              text: '賭ける',
              disabled: false,
              effect() {
                if (Math.random() < 0.5) {
                  GS.player.skillPowerMult = 2;
                  return '幸運！　スキルの効果が2倍になった！（この階層中）';
                } else {
                  GS.player.skillDisabled = true;
                  return '不運…　スキルが使用不能になった！（この階層中）';
                }
              }
            },
            {
              text: '断　る',
              disabled: false,
              effect() { return '像の前を通り過ぎた。'; }
            }
          ]
        };
      }
    },

    {
      id: 'f6_trap_mp',
      oncePerFloor: false,
      getContent() {
        return {
          title: '！　宝　箱　！',
          desc: '古びた宝箱を発見した。\n開けてみますか？',
          choices: [
            {
              text: '宝箱を開ける',
              disabled: false,
              effect() {
                GS.player.mpCostMult *= 2;
                return 'トラップだった！　呪いを受けた…スキルのMP消費が2倍になった！（この階層中）';
              }
            },
            {
              text: '開けない',
              disabled: false,
              effect() { return '宝箱をそっと閉じた。'; }
            }
          ]
        };
      }
    }
  ]
};

// ============================================================
//  initEvent  ― initFloorSelect から呼ばれる
// ============================================================
function initEvent() {
  const pool = (FLOOR_EVENTS[GS.floor] || []).filter(ev => {
    return !(ev.oncePerFloor && GS.floorEventsUsed.has(ev.id));
  });

  if (pool.length === 0) {
    // イベントがなければ戦闘へフォールバック
    initBattle();
    return;
  }

  const ev = pool[Math.floor(Math.random() * pool.length)];
  if (ev.oncePerFloor) GS.floorEventsUsed.add(ev.id);

  const content = ev.getContent();
  document.getElementById('event-title').textContent = content.title;
  document.getElementById('event-description').textContent = content.desc;

  const choicesDiv = document.getElementById('event-choices');
  choicesDiv.innerHTML = '';

  content.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn event-choice-btn';
    btn.textContent = choice.disabled && choice.disabledMsg
      ? `${choice.text}（${choice.disabledMsg}）`
      : choice.text;
    btn.disabled = !!choice.disabled;

    if (!choice.disabled) {
      btn.onclick = () => {
        // 選択肢を無効化（二度押し防止）
        choicesDiv.querySelectorAll('button').forEach(b => b.disabled = true);

        const resultMsg = choice.effect ? choice.effect() : '';

        if (resultMsg) {
          document.getElementById('event-description').textContent = resultMsg;
        }

        const next = _resolveAfterEvent();
        setTimeout(next, resultMsg ? 900 : 0);
      };
    }

    choicesDiv.appendChild(btn);
  });

  showScene('event');
}

// 特殊フラグを処理して次のシーンへ
function _resolveAfterEvent() {
  if (GS._trapFall) {
    GS._trapFall = false;
    return () => descendFloor(true);
  }
  if (GS._mimicBattle) {
    GS._mimicBattle = false;
    return () => initBattle();
  }
  return () => initFloorSelect();
}
