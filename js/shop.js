'use strict';

// ============================================================
//  SHOP  ― 担当A が編集
// ============================================================
let shopTab = 'weapons';

function initShop() {
  showScene('shop');
  shopTab = 'weapons';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="weapons"]').classList.add('active');
  renderShop();
}

function renderShop() {
  const cont = document.getElementById('shop-items');
  cont.innerHTML = '';
  document.getElementById('shop-gold').textContent = `所持: ${GS.player.gold}G`;

  let entries = [];
  if (shopTab === 'weapons') {
    entries = Object.entries(WEAPONS).map(([id, d]) => ({ id, ...d, cat: 'weapon' }));
  } else if (shopTab === 'armors') {
    entries = Object.entries(ARMORS).map(([id, d]) => ({ id, ...d, cat: 'armor' }));
  } else if (shopTab === 'skills') {
    entries = Object.entries(SHOP_SKILLS).map(([id, d]) => ({ id, ...d, cat: 'skill' }));
  } else if (shopTab === 'items') {
    entries = Object.entries(ITEMS).map(([id, d]) => ({ id, ...d, cat: 'item' }));
  }

  entries.forEach(item => {
    const owned  = isOwned(item);
    const afford = GS.player.gold >= item.price;

    const row = document.createElement('div');
    row.className = 'shop-item' + (owned ? ' owned' : '');
    row.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}${owned ? ' <span style="color:#888877">[所持]</span>' : ''}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <span class="item-price">${item.price}G</span>
      <button class="btn-buy" ${owned || !afford ? 'disabled' : ''}>
        ${owned ? '購入済' : !afford ? 'G不足' : '購　入'}
      </button>`;

    if (!owned && afford) {
      row.querySelector('.btn-buy').onclick = () => { doBuy(item); renderShop(); };
    }
    cont.appendChild(row);
  });
}

function isOwned(item) {
  const p = GS.player;
  if (item.cat === 'weapon') return p.weapon && p.weapon.id === item.id;
  if (item.cat === 'armor')  return p.armor  && p.armor.id  === item.id;
  if (item.cat === 'skill')  return p.skills.includes(item.id);
  return false;
}

function doBuy(item) {
  GS.player.gold -= item.price;
  if (item.cat === 'weapon') {
    GS.player.weapon = { ...item };
  } else if (item.cat === 'armor') {
    if (GS.player.armor && GS.player.armor.mpBonus) {
      GS.player.maxMp -= GS.player.armor.mpBonus;
      GS.player.mp = Math.min(GS.player.mp, GS.player.maxMp);
    }
    GS.player.armor = { ...item };
    if (item.mpBonus) {
      GS.player.maxMp += item.mpBonus;
      GS.player.mp    += item.mpBonus;
    }
  } else if (item.cat === 'skill') {
    GS.player.skills.push(item.id);
  } else if (item.cat === 'item') {
    const ex = GS.player.inventory.find(e => e.id === item.id);
    if (ex) ex.count++; else GS.player.inventory.push({ id: item.id, count: 1 });
  }
}
