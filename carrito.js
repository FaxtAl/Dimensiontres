/**
 * carrito.js — Lógica de la página del carrito | Dimensión Tres
 * Requiere: config.js, cart.js (cargados antes en el HTML)
 */

// CONFIG viene de config.js cargado como script normal antes que este archivo.
// Los precios que llegan desde Access ya incluyen IVA, asi que el carrito no suma impuesto extra.
var TAX         = 0;
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

function calculateCartTotals() {
  var sub = CartStore.getSubtotal();
  var disc = sub * discountPct;
  var base = sub - disc;
  var tax = 0;
  var total = base;

  return {
    subtotal: sub,
    discount: disc,
    base: base,
    iva: tax,
    total: total
  };
}

function getCartStockLabel(item) {
  if (typeof CartStore !== 'undefined' && typeof CartStore.getStockLabel === 'function') {
    return CartStore.getStockLabel(item);
  }
  var stock = item && item.stock !== undefined && item.stock !== null ? Number(item.stock) : null;
  return stock !== null && stock > 0 ? 'Stock ' + stock : 'Consultar';
}

function showCartNotice(message) {
  if (typeof cartToastMessage === 'function') {
    cartToastMessage(message, 'error');
    return;
  }
  alert(message);
}

function cleanCartText(value) {
  return String(value || '')
    .replace(/\bCodigo\b/gi, 'Código')
    .replace(/\bPerifericos\b/gi, 'Periféricos')
    .replace(/\bCatalogo\b/gi, 'Catálogo')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCartItemMeta(item) {
  var category = cleanCartText(item.sourceLabel || item.category || '');
  var codeText = cleanCartText(item.codigo || item.code || item.ref || '');
  var codeMatch = codeText.match(/[0-9]{5,}/);
  var parts = [];

  if (category) parts.push(category);
  if (codeMatch) parts.push('Código ' + codeMatch[0]);

  return parts.join(' · ');
}

/* ─── RENDER ─────────────────────────────── */
async function hydrateCartImages() {
  if (!window.SupabaseStore || !window.SupabaseStore.fetchAccessProductById || !CartStore.replaceAll) {
    return false;
  }

  var items = CartStore.getAll();
  if (!items.length) return false;
  var changed = false;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.image) continue;

    var productId = item.accessId || item.id_productos || '';
    if (!productId) {
      var match = String(item.id || '').match(/^access-(.+)$/);
      productId = match ? match[1] : '';
    }
    if (!productId) continue;

    try {
      var product = await window.SupabaseStore.fetchAccessProductById(productId);
      if (!product || !product.image) continue;

      item.image = product.image;
      item.accessId = product.accessId || product.id || item.accessId || productId;
      item.codigo = item.codigo || product.codigo || product.code || '';
      item.code = item.code || product.code || product.codigo || '';
      item.sourceLabel = item.sourceLabel || product.sourceLabel || '';
      item.description = item.description || product.description || product.subtitle || '';
      if ((item.stock === undefined || item.stock === null || item.stock === '') && product.stock !== undefined) {
        item.stock = product.stock;
      }
      changed = true;
    } catch (error) {
      console.warn('No se pudo completar la imagen del carrito:', error);
    }
  }

  if (changed) CartStore.replaceAll(items);
  return changed;
}

function render() {
  var grid  = document.getElementById('cart-grid');
  var empty = document.getElementById('cart-empty');
  if (!grid || !empty) return;

  if (CartStore.removeByOrderItems && CartStore.removeByOrderItems() > 0) {
    showCartNotice('Sacamos del carrito los productos a pedido. Consultanos por WhatsApp para reservarlos.');
  }

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
  tr.className  = 'cart-row group transition-colors hover:bg-surface-container-high/50';
  tr.dataset.id = item.id;

  var meta = getCartItemMeta(item);

  /* ── Celda principal ── */
  var mainCell = document.createElement('td');
  mainCell.className = 'cart-main-cell px-4 md:px-6 py-6';

  var flexDiv = document.createElement('div');
  flexDiv.className = 'cart-item-layout flex items-center gap-4';

  // Imagen
  var imgDiv = document.createElement('div');
  imgDiv.className = 'cart-image-box w-16 h-16 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center p-2';
  var img = document.createElement('img');
  img.className = 'w-full h-full object-contain transition-all duration-500';
  img.src = item.image || '';
  img.alt = item.name;
  img.onerror = function() { this.style.display = 'none'; };
  imgDiv.appendChild(img);

  // Info
  var infoDiv = document.createElement('div');
  infoDiv.className = 'cart-item-info';
  var h3 = document.createElement('h3');
  h3.className = 'cart-item-title font-headline font-bold text-base md:text-lg leading-tight uppercase';
  h3.textContent = cleanCartText(item.name);
  infoDiv.appendChild(h3);

  if (meta) {
    var metaP = document.createElement('p');
    metaP.className = 'cart-item-meta text-xs text-on-surface-variant font-label mt-1';
    metaP.textContent = meta;
    infoDiv.appendChild(metaP);
  }

  var stockP = document.createElement('p');
  stockP.className = 'text-xs font-label mt-1';
  stockP.style.color = '#8ff5ff';
  stockP.textContent = getCartStockLabel(item);
  infoDiv.appendChild(stockP);

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
  qtyCell.className = 'cart-qty-cell px-6 py-6 hidden md:table-cell';
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
  priceCell.className = 'cart-price-cell px-6 py-6 text-right hidden md:table-cell';
  var priceSpan = document.createElement('span');
  priceSpan.id = 'price-' + item.id;
  priceSpan.className = 'font-headline font-bold text-xl text-primary';
  priceSpan.textContent = formatMoney(lineTotal);
  priceCell.appendChild(priceSpan);
  tr.appendChild(priceCell);

  /* ── Celda eliminar ── */
  var deleteCell = document.createElement('td');
  deleteCell.className = 'cart-delete-cell px-4 md:px-6 py-6 text-right';
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
  var totals = calculateCartTotals();
  var productsTotal = totals.subtotal;
  var discountTotal = totals.discount;

  var elSub   = document.getElementById('sum-sub');
  var elDiscountRow = document.getElementById('discount-row');
  var elDiscount = document.getElementById('sum-discount');
  var elTotal = document.getElementById('sum-total');

  if (elSub)   elSub.textContent   = formatMoney(productsTotal);
  if (elDiscountRow && elDiscount) {
    elDiscountRow.classList.toggle('hidden', discountTotal <= 0);
    elDiscountRow.classList.toggle('flex', discountTotal > 0);
    elDiscount.textContent = '-' + formatMoney(discountTotal);
  }
  if (elTotal) {
    elTotal.textContent = formatMoney(totals.total);
    elTotal.classList.remove('total-flash');
    void elTotal.offsetWidth;
    elTotal.classList.add('total-flash');
  }
}

/* ─── CAMBIAR CANTIDAD ───────────────────── */
function changeQty(id, delta) {
  var result = CartStore.updateQty(id, delta);
  if (result && !result.ok && result.reason === 'pedido') {
    showCartNotice('Este producto es a pedido. Consultanos para reservarlo.');
    return;
  }
  if (result && !result.ok && result.reason === 'stock') {
    showCartNotice('No hay suficiente stock. Disponible: ' + result.available + '.');
    return;
  }

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

function cartHasByOrderItems(items) {
  return (items || []).some(function(item) {
    return typeof isByOrderProduct === 'function' && isByOrderProduct(item);
  });
}

function warnByOrderCheckout() {
  showCartNotice('Tenes productos a pedido. Sacalos del carrito y consultanos por WhatsApp para reservarlos.');
}

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
  var total = base;

  var lines = items.map(function(i) {
    return '• ' + i.name + ' x' + i.qty + ' — ' + formatMoney(i.price * i.qty);
  });
  lines.push('');
  if (discountPct > 0) lines.push('Descuento: -' + formatMoney(disc));
  lines.push('*TOTAL: ' + formatMoney(total) + '*');

  var text = '¡Hola! Quiero hacer un pedido en DimensionTres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493534019085';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

function checkoutUnavailable(methodName) {
  alert(methodName + ' queda para el siguiente paso. Para 3 o 6 cuotas lo conectamos con Getnet.');
}

async function fetchGetnetOptions(total) {
  var response = await fetch('api/getnet-installments.php?amount=' + encodeURIComponent(total), {
    headers: { 'Accept': 'application/json' }
  });
  var raw = await response.text();
  var data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch (error) {}
  if (!response.ok || !data || !data.ok) {
    throw new Error((data && data.error) || raw.slice(0, 180) || ('HTTP ' + response.status));
  }
  return data.options || [];
}

function chooseGetnetInstallments(options) {
  var lines = ['Elegí cuotas para Getnet: 3 o 6', ''];
  options.forEach(function(option) {
    lines.push(
      option.installments + ' cuotas: ' +
      formatMoney(option.installment_amount) + ' c/u - final ' +
      formatMoney(option.total) +
      (option.rate_percent > 0 ? ' (' + option.rate_percent + '%)' : '')
    );
  });

  var selected = prompt(lines.join('\n'), '3');
  if (selected === null) return null;
  selected = String(selected).trim();
  var option = options.find(function(item) { return String(item.installments) === selected; });
  if (!option) {
    alert('Por ahora Getnet está preparado solo para 3 o 6 cuotas.');
    return null;
  }
  return option;
}

async function checkoutGetnet(button) {
  var totals = calculateCartTotals();
  var options = [];
  try {
    options = await fetchGetnetOptions(totals.total);
  } catch (error) {
    console.warn('No se pudieron leer cuotas Getnet:', error);
    options = [
      { installments: 3, rate_percent: 0, base_total: totals.total, surcharge: 0, total: totals.total, installment_amount: Math.ceil((totals.total / 3) * 100) / 100 },
      { installments: 6, rate_percent: 0, base_total: totals.total, surcharge: 0, total: totals.total, installment_amount: Math.ceil((totals.total / 6) * 100) / 100 }
    ];
  }

  var selectedOption = chooseGetnetInstallments(options);
  if (!selectedOption) return;

  var installments = selectedOption.installments;
  var installmentAmount = selectedOption.installment_amount;
  var ok = confirm(
    'Getnet en ' + installments + ' cuotas\n\n' +
    'Subtotal: ' + formatMoney(selectedOption.base_total || totals.total) + '\n' +
    (selectedOption.surcharge > 0 ? 'Recargo: ' + formatMoney(selectedOption.surcharge) + '\n' : '') +
    'Total final: ' + formatMoney(selectedOption.total || totals.total) + '\n' +
    'Cada cuota: ' + formatMoney(installmentAmount) + '\n\n' +
    'Te llevamos al checkout seguro de Getnet.'
  );
  if (!ok) return;

  var originalHtml = setCheckoutButtonLoading(button, 'Preparando Getnet...');

  try {
    var result = await createSavedOrder(
      'getnet',
      'Pedido creado para Getnet en ' + installments + ' cuotas de ' + formatMoney(installmentAmount) + '.'
    );
    if (!result || result.cancelled) return;
    if (result.error || !result.saved) {
      alert((result.error && result.error.message) || 'No se pudo guardar el pedido.');
      return;
    }
    if (result.saved.error) {
      alert(result.saved.error.message || 'No se pudo guardar el pedido.');
      return;
    }

    var token = window.SupabaseStore && window.SupabaseStore.getAccessToken
      ? await window.SupabaseStore.getAccessToken()
      : '';
    var order = result.saved.order;

    var response = await fetch('api/getnet-create-checkout.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        order_id: order.id,
        installments: installments,
        access_token: token
      })
    });

    var raw = await response.text();
    var data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (error) {}
    if (!response.ok || !data || !data.ok) {
      throw new Error((data && data.error) || raw.slice(0, 180) || ('HTTP ' + response.status));
    }

    localStorage.setItem('dt_last_order_reference', data.order_ref || order.external_reference || '');
    window.location.href = data.checkout_url;
  } catch (error) {
    console.error('Error Getnet:', error);
    alert(error.message || 'No se pudo preparar Getnet.');
  } finally {
    restoreCheckoutButton(button, originalHtml);
  }
}

async function resolveCheckoutUser() {
  var currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

  if (window.SupabaseStore && window.SupabaseStore.getCurrentAccount) {
    try {
      var account = await window.SupabaseStore.getCurrentAccount();
      if (account && account.user && account.user.id) {
        localStorage.setItem('d3_user', JSON.stringify(account.user));
        return account.user;
      }
    } catch (error) {
      console.warn('No se pudo restaurar la sesion de compra:', error);
    }
  }

  if (currentUser && currentUser.id) return currentUser;

  window.location.href = 'cuenta.html?from=checkout&return=' + encodeURIComponent('carrito.html');
  return null;
}

async function createSavedOrder(method, notes) {
  var items = CartStore.getAll();
  if (!items.length) return { cancelled: true };
  if (cartHasByOrderItems(items)) {
    warnByOrderCheckout();
    return { cancelled: true };
  }
  if (!window.SupabaseStore || !window.SupabaseStore.createWebOrder) {
    return { error: { message: 'No se pudo conectar con Supabase para guardar el pedido.' } };
  }

  var currentUser = await resolveCheckoutUser();
  if (!currentUser) return { cancelled: true };

  var totals = calculateCartTotals();
  var saved = await window.SupabaseStore.createWebOrder({
    items: items,
    account: currentUser || {},
    totals: {
      subtotal: totals.subtotal,
      iva: totals.iva,
      total: totals.total
    },
    method: method || 'whatsapp',
    notes: notes || (discountPct > 0 ? 'Pedido con descuento aplicado desde carrito web.' : 'Pedido creado desde carrito web.')
  });

  return { saved: saved, totals: totals, items: items };
}

function setCheckoutButtonLoading(button, loadingText) {
  if (!button) return '';
  var originalHtml = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">sync</span> ' + loadingText;
  return originalHtml;
}

function restoreCheckoutButton(button, originalHtml) {
  if (!button) return;
  button.disabled = false;
  button.innerHTML = originalHtml;
}

async function checkoutSavedOrder(button, method) {
  var originalHtml = setCheckoutButtonLoading(button, 'Guardando pedido...');

  var result = await createSavedOrder(method || 'whatsapp');
  restoreCheckoutButton(button, originalHtml);

  if (!result || result.cancelled) return;
  if (result.error || !result.saved) {
    alert((result.error && result.error.message) || 'No se pudo guardar el pedido.');
    return;
  }

  var saved = result.saved;
  var items = result.items;
  var totals = result.totals;

  if (saved.error) {
    alert(saved.error.message || 'No se pudo guardar el pedido.');
    return;
  }

  var orderRef = saved.order && saved.order.external_reference ? saved.order.external_reference : '';
  var lines = items.map(function(i) {
    return '- ' + i.name + ' x' + i.qty + ' - ' + formatMoney(i.price * i.qty);
  });

  lines.push('');
  if (orderRef) lines.push('Pedido: ' + orderRef);
  if (discountPct > 0) lines.push('Descuento: -' + formatMoney(totals.discount));
  lines.push('*TOTAL: ' + formatMoney(totals.total) + '*');

  var text = 'Hola! Quiero hacer un pedido en DimensionTres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493534019085';
  localStorage.setItem('dt_last_order_reference', orderRef || '');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

async function checkoutMercadoPago(button) {
  var originalHtml = setCheckoutButtonLoading(button, 'Preparando pago...');

  try {
    var result = await createSavedOrder('mercadopago', 'Pedido creado para pagar en 1 cuota con Mercado Pago.');
    if (!result || result.cancelled) return;
    if (result.error || !result.saved) {
      alert((result.error && result.error.message) || 'No se pudo guardar el pedido.');
      return;
    }
    if (result.saved.error) {
      alert(result.saved.error.message || 'No se pudo guardar el pedido.');
      return;
    }

    if (!window.SupabaseStore || !window.SupabaseStore.getAccessToken) {
      alert('No se pudo validar tu sesion para Mercado Pago.');
      return;
    }

    var token = await window.SupabaseStore.getAccessToken();
    if (!token) {
      alert('Inicia sesion de nuevo para pagar.');
      return;
    }

    var order = result.saved.order;
    var response = await fetch('api/mp-create-preference.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        order_id: order.id,
        installments: 1,
        access_token: token
      })
    });

    var raw = await response.text();
    var data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (error) {}
    if (!response.ok || !data || !data.ok) {
      throw new Error((data && data.error) || raw.slice(0, 180) || ('HTTP ' + response.status));
    }

    localStorage.setItem('dt_last_order_reference', data.order_ref || order.external_reference || '');
    window.location.href = data.checkout_url;
  } catch (error) {
    console.error('Error Mercado Pago:', error);
    alert(error.message || 'No se pudo iniciar Mercado Pago.');
  } finally {
    restoreCheckoutButton(button, originalHtml);
  }
}

/* ─── INIT ───────────────────────────────── */
window.addEventListener('storage', function(e) { if (e.key === 'dt_cart_v1') render(); });
document.addEventListener('DOMContentLoaded', function() {
  render();
  updateCartBadge();
  hydrateCartImages().then(function(changed) {
    if (changed) render();
  });
});
