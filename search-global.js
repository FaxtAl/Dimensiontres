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
      .replace(/\s+/g, ' ')
      .trim();
  }

  var SEARCH_ALIASES = [
    ['placa video', ['placa de video', 'placas de video', 'gpu', 'vga', 'rtx', 'radeon', 'nvidia']],
    ['joystick', ['joystic', 'joistick', 'joy', 'gamepad', 'control', 'dualsense', 'dualshock']],
    ['auricular', ['auriculares', 'auri', 'headset', 'headphone', 'audio']],
    ['teclado', ['teclados', 'teclado mecanico', 'keyboard']],
    ['mouse', ['mause', 'raton']],
    ['monitor', ['monitores', 'pantalla', 'display']],
    ['playstation', ['ps5', 'ps4', 'ps3', 'ps2', 'play', 'pley', 'sony']],
    ['xbox', ['x box', 'series x', 'series s']],
    ['nintendo', ['switch', 'oled']],
    ['memoria ram', ['ram', 'ddr4', 'ddr5', 'memorias']],
    ['almacenamiento', ['ssd', 'hdd', 'disco', 'disco rigido', 'pendrive', 'nvme']],
    ['motherboard', ['mother', 'placa madre', 'mainboard']],
    ['procesador', ['cpu', 'micro', 'ryzen', 'intel']],
    ['fuente', ['psu', 'fuente gamer']],
    ['gabinete', ['case', 'pc gamer', 'pc gamers']]
  ];

  function expandSearchAliases(text) {
    var normalized = normalize(text);
    if (!normalized) return '';
    var extra = [];
    SEARCH_ALIASES.forEach(function(group) {
      var words = [group[0]].concat(group[1] || []);
      var matched = words.some(function(word) {
        return normalized.indexOf(normalize(word)) !== -1;
      });
      if (matched) extra.push.apply(extra, words);
    });
    return normalize(normalized + ' ' + extra.join(' '));
  }

  function searchTokens(value) {
    return expandSearchAliases(value)
      .split(' ')
      .map(function(token) { return token.trim(); })
      .filter(function(token) { return token.length >= 2; });
  }

  function singularToken(token) {
    token = String(token || '');
    if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
    if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
    return token;
  }

  function levenshtein(a, b, max) {
    a = singularToken(a);
    b = singularToken(b);
    if (a === b) return 0;
    if (!a || !b) return Math.max(a.length, b.length);
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var previous = [];
    for (var j = 0; j <= b.length; j++) previous[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var current = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        rowMin = Math.min(rowMin, current[j]);
      }
      if (rowMin > max) return max + 1;
      previous = current;
    }
    return previous[b.length];
  }

  function tokenScore(queryToken, targetTokens, targetText) {
    var token = singularToken(queryToken);
    if (!token) return 0;
    if (targetText.indexOf(token) !== -1) return token.length >= 4 ? 5 : 3;
    var best = 0;
    targetTokens.forEach(function(target) {
      var cleanTarget = singularToken(target);
      if (!cleanTarget) return;
      if (cleanTarget === token) best = Math.max(best, 6);
      else if (cleanTarget.indexOf(token) === 0 || token.indexOf(cleanTarget) === 0) best = Math.max(best, 4);
      else if (token.length >= 4 && cleanTarget.length >= 4) {
        var maxDistance = token.length >= 7 ? 2 : 1;
        if (levenshtein(token, cleanTarget, maxDistance) <= maxDistance) best = Math.max(best, 2);
      }
    });
    return best;
  }

  function smartScore(fields, query) {
    var queryText = expandSearchAliases(query);
    if (queryText.length < 2) return 0;
    var targetText = expandSearchAliases(fields.filter(Boolean).join(' '));
    if (!targetText) return 0;
    if (targetText === queryText) return 1000;
    if (targetText.indexOf(queryText) !== -1) return 850;
    var queryTokens = searchTokens(queryText);
    var targetTokens = searchTokens(targetText);
    var total = 0;
    var matched = 0;
    queryTokens.forEach(function(token) {
      var score = tokenScore(token, targetTokens, targetText);
      if (score > 0) {
        total += score;
        matched++;
      }
    });
    if (!matched) return 0;
    if (queryTokens.length > 1 && matched < Math.ceil(queryTokens.length * 0.6)) return 0;
    return total + matched * 10;
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
    return smartScore([
      product.name,
      product.category,
      product.sourceLabel,
      product.subtitle,
      product.description,
      product.code,
      product.id,
      product.accessId
    ], query);
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
