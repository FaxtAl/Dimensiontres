/**
 * search-global.js - recomendaciones de productos fuera del catalogo.
 * Usa SupabaseStore para sugerir productos reales y redirige al catalogo.
 */
(function() {
  var productCache = null;
  var loadingPromise = null;
  var timers = new WeakMap();

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function formatPrice(value) {
    var amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) return '';
    return (CONFIG.CURRENCY_SYMBOL || '$') + amount.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function productUrl(product) {
    var slug = product.slug || (product.source === 'access' ? 'access-' + product.id : product.id);
    return 'producto.html?id=' + encodeURIComponent(slug);
  }

  function collectSubcategoryIds(items, out) {
    (items || []).forEach(function(item) {
      var fallback = String(item.id || '').match(/^subcat-(.+)$/);
      var subId = item.accessSubcategoryId || (fallback ? fallback[1] : '');
      if (subId) out.push(String(subId));
      if (item.children && item.children.length) collectSubcategoryIds(item.children, out);
    });
  }

  async function runChunks(values, size, worker) {
    var out = [];
    for (var i = 0; i < values.length; i += size) {
      var chunk = values.slice(i, i + size);
      var rows = await Promise.all(chunk.map(worker));
      rows.forEach(function(list) { out.push.apply(out, list || []); });
    }
    return out;
  }

  async function loadProducts() {
    if (productCache) return productCache;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async function() {
      if (!window.SupabaseStore || !window.SupabaseStore.isReady()) return [];

      var tree = await window.SupabaseStore.fetchAccessCatalogTree();
      var ids = [];
      collectSubcategoryIds(tree, ids);
      ids = Array.from(new Set(ids));

      var products = await runChunks(ids, 6, function(id) {
        return window.SupabaseStore.fetchAccessProductsBySubcategory(id);
      });

      var seen = new Set();
      productCache = products.filter(function(product) {
        var id = product.source + ':' + product.id;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return productCache;
    })();

    return loadingPromise;
  }

  function scoreProduct(product, query) {
    var name = normalize(product.name);
    var meta = normalize([product.category, product.sourceLabel, product.subtitle, product.description, product.code].join(' '));
    if (!name && !meta) return 0;
    if (name === query) return 100;
    if (name.startsWith(query)) return 85;
    if (name.includes(query)) return 65;
    if (meta.includes(query)) return 35;
    return 0;
  }

  function getSuggestions(products, query) {
    var normalized = normalize(query);
    if (normalized.length < 2) return [];

    return products
      .map(function(product) {
        return { product: product, score: scoreProduct(product, normalized) };
      })
      .filter(function(entry) { return entry.score > 0; })
      .sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.product.name || '').localeCompare(String(b.product.name || ''));
      })
      .slice(0, 5)
      .map(function(entry) { return entry.product; });
  }

  function ensureBox(input) {
    var host = input.closest('.relative') || input.parentElement;
    if (!host) return null;
    host.classList.add('global-search-host');

    var box = host.querySelector('.global-search-suggestions');
    if (!box) {
      box = document.createElement('div');
      box.className = 'global-search-suggestions';
      host.appendChild(box);
    }
    return box;
  }

  function hideBox(input) {
    var box = ensureBox(input);
    if (box) box.classList.remove('active');
  }

  function renderLoading(input) {
    var box = ensureBox(input);
    if (!box) return;
    box.innerHTML = '<div class="global-search-empty">Buscando productos...</div>';
    box.classList.add('active');
  }

  function renderSuggestions(input, products) {
    var box = ensureBox(input);
    if (!box) return;

    box.innerHTML = '';
    if (!products.length) {
      box.innerHTML = '<div class="global-search-empty">No encontramos productos con ese texto.</div>';
      box.classList.add('active');
      return;
    }

    products.forEach(function(product) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'global-search-suggestion';
      item.addEventListener('click', function() {
        window.location.href = productUrl(product);
      });

      var thumb = document.createElement('span');
      thumb.className = 'global-search-thumb';
      if (product.image) {
        var img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name || 'Producto';
        img.loading = 'lazy';
        img.onerror = function() {
          thumb.innerHTML = '<span class="material-symbols-outlined">inventory_2</span>';
        };
        thumb.appendChild(img);
      } else {
        thumb.innerHTML = '<span class="material-symbols-outlined">' + (product.icon || 'inventory_2') + '</span>';
      }

      var copy = document.createElement('span');
      copy.className = 'global-search-copy';

      var name = document.createElement('span');
      name.className = 'global-search-name';
      name.textContent = product.name || 'Producto';

      var meta = document.createElement('span');
      meta.className = 'global-search-meta';
      meta.textContent = product.sourceLabel || product.category || product.subtitle || 'Catalogo';

      var price = document.createElement('span');
      price.className = 'global-search-price';
      price.textContent = formatPrice(product.price);

      copy.appendChild(name);
      copy.appendChild(meta);
      item.appendChild(thumb);
      item.appendChild(copy);
      item.appendChild(price);
      box.appendChild(item);
    });

    box.classList.add('active');
  }

  function renderCatalogShortcut(input, query) {
    var box = ensureBox(input);
    if (!box) return;

    box.innerHTML = '';
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'global-search-suggestion';
    item.addEventListener('click', function() {
      goToCatalog(input);
    });

    var thumb = document.createElement('span');
    thumb.className = 'global-search-thumb';
    thumb.innerHTML = '<span class="material-symbols-outlined">search</span>';

    var copy = document.createElement('span');
    copy.className = 'global-search-copy';

    var name = document.createElement('span');
    name.className = 'global-search-name';
    name.textContent = 'Buscar en catalogo';

    var meta = document.createElement('span');
    meta.className = 'global-search-meta';
    meta.textContent = String(query || '').trim();

    copy.appendChild(name);
    copy.appendChild(meta);
    item.appendChild(thumb);
    item.appendChild(copy);
    box.appendChild(item);
    box.classList.add('active');
  }

  function goToCatalog(input) {
    var query = String(input.value || '').trim();
    if (!query) return;
    window.location.href = 'catalogo.html?q=' + encodeURIComponent(query);
  }

  function attachSearch(input) {
    if (!input || input.dataset.globalSearchReady === 'true') return;
    input.dataset.globalSearchReady = 'true';

    var host = input.closest('.relative') || input.parentElement;
    var button = host ? host.querySelector('button[aria-label="Buscar"], button') : null;

    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        goToCatalog(input);
      } else if (event.key === 'Escape') {
        hideBox(input);
      }
    });

    input.addEventListener('input', function() {
      var query = input.value;
      clearTimeout(timers.get(input));
      if (normalize(query).length < 2) {
        hideBox(input);
        return;
      }

      renderLoading(input);
      var timer = setTimeout(async function() {
        if (!window.CONFIG || window.CONFIG.LOW_EGRESS_MODE !== false) {
          renderCatalogShortcut(input, query);
          return;
        }

        var products = await loadProducts();
        renderSuggestions(input, getSuggestions(products, query));
      }, 220);
      timers.set(input, timer);
    });

    input.addEventListener('focus', function() {
      if (normalize(input.value).length >= 2) input.dispatchEvent(new Event('input'));
    });

    if (button) {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        goToCatalog(input);
      });
    }
  }

  document.addEventListener('click', function(event) {
    if (!event.target.closest('.global-search-host')) {
      document.querySelectorAll('.global-search-suggestions.active').forEach(function(box) {
        box.classList.remove('active');
      });
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-global-search], #search-input').forEach(attachSearch);
  });
})();
