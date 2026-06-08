/**
 * index.js - Logica del inicio | Dimension Tres
 */

function handleSearch() {
  var desktopInput = document.getElementById('search-input');
  var query = (desktopInput ? desktopInput.value : '').trim();
  if (!query) return;
  window.location.href = 'catalogo.html?q=' + encodeURIComponent(query);
}

function handleViewCatalog() {
  window.location.href = 'catalogo.html';
}

(function initDestCarousel() {
  var track;
  var cards = [];
  var dots = [];
  var current = 0;
  var dragging = false;
  var startX = 0;

  function getPerPage() {
    return window.innerWidth >= 768 ? 3 : 1;
  }

  function setSlide(idx) {
    if (!track || !cards.length) return;
    var perPage = getPerPage();
    var maxIdx = Math.max(0, cards.length - perPage);
    current = Math.max(0, Math.min(idx, maxIdx));

    var wrap = track.parentElement;
    var gap = perPage > 1 ? 32 : 0;
    var cardW = (wrap.offsetWidth - gap * (perPage - 1)) / perPage;

    cards.forEach(function(card) {
      card.style.minWidth = cardW + 'px';
      card.style.maxWidth = cardW + 'px';
    });

    track.style.transform = 'translateX(' + (-(current * (cardW + gap))) + 'px)';

    dots.forEach(function(dot, index) {
      dot.style.background = index === current ? '#8ff5ff' : '#262626';
      dot.style.width = index === current ? '20px' : '8px';
    });
  }

  window.destCarousel = function(dir) {
    setSlide(current + dir);
  };

  function buildDots() {
    var dotsEl = document.getElementById('dest-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    dots = [];
    var perPage = getPerPage();
    var total = Math.max(1, cards.length - perPage + 1);
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.style.cssText = 'height:8px;border-radius:4px;border:none;background:#262626;cursor:pointer;transition:all .3s;padding:0;width:8px;';
      (function(index) {
        dot.addEventListener('click', function() { setSlide(index); });
      })(i);
      dotsEl.appendChild(dot);
      dots.push(dot);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    track = document.getElementById('dest-track');
    if (!track) return;
    cards = Array.from(track.children);
    buildDots();
    setSlide(0);

    var wrap = track.parentElement;
    wrap.addEventListener('touchstart', function(event) {
      startX = event.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function(event) {
      var dx = event.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) window.destCarousel(dx < 0 ? 1 : -1);
    }, { passive: true });

    wrap.addEventListener('mousedown', function(event) {
      dragging = true;
      startX = event.clientX;
      wrap.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', function(event) {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = 'grab';
      var dx = event.clientX - startX;
      if (Math.abs(dx) > 40) window.destCarousel(dx < 0 ? 1 : -1);
    });

    window.addEventListener('resize', function() {
      buildDots();
      setSlide(Math.min(current, cards.length - getPerPage()));
    });
  });
})();

function checkStoreStatus() {
  var now = new Date();
  var utc = now.getTime() + now.getTimezoneOffset() * 60000;
  var argTime = new Date(utc + (-3 * 60 * 60000));
  var totalMinutes = argTime.getHours() * 60 + argTime.getMinutes();
  var isOpen = (totalMinutes >= 540 && totalMinutes < 780) ||
               (totalMinutes >= 990 && totalMinutes < 1230);

  var badge = document.getElementById('store-status');
  if (!badge) return;

  if (isOpen) {
    badge.innerHTML = '<span style="color:#00f0e0">&bull;</span> Abierto ahora';
    badge.style.color = '#00f0e0';
    badge.style.borderColor = '#00f0e0';
    badge.style.background = 'rgba(0,240,224,0.07)';
  } else {
    badge.innerHTML = '<span style="color:#ff716c">&bull;</span> Cerrado ahora';
    badge.style.color = '#ff716c';
    badge.style.borderColor = '#ff716c';
    badge.style.background = 'rgba(255,113,108,0.07)';
  }
}

function formatHomeMoney(value) {
  var amount = Number(value || 0);
  var hasCents = Math.abs(amount - Math.round(amount)) > 0.009;
  return (CONFIG.CURRENCY_SYMBOL || '$') + amount.toLocaleString('es-AR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function normalizeHomeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function homeCatalogHref(item) {
  return 'catalogo.html?catid=' + encodeURIComponent(item.id);
}

function homeProductHref(product) {
  return 'producto.html?id=' + encodeURIComponent(product.slug);
}

function homeCategoryMeta(name) {
  var text = normalizeHomeText(name);
  if (text.indexOf('consolas de juegos') !== -1) {
    return {
      title: 'Consolas',
      subtitle: 'PS4 - Retro - Consolas',
      icon: 'sports_esports',
      image: 'img/Consolas.jpg'
    };
  }
  if (text.indexOf('accesorios consolas') !== -1) {
    return {
      title: 'Accesorios Consolas',
      subtitle: 'PS5 - PS4 - PS3 - PS2',
      icon: 'gamepad',
      image: 'img/Consolas_Accesorios.jpg'
    };
  }
  if (text.indexOf('hardware') !== -1) {
    return {
      title: 'Hardware',
      subtitle: 'Procesadores - Mother - Fuentes',
      icon: 'memory',
      image: 'img/hadware.jpg'
    };
  }
  if (text.indexOf('accesorio pc') !== -1) {
    return {
      title: 'Accesorio PC',
      subtitle: 'Discos - Redes - Otros',
      icon: 'storage',
      image: 'img/hadware.jpg'
    };
  }
  if (text.indexOf('perifericos pc') !== -1) {
    return {
      title: 'Perifericos PC',
      subtitle: 'Mouse - Teclados - Monitores',
      icon: 'mouse',
      image: 'img/perifericos.jpg'
    };
  }
  if (text.indexOf('memoria') !== -1) {
    return {
      title: 'Memorias',
      subtitle: 'SSD - Discos - Pendrives',
      icon: 'storage',
      image: 'img/hadware.jpg'
    };
  }
  if (text.indexOf('auricular') !== -1) {
    return {
      title: 'Auriculares',
      subtitle: 'Gamer - Vincha - In ear',
      icon: 'headphones',
      image: 'img/auriculares.jpg'
    };
  }
  if (text.indexOf('parlante') !== -1) {
    return {
      title: 'Parlantes',
      subtitle: 'Bluetooth - PC - Portatil',
      icon: 'speaker',
      image: 'img/parlantes.jpg'
    };
  }
  if (text.indexOf('silla') !== -1) {
    return {
      title: 'Silla Gamer',
      subtitle: 'Comodidad para setup',
      icon: 'chair',
      image: 'img/silla-gamer.jpg'
    };
  }
  if (text.indexOf('accesorio celular') !== -1 || text.indexOf('celular') !== -1) {
    return {
      title: 'Accesorio Celular',
      subtitle: 'Cables - Cargadores - Powerbank',
      icon: 'inventory_2',
      image: 'img/accesorio-celular.jpg'
    };
  }
  if (text.indexOf('adaptador') !== -1) {
    return {
      title: 'Adaptadores',
      subtitle: 'Conversores - Hubs - Carga',
      icon: 'device_hub',
      image: 'img/adaptadores.jpg'
    };
  }
  if (text.indexOf('cable') !== -1) {
    return {
      title: 'Cables',
      subtitle: 'HDMI - USB - Red - Corriente',
      icon: 'cable',
      image: 'img/cables.jpg'
    };
  }
  return {
    title: name,
    subtitle: 'Ver productos disponibles',
    icon: 'inventory_2',
    image: 'img/Water%20cooler%20corner.jpg'
  };
}

function pickHomeCategories(tree) {
  var wanted = [
    'Consolas de juegos',
    'Accesorios Consolas',
    'Hardware',
    'Perifericos PC',
    'Auriculares',
    'Cables'
  ];
  return wanted
    .map(function(name) {
      var target = normalizeHomeText(name);
      return tree.find(function(item) { return normalizeHomeText(item.name) === target; });
    })
    .filter(Boolean);
}

function renderHomeCategories(tree) {
  var grid = document.getElementById('home-category-grid');
  if (!grid) return;
  var categories = pickHomeCategories(tree);
  if (!categories.length) return;

  grid.innerHTML = '';
  categories.forEach(function(item, index) {
    var meta = homeCategoryMeta(item.name);
    var card = document.createElement('a');
    card.className = (index === 0 || index === categories.length - 1 ? 'sm:col-span-2 lg:col-span-1 ' : '') +
      'group block relative overflow-hidden bg-surface-container cursor-pointer min-h-[220px]';
    card.href = homeCatalogHref(item);
    card.setAttribute('aria-label', 'Ver categoria ' + meta.title);

    var img = document.createElement('img');
    img.alt = meta.title;
    img.className = 'w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700 absolute inset-0';
    img.src = meta.image;
    card.appendChild(img);

    var gradient = document.createElement('div');
    gradient.className = 'absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent';
    card.appendChild(gradient);

    var content = document.createElement('div');
    content.className = 'absolute bottom-6 left-6 right-6';
    content.innerHTML =
      '<span class="material-symbols-outlined text-primary mb-2 text-3xl">' + meta.icon + '</span>' +
      '<h3 class="font-headline text-xl md:text-2xl font-black uppercase tracking-tighter">' + meta.title + '</h3>' +
      '<p class="text-on-surface-variant text-xs uppercase tracking-widest mt-1">' + meta.subtitle + '</p>';
    card.appendChild(content);
    grid.appendChild(card);
  });
}

function renderHomePromo(tree) {
  var promo = document.getElementById('home-promo-card');
  if (!promo) return;
  var item = tree.find(function(cat) { return normalizeHomeText(cat.name) === 'hardware'; }) || tree[0];
  if (!item) return;

  var meta = homeCategoryMeta(item.name);
  var img = promo.querySelector('img');
  if (img) {
    img.src = meta.image;
    img.alt = meta.title;
  }
  var kicker = promo.querySelector('.setup-kicker');
  var title = promo.querySelector('.setup-promo-title');
  var text = promo.querySelector('.setup-promo-text');
  var link = promo.querySelector('.setup-promo-link');

  if (kicker) kicker.textContent = 'Productos del catalogo';
  if (title) title.textContent = meta.title;
  if (text) text.textContent = 'Entra directo a productos reales cargados desde la base: stock, precios y categorias actualizadas.';
  if (link) link.innerHTML = 'Ver productos <span class="material-symbols-outlined text-[18px]">arrow_forward</span>';
  promo.onclick = function() { window.location.href = homeCatalogHref(item); };
}

function setFeaturedProductImage(media, product, image) {
  if (!media || !product || !image || media.querySelector('img')) return;
  product.image = image;
  var icon = media.querySelector('.feat-icon');
  if (icon) icon.remove();
  var img = document.createElement('img');
  img.className = 'feat-card-img';
  img.src = image;
  img.alt = product.name || 'Producto';
  media.insertBefore(img, media.firstChild);
}

async function hydrateFeaturedProductImage(product, media) {
  if (!window.SupabaseStore || !window.SupabaseStore.findMercadoLibreImage) return;
  var image = await window.SupabaseStore.findMercadoLibreImage(product);
  setFeaturedProductImage(media, product, image);
}

function createFeaturedProductCard(product) {
  var card = document.createElement('div');
  card.className = 'featured-card group';
  card.dataset.productCard = '';
  card.onclick = function() { window.location.href = homeProductHref(product); };

  var media = document.createElement('div');
  media.className = 'feat-img-wrap';
  if (product.image) {
    var img = document.createElement('img');
    img.className = 'feat-card-img';
    img.src = product.image;
    img.alt = product.name;
    media.appendChild(img);
  } else {
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined feat-icon';
    icon.textContent = product.icon || 'inventory_2';
    media.appendChild(icon);
    hydrateFeaturedProductImage(product, media);
  }
  var line = document.createElement('div');
  line.className = 'feat-bottom-line';
  media.appendChild(line);
  card.appendChild(media);

  var body = document.createElement('div');
  body.className = 'feat-body';

  var tag = document.createElement('p');
  tag.className = 'feat-tag';
  tag.textContent = product.sourceLabel || product.category || 'Catalogo';
  body.appendChild(tag);

  var name = document.createElement('p');
  name.className = 'feat-name';
  name.textContent = product.name;
  body.appendChild(name);

  var price = document.createElement('p');
  price.className = 'feat-price';
  price.textContent = formatHomeMoney(product.price);
  body.appendChild(price);

  var btn = document.createElement('button');
  btn.className = 'feat-btn';
  btn.type = 'button';
  var byOrder = typeof isByOrderProduct === 'function' && isByOrderProduct(product);
  btn.textContent = byOrder ? 'A pedido' : 'Agregar al carrito';
  btn.addEventListener('click', function(event) {
    event.stopPropagation();
    if (typeof addToCartUI !== 'function') return;
    addToCartUI(btn, {
      id: product.slug,
      name: product.name,
      price: product.price,
      ref: product.model || '',
      category: product.sourceLabel || product.category || '',
      image: product.image || '',
      stock: product.stock,
      accessId: product.accessId || product.id || '',
      sourceLabel: product.sourceLabel || '',
      byOrder: byOrder
    });
  });
  body.appendChild(btn);
  card.appendChild(body);
  return card;
}

function wireStaticSetupLinks() {
  var grid = document.getElementById('home-featured-grid');
  if (!grid) return;

  var links = [
    { href: 'catalogo.html?q=joystick', label: 'Ver joysticks' },
    { href: 'catalogo.html?q=teclado', label: 'Ver teclados' },
    { href: 'catalogo.html?q=mouse', label: 'Ver mouses' },
    { href: 'catalogo.html?q=auricular', label: 'Ver audio' },
    { href: 'catalogo.html?q=monitor', label: 'Ver monitores' },
    { href: 'catalogo.html?q=ssd', label: 'Ver almacenamiento' }
  ];

  Array.from(grid.querySelectorAll('.featured-card')).forEach(function(card, index) {
    if (card.dataset.productCard) return;
    var target = links[index] || { href: 'catalogo.html', label: 'Ver catalogo' };
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.onclick = function() { window.location.href = target.href; };
    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') window.location.href = target.href;
    });

    var button = card.querySelector('.feat-btn');
    if (button) {
      button.textContent = target.label;
      button.onclick = function(event) {
        event.stopPropagation();
        window.location.href = target.href;
      };
    }
  });
}

async function loadHomeFeaturedProducts(tree) {
  if (!window.SupabaseStore) return [];
  var categories = pickHomeCategories(tree);
  var batches = await Promise.all(categories.map(function(item) {
    return fetchHomeProductsForCategory(item)
      .then(function(products) {
        return (products || [])
          .filter(function(product) { return Number(product.price || 0) > 0; })
          .slice(0, 2);
      })
      .catch(function() { return []; });
  }));

  var seen = {};
  return batches.reduce(function(all, group) {
    return all.concat(group);
  }, []).filter(function(product) {
    if (!product.slug || seen[product.slug]) return false;
    seen[product.slug] = true;
    return true;
  }).slice(0, 6);
}

function renderHomeFeaturedProducts(products) {
  var grid = document.getElementById('home-featured-grid');
  if (!grid || !products.length) return;
  grid.innerHTML = '';
  products.forEach(function(product) {
    grid.appendChild(createFeaturedProductCard(product));
  });
}

function collectHomeAccessSubcategoryIds(item) {
  var ids = [];
  function walk(node) {
    if (!node) return;
    if (node.accessSubcategoryId && ids.indexOf(String(node.accessSubcategoryId)) === -1) {
      ids.push(String(node.accessSubcategoryId));
    }
    (node.children || []).forEach(walk);
  }
  walk(item);
  return ids;
}

async function fetchHomeProductsForCategory(item) {
  if (!window.SupabaseStore) return [];

  var subcategoryIds = collectHomeAccessSubcategoryIds(item);
  if ((item.useChildrenForProducts || !item.accessCategoryId) && subcategoryIds.length && window.SupabaseStore.fetchAccessProductsBySubcategory) {
    var groups = await Promise.all(subcategoryIds.map(function(id) {
      return window.SupabaseStore.fetchAccessProductsBySubcategory(id).catch(function() { return []; });
    }));
    return groups.reduce(function(all, group) {
      return all.concat(group || []);
    }, []);
  }

  if (item.accessCategoryId && window.SupabaseStore.fetchAccessProductsByCategory) {
    return window.SupabaseStore.fetchAccessProductsByCategory(item.accessCategoryId).catch(function() { return []; });
  }

  return [];
}

async function loadHomeCatalogSections() {
  if (!window.SupabaseStore || !window.SupabaseStore.isReady || !window.SupabaseStore.isReady()) return;
  if (!window.SupabaseStore.fetchAccessCatalogTree) return;

  try {
    var tree = await window.SupabaseStore.fetchAccessCatalogTree();
    if (!tree || !tree.length) return;
    renderHomeCategories(tree);
    renderHomePromo(tree);
    if (window.CONFIG && window.CONFIG.LOW_EGRESS_MODE !== false) return;
    var products = await loadHomeFeaturedProducts(tree);
    renderHomeFeaturedProducts(products);
  } catch (err) {
    console.warn('No se pudo actualizar el inicio desde Supabase:', err);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  checkStoreStatus();
  setInterval(checkStoreStatus, 60000);
  wireStaticSetupLinks();
  loadHomeCatalogSections();
});
