'use strict';

// ============================================================
//  ITEMS  ― 担当B が編集
// ============================================================
const ITEMS = {
  potion: {
    name: 'ポーション',     desc: 'HPを50回復',                           type: 'heal_hp',  value: 50,  price: 50
  },
  hiPotion: {
    name: 'ハイポーション', desc: 'HPを120回復',                          type: 'heal_hp',  value: 120, price: 100
  },
  ether: {
    name: 'エーテル',       desc: 'MPを30回復',                           type: 'heal_mp',  value: 30,  price: 40
  },
  bomb: {
    name: '爆弾',           desc: '敵に60固定ダメージ',                   type: 'damage',   value: 60,  price: 38
  },
  poisonVial: {
    name: '毒の小瓶',       desc: '敵を毒状態にする（毎ターン8ダメージ）', type: 'poison',   value: 8,   price: 32
  },
  revivalHerb: {
    name: '蘇生草',         desc: '戦闘不能時HP1で復活（使用済で保持）',  type: 'revival',  price: 160
  }
};
