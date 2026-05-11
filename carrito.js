/**
 * carrito.js — Lógica de la página del carrito | Dimensión Tres
 * Requiere: config.js, cart.js (cargados antes en el HTML)
 */

// CONFIG viene de config.js cargado como script normal antes que este archivo
var TAX         = CONFIG.TAX_RATE;
var discountPct = 0; // porcentaje de descuento aplicado (0–1)

function formatMoney(value) {
  var amount = Number(value || 0);
  var hasCents = Math.abs(amount - Math.round(amount)) > 0.009;
  return (CONFIG.CURRENCY_SYMBOL || '$') + amount.toLocaleString('es-AR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  });
}

// PROMOS unificado desde CONFIG — usa la propiedad discount del objeto
var PROMOS = (function() {
  var out = {};
  Object.keys(CONFIG.PROMO_CODES).forEach(function(code) {
    out[code] = CONFIG.PROMO_CODES[code];
  });
  return out;
})();

function promoIsValid(promo) {
  if (!promo || promo.discount === undefined) return false;
  if (!promo.validUntil) return true;
  var expires = new Date(promo.validUntil + 'T23:59:59');
  return !isNaN(expires.getTime()) && expires >= new Date();
}

/* ─── RENDER ─────────────────────────────── */
function render() {
  var grid  = document.getElementById('cart-grid');
  var empty = document.getElementById('cart-empty');
  if (!grid || !empty) return;

  var items = CartStore.getAll();

  if (items.length === 0) {
    grid.style.display  = 'none';
    empty.style.display = 'flex';
    return;
  }

  grid.style.display  = '';
  empty.style.display = 'none';

  var tbody = document.getElementById('cart-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  items.forEach(function(item, idx) {
    var tr = buildRow(item);
    tr.style.animationDelay = (idx * 0.04) + 's';
    tbody.appendChild(tr);
    requestAnimationFrame(function() { tr.classList.add('row-in'); });
  });

  updateTotals();
}

/* ─── BUILD ROW ──────────────────────────── */
function buildRow(item) {
  var lineTotal = item.price * item.qty;
  var tr = document.createElement('tr');
  tr.className  = 'group transition-colors hover:bg-surface-container-high/50';
  tr.dataset.id = item.id;

  var meta = '';
  if (item.ref)                   meta += 'Ref: ' + item.ref;
  if (item.ref && item.category)  meta += ' | ';
  if (item.category)              meta += item.category;

  /* ── Celda principal ── */
  var mainCell = document.createElement('td');
  mainCell.className = 'px-4 md:px-6 py-6';

  var flexDiv = document.createElement('div');
  flexDiv.className = 'flex items-center gap-4';

  // Imagen
  var imgDiv = document.createElement('div');
  imgDiv.className = 'w-16 h-16 md:w-24 md:h-24 bg-surface-container-lowest flex-shrink-0 flex items-center justify-center p-2';
  var img = document.createElement('img');
  img.className = 'w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500';
  img.src = item.image || '';
  img.alt = item.name;
  img.onerror = function() { this.style.display = 'none'; };
  imgDiv.appendChild(img);

  // Info
  var infoDiv = document.createElement('div');
  var h3 = document.createElement('h3');
  h3.className = 'font-headline font-bold text-base md:text-lg leading-tight uppercase';
  h3.textContent = item.name;
  infoDiv.appendChild(h3);

  if (meta) {
    var metaP = document.createElement('p');
    metaP.className = 'text-xs text-on-surface-variant font-label mt-1';
    metaP.textContent = meta;
    infoDiv.appendChild(metaP);
  }

  var priceP = document.createElement('p');
  priceP.className = 'text-primary font-headline font-bold text-sm mt-1 md:hidden';
  priceP.textContent = formatMoney(lineTotal);
  infoDiv.appendChild(priceP);

  // Controles mobile
  var controlsDiv = document.createElement('div');
  controlsDiv.className = 'flex items-center gap-3 mt-3 md:hidden';

  var minusBtn = document.createElement('button');
  minusBtn.className = 'qty-btn';
  minusBtn.onclick = function() { changeQty(item.id, -1); };
  var minusSpan = document.createElement('span');
  minusSpan.className = 'material-symbols-outlined text-sm';
  minusSpan.textContent = 'remove';
  minusBtn.appendChild(minusSpan);
  controlsDiv.appendChild(minusBtn);

  var qtySpanMob = document.createElement('span');
  qtySpanMob.id = 'qty-mob-' + item.id;
  qtySpanMob.className = 'font-headline font-bold text-base w-4 text-center';
  qtySpanMob.textContent = item.qty;
  controlsDiv.appendChild(qtySpanMob);

  var plusBtn = document.createElement('button');
  plusBtn.className = 'qty-btn';
  plusBtn.onclick = function() { changeQty(item.id, 1); };
  var plusSpan = document.createElement('span');
  plusSpan.className = 'material-symbols-outlined text-sm';
  plusSpan.textContent = 'add';
  plusBtn.appendChild(plusSpan);
  controlsDiv.appendChild(plusBtn);

  infoDiv.appendChild(controlsDiv);
  flexDiv.appendChild(imgDiv);
  flexDiv.appendChild(infoDiv);
  mainCell.appendChild(flexDiv);
  tr.appendChild(mainCell);

  /* ── Celda cantidad desktop ── */
  var qtyCell = document.createElement('td');
  qtyCell.className = 'px-6 py-6 hidden md:table-cell';
  var qtyFlex = document.createElement('div');
  qtyFlex.className = 'flex items-center justify-center gap-3';

  var dMinusBtn = document.createElement('button');
  dMinusBtn.className = 'qty-btn';
  dMinusBtn.onclick = function() { changeQty(item.id, -1); };
  var dMinusSpan = document.createElement('span');
  dMinusSpan.className = 'material-symbols-outlined text-sm';
  dMinusSpan.textContent = 'remove';
  dMinusBtn.appendChild(dMinusSpan);
  qtyFlex.appendChild(dMinusBtn);

  var dQtySpan = document.createElement('span');
  dQtySpan.id = 'qty-' + item.id;
  dQtySpan.className = 'font-headline font-bold text-lg w-4 text-center';
  dQtySpan.textContent = item.qty;
  qtyFlex.appendChild(dQtySpan);

  var dPlusBtn = document.createElement('button');
  dPlusBtn.className = 'qty-btn';
  dPlusBtn.onclick = function() { changeQty(item.id, 1); };
  var dPlusSpan = document.createElement('span');
  dPlusSpan.className = 'material-symbols-outlined text-sm';
  dPlusSpan.textContent = 'add';
  dPlusBtn.appendChild(dPlusSpan);
  qtyFlex.appendChild(dPlusBtn);

  qtyCell.appendChild(qtyFlex);
  tr.appendChild(qtyCell);

  /* ── Celda precio desktop ── */
  var priceCell = document.createElement('td');
  priceCell.className = 'px-6 py-6 text-right hidden md:table-cell';
  var priceSpan = document.createElement('span');
  priceSpan.id = 'price-' + item.id;
  priceSpan.className = 'font-headline font-bold text-xl text-primary';
  priceSpan.textContent = formatMoney(lineTotal);
  priceCell.appendChild(priceSpan);
  tr.appendChild(priceCell);

  /* ── Celda eliminar ── */
  var deleteCell = document.createElement('td');
  deleteCell.className = 'px-4 md:px-6 py-6 text-right';
  var deleteBtn = document.createElement('button');
  deleteBtn.className = 'text-on-surface-variant hover:text-error transition-colors';
  deleteBtn.title = 'Eliminar';
  deleteBtn.onclick = function() { removeItem(item.id); };
  var deleteSpan = document.createElement('span');
  deleteSpan.className = 'material-symbols-outlined';
  deleteSpan.textContent = 'delete';
  deleteBtn.appendChild(deleteSpan);
  deleteCell.appendChild(deleteBtn);
  tr.appendChild(deleteCell);

  return tr; // ← FALTABA
}

/* ─── UPDATE TOTALS (función propia, separada de buildRow) ── */
function updateTotals() {
  var sub   = CartStore.getSubtotal();
  var disc  = sub * discountPct;
  var base  = sub - disc;
  var tax   = base * TAX;
  var total = base + tax;

  var elSub   = document.getElementById('sum-sub');
  var elTax   = document.getElementById('sum-tax');
  var elTotal = document.getElementById('sum-total');

  if (elSub)   elSub.textContent   = formatMoney(sub);
  if (elTax)   elTax.textContent   = formatMoney(tax);
  if (elTotal) {
    elTotal.textContent = formatMoney(total);
    elTotal.classList.remove('total-flash');
    void elTotal.offsetWidth;
    elTotal.classList.add('total-flash');
  }
}

/* ─── CAMBIAR CANTIDAD ───────────────────── */
function changeQty(id, delta) {
  CartStore.updateQty(id, delta);
  var item = CartStore.getAll().find(function(i) { return i.id === id; });
  if (!item) { animRemove(id); return; }

  var qEl = document.getElementById('qty-' + id);
  var pEl = document.getElementById('price-' + id);
  if (qEl) {
    qEl.textContent = item.qty;
    qEl.classList.remove('qty-pop');
    void qEl.offsetWidth;
    qEl.classList.add('qty-pop');
  }
  if (pEl) pEl.textContent = formatMoney(item.price * item.qty);

  var qMob = document.getElementById('qty-mob-' + id);
  if (qMob) qMob.textContent = item.qty;

  var row = document.querySelector('tr[data-id="' + id + '"]');
  if (row) {
    var mPrice = row.querySelector('p.text-primary');
    if (mPrice) mPrice.textContent = formatMoney(item.price * item.qty);
  }

  updateTotals();
  updateCartBadge();
}

/* ─── ELIMINAR CON ANIMACIÓN ─────────────── */
function animRemove(id) {
  var row = document.querySelector('tr[data-id="' + id + '"]');
  if (!row) return;
  row.classList.add('row-out');
  setTimeout(function() {
    row.remove();
    if (CartStore.getAll().length === 0) render();
    else { updateTotals(); updateCartBadge(); }
  }, 260);
}

function removeItem(id) { CartStore.remove(id); animRemove(id); }
function clearCartUI()  { CartStore.clear(); render(); updateCartBadge(); }

/* ─── CÓDIGO PROMO ───────────────────────── */
function applyPromo() {
  var input = document.getElementById('promo-input');
  var msg   = document.getElementById('promo-msg');
  if (!input || !msg) return;

  var code = input.value.trim().toUpperCase();
  if (!code) return;

  msg.classList.remove('hidden');
  if (promoIsValid(PROMOS[code])) {
    discountPct      = PROMOS[code].discount;
    msg.textContent  = '✓ ' + (discountPct * 100) + '% de descuento aplicado';
    msg.style.color  = '#8ff5ff';
  } else if (PROMOS[code]) {
    discountPct      = 0;
    msg.textContent  = '✕ Código vencido';
    msg.style.color  = '#ff716c';
  } else {
    discountPct      = 0;
    msg.textContent  = '✕ Código inválido';
    msg.style.color  = '#ff716c';
  }
  updateTotals();
}

/* ─── CHECKOUT WHATSAPP ──────────────────── */
function checkoutWhatsApp() {
  var items = CartStore.getAll();
  if (!items.length) return;

  var sub   = CartStore.getSubtotal();
  var disc  = sub * discountPct;
  var base  = sub - disc;
  var tax   = base * TAX;
  var total = base + tax;

  var lines = items.map(function(i) {
    return '• ' + i.name + ' x' + i.qty + ' — ' + formatMoney(i.price * i.qty);
  });
  lines.push('');
  if (discountPct > 0) lines.push('Descuento: -' + formatMoney(disc));
  lines.push('IVA (21%): ' + formatMoney(tax));
  lines.push('*TOTAL: ' + formatMoney(total) + '*');

  var text = '¡Hola! Quiero hacer un pedido en Dimensión Tres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493535000000';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

/* ─── INIT ───────────────────────────────── */
window.addEventListener('storage', function(e) { if (e.key === 'dt_cart_v1') render(); });
document.addEventListener('DOMContentLoaded', function() { render(); updateCartBadge(); });
