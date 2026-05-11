/**
 * catalogo.js — Filtros, búsqueda y sort del Catálogo | Dimensión Tres
 */

/* ── Estado global del filtro ── */
var currentFilter = 'all';
var currentSearch = '';

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
  currentSearch = query.toLowerCase().trim();
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
    var cardName      = card.dataset.name.toLowerCase();
    var matchesSearch = currentSearch === '' || cardName.includes(currentSearch);

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
