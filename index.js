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

// Carrusel de imagenes para el fondo de Inicio. El texto y los botones se
// mantienen fijos para que la portada siga siendo clara y facil de usar.
// Solo banners en la portada. Van sin palabras adentro: el titulo, la bajada
// y los botones son HTML del sitio y se dibujan encima.
var HOME_HERO_IMAGES = [
  { src: 'img/banners/proximos-estrenos.webp?v=banners-limpios-20260826', alt: 'Proximos estrenos de juegos para PS5', banner: true },
  { src: 'img/banners/perifericos-logitech.webp?v=banners-limpios-20260826', alt: 'Perifericos Logitech G', banner: true },
  { src: 'img/banners/arma-tu-pc.webp?v=banners-limpios-20260826', alt: 'Arma tu PC ideal con componentes seleccionados', banner: true }
];

function initHomeHeroCarousel() {
  var image = document.getElementById('home-hero-image');
  var dots = Array.from(document.querySelectorAll('[data-home-hero-dot]'));
  if (!image || HOME_HERO_IMAGES.length < 2) return;

  var currentIndex = 0;
  function setActiveDot() {
    dots.forEach(function(dot, index) {
      dot.classList.toggle('is-active', index === currentIndex);
    });
  }
  var seccion = document.getElementById('inicio');

  // El texto del sitio se muestra siempre: los banners van sin palabras y el
  // titulo, la bajada y los botones viven en HTML encima.
  function aplicarModoBanner(item) {
    if (!seccion) return;
    seccion.classList.toggle('es-banner', item.banner === true);
  }

  function applyNextImage(nextIndex, next) {
    image.classList.add('is-switching');
    window.setTimeout(function() {
      image.src = next.src;
      image.alt = next.alt;
      currentIndex = nextIndex;
      setActiveDot();
      aplicarModoBanner(next);
      image.classList.remove('is-switching');
    }, 430);
  }

  // El primero del arreglo es un banner, asi que el modo se aplica de entrada.
  aplicarModoBanner(HOME_HERO_IMAGES[0]);
  function showNextImage() {
    if (document.hidden) return;
    var nextIndex = (currentIndex + 1) % HOME_HERO_IMAGES.length;
    var next = HOME_HERO_IMAGES[nextIndex];
    var preload = new Image();
    var handled = false;
    var fallbackTimer = window.setTimeout(function() {
      if (handled) return;
      handled = true;
      applyNextImage(nextIndex, next);
    }, 900);
    preload.onload = function() {
      if (handled) return;
      handled = true;
      window.clearTimeout(fallbackTimer);
      applyNextImage(nextIndex, next);
    };
    preload.onerror = function() {
      if (handled) return;
      handled = true;
      window.clearTimeout(fallbackTimer);
      applyNextImage(nextIndex, next);
    };
    preload.src = next.src;
  }

  setActiveDot();
  // 3 segundos era muy poco: no daba tiempo a mirar el banner ni a leer el
  // texto de encima antes de que cambiara.
  window.setInterval(showNextImage, 7000);
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

var STORE_HOLIDAYS = new Set([
  '2026-01-01',
  '2026-02-16', '2026-02-17',
  '2026-03-23', '2026-03-24',
  '2026-04-02', '2026-04-03',
  '2026-05-01', '2026-05-25',
  '2026-06-15', '2026-06-20',
  '2026-07-09', '2026-07-10',
  '2026-08-17',
  '2026-10-12',
  '2026-11-23',
  '2026-12-07', '2026-12-08', '2026-12-25'
]);

function getStoreClock(date) {
  var parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Cordoba',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date || new Date());
  var values = {};
  parts.forEach(function(part) {
    if (part.type !== 'literal') values[part.type] = part.value;
  });
  return {
    dateKey: values.year + '-' + values.month + '-' + values.day,
    weekday: values.weekday,
    totalMinutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function getStoreStatus(date) {
  var clock = getStoreClock(date);
  var isHoliday = STORE_HOLIDAYS.has(clock.dateKey);
  var isSunday = clock.weekday === 'Sun';
  var isBusinessDay = !isSunday && !isHoliday;
  var isWithinHours = (clock.totalMinutes >= 540 && clock.totalMinutes < 780) ||
                      (clock.totalMinutes >= 990 && clock.totalMinutes < 1230);

  return {
    isOpen: isBusinessDay && isWithinHours,
    reason: isHoliday ? 'holiday' : (isSunday ? 'sunday' : 'hours'),
    dateKey: clock.dateKey
  };
}

function checkStoreStatus() {
  var status = getStoreStatus(new Date());

  var badge = document.getElementById('store-status');
  if (!badge) return;

  badge.dataset.state = status.isOpen ? 'open' : 'closed';
  badge.dataset.reason = status.reason;

  if (status.isOpen) {
    badge.innerHTML = '<span style="color:#00f0e0">&bull;</span> Abierto ahora';
    badge.style.color = '#00f0e0';
    badge.style.borderColor = '#00f0e0';
    badge.style.background = 'rgba(0,240,224,0.07)';
  } else {
    var closedText = status.reason === 'holiday' ? 'Cerrado por feriado' :
                     (status.reason === 'sunday' ? 'Cerrado hoy' : 'Cerrado ahora');
    badge.innerHTML = '<span style="color:#ff716c">&bull;</span> ' + closedText;
    badge.style.color = '#ff716c';
    badge.style.borderColor = '#ff716c';
    badge.style.background = 'rgba(255,113,108,0.07)';
  }
}

window.DT_STORE_SCHEDULE = {
  getStatus: getStoreStatus,
  holidays: Array.from(STORE_HOLIDAYS)
};

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
  if (item && item.href) return item.href;
  return 'catalogo.html?catid=' + encodeURIComponent(item.id);
}

function homeProductHref(product) {
  return 'producto.html?id=' + encodeURIComponent(product.slug);
}

function homeCategoryMeta(name) {
  var text = normalizeHomeText(name);
  if (text.indexOf('placas de video') !== -1) {
    return {
      title: 'Placas de video',
      subtitle: 'GPU - RTX - Radeon',
      icon: 'memory',
      image: 'img/hadware.jpg'
    };
  }
  if (text === 'consolas' || text.indexOf('consolas de juegos') !== -1) {
    return {
      title: 'Consolas',
      subtitle: 'PS4 - Retro - Consolas',
      icon: 'sports_esports',
      image: 'img/categorias/consolas.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('juegos fisicos') !== -1 || text.indexOf('juegos originales') !== -1) {
    return {
      title: 'Juegos Físicos',
      subtitle: 'PS5 - PS4 - PS3',
      icon: 'stadia_controller',
      image: 'img/categorias/juegos-fisicos.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('accesorios consolas') !== -1 || text.indexOf('accesorios para consolas') !== -1) {
    return {
      title: 'Accesorios Consolas',
      subtitle: 'PS5 - PS4 - PS3 - PS2',
      icon: 'gamepad',
      image: 'img/categorias/accesorios-consolas.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('pc y componentes') !== -1) {
    return {
      title: 'PC y Componentes',
      subtitle: 'Procesador - Mother - Placa de Video',
      icon: 'memory',
      image: 'img/categorias/pc-componentes.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('hardware') !== -1) {
    return {
      title: 'PC y Componentes',
      subtitle: 'Procesadores - Mother - Fuentes',
      icon: 'memory',
      image: 'img/categorias/pc-componentes.png?v=categorias-iguales-20260923'
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
      title: 'Periféricos PC',
      subtitle: 'Mouse - Teclados - Monitores',
      icon: 'mouse',
      image: 'img/categorias/perifericos-pc.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('monitores') !== -1) {
    return {
      title: 'Monitores',
      subtitle: 'Gaming - Oficina - 144Hz',
      icon: 'desktop_windows',
      image: 'img/perifericos.jpg'
    };
  }
  if (text.indexOf('pc gamers') !== -1 || text.indexOf('pc gamer') !== -1) {
    return {
      title: 'PC Gamers',
      subtitle: 'Gabinetes - Setups - Armados',
      icon: 'desktop_windows',
      image: 'img/hadware.jpg'
    };
  }
  if (text.indexOf('teclados mecanicos') !== -1 || text.indexOf('teclados') !== -1) {
    return {
      title: 'Teclados mecánicos',
      subtitle: 'Redragon - Gamer - RGB',
      icon: 'keyboard',
      image: 'img/perifericos.jpg'
    };
  }
  if (text.indexOf('almacenamiento') !== -1) {
    return {
      title: 'Almacenamiento',
      subtitle: 'SSD - HDD - Pendrives - MicroSD',
      icon: 'storage',
      image: 'img/categorias/almacenamiento.png?v=categorias-iguales-20260923'
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
      image: 'img/categorias/auriculares.png?v=categorias-iguales-20260923'
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
      image: 'img/categorias/accesorio-celular.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('adaptador') !== -1) {
    return {
      title: 'Adaptadores',
      subtitle: 'Conversores - Hubs - Carga',
      icon: 'device_hub',
      image: 'img/categorias/adaptadores.png?v=categorias-iguales-20260923'
    };
  }
  if (text.indexOf('cable') !== -1) {
    return {
      title: 'Cables',
      subtitle: 'HDMI - USB - Red - Corriente',
      icon: 'cable',
      image: 'img/categorias/cables.png?v=categorias-iguales-20260923'
    };
  }
  if (text === 'otros' || text.indexOf('otros') !== -1) {
    return {
      title: 'Otros',
      subtitle: 'Productos varios del catalogo',
      icon: 'inventory_2',
      image: 'img/Water%20cooler%20corner.jpg'
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
  // Diez accesos visuales a categorias reales del catalogo.
  var wanted = [
    { title: 'Consolas', source: 'Consolas de juegos', href: 'catalogo.html?catid=cat-consolas-de-juegos' },
    { title: 'Juegos físicos', source: 'Juegos Fisicos', href: 'catalogo.html?catid=cat-juegos-fisicos' },
    { title: 'Accesorios para consolas', source: 'Accesorios Consolas', href: 'catalogo.html?catid=cat-accesorios-consolas' },
    { title: 'PC y componentes', source: 'PC y Componentes', href: 'catalogo.html?catid=cat-pc-y-componentes' },
    { title: 'Periféricos PC', source: 'Periféricos PC', href: 'catalogo.html?catid=cat-perifericos-pc' },
    { title: 'Almacenamiento', source: 'Almacenamiento', href: 'catalogo.html?catid=cat-almacenamiento' },
    { title: 'Cables', source: 'Cables', href: 'catalogo.html?catid=cat-cables' },
    { title: 'Adaptadores', source: 'Adaptadores', href: 'catalogo.html?catid=cat-adaptadores' },
    { title: 'Accesorios para celular', source: 'Accesorio Celular', href: 'catalogo.html?catid=cat-accesorio-celular' },
    { title: 'Auriculares', source: 'Auriculares', href: 'catalogo.html?catid=cat-auriculares' }
  ];

  // Fallbacks estaticos (mismo slugify que catalogSlug del supabase-client.js)
  function slug(name) {
    return 'cat-' + String(name || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  var fallbacks = wanted.reduce(function(acc, entry) {
    var source = entry.source || entry.title;
    acc[normalizeHomeText(source)] = { id: slug(source), name: source };
    return acc;
  }, {});

  return wanted.map(function(entry) {
    var target = normalizeHomeText(entry.source || entry.title);
    var found = (tree || []).find(function(item) { return normalizeHomeText(item.name) === target; });
    var base = found || fallbacks[target] || null;
    if (!base) return null;
    var item = Object.assign({}, base);
    item.homeTitle = entry.title;
    if (entry.href) item.href = entry.href;
    return item;
  }).filter(Boolean);
}

function renderHomeCategories(tree) {
  var grid = document.getElementById('home-category-grid');
  if (!grid) return;
  var categories = pickHomeCategories(tree);
  if (!categories.length) return;

  grid.innerHTML = '';
  categories.forEach(function(item) {
    var meta = homeCategoryMeta(item.homeTitle || item.name);
    var card = document.createElement('a');
    card.className = 'home-category-card';
    card.href = homeCatalogHref(item);
    card.setAttribute('aria-label', 'Ver categoria ' + meta.title);

    var img = document.createElement('img');
    img.alt = meta.title;
    img.src = meta.image;
    var media = document.createElement('span');
    media.className = 'home-category-media';
    media.appendChild(img);
    card.appendChild(media);

    // Sin texto debajo: la tarjeta es solo la foto. El nombre de la categoria
    // sigue en el aria-label para quien navega con lector de pantalla.
    grid.appendChild(card);
  });
}

function renderHomePromo(tree) {
  var promo = document.getElementById('home-promo-card');
  if (!promo) return;
  var item = tree.find(function(cat) {
    var text = normalizeHomeText(cat.name);
    return text === 'hardware' || text === 'pc y componentes';
  }) || tree[0];
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

  // Antes decia siempre "Productos del catalogo", un texto decorativo
  // que no cambiaba nunca. Se reemplaza por un dato real: cuantos
  // productos tiene esa categoria, que ya viene calculado en el arbol
  // (item.productCount).
  var cantidad = Number(item.productCount || 0);
  if (kicker) {
    kicker.textContent = cantidad > 0
      ? cantidad.toLocaleString('es-AR') + ' productos disponibles'
      : 'Productos del catalogo';
  }
  if (title) title.textContent = meta.title;
  if (text) {
    text.textContent = '';
    text.style.display = 'none';
  }
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
  img.referrerPolicy = 'no-referrer';
  attachFeaturedImageFallback(img, product, media);
  media.insertBefore(img, media.firstChild);
}

function getFeaturedImageCandidates(product, image) {
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

function attachFeaturedImageFallback(img, product, media) {
  if (!img || !product || !media) return;
  var candidates = getFeaturedImageCandidates(product, img.getAttribute('src'));
  img.dataset.fallbackIndex = '0';
  img.onerror = function() {
    var nextIndex = Number(img.dataset.fallbackIndex || 0) + 1;
    if (nextIndex < candidates.length) {
      img.dataset.fallbackIndex = String(nextIndex);
      product.image = candidates[nextIndex];
      img.src = candidates[nextIndex];
      return;
    }
    img.remove();
    if (!media.querySelector('.feat-icon')) {
      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined feat-icon';
      icon.textContent = product.icon || 'inventory_2';
      media.insertBefore(icon, media.firstChild);
    }
  };
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
    img.referrerPolicy = 'no-referrer';
    attachFeaturedImageFallback(img, product, media);
    media.appendChild(img);
  } else {
    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined feat-icon';
    icon.textContent = product.icon || 'inventory_2';
    media.appendChild(icon);
    hydrateFeaturedProductImage(product, media);
  }
  // Misma tarjeta que el catalogo: disponibilidad como pildora sobre la foto,
  // categoria y nombre, y un pie con precio (+ "Quedan pocas") y boton-icono.
  var esProveedor = product.fulfillment === 'provider' || product.sourceIntegration === 'invid';
  var disponibilidad = document.createElement('span');
  disponibilidad.className = 'feat-availability' + (esProveedor ? ' is-provider' : ' is-local');
  disponibilidad.textContent = esProveedor ? 'Llega en 48 hs' : 'En local';
  media.appendChild(disponibilidad);
  card.appendChild(media);

  var body = document.createElement('div');
  body.className = 'feat-body';

  // Chip de stock debajo de la foto (verde disponible / ambar pocas /
  // gris sin stock), como en la referencia que paso el dueño.
  var stockState = typeof getProductStockState === 'function' ? getProductStockState(product) : null;
  if (stockState && stockState.status !== 'unknown') {
    var stockChip = document.createElement('span');
    stockChip.className = 'feat-stock'
      + (stockState.status === 'low' ? ' is-low' : '')
      + (stockState.status === 'out' ? ' is-out' : '');
    stockChip.textContent = stockState.status === 'low' ? 'Quedan pocas'
      : (stockState.status === 'out' ? 'Sin stock' : 'Disponible');
    body.appendChild(stockChip);
  }

  var tag = document.createElement('p');
  tag.className = 'feat-tag';
  // Access trae "Accessorios" mal escrito; el catalogo lo corrige con
  // displayCatalogText y ahora, sin mayusculas forzadas, se notaba aca.
  tag.textContent = String(product.sourceLabel || product.category || 'Catálogo')
    .replace(/\bAccessorios\b/gi, 'Accesorios')
    .replace(/\bAccessorio\b/gi, 'Accesorio');
  body.appendChild(tag);

  var name = document.createElement('p');
  name.className = 'feat-name';
  name.textContent = product.name;
  body.appendChild(name);

  var foot = document.createElement('div');
  foot.className = 'feat-foot';
  var priceWrap = document.createElement('div');
  priceWrap.className = 'feat-price-wrap';
  var price = document.createElement('p');
  price.className = 'feat-price';
  price.textContent = formatHomeMoney(product.price);
  priceWrap.appendChild(price);
  if (typeof getProductStockState === 'function') {
    var stockStatus = getProductStockState(product).status;
    if (stockStatus === 'low' || stockStatus === 'available') {
      var stockLabel = document.createElement('span');
      stockLabel.className = stockStatus === 'low' ? 'feat-low' : 'feat-available';
      stockLabel.textContent = stockStatus === 'low' ? 'Quedan pocas' : 'Disponible';
      priceWrap.appendChild(stockLabel);
    }
  }
  // Linea chica bajo el precio, como el "Incluye 15% OFF..." de la
  // referencia. Aca decimos lo que es cierto en DimensionTres: por
  // transferencia se paga lo mismo (ver legales.html).
  var note = document.createElement('p');
  note.className = 'feat-note';
  note.textContent = 'Transferencia: mismo precio';
  priceWrap.appendChild(note);
  foot.appendChild(priceWrap);

  var btn = document.createElement('button');
  btn.className = 'feat-btn';
  btn.type = 'button';
  var byOrder = typeof isByOrderProduct === 'function' && isByOrderProduct(product);
  var btnIcon = document.createElement('span');
  btnIcon.className = 'material-symbols-outlined';
  btnIcon.setAttribute('aria-hidden', 'true');
  btnIcon.textContent = byOrder ? 'schedule' : 'add_shopping_cart';
  btn.appendChild(btnIcon);
  btn.title = byOrder ? 'A pedido' : 'Agregar al carrito';
  btn.setAttribute('aria-label', 'Agregar ' + (product.name || 'producto') + ' al carrito');
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
      productId: product.productId || '',
      source: product.source || '',
      sourceIntegration: product.sourceIntegration || '',
      sourceLabel: product.sourceLabel || '',
      byOrder: byOrder
    });
  });
  foot.appendChild(btn);
  body.appendChild(foot);
  card.appendChild(body);
  return card;
}

function homeFeaturedProductText(product) {
  return normalizeHomeText([
    product && product.name,
    product && product.subtitle,
    product && product.description,
    product && product.sourceLabel,
    product && product.category,
    product && product.rootCategory,
    product && product.model,
    product && product.codigo,
    product && product.code
  ].filter(Boolean).join(' '));
}

function isUsableHomeFeaturedProduct(product) {
  if (!product || !product.name || !product.slug) return false;
  if (Number(product.price || 0) <= 0) return false;
  var text = homeFeaturedProductText(product);
  var hiddenTerms = [
    'servicio',
    'arreglo',
    'consola de juego',
    'juegos digitales',
    'cargar mercado pago',
    'nota de credito',
    'estacionamiento',
    'actualizacion kinect'
  ];
  return !hiddenTerms.some(function(term) {
    if (term === 'consola de juego') {
      return text.indexOf(term) !== -1 && text.indexOf('playstation 5') === -1 && text.indexOf('ps5') === -1;
    }
    return text.indexOf(term) !== -1;
  });
}

function compareHomeFeaturedProducts(a, b) {
  var imageDiff = Number(!!b.image) - Number(!!a.image);
  if (imageDiff !== 0) return imageDiff;

  var stockDiff = Number(Number(b.stock || 0) > 0) - Number(Number(a.stock || 0) > 0);
  if (stockDiff !== 0) return stockDiff;

  return String(a.name || '').localeCompare(String(b.name || ''), 'es');
}

function productMatchesFeaturedRule(product, rule) {
  var text = homeFeaturedProductText(product);
  var categoryText = normalizeHomeText([product && product.category, product && product.rootCategory].filter(Boolean).join(' '));
  var labelText = normalizeHomeText(product && product.sourceLabel);
  var isConsoleCategory = categoryText.indexOf('consolas de juegos') !== -1 || labelText.indexOf('consola') === 0;
  var isConsoleAccessoryCategory = categoryText.indexOf('accesorios consolas') !== -1 || labelText.indexOf('accessorios') !== -1 || labelText.indexOf('accesorios') !== -1;
  var isJoystickAccessoryOnly = ['adaptador', 'base', 'cable', 'funda', 'cubre', 'bateria', 'caja', 'pilas', 'cargador', 'ventilador', 'cooler', 'usb hub'].some(function(term) {
    return text.indexOf(term) !== -1;
  });
  var isJoystick = (text.indexOf('joystick') !== -1 || text.indexOf('dualsense') !== -1 || text.indexOf('dualshock') !== -1) && !isJoystickAccessoryOnly;
  var isPs5 = text.indexOf('ps5') !== -1 || text.indexOf('playstation 5') !== -1;
  var isPs4 = text.indexOf('ps4') !== -1 || text.indexOf('playstation 4') !== -1;

  if (rule === 'ps5-console') return isPs5 && isConsoleCategory && !isJoystick;
  if (rule === 'ps4-console') return isPs4 && isConsoleCategory && !isJoystick;
  if (rule === 'ps5-joystick') return isPs5 && isJoystick;
  if (rule === 'ps4-joystick') return isPs4 && isJoystick;
  if (rule === 'any-joystick') return isJoystick;
  if (rule === 'console-extra') return isConsoleCategory || isConsoleAccessoryCategory;
  return false;
}

function pickPreferredHomeFeaturedProducts(products) {
  var seen = {};
  var pool = (products || [])
    .filter(isUsableHomeFeaturedProduct)
    .filter(function(product) {
      if (!product.slug || seen[product.slug]) return false;
      seen[product.slug] = true;
      return true;
    })
    .sort(compareHomeFeaturedProducts);

  var selected = [];
  var selectedSlugs = {};
  function addFirst(rule) {
    var found = pool.find(function(product) {
      return !selectedSlugs[product.slug] && productMatchesFeaturedRule(product, rule);
    });
    if (!found) return;
    selected.push(found);
    selectedSlugs[found.slug] = true;
  }

  [
    'ps5-console',
    'ps4-console',
    'ps5-joystick',
    'ps4-joystick',
    'any-joystick',
    'console-extra'
  ].forEach(addFirst);

  pool.forEach(function(product) {
    if (selected.length >= 6 || selectedSlugs[product.slug]) return;
    if (productMatchesFeaturedRule(product, 'any-joystick')) {
      selected.push(product);
      selectedSlugs[product.slug] = true;
    }
  });

  pool.forEach(function(product) {
    if (selected.length >= 6 || selectedSlugs[product.slug]) return;
    if (productMatchesFeaturedRule(product, 'console-extra')) {
      selected.push(product);
      selectedSlugs[product.slug] = true;
    }
  });

  pool.forEach(function(product) {
    if (selected.length >= 6 || selectedSlugs[product.slug]) return;
    selected.push(product);
    selectedSlugs[product.slug] = true;
  });

  return selected.slice(0, 6);
}

/* ── "Mejora tu setup": una fila por categoria ──────────────────────────
   Cada fila es un carrusel horizontal con productos reales, del local
   (Access) y del proveedor (Invid). Antes el HTML tenia tres filas pero el
   JS solo llenaba una grilla vieja (#home-featured-grid) que ya no existe:
   por eso quedaban en "Cargando producto". */
var SETUP_GROUPS = [
  { gridId: 'home-featured-processors', words: ['procesador'], invid: ['AMD', 'Intel'] },
  // Perifericos solo de Invid (pedido del local): words vacio = no busca en Access.
  { gridId: 'home-featured-perifericos', words: [], invid: ['Mouse', 'Teclados', 'Teclado + Mouse', 'Mousepads', 'Web Cam', 'Micrófonos'] },
  // "consolas de juegos" y no "consola": si no agarra "Accesorios Consolas".
  { gridId: 'home-featured-consolas', words: ['consolas de juegos'] }
];

function findHomeTreeNode(tree, words) {
  var found = null;
  (function walk(nodes) {
    (nodes || []).forEach(function(node) {
      if (found || !node) return;
      var name = normalizeHomeText(node.name);
      if (words.some(function(word) { return name.indexOf(normalizeHomeText(word)) !== -1; })) {
        found = node;
        return;
      }
      walk(node.children);
    });
  })(tree);
  return found;
}

async function loadSetupGroupProducts(tree, group) {
  var lists = [];
  var node = findHomeTreeNode(tree, group.words);
  if (node) {
    lists.push(await fetchHomeProductsForCategory(node).catch(function() { return []; }));
  }

  var store = window.SupabaseStore;
  if (group.invid && group.invid.length && store && store.fetchInvidPcProductsByCategories) {
    lists.push(await store.fetchInvidPcProductsByCategories(group.invid).catch(function() { return []; }));
  }

  var seen = {};
  return lists
    .reduce(function(all, list) { return all.concat(list || []); }, [])
    .filter(isUsableHomeFeaturedProduct)
    .filter(function(product) {
      if (seen[product.slug]) return false;
      seen[product.slug] = true;
      return true;
    })
    .sort(compareHomeFeaturedProducts)
    .slice(0, 12);
}

function renderSetupGroup(gridId, products) {
  var grid = document.getElementById(gridId);
  if (!grid) return;
  var section = grid.closest('.setup-product-group');

  // Sin productos se esconde la fila entera: peor que no mostrarla es
  // dejar las tarjetas de "Cargando producto" para siempre.
  if (!products.length) {
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = '';
  grid.innerHTML = '';
  products.forEach(function(product) {
    grid.appendChild(createFeaturedProductCard(product));
  });
}

async function loadHomeSetupGroups(tree) {
  await Promise.all(SETUP_GROUPS.map(async function(group) {
    var products = await loadSetupGroupProducts(tree, group).catch(function() { return []; });
    renderSetupGroup(group.gridId, products);
  }));
  startSetupAutoplay();
}

var SETUP_AUTOPLAY_MS = 2500; // 4,5 s se sentia lento
var setupAutoplayTimers = {};

// Las filas avanzan solas, pero se frenan mientras la persona mira o toca
// una fila, con la pestaña en segundo plano o si pidio menos movimiento.
function startSetupAutoplay() {
  var menosMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (menosMovimiento) return;

  SETUP_GROUPS.forEach(function(group) {
    var grid = document.getElementById(group.gridId);
    if (!grid || grid.dataset.autoplayListo === '1') return;
    var section = grid.closest('.setup-product-group');
    if (!section || section.style.display === 'none') return;

    grid.dataset.autoplayListo = '1';

    function frenar() { detenerSetupAutoplay(group.gridId); }
    function seguir() { reanudarSetupAutoplay(group.gridId); }

    section.addEventListener('pointerenter', frenar);
    section.addEventListener('pointerleave', seguir);
    section.addEventListener('focusin', frenar);
    section.addEventListener('focusout', seguir);
    grid.addEventListener('touchstart', frenar, { passive: true });
    grid.addEventListener('touchend', seguir, { passive: true });

    reanudarSetupAutoplay(group.gridId);
  });

  if (!document.body.dataset.autoplayVisibilidad) {
    document.body.dataset.autoplayVisibilidad = '1';
    document.addEventListener('visibilitychange', function() {
      SETUP_GROUPS.forEach(function(group) {
        if (document.hidden) detenerSetupAutoplay(group.gridId);
        else reanudarSetupAutoplay(group.gridId);
      });
    });
  }
}

function detenerSetupAutoplay(gridId) {
  if (setupAutoplayTimers[gridId]) {
    window.clearInterval(setupAutoplayTimers[gridId]);
    setupAutoplayTimers[gridId] = null;
  }
}

function reanudarSetupAutoplay(gridId) {
  detenerSetupAutoplay(gridId);
  if (document.hidden) return;
  var grid = document.getElementById(gridId);
  if (!grid || grid.scrollWidth <= grid.clientWidth + 4) return;
  setupAutoplayTimers[gridId] = window.setInterval(function() {
    moveSetupCarousel(gridId, 1);
  }, SETUP_AUTOPLAY_MS);
}

/* Flechas de cada fila. El HTML las llama con el id de la grilla, asi que
   cada carrusel se mueve por su cuenta. */
function moveSetupCarousel(gridId, direction) {
  var grid = document.getElementById(gridId);
  var card = grid && grid.querySelector('.featured-card');
  if (!grid || !card) return;

  var styles = window.getComputedStyle(grid);
  var gap = parseFloat(styles.columnGap || styles.gap || 0) || 0;
  var step = card.getBoundingClientRect().width + gap;
  var atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
  var atStart = grid.scrollLeft <= 4;

  var target;
  if (direction > 0 && atEnd) target = 0;
  else if (direction < 0 && atStart) target = grid.scrollWidth;
  else target = grid.scrollLeft + step * direction;

  var from = grid.scrollLeft;
  grid.scrollTo({ left: target, behavior: 'smooth' });

  // Si el navegador no anima (pestaña en segundo plano, "reducir movimiento"),
  // movemos la fila de una sola vez para que la flecha siempre responda.
  window.setTimeout(function () {
    if (Math.abs(grid.scrollLeft - from) < 2) {
      var snap = grid.style.scrollSnapType;
      var behavior = grid.style.scrollBehavior;
      grid.style.scrollSnapType = 'none';
      grid.style.scrollBehavior = 'auto';
      grid.scrollLeft = target;
      grid.style.scrollSnapType = snap;
      grid.style.scrollBehavior = behavior;
    }
  }, 350);
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
    await loadHomeSetupGroups(tree);
  } catch (err) {
    console.warn('No se pudo actualizar el inicio desde Supabase:', err);
  }
}

function setHomeAdminLinksVisible(visible) {
  document.querySelectorAll('[data-admin-link]').forEach(function(link) {
    link.style.display = visible ? '' : 'none';
  });
}

// Cartelito rojo con la cantidad de pedidos pendientes al lado de "Admin",
// mismo estilo que el .dt-badge del carrito (cart.js). Solo se llama
// cuando ya se confirmo que el usuario es admin, asi que a un cliente
// normal no le pega ni un solo pedido a la base por esto.
function setHomeAdminBadge(cantidad) {
  document.querySelectorAll('[data-admin-link]').forEach(function(link) {
    link.style.position = 'relative';
    var badge = link.querySelector('.dt-badge');
    if (!cantidad) { badge && badge.remove(); return; }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'dt-badge';
      badge.style.cssText = 'position:absolute;top:-8px;right:-14px;background:#b90afc;color:#fff;font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:10px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 3px;pointer-events:none;z-index:10;border-radius:9px;';
      link.appendChild(badge);
    }
    badge.textContent = cantidad > 99 ? '99+' : cantidad;
  });
}

async function checkHomePendingOrders(token) {
  var cfg = window.CONFIG || {};
  try {
    var response = await fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/admin_list_orders', {
      method: 'POST',
      headers: {
        apikey: cfg.SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit_count: 80 })
    });
    if (!response.ok) return;
    var orders = await response.json();
    var pendientes = (orders || []).filter(function(o) { return o && o.estado === 'pendiente'; }).length;
    setHomeAdminBadge(pendientes);
  } catch (error) {
    // Sin badge si algo falla; no es critico para el resto de la pagina.
  }
}

async function checkHomeAdminAccess() {
  setHomeAdminLinksVisible(false);

  var cfg = window.CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_PUBLISHABLE_KEY) return;
  if (!window.SupabaseStore || !window.SupabaseStore.getAccessToken) return;

  try {
    var token = await window.SupabaseStore.getAccessToken();
    if (!token) return;

    // El boton interno solo se muestra si la base confirma que la sesion es admin.
    var response = await fetch(cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/rpc/admin_current_user', {
      method: 'POST',
      headers: {
        apikey: cfg.SUPABASE_PUBLISHABLE_KEY,
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    if (!response.ok) return;

    var admin = await response.json();
    var esAdmin = Boolean(admin && admin.is_admin);
    setHomeAdminLinksVisible(esAdmin);
    if (esAdmin) checkHomePendingOrders(token);
  } catch (error) {
    setHomeAdminLinksVisible(false);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();
  checkStoreStatus();
  setInterval(checkStoreStatus, 60000);
  initHomeHeroCarousel();
  loadHomeCatalogSections();
  checkHomeAdminAccess();
});

/* ═══════════════════════════════════════════════════════════
   APARICION AL SCROLLEAR
   Marca los bloques principales y los enciende cuando entran en
   pantalla. Con IntersectionObserver, que no cuesta nada: no hay
   un listener de scroll corriendo todo el tiempo.
   ═══════════════════════════════════════════════════════════ */

(function initRevelado() {
  function arrancar() {
    // El hero queda afuera a proposito: es lo primero que se ve y no
    // corresponde que aparezca con retardo.
    var selectores = [
      '#categorias > .container > *',
      '#categorias > *:not(.dt-halo)',
      '#destacados > *:not(.dt-halo)',
      '#servicios > *:not(.dt-halo)',
      '#contacto > *:not(.dt-halo)'
    ];

    var bloques = [];
    selectores.forEach(function(sel) {
      try {
        [].forEach.call(document.querySelectorAll(sel), function(el) {
          if (bloques.indexOf(el) === -1) bloques.push(el);
        });
      } catch (e) {}
    });

    if (!bloques.length) return;

    // Sin soporte, se muestra todo y listo.
    if (!('IntersectionObserver' in window)) return;

    bloques.forEach(function(el, i) {
      el.classList.add('dt-reveal');
      // Escalonado corto: los de mas abajo entran apenas despues.
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
    });

    var obs = new IntersectionObserver(function(entradas) {
      entradas.forEach(function(e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('dt-visible');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    bloques.forEach(function(el) { obs.observe(el); });

    // Red de seguridad: si por lo que sea el observador no dispara (pestaña en
    // segundo plano, navegador raro, un error mas arriba), a los 2 segundos se
    // muestra todo igual. Un efecto lindo no puede dejar la pagina en blanco.
    window.setTimeout(function() {
      bloques.forEach(function(el) { el.classList.add('dt-visible'); });
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
