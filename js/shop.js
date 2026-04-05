'use strict';

// ============================================================
//  SHOP  ― 担当A が編集
// ============================================================
let shopTab = 'relics';

// ---- ランダムラインナップ生成 ----
function generateLineup() {
  // レリック: tier重み付き抽選で5個
  const relicPool = Object.entries(RELICS).map(([id, d]) => ({
    id, ...d, cat: 'relic',
    weight: ({ 1: 3, 2: 2, 3: 1 })[d.tier] ?? 1
  }));
  GS.shopLineup.relics = pickWeighted(relicPool, 5);

  // アイテム: 均等抽選で3個
  const itemPool = Object.entries(ITEMS).map(([id, d]) => ({ id, ...d, cat: 'item' }));
  GS.shopLineup.items = pickRandom(itemPool, 3);
}

function pickWeighted(pool, count) {
  const expanded = pool.flatMap(item => Array(item.weight).fill(item));
  shuffle(expanded);
  const seen = new Set();
  const result = [];
  for (const item of expanded) {
    if (!seen.has(item.id) && result.length < count) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

function pickRandom(pool, count) {
  const arr = [...pool];
  shuffle(arr);
  return arr.slice(0, count);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ---- ショップ初期化 ----
function initShop() {
  showScene('shop');
  shopTab = 'relics';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="relics"]').classList.add('active');
  generateLineup();
  renderShop();
}

// ---- 描画 ----
function renderShop() {
  const cont = document.getElementById('shop-items');
  cont.innerHTML = '';
  document.getElementById('shop-gold').textContent = `所持: ${GS.player.gold}G`;

  const entries = shopTab === 'relics'
    ? GS.shopLineup.relics
    : GS.shopLineup.items;

  entries.forEach(item => {
    const owned  = isOwned(item);
    const afford = GS.player.gold >= item.price;

    let btnLabel, btnDisabled;
    if (owned)        { btnLabel = '所持済'; btnDisabled = true; }
    else if (!afford) { btnLabel = 'G不足';  btnDisabled = true; }
    else              { btnLabel = '購　入'; btnDisabled = false; }

    const row = document.createElement('div');
    row.className = 'shop-item' + (owned ? ' owned' : '');
    row.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}${owned ? ' <span style="color:#888877">[所持]</span>' : ''}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <span class="item-price">${item.price}G</span>
      <button class="btn-buy" ${btnDisabled ? 'disabled' : ''}>${btnLabel}</button>`;

    if (!btnDisabled) {
      row.querySelector('.btn-buy').onclick = () => { doBuy(item); renderShop(); };
    }
    cont.appendChild(row);
  });
}

// ---- 所持判定 ----
function isOwned(item) {
  if (item.cat === 'relic') return GS.player.relics.some(r => r.id === item.id);
  return false; // アイテムは重複購入可能
}

// ---- 購入処理 ----
function doBuy(item) {
  GS.player.gold -= item.price;
  if (item.cat === 'relic') {
    GS.player.relics.push({ ...item });
    if (item.hpBonus) {
      GS.player.maxHp += item.hpBonus;
      GS.player.hp    += item.hpBonus;
    }
    if (item.mpBonus) {
      GS.player.maxMp += item.mpBonus;
      GS.player.mp    += item.mpBonus;
    }
  } else if (item.cat === 'item') {
    const ex = GS.player.inventory.find(e => e.id === item.id);
    if (ex) ex.count++; else GS.player.inventory.push({ id: item.id, count: 1 });
  }
}
