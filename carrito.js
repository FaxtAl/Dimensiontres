/**
 * carrito.js — Lógica de la página del carrito | Dimensión Tres
 * Requiere: config.js, cart.js (cargados antes en el HTML)
 */

// CONFIG viene de config.js cargado como script normal antes que este archivo.
// Los precios que llegan desde Access ya incluyen IVA, asi que el carrito no suma impuesto extra.
var TAX         = 0;
var mercadoPagoInstallments = 12;
var transferProofFileName = '';
var TRANSFER_PAYMENT = {
  alias: 'dimension3',
  holder: 'Carlos Priarollo',
  email: 'carlos_p4525@hotmail.com'
};

function applyCartCoupon(event) {
  if (event) event.preventDefault();
  var input = document.getElementById('coupon-code');
  var status = document.getElementById('coupon-status');
  if (!input || !status) return;
  var code = String(input.value || '').trim().toUpperCase();
  if (!code) {
    status.className = 'is-error';
    status.textContent = 'Ingresá un código de cupón.';
    input.focus();
    return;
  }
  status.className = 'is-error';
  status.textContent = 'Ese cupón no es válido o ya venció.';
}

function selectMercadoPagoInstallments() {
  mercadoPagoInstallments = 12;
  var label = document.getElementById('mp-selected-label');
  if (label) label.textContent = 'Hasta 12 cuotas en Mercado Pago';
}

function updatePaymentMethodAmounts(totals) {
  var totalText = formatMoney(totals && totals.total ? totals.total : 0);
  var transferPrice = document.getElementById('transfer-selected-price');
  var mercadoPagoPrice = document.getElementById('mp-selected-price');
  var transferDetail = document.getElementById('transfer-total-detail');
  if (transferPrice) transferPrice.textContent = totalText;
  if (mercadoPagoPrice) mercadoPagoPrice.textContent = totalText;
  if (transferDetail) transferDetail.textContent = totalText;
}

function fallbackCopy(text) {
  var input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', 'readonly');
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  try { document.execCommand('copy'); } catch (error) {}
  document.body.removeChild(input);
}

function copyTransferAlias() {
  var alias = TRANSFER_PAYMENT.alias;
  function done() { alert('Alias copiado: ' + alias); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(alias).then(done).catch(function() {
      fallbackCopy(alias);
      done();
    });
    return;
  }
  fallbackCopy(alias);
  done();
}

function handleTransferProof(input) {
  var file = input && input.files && input.files[0] ? input.files[0] : null;
  transferProofFileName = file ? file.name : '';
  var label = document.getElementById('transfer-proof-name');
  if (!label) return;
  label.textContent = transferProofFileName
    ? 'Comprobante seleccionado: ' + transferProofFileName + '. Al abrir WhatsApp, adjuntalo en el chat.'
    : 'Cuando termines, mandamos el pedido por WhatsApp para adjuntar el comprobante.';
}

// Los datos para transferir arrancan plegados y se abren al elegir el metodo.
// Desplegados de entrada estiraban el resumen a 1217px contra 900 de pantalla,
// asi que el total y los medios de pago nunca se veian juntos.
function focusTransferPanel() {
  var panel = document.querySelector('.transfer-panel');
  if (!panel) return;

  panel.classList.add('is-open');

  var boton = document.querySelector('.payment-method.is-active');
  if (boton) boton.setAttribute('aria-expanded', 'true');

  if (panel.scrollIntoView) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function uploadTransferProof(orderId) {
  var input = document.getElementById('transfer-proof-input');
  var file = input && input.files && input.files[0] ? input.files[0] : null;
  if (!file) {
    return { ok: false, error: 'Falta cargar el comprobante.' };
  }

  var token = '';
  if (window.SupabaseStore && window.SupabaseStore.getAccessToken) {
    token = await window.SupabaseStore.getAccessToken();
  }
  if (!token) {
    return { ok: false, code: 'session_required', error: 'Inicia sesion para subir el comprobante.' };
  }

  var form = new FormData();
  form.append('order_id', orderId);
  form.append('access_token', token);
  form.append('proof', file);

  var response = await fetch('api/transfer-proof-upload.php', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-Authorization': 'Bearer ' + token
    },
    body: form
  });

  var raw = await response.text();
  var data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch (error) {}
  if (!response.ok || !data || !data.ok) {
    return {
      ok: false,
      code: data && data.code,
      error: (data && data.error) || raw.slice(0, 180) || ('HTTP ' + response.status)
    };
  }
  return data;
}

function formatMoney(value) {
  var amount = Number(value || 0);
  var hasCents = Math.abs(amount - Math.round(amount)) > 0.009;
  return (CONFIG.CURRENCY_SYMBOL || '$') + amount.toLocaleString('es-AR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function calculateCartTotals() {
  var sub = CartStore.getSubtotal();

  return {
    subtotal: sub,
    base: sub,
    iva: 0,
    total: sub
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

function isPaymentSessionExpiredError(error) {
  var message = String(error && error.message ? error.message : error || '').toLowerCase();
  if (isPaymentBackendJwtConfigError(error)) return false;
  return (error && (error.code === 'session_expired' || error.code === 'session_required')) ||
    message.indexOf('session_expired') !== -1 ||
    message.indexOf('session_required') !== -1 ||
    message.indexOf('tu sesion vencio') !== -1 ||
    message.indexOf('sesion invalida') !== -1 ||
    message.indexOf('inicia sesion') !== -1 ||
    message.indexOf('sesión') !== -1;
}

function isPaymentBackendJwtConfigError(error) {
  var message = String(error && error.message ? error.message : error || '').toLowerCase();
  return message.indexOf('bad_jwt') !== -1 ||
    message.indexOf('jwt') !== -1 ||
    message.indexOf('unrecognized jwt') !== -1 ||
    message.indexOf('unable to parse or verify signature') !== -1 ||
    message.indexOf('keyfunc') !== -1;
}

async function resetCheckoutSessionAndRedirect(message) {
  try {
    if (window.SupabaseStore && window.SupabaseStore.signOutAccount) {
      await window.SupabaseStore.signOutAccount();
    }
  } catch (error) {}

  try {
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var key = localStorage.key(i);
      var normalized = String(key || '').toLowerCase();
      if (normalized.indexOf('supabase') !== -1 || (normalized.indexOf('sb-') === 0 && normalized.indexOf('auth') !== -1)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {}

  alert(message || 'Tu sesion vencio. Inicia sesion de nuevo para continuar con el pago.');
  window.location.href = 'cuenta.html?from=checkout&return=' + encodeURIComponent('carrito.html#pago');
}

function cleanCartText(value) {
  return String(value || '')
    .replace(/\bCodigo\b/gi, 'Código')
    .replace(/\bPeriféricos\b/gi, 'Periféricos')
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
  var checkoutGrid = document.getElementById('checkout-grid');
  var checkoutEmpty = document.getElementById('checkout-empty');
  if (!grid || !empty) {
    if (checkoutGrid && checkoutEmpty) renderCheckoutSummary(checkoutGrid, checkoutEmpty);
    return;
  }

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

function renderCheckoutSummary(grid, empty) {
  var items = CartStore.getAll();
  var list = document.getElementById('checkout-items');

  if (!items.length) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = '';
  if (!list) return;
  list.innerHTML = '';

  items.forEach(function(item) {
    var row = document.createElement('div');
    row.className = 'dt-checkout-item';

    var img = document.createElement('img');
    img.src = item.image || '';
    img.alt = item.name || 'Producto';
    img.onerror = function() { this.style.visibility = 'hidden'; };

    var copy = document.createElement('div');
    copy.className = 'dt-checkout-item-copy';
    var name = document.createElement('strong');
    name.textContent = cleanCartText(item.name || 'Producto');
    var qty = document.createElement('span');
    qty.textContent = item.qty + ' × ' + formatMoney(item.price);
    copy.appendChild(name);
    copy.appendChild(qty);

    var total = document.createElement('strong');
    total.textContent = formatMoney(item.price * item.qty);

    row.appendChild(img);
    row.appendChild(copy);
    row.appendChild(total);
    list.appendChild(row);
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

  if (typeof isDelayedDeliveryProduct === 'function' && isDelayedDeliveryProduct(item)) {
    var delayP = document.createElement('p');
    delayP.className = 'cart-item-delay';
    delayP.textContent = 'Demora aproximada: 48 hs';
    infoDiv.appendChild(delayP);
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

  /* ── Celda precio unitario (escritorio) ──
     Antes solo se mostraba el total de la linea, asi que con cantidad
     mayor a 1 no se veia cuanto vale la unidad. */
  var unitCell = document.createElement('td');
  unitCell.className = 'cart-unit-cell px-6 py-6 text-right hidden md:table-cell';
  var unitSpan = document.createElement('span');
  unitSpan.className = 'font-headline font-semibold text-base text-on-surface-variant';
  unitSpan.textContent = formatMoney(item.price);
  unitCell.appendChild(unitSpan);
  tr.appendChild(unitCell);

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
/**
 * Aviso de demora en el resumen. Cada producto ya avisa en su fila, pero al
 * pagar se pasaba por alto: esto lo dice una vez, arriba de los medios de pago.
 */
function updateDelayNote() {
  var note = document.getElementById('cart-delay-note');
  var text = document.getElementById('cart-delay-note-text');
  if (!note || !text) return;

  var delayed = CartStore.getAll().filter(function(item) {
    return typeof isDelayedDeliveryProduct === 'function' && isDelayedDeliveryProduct(item);
  });

  if (!delayed.length) {
    note.hidden = true;
    return;
  }

  text.textContent = delayed.length === 1
    ? 'Un producto de tu pedido llega en 48 hs. Te avisamos cuando esté listo para retirar.'
    : delayed.length + ' productos de tu pedido llegan en 48 hs. Te avisamos cuando estén listos para retirar.';
  note.hidden = false;
}

function updateTotals() {
  var totals = calculateCartTotals();

  var elSub   = document.getElementById('sum-sub');
  var elTotal = document.getElementById('sum-total');

  updateDelayNote();

  if (elSub)   elSub.textContent   = formatMoney(totals.subtotal);
  if (elTotal) {
    elTotal.textContent = formatMoney(totals.total);
    elTotal.classList.remove('total-flash');
    void elTotal.offsetWidth;
    elTotal.classList.add('total-flash');
  }
  updatePaymentMethodAmounts(totals);
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
function clearCartUI()  {
  if (CartStore.getAll().length && !confirm('¿Vaciar el carrito? Se van a quitar todos los productos.')) return;
  CartStore.clear();
  render();
  updateCartBadge();
}

function cartHasByOrderItems(items) {
  return (items || []).some(function(item) {
    return typeof isByOrderProduct === 'function' && isByOrderProduct(item);
  });
}

function warnByOrderCheckout() {
  showCartNotice('Tenes productos a pedido. Sacalos del carrito y consultanos por WhatsApp para reservarlos.');
}

/* ─── CHECKOUT WHATSAPP ──────────────────── */
function checkoutWhatsApp() {
  var items = CartStore.getAll();
  if (!items.length) return;

  var total = CartStore.getSubtotal();

  var lines = items.map(function(i) {
    return '• ' + i.name + ' x' + i.qty + ' — ' + formatMoney(i.price * i.qty);
  });
  lines.push('');
  lines.push('*TOTAL: ' + formatMoney(total) + '*');

  var text = '¡Hola! Quiero hacer un pedido en DimensionTres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493534019085';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

function checkoutUnavailable(methodName) {
  alert(methodName + ' queda para el siguiente paso.');
}

// Antes de comprar o guardar pedido siempre valida la sesion real de Supabase.
// No alcanza con localStorage: si no hay sesion activa manda a cuenta.html.
async function resolveCheckoutUser() {
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

  try { localStorage.removeItem('d3_user'); } catch (error) {}

  window.location.href = 'cuenta.html?from=checkout&return=' + encodeURIComponent('carrito.html#pago');
  return null;
}

// Guarda el pedido web en Supabase. Despues la cuenta lo muestra en historial
// y Mercado Pago usa este order_id para no pagar pedidos anonimos.
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
    notes: notes || 'Pedido creado desde carrito web.'
  });

  return { saved: saved, totals: totals, items: items };
}

// Avisa al local por WhatsApp Cloud API cuando entra un pedido web.
async function notifyStoreOrder(saved, eventType) {
  if (!saved || saved.reused || !saved.order || !saved.order.id) return;
  if (!window.SupabaseStore || !window.SupabaseStore.getAccessToken) return;

  try {
    var token = await window.SupabaseStore.getAccessToken();
    if (!token) return;

    await fetch('api/whatsapp-order-notify.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        order_id: saved.order.id,
        event: eventType || 'created',
        access_token: token
      })
    });
  } catch (error) {
    console.warn('No se pudo avisar el pedido por WhatsApp Cloud API:', error);
  }
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

// Flujo de WhatsApp: guarda pedido en Supabase y abre el mensaje con el detalle.
async function checkoutSavedOrder(button, method) {
  var originalHtml = setCheckoutButtonLoading(button, 'Guardando pedido...');

  var result = await createSavedOrder(method || 'whatsapp');
  restoreCheckoutButton(button, originalHtml);

  if (!result || result.cancelled) return;
  if (result.error || !result.saved) {
    if (isPaymentSessionExpiredError(result.error)) {
      await resetCheckoutSessionAndRedirect('Inicia sesion para guardar el pedido y comprar.');
      return;
    }
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

  if ((method || 'whatsapp') === 'whatsapp') {
    notifyStoreOrder(saved, 'created');
  }

  var orderRef = saved.order && saved.order.external_reference ? saved.order.external_reference : '';
  var lines = items.map(function(i) {
    return '- ' + i.name + ' x' + i.qty + ' - ' + formatMoney(i.price * i.qty);
  });

  lines.push('');
  if (orderRef) lines.push('Pedido: ' + orderRef);
  lines.push('*TOTAL: ' + formatMoney(totals.total) + '*');

  var text = 'Hola! Quiero hacer un pedido en DimensionTres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493534019085';
  localStorage.setItem('dt_last_order_reference', orderRef || '');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

// Flujo de transferencia: guarda el pedido y abre WhatsApp para enviar el comprobante.
async function checkoutBankTransfer(button) {
  if (!transferProofFileName) {
    showCartNotice('Primero cargá el comprobante de transferencia para mandarlo por WhatsApp.');
    var input = document.getElementById('transfer-proof-input');
    if (input) input.click();
    return;
  }

  var originalHtml = setCheckoutButtonLoading(button, 'Guardando transferencia...');

  var result = await createSavedOrder(
    'transferencia',
    'Pedido creado desde carrito web para transferencia bancaria. Alias: ' + TRANSFER_PAYMENT.alias + '.'
  );
  restoreCheckoutButton(button, originalHtml);

  if (!result || result.cancelled) return;
  if (result.error || !result.saved) {
    if (isPaymentSessionExpiredError(result.error)) {
      await resetCheckoutSessionAndRedirect('Inicia sesion para guardar el pedido y comprar.');
      return;
    }
    alert((result.error && result.error.message) || 'No se pudo guardar el pedido.');
    return;
  }

  var saved = result.saved;
  if (saved.error) {
    alert(saved.error.message || 'No se pudo guardar el pedido.');
    return;
  }

  var proofResult = await uploadTransferProof(saved.order.id);
  if (!proofResult || !proofResult.ok) {
    if (isPaymentSessionExpiredError(proofResult)) {
      await resetCheckoutSessionAndRedirect('Tu sesion vencio. Inicia sesion de nuevo para subir el comprobante.');
      return;
    }
    alert((proofResult && proofResult.error) || 'No se pudo guardar el comprobante.');
    return;
  }

  notifyStoreOrder(saved, 'created');

  var items = result.items;
  var totals = result.totals;
  var orderRef = saved.order && saved.order.external_reference ? saved.order.external_reference : '';
  var lines = items.map(function(i) {
    return '- ' + i.name + ' x' + i.qty + ' - ' + formatMoney(i.price * i.qty);
  });

  lines.push('');
  if (orderRef) lines.push('Pedido: ' + orderRef);
  lines.push('Pago: Transferencia bancaria');
  lines.push('Transferir a:');
  lines.push('Alias: ' + TRANSFER_PAYMENT.alias);
  lines.push('Titular: ' + TRANSFER_PAYMENT.holder);
  lines.push('Email: ' + TRANSFER_PAYMENT.email);
  lines.push('*Total a transferir: ' + formatMoney(totals.total) + '*');
  lines.push('');
  lines.push('Comprobante: ' + (proofResult.proof_name || transferProofFileName));
  lines.push('Te lo adjunto aca por WhatsApp para revisarlo.');

  var text = 'Hola! Hice este pedido por transferencia en DimensionTres:\n\n' + lines.join('\n');
  var phone = CONFIG.CONTACT_PHONE || '5493534019085';
  localStorage.setItem('dt_last_order_reference', orderRef || '');
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
}

// Flujo de Mercado Pago: guarda pedido primero, valida sesion y recien ahi crea preferencia de pago.
async function checkoutMercadoPago(button) {
  var originalHtml = setCheckoutButtonLoading(button, 'Preparando pago...');
  var selectedInstallments = 12;

  try {
    var items = CartStore.getAll();
    if (!items.length) return;
    if (cartHasByOrderItems(items)) {
      warnByOrderCheckout();
      return;
    }

    var orderResult = await createSavedOrder(
      'mercadopago',
      'Pedido creado desde carrito web para Mercado Pago hasta en 12 cuotas.'
    );
    if (!orderResult || orderResult.cancelled) return;
    if (orderResult.error || !orderResult.saved || !orderResult.saved.order || !orderResult.saved.order.id) {
      throw new Error((orderResult.error && orderResult.error.message) || 'No se pudo guardar el pedido antes de pagar.');
    }

    var token = '';
    if (window.SupabaseStore && window.SupabaseStore.getAccessToken) {
      token = await window.SupabaseStore.getAccessToken();
    }
    if (!token) {
      var sessionError = new Error('Inicia sesion para pagar con Mercado Pago.');
      sessionError.code = 'session_required';
      throw sessionError;
    }

    var response = await fetch('api/mp-create-preference.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        order_id: orderResult.saved.order.id,
        access_token: token,
        max_installments: selectedInstallments
      })
    });

    var raw = await response.text();
    var data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch (error) {}
    if (!response.ok || !data || !data.ok) {
      var checkoutError = new Error((data && data.error) || raw.slice(0, 180) || ('HTTP ' + response.status));
      if (data && data.code) checkoutError.code = data.code;
      throw checkoutError;
    }

    localStorage.setItem('dt_last_order_reference', data.order_ref || '');
    window.location.href = data.checkout_url;
  } catch (error) {
    console.error('Error Mercado Pago:', error);
    if (isPaymentBackendJwtConfigError(error)) {
      alert('El pago no puede validar tu sesion porque la API de pagos esta usando otra clave de Supabase. Subi api/payment-config.php actualizado y volve a probar.');
      return;
    }
    if (isPaymentSessionExpiredError(error)) {
      await resetCheckoutSessionAndRedirect();
      return;
    }
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
  selectMercadoPagoInstallments(mercadoPagoInstallments);
  hydrateCartImages().then(function(changed) {
    if (changed) render();
  });
});
