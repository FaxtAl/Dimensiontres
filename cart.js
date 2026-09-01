/**
 * cart.js — Motor del carrito | Dimensión Tres
 * Incluir en todas las páginas con: <script src="cart.js"></script>
 */

/* ─── STORE ─────────────────────────────────── */
function normalizeCartStock(value) {
  if (value === null || value === undefined || value === '') return null;
  var parsed = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
}

function getCartItemStock(item) {
  if (!item) return null;
  var value = item.stock;
  if (value === null || value === undefined || value === '') value = item.maxStock;
  if (value === null || value === undefined || value === '') value = item.availableStock;
  return normalizeCartStock(value);
}

var LOW_STOCK_LIMIT = 3;

function normalizeProductRuleText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeProductRuleBoolean(value) {
  if (value === true) return true;
  if (value === false) return false;
  if (value === 1 || value === -1) return true;
  if (value === 0) return false;

  var text = normalizeProductRuleText(value).trim();
  if (!text) return null;
  if (['true', 'si', 's', 'yes', 'y', '1', '-1', 'pedido', 'a pedido', 'checked'].indexOf(text) !== -1) return true;
  if (['false', 'no', 'n', '0', 'disponible', 'stock', 'consultar', 'unchecked'].indexOf(text) !== -1) return false;
  return null;
}

function readByOrderFlag(item) {
  var keys = [
    'byOrder',
    'aPedido',
    'producto_sinstock',
    'Producto_sinstock',
    'prodcuto_sinstock',
    'Prodcuto_sinstock',
    'isByOrder'
  ];

  for (var i = 0; i < keys.length; i++) {
    if (Object.prototype.hasOwnProperty.call(item, keys[i])) {
      var parsed = normalizeProductRuleBoolean(item[keys[i]]);
      if (parsed !== null) return parsed;
    }
  }

  return null;
}

function isByOrderProduct(item) {
  // La marca historica "A pedido" ya no se usa en la web.
  // Disponibilidad y compra dependen unicamente del stock real.
  return false;
}

function getProductStockState(item) {
  var stock = getCartItemStock(item);
  if (stock !== null && stock <= 0) return { status: 'out', label: 'Sin stock', stock: stock };
  if (stock === null) return { status: 'unknown', label: 'Consultar', stock: stock };
  if (stock <= LOW_STOCK_LIMIT) return { status: 'low', label: 'Stock bajo', stock: stock };
  return { status: 'available', label: 'Stock disponible', stock: stock };
}

function isOutOfStockProduct(item) {
  return getProductStockState(item).status === 'out';
}

window.DimensionTresProductRules = window.DimensionTresProductRules || {};
window.DimensionTresProductRules.isByOrderProduct = isByOrderProduct;
window.DimensionTresProductRules.getStockState = getProductStockState;
window.DimensionTresProductRules.isOutOfStockProduct = isOutOfStockProduct;
window.isByOrderProduct = isByOrderProduct;
window.getProductStockState = getProductStockState;
window.isOutOfStockProduct = isOutOfStockProduct;

function mergeCartItemData(target, source) {
  if (!target || !source) return;
  ['image', 'ref', 'category', 'code', 'codigo', 'accessId', 'productId', 'source', 'sourceIntegration', 'supplierId', 'sourceLabel', 'description', 'subtitle', 'byOrder', 'aPedido', 'pedido', 'producto_sinstock', 'prodcuto_sinstock', 'producto_si'].forEach(function(key) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') target[key] = source[key];
  });
  var stock = getCartItemStock(source);
  if (stock !== null) target.stock = stock;
}

function trimCartText(value, maxLength) {
  var text = String(value === undefined || value === null ? '' : value);
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function compactCartItem(item) {
  if (!item) return null;
  var stock = getCartItemStock(item);
  var compact = {
    id: trimCartText(item.id || item.slug || item.accessId || item.name, 180),
    name: trimCartText(item.name || item.title || 'Producto', 180),
    price: Number(item.price || 0),
    image: trimCartText(item.image || item.img || '', 260),
    qty: Math.max(1, Math.floor(Number(item.qty || 1)))
  };

  [
    'ref',
    'category',
    'code',
    'codigo',
    'accessId',
    'productId',
    'source',
    'sourceIntegration',
    'supplierId',
    'sourceLabel',
    'byOrder',
    'aPedido',
    'pedido',
    'producto_sinstock',
    'prodcuto_sinstock',
    'producto_si'
  ].forEach(function(key) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
      compact[key] = typeof item[key] === 'string' ? trimCartText(item[key], 180) : item[key];
    }
  });

  if (item.description || item.subtitle) {
    compact.description = trimCartText(item.description || item.subtitle, 160);
  }
  if (stock !== null) compact.stock = stock;
  return compact.id ? compact : null;
}

function compactCartItems(items) {
  return (Array.isArray(items) ? items : []).map(compactCartItem).filter(Boolean);
}

function isCartQuotaError(error) {
  var name = String(error && error.name || '').toLowerCase();
  var message = String(error && error.message || '').toLowerCase();
  return name.indexOf('quota') !== -1 ||
    message.indexOf('quota') !== -1 ||
    message.indexOf('exceeded the quota') !== -1 ||
    message.indexOf('storage') !== -1;
}

function clearCartOptionalCaches() {
  var removed = 0;
  try {
    if (!window.localStorage) return removed;
    for (var i = window.localStorage.length - 1; i >= 0; i--) {
      var key = window.localStorage.key(i) || '';
      if (
        key.indexOf('dt-public-catalog-') === 0 ||
        key.indexOf('dt-ml-image-') === 0
      ) {
        window.localStorage.removeItem(key);
        removed++;
      }
    }
  } catch (error) {}
  return removed;
}

const CartStore = (() => {
  const KEY = 'dt_cart_v1';
  const SESSION_KEY = KEY + '_session';
  let memoryCart = [];
  const get = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY)) || [];
      if (stored.length) return compactCartItems(stored);
    } catch {}
    try {
      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || [];
      if (stored.length) return compactCartItems(stored);
    } catch {}
    return compactCartItems(memoryCart);
  };
  const save = items => {
    const compacted = compactCartItems(items);
    const payload = JSON.stringify(compacted);
    memoryCart = compacted;

    try {
      localStorage.setItem(KEY, payload);
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      window.dispatchEvent(new CustomEvent('cart:updated'));
      return;
    } catch (error) {
      if (!isCartQuotaError(error)) throw error;
    }

    clearCartOptionalCaches();
    try {
      localStorage.setItem(KEY, payload);
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      window.dispatchEvent(new CustomEvent('cart:updated'));
      return;
    } catch (error) {}

    try {
      sessionStorage.setItem(SESSION_KEY, payload);
      window.dispatchEvent(new CustomEvent('cart:updated'));
      return;
    } catch (error) {
      if (typeof cartToastMessage === 'function') {
        cartToastMessage('El navegador no tiene espacio para guardar el carrito. Borra datos del sitio y volve a intentar.', 'error');
      }
      throw error;
    }
  };
  return {
    getAll:     get,
    add(item, qty)  {
      const amount = Math.max(1, Math.floor(Number(qty || 1)));
      if (isByOrderProduct(item)) {
        return { ok: false, reason: 'pedido', item: item };
      }
      const items = get();
      const ex = items.find(i => i.id === item.id);
      const stock = getCartItemStock(item);
      const currentQty = Number((ex && ex.qty) || 0);

      if (stock !== null && stock <= 0) {
        return { ok: false, reason: 'sin-stock', available: 0, current: currentQty, item: ex || item };
      }

      if (stock !== null && stock > 0 && currentQty + amount > stock) {
        return { ok: false, reason: 'stock', available: stock, current: currentQty, item: ex || item };
      }

      if (ex) {
        ex.qty = currentQty + amount;
        mergeCartItemData(ex, item);
      } else {
        const nextItem = { ...item, qty: amount };
        if (stock !== null) nextItem.stock = stock;
        items.push(nextItem);
      }

      save(items);
      return { ok: true, added: amount, available: stock, item: ex || item };
    },
    remove(id) { save(get().filter(i => i.id !== id)); },
    replaceAll(items) {
      save(Array.isArray(items) ? items : []);
    },
    updateQty(id, d) {
      const items = get();
      const i = items.find(x => x.id === id);
      if (!i) return { ok: false, reason: 'missing' };

      const stock = getCartItemStock(i);
      const currentQty = Number(i.qty || 0);
      const nextQty = Math.max(0, currentQty + d);

      if (d > 0 && isByOrderProduct(i)) {
        return { ok: false, reason: 'pedido', item: i };
      }

      if (d > 0 && stock !== null && stock <= 0) {
        return { ok: false, reason: 'sin-stock', available: 0, current: currentQty, item: i };
      }

      if (d > 0 && stock !== null && stock > 0 && nextQty > stock) {
        return { ok: false, reason: 'stock', available: stock, current: currentQty, item: i };
      }

      i.qty = nextQty;
      if (i.qty === 0) {
        save(items.filter(x => x.id !== id));
        return { ok: true, removed: true, available: stock, item: i };
      }

      save(items);
      return { ok: true, available: stock, item: i };
    },
    clear()        { save([]); },
    removeByOrderItems() {
      const items = get();
      const kept = items.filter(i => !isByOrderProduct(i));
      if (kept.length !== items.length) {
        save(kept);
        return items.length - kept.length;
      }
      return 0;
    },
    getCount()     { return get().reduce((a, i) => a + i.qty, 0); },
    getSubtotal()  { return get().reduce((a, i) => a + i.price * i.qty, 0); },
    getItemStock: getCartItemStock,
    getStockLabel(item) {
      return getProductStockState(item).label;
    },
    getStockState: getProductStockState,
    isOutOfStockProduct: isOutOfStockProduct,
    isByOrderProduct: isByOrderProduct
  };
})();

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('d3_user')) || null; } catch (e) { return null; }
}

function ensureUserLoggedIn(action) {
  if (getCurrentUser()) return true;
  window.location.href = 'cuenta.html?from=' + encodeURIComponent(action || 'add-to-cart');
  return false;
}

/* ─── BADGE ──────────────────────────────────── */
function updateCartBadge() {
  const count = CartStore.getCount();
  document.querySelectorAll('[data-cart-btn]').forEach(btn => {
    btn.style.position = 'relative';
    let badge = btn.querySelector('.dt-badge');
    if (count === 0) { badge && badge.remove(); return; }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'dt-badge';
      badge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#b90afc;color:#fff;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:10px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 3px;pointer-events:none;z-index:10;transition:transform .2s cubic-bezier(.34,1.56,.64,1)';
      btn.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
  });
}
window.addEventListener('cart:updated', updateCartBadge);
document.addEventListener('DOMContentLoaded', updateCartBadge);

/* ─── FLY ANIMATION ──────────────────────────── */
function flyToCart(sourceEl, imgSrc) {
  const dest = document.querySelector('[data-cart-btn]');
  if (!dest) return;
  const s = sourceEl.getBoundingClientRect(), d = dest.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.style.cssText = `position:fixed;width:52px;height:52px;overflow:hidden;background:#ffffff;border:1px solid rgba(143,245,255,.3);box-shadow:0 0 18px rgba(143,245,255,.2);z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center;left:${s.left+s.width/2-26}px;top:${s.top+s.height/2-26}px;border-radius:10px`;
  if (imgSrc) { const img = document.createElement('img'); img.src = imgSrc; img.style.cssText='width:84%;height:84%;object-fit:contain'; ghost.appendChild(img); }
  document.body.appendChild(ghost);
  requestAnimationFrame(() => {
    ghost.style.transition = 'transform .15s ease-out';
    ghost.style.transform = 'scale(1.2)';
    setTimeout(() => {
      ghost.style.transition = 'left .5s cubic-bezier(.4,0,.2,1),top .5s cubic-bezier(.4,0,.2,1),transform .5s,opacity .5s';
      ghost.style.left = `${d.left+d.width/2-26}px`;
      ghost.style.top  = `${d.top+d.height/2-26}px`;
      ghost.style.transform = 'scale(0.2)';
      ghost.style.opacity = '0';
      setTimeout(() => {
        dest.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)';
        dest.style.transform = 'scale(1.35)';
        setTimeout(() => { dest.style.transform = 'scale(1)'; ghost.remove(); }, 180);
      }, 510);
    }, 150);
  });
}

/* ─── TOAST ──────────────────────────────────── */
function cartToast(name) {
  let wrap = document.getElementById('dt-toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.id='dt-toast-wrap'; wrap.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.style.cssText = 'background:#1a1919;border-left:2px solid #8ff5ff;border:1px solid rgba(143,245,255,.2);color:#fff;font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;padding:11px 18px;display:flex;align-items:center;gap:8px;max-width:min(90vw,420px);opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s';
  
  // Crear elementos seguros en lugar de innerHTML
  const iconSpan = document.createElement('span');
  iconSpan.style.cssText = "color:#8ff5ff;font-family:'Material Symbols Outlined';font-size:15px;vertical-align:middle";
  iconSpan.textContent = 'check_circle';
  
  // El nombre del producto puede ser larguisimo ("PROCESADOR INTEL CORE
  // ULTRA 7 265KF 20 CORES S/VIDEO S/COOLER S1851..."). Con nowrap y sin
  // ancho maximo el cartel se estiraba mas que la pantalla del celular.
  // Ahora se corta con puntos suspensivos en una sola linea; el min-width
  // en 0 es lo que habilita el recorte dentro de un flex.
  const textSpan = document.createElement('span');
  textSpan.style.cssText = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
  textSpan.textContent = ` ${name}`;

  // "agregado" va en su propio span que no se encoge: si fuera parte del
  // mismo texto, los puntos suspensivos se lo comerian y el cartel quedaria
  // sin decir que paso.
  const accionSpan = document.createElement('span');
  accionSpan.style.cssText = 'flex-shrink:0';
  accionSpan.textContent = 'agregado';

  t.appendChild(iconSpan);
  t.appendChild(textSpan);
  t.appendChild(accionSpan);
  
  wrap.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; });
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(8px)'; setTimeout(()=>t.remove(),300); }, 2600);
}

/* ─── ADD TO CART (API pública) ──────────────── */

function cartToastMessage(message, tone) {
  let wrap = document.getElementById('dt-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'dt-toast-wrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none';
    document.body.appendChild(wrap);
  }

  const color = tone === 'error' ? '#ff716c' : '#8ff5ff';
  const icon = tone === 'error' ? 'error' : 'info';
  const t = document.createElement('div');
  t.style.cssText = 'background:#1a1919;border-left:2px solid ' + color + ';border:1px solid rgba(143,245,255,.2);color:#fff;font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:11px 18px;display:flex;align-items:center;gap:8px;max-width:min(92vw,560px);white-space:normal;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s';

  const iconSpan = document.createElement('span');
  iconSpan.style.cssText = "color:" + color + ";font-family:'Material Symbols Outlined';font-size:15px;vertical-align:middle";
  iconSpan.textContent = icon;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  t.appendChild(iconSpan);
  t.appendChild(textSpan);
  wrap.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 300); }, 3000);
}

function cartStockToast(name, available) {
  cartToastMessage('No hay suficiente stock de ' + name + '. Disponible: ' + available + '.', 'error');
}

function cartByOrderToast(name) {
  cartToastMessage((name ? name + ': ' : '') + 'Producto a pedido. Consultanos por WhatsApp para reservarlo.', 'error');
}

function cartOutOfStockToast(name) {
  cartToastMessage((name ? name + ': ' : '') + 'Consultanos por WhatsApp para confirmar disponibilidad.', 'error');
}

function cartBuildProductWhatsAppUrl(product) {
  const phone = String((window.CONFIG && CONFIG.CONTACT_PHONE) || '5493534019085').replace(/\D+/g, '');
  const name = String((product && product.name) || 'producto').trim();
  const code = String(product && (product.ref || product.codigo || product.code || product.accessId || product.id) || '').trim();
  const category = String(product && (product.sourceLabel || product.category) || '').trim();
  const parts = ['Hola! Quiero consultar disponibilidad de: ' + name];
  if (code) parts.push('Código/ref: ' + code);
  if (category) parts.push('Categoría: ' + category);
  parts.push('Me podrían confirmar stock?');
  return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(parts.join('\n'));
}

function cartOpenProductWhatsApp(product) {
  window.open(cartBuildProductWhatsAppUrl(product), '_blank', 'noopener');
}

/**
 * addToCart — wrapper llamado desde los sub-catálogos.
 * Firma: addToCart(name, price, img, event)
 * Genera un id estable desde el nombre del producto.
 */
function addToCart(name, price, img, event) {
  const product = {
    id:    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name,
    price,
    image: img || ''
  };

  // Tomamos el botón del evento si fue pasado, o lo buscamos en el DOM
  const btn = (event && event.currentTarget)
    ? event.currentTarget
    : document.querySelector(`button.btn-add[onclick*="${name.substring(0, 10)}"]`);

  if (btn) {
    addToCartUI(btn, product);
  } else {
    // Fallback sin animación de botón
    const result = CartStore.add(product);
    if (!result.ok && result.reason === 'pedido') {
      cartOpenProductWhatsApp(product);
      cartByOrderToast(product.name);
      return;
    }
    if (!result.ok && result.reason === 'sin-stock') {
      cartOpenProductWhatsApp(product);
      cartOutOfStockToast(product.name);
      return;
    }
    if (!result.ok && result.reason === 'stock') {
      cartStockToast(product.name, result.available);
      return;
    }
    updateCartBadge();
    cartToast(name);
  }
}

function addToCartUI(btn, product) {
  if (btn.disabled) return;
  btn.disabled = true;
  const result = CartStore.add(product);
  if (!result.ok && result.reason === 'pedido') {
    btn.disabled = false;
    cartOpenProductWhatsApp(product);
    cartByOrderToast(product.name);
    return;
  }
  if (!result.ok && result.reason === 'sin-stock') {
    btn.disabled = false;
    cartOpenProductWhatsApp(product);
    cartOutOfStockToast(product.name);
    return;
  }
  if (!result.ok && result.reason === 'stock') {
    btn.disabled = false;
    cartStockToast(product.name, result.available);
    return;
  }
  const card = btn.closest('[data-product-card]') || btn.closest('.group');
  flyToCart(btn, card?.querySelector('img')?.src || null);
  const orig = btn.innerHTML;
  
  // Crear elementos seguros
  const checkSpan = document.createElement('span');
  checkSpan.style.cssText = "font-family:'Material Symbols Outlined';font-size:14px;vertical-align:middle";
  checkSpan.textContent = 'check';
  
  const textSpan = document.createElement('span');
  textSpan.textContent = ' Agregado';
  
  btn.innerHTML = '';
  btn.appendChild(checkSpan);
  btn.appendChild(textSpan);
  
  btn.style.background = 'rgba(143,245,255,.1)';
  btn.style.color = '#8ff5ff';
  setTimeout(() => { btn.innerHTML=orig; btn.style.background=''; btn.style.color=''; btn.disabled=false; }, 1800);
  cartToast(product.name);
}

/* ═══════════════════════════════════════════════════════════
   MINI CARRITO LATERAL
   Se arma por JS y no en el HTML porque el nav esta repetido en
   cinco paginas: asi hay una sola copia y no se pueden
   desincronizar. Se abre con el icono del carrito del nav.
   ═══════════════════════════════════════════════════════════ */

// formatMoney vive en carrito.js, que solo se carga en la pagina del carrito.
// El mini carrito corre en todas, asi que trae el suyo.
function dtPlata(valor) {
  return '$' + Math.round(Number(valor) || 0).toLocaleString('es-AR');
}

function dtMiniCartHost() {
  var host = document.getElementById('dt-minicart');
  if (host) return host;

  var fondo = document.createElement('div');
  fondo.id = 'dt-minicart-fondo';
  fondo.className = 'dt-minicart-fondo';
  fondo.addEventListener('click', function() { dtToggleMiniCart(true); });
  document.body.appendChild(fondo);

  host = document.createElement('aside');
  host.id = 'dt-minicart';
  host.className = 'dt-minicart';
  host.setAttribute('aria-label', 'Tu carrito');
  host.innerHTML =
    '<div class="dt-minicart-head">' +
      '<span>Mi carrito</span>' +
      '<button type="button" aria-label="Cerrar carrito"><span class="material-symbols-outlined">close</span></button>' +
    '</div>' +
    '<div class="dt-minicart-body" id="dt-minicart-body"></div>' +
    '<div class="dt-minicart-foot">' +
      '<div class="dt-minicart-linea"><span>Subtotal</span><strong id="dt-minicart-sub">$0</strong></div>' +
      '<div class="dt-minicart-linea dt-minicart-total"><span>Total</span><strong id="dt-minicart-total">$0</strong></div>' +
      '<div class="dt-minicart-botones">' +
        '<a href="carrito.html" class="dt-minicart-ver">Ver carrito</a>' +
        '<a href="carrito.html" class="dt-minicart-pagar">Continuar con el pago</a>' +
      '</div>' +
    '</div>';
  host.querySelector('.dt-minicart-head button')
      .addEventListener('click', function() { dtToggleMiniCart(true); });
  document.body.appendChild(host);
  return host;
}

function dtRenderMiniCart() {
  var host = dtMiniCartHost();
  var body = host.querySelector('#dt-minicart-body');
  var items = CartStore.getAll();

  body.innerHTML = '';

  if (!items.length) {
    var vacio = document.createElement('p');
    vacio.className = 'dt-minicart-vacio';
    vacio.textContent = 'Tu carrito está vacío.';
    body.appendChild(vacio);
  } else {
    items.forEach(function(item) {
      var fila = document.createElement('div');
      fila.className = 'dt-minicart-item';

      var img = document.createElement('img');
      img.src = item.image || '';
      img.alt = item.name || '';
      img.onerror = function() { this.style.visibility = 'hidden'; };

      var info = document.createElement('div');
      var nombre = document.createElement('strong');
      nombre.textContent = item.name || 'Producto';
      var detalle = document.createElement('span');
      detalle.textContent = item.qty + ' × ' + dtPlata(item.price);
      info.appendChild(nombre);
      info.appendChild(detalle);

      var quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.className = 'dt-minicart-quitar';
      quitar.setAttribute('aria-label', 'Quitar ' + (item.name || 'producto'));
      quitar.innerHTML = '<span class="material-symbols-outlined">close</span>';
      quitar.addEventListener('click', function() {
        CartStore.remove(item.id);
        dtRenderMiniCart();
        if (typeof renderCart === 'function') renderCart();
      });

      fila.appendChild(img);
      fila.appendChild(info);
      fila.appendChild(quitar);
      body.appendChild(fila);
    });
  }

  var total = items.reduce(function(acc, i) { return acc + i.price * i.qty; }, 0);
  host.querySelector('#dt-minicart-sub').textContent = dtPlata(total);
  host.querySelector('#dt-minicart-total').textContent = dtPlata(total);
}

function dtToggleMiniCart(forzarCerrado) {
  var host = dtMiniCartHost();
  var fondo = document.getElementById('dt-minicart-fondo');

  var abrir = forzarCerrado === true ? false : !host.classList.contains('is-open');
  if (abrir) dtRenderMiniCart();

  host.classList.toggle('is-open', abrir);
  if (fondo) fondo.classList.toggle('is-open', abrir);
  document.body.style.overflow = abrir ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', function() {
  // En carrito.html el icono no abre el panel: ya estas viendo el carrito.
  var enCarrito = /carrito\.html$/i.test(window.location.pathname);

  document.querySelectorAll('[data-cart-btn]').forEach(function(btn) {
    btn.onclick = null;
    btn.addEventListener('click', function(event) {
      event.preventDefault();
      if (enCarrito) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      dtToggleMiniCart();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') dtToggleMiniCart(true);
  });
});
