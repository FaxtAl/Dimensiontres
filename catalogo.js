/**
 * catalogo.js — Filtros, búsqueda y sort del Catálogo | Dimensión Tres
 */

/* ── Estado global del filtro ── */
var currentFilter = 'all';
var currentSearch = '';

function normalizeSmartSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

var SMART_SEARCH_ALIASES = [
  ['placa video', ['placa de video', 'placas de video', 'gpu', 'vga', 'rtx', 'radeon']],
  ['joystick', ['joystic', 'joistick', 'joy', 'gamepad', 'control']],
  ['auricular', ['auriculares', 'auri', 'headset', 'audio']],
  ['teclado', ['teclados', 'teclado mecanico', 'keyboard']],
  ['mouse', ['mause', 'raton']],
  ['monitor', ['monitores', 'pantalla']],
  ['playstation', ['ps5', 'ps4', 'ps3', 'ps2', 'play', 'pley']],
  ['memoria ram', ['ram', 'ddr4', 'ddr5']],
  ['almacenamiento', ['ssd', 'hdd', 'disco', 'pendrive', 'nvme']]
];

function expandSmartSearch(value) {
  var text = normalizeSmartSearch(value);
  var extra = [];
  SMART_SEARCH_ALIASES.forEach(function(group) {
    var words = [group[0]].concat(group[1] || []);
    if (words.some(function(word) { return text.indexOf(normalizeSmartSearch(word)) !== -1; })) {
      extra.push.apply(extra, words);
    }
  });
  return normalizeSmartSearch(text + ' ' + extra.join(' '));
}

function smartCardMatches(text, query) {
  var target = expandSmartSearch(text);
  var q = expandSmartSearch(query);
  if (!q) return true;
  if (target.indexOf(q) !== -1) return true;
  return q.split(' ').filter(function(token) { return token.length >= 3; }).some(function(token) {
    return target.split(' ').some(function(word) {
      return word.indexOf(token) === 0 || token.indexOf(word) === 0 ||
        (token.length >= 4 && word.length >= 4 && Math.abs(token.length - word.length) <= 1 && word.slice(0, 3) === token.slice(0, 3));
    });
  });
}

/**
 * setFilter — activa un filtro de categoría.
 * @param {string} filter - slug del filtro ('all', 'hardware', etc.)
 * @param {HTMLElement} btn - botón clickeado para activar el estilo
 */
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
  if (btn && btn.classList) {
    btn.classList.add('active');
  }
  var mobileSelect = document.getElementById('category-mobile-select');
  if (mobileSelect) {
    mobileSelect.value = filter;
  }
  applyFilters();
}

/**
 * filterBySearch — filtra las tarjetas por texto de búsqueda.
 * @param {string} query - texto ingresado por el usuario
 */
function filterBySearch(query) {
  currentSearch = normalizeSmartSearch(query);
  applyFilters();
}

/**
 * applyFilters — aplica el filtro activo Y la búsqueda simultáneamente.
 */
function applyFilters() {
  var cards = document.querySelectorAll('.cat-card');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var matchesFilter = currentFilter === 'all' || card.dataset.category === currentFilter;
    var cardName      = card.dataset.name || '';
    var matchesSearch = currentSearch === '' || smartCardMatches(cardName, currentSearch);

    if (matchesFilter && matchesSearch) {
      card.classList.remove('hidden-filter');
      visibleCount++;
    } else {
      card.classList.add('hidden-filter');
    }
  });

  document.getElementById('visible-count').textContent = visibleCount;
  document.getElementById('empty-state').classList.toggle('hidden', visibleCount > 0);
  document.getElementById('categories-grid').style.display = visibleCount > 0 ? '' : 'none';
}

/**
 * sortCards — reordena las tarjetas dentro del grid.
 * @param {string} order - 'az', 'za', 'default'
 */
function sortCards(order) {
  var grid  = document.getElementById('categories-grid');
  var cards = Array.from(grid.querySelectorAll('.cat-card'));

  if (order === 'default') {
    cards.sort(function(a, b) {
      return (parseFloat(a.style.animationDelay) || 0) - (parseFloat(b.style.animationDelay) || 0);
    });
  } else {
    cards.sort(function(a, b) {
      return order === 'az'
        ? a.dataset.name.localeCompare(b.dataset.name, 'es')
        : b.dataset.name.localeCompare(a.dataset.name, 'es');
    });
  }

  cards.forEach(function(c) { grid.appendChild(c); });
}

/**
 * resetFilters — reinicia búsqueda y filtro activo.
 */
function resetFilters() {
  currentFilter = 'all';
  currentSearch = '';
  document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
  var allPill = document.querySelector('[data-filter="all"]');
  if (allPill) allPill.classList.add('active');
  ['search-catalog', 'search-filter-mobile', 'category-mobile-select'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  applyFilters();
}

/**
 * handleSearch — filtra en la misma página.
 */
function handleSearch(query) {
  if (!query || !query.trim()) return;
  filterBySearch(query.trim());
  var el = document.getElementById('search-catalog');
  if (el) el.focus();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
});
