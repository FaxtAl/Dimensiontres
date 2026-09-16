/**
 * search-global.js - recomendaciones de productos fuera del catalogo.
 * Usa SupabaseStore para sugerir productos reales y redirige al catalogo.
 */
(function() {
  var productCache = null;
  var loadingPromise = null;
  var timers = new WeakMap();
  var searchRanking = window.DimensionTresSearch;

  function normalize(value) {
    if (searchRanking) return searchRanking.normalize(value);
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
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

  function collectInvidCategoryNames(items, out) {
    (items || []).forEach(function(item) {
      var name = item.invidCategoryName || item.name;
      if (name) out.push(String(name));
      if (item.children && item.children.length) collectInvidCategoryNames(item.children, out);
    });
  }

  function uniqueProducts(products) {
    var seen = new Set();
    return (products || []).filter(function(product) {
      if (!product) return false;
      var id = [
        product.source || '',
        product.id || product.accessId || product.productId || product.codigo || product.code || product.name || ''
      ].join(':');
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
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

      var accessPromise = (async function() {
        if (!window.SupabaseStore.fetchAccessCatalogTree || !window.SupabaseStore.fetchAccessProductsBySubcategory) return [];
        var tree = await window.SupabaseStore.fetchAccessCatalogTree();
        var ids = [];
        collectSubcategoryIds(tree, ids);
        ids = Array.from(new Set(ids));
        return runChunks(ids, 6, function(id) {
          return window.SupabaseStore.fetchAccessProductsBySubcategory(id);
        });
      })();

      var invidPromise = (async function() {
        if (!window.SupabaseStore.fetchInvidPcCatalogTree) return [];
        var tree = await window.SupabaseStore.fetchInvidPcCatalogTree();
        var names = [];
        collectInvidCategoryNames(tree, names);
        names = Array.from(new Set(names));
        if (!names.length) return [];
        if (window.SupabaseStore.fetchInvidPcProductsByCategories) {
          return window.SupabaseStore.fetchInvidPcProductsByCategories(names);
        }
        if (window.SupabaseStore.fetchInvidPcProductsByCategory) {
          return runChunks(names, 6, function(name) {
            return window.SupabaseStore.fetchInvidPcProductsByCategory(name);
          });
        }
        return [];
      })();

      var results = await Promise.allSettled([accessPromise, invidPromise]);
      var products = [];
      results.forEach(function(result) {
        if (result.status === 'fulfilled') products = products.concat(result.value || []);
      });
      productCache = uniqueProducts(products);
      return productCache;
    })();

    return loadingPromise;
  }

  function scoreProduct(product, query) {
    return searchRanking ? searchRanking.scoreProduct(product, query) : 0;
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
      .slice(0, 8)
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

  function getSearchImageCandidates(product, image) {
    var list = [];
    function push(url) {
      url = String(url || '').trim();
      if (url && list.indexOf(url) === -1) list.push(url);
    }
    push(image);
    push(product && product.image);
    push(product && product.supplierImage);
    var extra = product && (product.imageCandidates || product.apiImageCandidates);
    if (Array.isArray(extra)) extra.forEach(push);
    else push(extra);
    return list;
  }

  function attachSearchImageFallback(img, product, thumb) {
    var candidates = getSearchImageCandidates(product, img && img.getAttribute('src'));
    img.dataset.fallbackIndex = '0';
    img.onerror = function() {
      var nextIndex = Number(img.dataset.fallbackIndex || 0) + 1;
      if (nextIndex < candidates.length) {
        img.dataset.fallbackIndex = String(nextIndex);
        product.image = candidates[nextIndex];
        img.src = candidates[nextIndex];
        return;
      }
      thumb.innerHTML = '<span class="material-symbols-outlined">inventory_2</span>';
    };
  }

  function hideBox(input) {
    var box = ensureBox(input);
    if (box) box.classList.remove('active');
  }

  function renderLoading(input) {
    var box = ensureBox(input);
    if (!box) return;
    box.innerHTML = '<div class="global-search-empty">Buscando en todo el catalogo...</div>';
    box.classList.add('active');
  }

  function productSearchLocation(product) {
    product = product || {};
    return product.sourceLabel ||
      product.subcategory ||
      product.subcategoria ||
      product.category ||
      product.categoria ||
      product.rootCategory ||
      product.subtitle ||
      product.brand ||
      product.marca ||
      'Catalogo';
  }

  function renderViewAll(input, query, box) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'global-search-suggestion global-search-view-all';
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
    name.textContent = 'Ver todos los resultados';

    var meta = document.createElement('span');
    meta.className = 'global-search-meta';
    meta.textContent = String(query || '').trim();

    copy.appendChild(name);
    copy.appendChild(meta);
    item.appendChild(thumb);
    item.appendChild(copy);
    box.appendChild(item);
  }

  function renderSuggestions(input, products, query) {
    var box = ensureBox(input);
    if (!box) return;

    box.innerHTML = '';
    if (!products.length) {
      box.innerHTML = '<div class="global-search-empty">No aparecio en la vista rapida.</div>';
      renderViewAll(input, query, box);
      box.classList.add('active');
      return;
    }

    products.forEach(function(product) {
      var productName = product.name || product.nombre || product.title || product.titulo || product.producto || product.descripcion || product.description || product.codigo || product.code || product.id || 'Producto';
      var productMeta = 'En ' + productSearchLocation(product);

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
        img.alt = productName || 'Producto';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        attachSearchImageFallback(img, product, thumb);
        thumb.appendChild(img);
      } else {
        thumb.innerHTML = '<span class="material-symbols-outlined">' + (product.icon || 'inventory_2') + '</span>';
      }

      var copy = document.createElement('span');
      copy.className = 'global-search-copy';

      var name = document.createElement('span');
      name.className = 'global-search-name';
      name.textContent = productName || 'Producto';

      var meta = document.createElement('span');
      meta.className = 'global-search-meta';
      meta.textContent = productMeta || 'En Catalogo';

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

    renderViewAll(input, query, box);
    box.classList.add('active');
  }

  function renderCatalogShortcut(input, query) {
    var box = ensureBox(input);
    if (!box) return;

    box.innerHTML = '';
    box.innerHTML = '<div class="global-search-empty">No aparecio en la vista rapida.</div>';
    renderViewAll(input, query, box);
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
        try {
          var products = await loadProducts();
          if (!products.length) {
            renderCatalogShortcut(input, query);
            return;
          }
          renderSuggestions(input, getSuggestions(products, query), query);
        } catch (error) {
          console.warn('No se pudo cargar la busqueda global:', error);
          renderCatalogShortcut(input, query);
        }
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

  // Para el bot de preguntas (bot.js): reusa la misma carga de productos y el
  // mismo ranking que las sugerencias del buscador, sin duplicar codigo.
  window.DimensionTresSearchGlobal = {
    loadProducts: loadProducts,
    getSuggestions: getSuggestions,
    productUrl: productUrl,
    formatPrice: formatPrice
  };
})();
