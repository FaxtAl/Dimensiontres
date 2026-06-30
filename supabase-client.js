// supabase-client.js - lectura publica del catalogo desde Supabase.
(function() {
  var cfg = window.CONFIG || {};
  var client = null;

  function isReady() {
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY && window.supabase);
  }

  function getClient() {
    if (!isReady()) return null;
    if (!client) {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
    }
    return client;
  }

  var LOCAL_PRODUCT_IMAGE_FILES = [
    '[6984521291670] Auricular Intra Manos Libres Samsung AKG S21 Ultra.png',
    'Adaptador Bluetooth 5.4 nano usb mercury MA530.webp',
    'Adaptador Joystick Ps4 TCON.webp',
    'All gamestick x2 consola retro.webp',
    'Arcade Doble Multiconsola.webp',
    'Auricular JBL (Replica).webp',
    'Auricular Samsung Replica Galaxy S10+ Caja Chica.png',
    'Auricular Sport SF-A41 HI-FI.webp',
    'Auricular Tame AU-1236.webp',
    'auriculares inalambricos inpods 12 I12.webp',
    'Auriculares Noga Voice NGV-400.webp',
    'Adaptador inalambrico tp link 150 Mbps.webp',
    'Base cargadora joystick ps5.webp',
    'Base de carga joystick ps5.png',
    'Cable miniplug a miniplug + microfono.webp',
    'Joystick Dualsense Ps5 Blanco.webp',
    'Joystick Bluetooth x3.webp',
    'ps5 con lectora.webp',
    'ps5 digital.webp',
    'Base joystick ps4 Luz led.jpg',
    'bateria joystick Xbox one.webp',
    'Cable Audio Video ps2 AV.webp',
    'Cable Mallado 2 Hembra Auricularesmicrofono A Plug 3.5mm Macho.webp',
    'Cable usb Cargador Joystick PS4.webp',
    'Cable USB Ps3 1.5M Data Cable.webp',
    'Cable VGA 1.5M.jpg',
    'Cable video compuesto Ps2 Ps3.webp',
    'Caja pilas joystick Xbox 360.webp',
    'Consola Game TV Stick Your Name Gamer.avif',
    'Consola Game TV Stick Your Name Gamer.webp',
    'Consola portatil Pop It electronico.webp',
    'Consola portatil X6.webp',
    'Conversor HDMI a VGA.webp',
    'Cubre grip x4.webp',
    'D_Q_NP_831147-MLA79987574616_102024-F.webp',
    'Dead Alliance Day One Edition Ps4.webp',
    'Funda Silicola Ps3.webp',
    'Funda silicona PS4.webp',
    'gamestick AllGames (ps5).webp',
    'Inova Cable de Datos.webp',
    'Joystick Ps3 Alternativos.webp',
    'Kit Gabinete Kelyx LC727-14 Fuente 500w.jpg',
    'Micrófono Noga Vintage MIC-2030 PC Cardioide color plateado.webp',
    'Mini Consola 2 joystick inalambricos Extreme Mini Game Box.jpg',
    'MOUSE GAMER RAPTOR STORM GRIP 4 BOTONES 3600DPI 7 COLORES.webp',
    'Mouse Gamer Retroiluminado T-Wolf v1 Óptico 1200Dpi USB RGB.webp',
    'Mouse Gamer T-Wolf V15 Celeste Retroiluminado 1600 Dpi USB.webp',
    'Noga Stormer NG-8620.webp',
    'Pad Mouse Raptor Ultra Glide Antideslizante Impermeable Xl Color Negro.webp',
    'Parlantes 2.1 Noga.jpg',
    'Pendrive 32 gb Hiksemi Cassic.webp',
    'Pendrive 64GB Hiksemi 3.2 Pully.webp',
    'Pendrive Kingston 64 GB.webp',
    'receptor de musica inalambrico BT-163.webp',
    'Seisa Fast 2USB Charge Kit.jpg',
    'Sentech ST-HS450.webp',
    'Sup + joystick gme-61020.jpg',
    'Sy830mv.webp',
    'Teclado Logitech K120 QWERTY español color negro.webp',
    'Teclado Para Una Mano Shipido.webp',
    'tranyoo cable Tipo Ca C 1M 3A.webp'
  ];
  var LOCAL_PRODUCT_IMAGE_ALIASES = {
    'convertidor hdmi a vga': 'Conversor HDMI a VGA.webp',
    'conversor hdmi a vga': 'Conversor HDMI a VGA.webp',
    'cable tipo c a c 1m 3a': 'tranyoo cable Tipo Ca C 1M 3A.webp',
    'cable tranyoo tipo c a c 1m 3a': 'tranyoo cable Tipo Ca C 1M 3A.webp',
    'tranyoo cable tipo c a c 1m 3a': 'tranyoo cable Tipo Ca C 1M 3A.webp',
    'pendrive 32 gb hiksemi classic': 'Pendrive 32 gb Hiksemi Cassic.webp',
    'pendrive 32gb hiksemi classic': 'Pendrive 32 gb Hiksemi Cassic.webp',
    'pendrive 64gb hiksemi pully': 'Pendrive 64GB Hiksemi 3.2 Pully.webp',
    'adaptador inalambrico tplink 150 mbps': 'Adaptador inalambrico tp link 150 Mbps.webp',
    'adaptador inalambrico tp link 150 mbps': 'Adaptador inalambrico tp link 150 Mbps.webp',
    'playstation 5 consola con lectora': 'ps5 con lectora.webp',
    'playstation 5 con lectora': 'ps5 con lectora.webp',
    'ps5 con lectora': 'ps5 con lectora.webp',
    'consola con lectora': 'ps5 con lectora.webp',
    'playstation 5 consola de juego digital': 'ps5 digital.webp',
    'playstation 5 digital': 'ps5 digital.webp',
    'ps5 digital': 'ps5 digital.webp',
    'consola de juego digital': 'ps5 digital.webp',
    'playstation 4 slim 1tb usada': 'PlayStation 4 Slim 1TB Usada.webp',
    'ps4 slim 1tb usada': 'PlayStation 4 Slim 1TB Usada.webp',
    'playstation 3 slim usada': 'PlayStation 3 Slim Usada.webp',
    'ps3 slim usada': 'PlayStation 3 Slim Usada.webp',
    'xbox one s usada': 'Xbox One S Usada.jpg',
    'adaptador para celular joystick ps4': 'Adaptador Para celular Joystick ps4.webp',
    'adaptador celular joystick ps4': 'Adaptador Para celular Joystick ps4.webp',
    'joystick alternativo ps4 argentina replica': 'Joystick Alternativo Ps4 Argentina Replica.webp',
    'joystick ps4 alternativo argentina replica': 'Joystick Alternativo Ps4 Argentina Replica.webp',
    'joystick original usado ps4': 'Joystick original usado Ps4.webp',
    'joystick ps4 original usado': 'Joystick original usado Ps4.webp',
    'little nightmares ii ps4': 'Little Nighmares II Ps4.jpg',
    'little nightmares 2 ps4': 'Little Nighmares II Ps4.jpg',
    'little nighmares ii ps4': 'Little Nighmares II Ps4.jpg',
    'tom clancys ghost recon juego original ps4': 'Tom Clancys GhosterRecon Juego Original PS4.jpg',
    'tom clancy ghost recon ps4': 'Tom Clancys GhosterRecon Juego Original PS4.jpg',
    'ghost recon juego original ps4': 'Tom Clancys GhosterRecon Juego Original PS4.jpg'
  };
  var LOCAL_PRODUCT_IMAGES = buildLocalProductImageIndex();
  var LOCAL_PRODUCT_IMAGE_KEYS = Object.keys(LOCAL_PRODUCT_IMAGES);

  function normalizeImageKey(value) {
    var text = String(value || '').trim().toLowerCase();
    if (text.normalize) {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return text.replace(/[^a-z0-9]+/g, ' ').replace(/^\s+|\s+$/g, '');
  }

  function productImagePath(fileName) {
    return 'img/productos/' + encodeURIComponent(fileName).replace(/%2F/g, '/');
  }

  function getLocalProductImageFiles() {
    var files = LOCAL_PRODUCT_IMAGE_FILES.slice();
    var externalFiles = window.DT_LOCAL_PRODUCT_IMAGE_FILES;
    if (Array.isArray(externalFiles)) {
      externalFiles.forEach(function(fileName) {
        if (fileName && files.indexOf(fileName) === -1) files.push(fileName);
      });
    }
    return files;
  }

  function cleanSupplierCodeText(value) {
    return String(value || '')
      .replace(/\s*\(\d{3,}\)/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function addLocalProductImage(index, key, path) {
    key = normalizeImageKey(key);
    if (key && !index[key]) index[key] = path;
  }

  function buildLocalProductImageIndex() {
    var index = {};
    getLocalProductImageFiles().forEach(function(fileName) {
      var path = productImagePath(fileName);
      var baseName = fileName.replace(/\.[^.]+$/, '');
      addLocalProductImage(index, baseName, path);

      var codedName = baseName.match(/^\[(\d+)\]\s*(.+)$/);
      if (codedName) {
        addLocalProductImage(index, codedName[1], path);
        addLocalProductImage(index, codedName[2], path);
      }
    });
    Object.keys(LOCAL_PRODUCT_IMAGE_ALIASES).forEach(function(alias) {
      var fileName = LOCAL_PRODUCT_IMAGE_ALIASES[alias];
      if (fileName) addLocalProductImage(index, alias, productImagePath(fileName));
    });
    return index;
  }

  function findLocalProductImage(value) {
    var key = normalizeImageKey(value);
    if (!key) return '';
    if (LOCAL_PRODUCT_IMAGES[key]) return LOCAL_PRODUCT_IMAGES[key];
    if (key.length < 6) return '';

    for (var i = 0; i < LOCAL_PRODUCT_IMAGE_KEYS.length; i++) {
      var localKey = LOCAL_PRODUCT_IMAGE_KEYS[i];
      if (localKey.length < 6) continue;
      if (key.indexOf(localKey) !== -1 || localKey.indexOf(key) !== -1) {
        return LOCAL_PRODUCT_IMAGES[localKey];
      }
    }
    return '';
  }

  function normalizeProductImageCode(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');
  }

  function splitProductImageCodes(value) {
    return String(value || '').split(/[,;|\n\r]+/).map(normalizeProductImageCode).filter(Boolean);
  }

  function findMappedProductImageById(value, byId) {
    var id = String(value || '').trim();
    return id && byId && byId[id] ? byId[id] : '';
  }

  function findMappedProductImageByCode(value, byCode) {
    if (!byCode) return '';
    var codes = splitProductImageCodes(value);
    for (var i = 0; i < codes.length; i++) {
      if (byCode[codes[i]]) return byCode[codes[i]];
    }
    return '';
  }

  function imageRowText(row) {
    return normalizeImageKey([
      row && row.producto,
      row && row.nombre,
      row && row.descripcion,
      row && row.categoria,
      row && row.subcategoria,
      row && row.sourceLabel
    ].filter(Boolean).join(' '));
  }

  function isPhysicalGameImageRow(row) {
    var text = imageRowText(row);
    return text.indexOf('juego') !== -1 || text.indexOf('juegos') !== -1;
  }

  function trustedGameImageUrl(url) {
    url = String(url || '').toLowerCase();
    return url.indexOf('img/productos/') === 0
      || url.indexOf('img/invid/') === 0
      || url.indexOf('dixgamer.com') !== -1
      || url.indexOf('image.api.playstation.com') !== -1
      || url.indexOf('assets.nintendo.com') !== -1
      || url.indexOf('steamstatic.com') !== -1;
  }

  function imagePlatformConflicts(row, url) {
    var text = imageRowText(row);
    url = normalizeImageKey(url);
    var productPlatforms = ['ps5', 'ps4', 'ps3', 'ps2'].filter(function(platform) {
      return text.indexOf(platform) !== -1 || text.indexOf('playstation ' + platform.slice(2)) !== -1;
    });
    if (!productPlatforms.length) return false;
    return ['ps5', 'ps4', 'ps3', 'ps2'].some(function(platform) {
      return productPlatforms.indexOf(platform) === -1 && url.indexOf(platform) !== -1;
    });
  }

  function isAllowedMappedGameImage(row, url) {
    if (!isPhysicalGameImageRow(row)) return true;
    return trustedGameImageUrl(url) && !imagePlatformConflicts(row, url);
  }

  function findMappedProductImage(row) {
    var map = window.DT_PRODUCT_IMAGE_MAP || {};
    var byId = Object.assign({}, map.ids || {}, map.byId || {});
    var byCode = Object.assign({}, map.codes || {}, map.byCode || {});
    var idFields = [
      row && row.id_productos,
      row && row.id_viejo,
      row && row.accessId,
      row && row.productId,
      row && row.id
    ];
    var codeFields = [
      row && row.codigo,
      row && row.code,
      row && row.model,
      row && row.sku
    ];

    for (var i = 0; i < idFields.length; i++) {
      var byIdMatch = findMappedProductImageById(idFields[i], byId);
      if (byIdMatch && isAllowedMappedGameImage(row, byIdMatch)) return byIdMatch;
    }

    for (var j = 0; j < codeFields.length; j++) {
      var byCodeMatch = findMappedProductImageByCode(codeFields[j], byCode);
      if (byCodeMatch && isAllowedMappedGameImage(row, byCodeMatch)) return byCodeMatch;
    }

    return '';
  }

  function resolveProductImage(row) {
    for (var i = 1; i < arguments.length; i++) {
      var found = findLocalProductImage(arguments[i]);
      if (found) return found;
    }
    var mappedImage = findMappedProductImage(row);
    if (mappedImage) return mappedImage;
    if (row && row.imagen_url && isAllowedMappedGameImage(row, row.imagen_url)) return row.imagen_url;
    if (row && row.image_url && isAllowedMappedGameImage(row, row.image_url)) return row.image_url;
    if (row && row.invid_imagen_url && isAllowedMappedGameImage(row, row.invid_imagen_url)) return row.invid_imagen_url;
    return '';
  }

  function normalizeRemoteImageUrl(url) {
    var value = String(url || '').trim().replace(/^["']|["']$/g, '');
    if (!value) return '';
    value = value.replace(/\\\//g, '/').replace(/\s+/g, '%20');
    if (value.indexOf('//') === 0) value = 'https:' + value;
    if (/^http:\/\//i.test(value)) value = value.replace(/^http:\/\//i, 'https://');
    if (/^(www\.|invidcomputers\.com|api\.|cdn\.)/i.test(value)) value = 'https://' + value;
    value = value.replace(/^https:\/\/invidcomputers\.com\//i, 'https://www.invidcomputers.com/');
    if (/^\/[^/]/.test(value)) value = 'https://www.invidcomputers.com' + value;
    if (/^(imagenes|images|img|uploads|storage)\//i.test(value)) value = 'https://www.invidcomputers.com/' + value;
    return value;
  }

  function getInvidLocalImageCandidates(row) {
    var rawId = row && (row.id_productos || row.invid_id || row.productId || row.id);
    var id = String(rawId || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) return [];

    var exactLocalFile = window.DT_INVID_IMAGE_FILES && window.DT_INVID_IMAGE_FILES[id];
    if (exactLocalFile) {
      return ['img/invid/' + encodeURIComponent(exactLocalFile).replace(/%2F/g, '/')];
    }

    var exts = [];
    function addExt(ext) {
      ext = String(ext || '').toLowerCase().replace(/^\./, '');
      if (ext && exts.indexOf(ext) === -1) exts.push(ext);
    }

    var remoteUrl = String(row && (row.invid_imagen_url || row.invid_image_url || row.imagen_url || row.image_url) || '').split('?')[0];
    var match = remoteUrl.match(/\.([a-z0-9]+)$/i);
    if (match) {
      var ext = match[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      if (['png', 'jpg', 'webp', 'gif', 'avif'].indexOf(ext) !== -1) addExt(ext);
    }

    ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].forEach(addExt);
    return exts.map(function(ext) {
      return 'img/invid/' + id + '.' + ext;
    });
  }

  function pushInvidImageCandidate(row, candidates, value) {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach(function(item) { pushInvidImageCandidate(row, candidates, item); });
      return;
    }
    if (typeof value === 'object') {
      [
        'url', 'src', 'href', 'path', 'imagen', 'image', 'foto', 'thumbnail',
        'small', 'medium', 'large', 'original', 'secure_url'
      ].forEach(function(key) {
        pushInvidImageCandidate(row, candidates, value[key]);
      });
      return;
    }

    var raw = String(value || '').trim();
    if (!raw) return;
    if ((raw.charAt(0) === '[' || raw.charAt(0) === '{') && window.JSON) {
      try {
        pushInvidImageCandidate(row, candidates, JSON.parse(raw));
        return;
      } catch (error) {}
    }

    raw.split(/[|,;]/).forEach(function(part) {
      part = String(part || '').trim().replace(/\\/g, '/');
      var isLocalAsset = /^img\/(productos|invid)\//i.test(part);
      var url = isLocalAsset ? part : normalizeRemoteImageUrl(part);
      if (!url || candidates.indexOf(url) !== -1) return;
      if (!/^https?:\/\//i.test(url) && url.indexOf('img/productos/') !== 0 && url.indexOf('img/invid/') !== 0) return;
      if (isAllowedMappedGameImage(row, url)) candidates.push(url);
    });
  }

  function collectInvidApiImages(row) {
    var candidates = [];
    getInvidLocalImageCandidates(row).forEach(function(url) {
      pushInvidImageCandidate(row, candidates, url);
    });
    var fields = [
      'invid_imagen_url', 'invid_image_url', 'imagen_url', 'image_url', 'url_imagen',
      'urlImagen', 'foto_url', 'foto', 'imagen', 'image', 'thumbnail', 'thumb',
      'picture', 'pictures', 'imagenes', 'images', 'fotos', 'galeria'
    ];
    for (var i = 0; row && i < fields.length; i++) {
      pushInvidImageCandidate(row, candidates, row[fields[i]]);
    }
    return candidates;
  }

  function resolveInvidApiImage(row) {
    var candidates = collectInvidApiImages(row);
    return candidates[0] || '';
  }

  var ML_IMAGE_CACHE_PREFIX = 'dt-ml-image-';
  // Cache corto porque stock/precios cambian desde Access durante el dia.
  // Cambiar el prefijo fuerza al navegador a ignorar caches viejos.
  var PUBLIC_CATALOG_CACHE_PREFIX = 'dt-public-catalog-v20260629-img-local-progress2-';
  var PUBLIC_CATALOG_CACHE_TTL_MS = Math.max(1, Number(cfg.PUBLIC_CATALOG_CACHE_MINUTES || 1)) * 60 * 1000;
  var publicCatalogMemoryCache = {};
  var publicCatalogPending = {};
  var mlImageRequests = {};

  function safeLocalStorageGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : '';
    } catch (error) {
      return '';
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch (error) {
      // El cache es opcional; si el navegador lo bloquea seguimos igual.
    }
  }

  function safeLocalStorageRemove(key) {
    try {
      if (window.localStorage) window.localStorage.removeItem(key);
    } catch (error) {
      // Sin localStorage, simplemente no cacheamos.
    }
  }

  function publicCatalogCacheKey(key) {
    return PUBLIC_CATALOG_CACHE_PREFIX + key;
  }

  function readPublicCatalogCache(key) {
    var memory = publicCatalogMemoryCache[key];
    if (memory && memory.expiresAt > Date.now()) {
      return { hit: true, value: memory.value };
    }

    var raw = safeLocalStorageGet(publicCatalogCacheKey(key));
    if (!raw) return { hit: false, value: null };

    try {
      var cached = JSON.parse(raw);
      if (!cached || cached.expiresAt < Date.now()) {
        return { hit: false, stale: true, value: cached && cached.value ? cached.value : null };
      }
      publicCatalogMemoryCache[key] = {
        expiresAt: cached.expiresAt,
        value: cached.value
      };
      return { hit: true, value: cached.value };
    } catch (error) {
      safeLocalStorageRemove(publicCatalogCacheKey(key));
      return { hit: false, value: null };
    }
  }

  function writePublicCatalogCache(key, value) {
    publicCatalogMemoryCache[key] = {
      expiresAt: Date.now() + PUBLIC_CATALOG_CACHE_TTL_MS,
      value: value
    };
    safeLocalStorageSet(publicCatalogCacheKey(key), JSON.stringify({
      expiresAt: Date.now() + PUBLIC_CATALOG_CACHE_TTL_MS,
      value: value
    }));
  }

  async function withPublicCatalogTimeout(promise, key) {
    var timeoutMs = Math.max(3000, Number(cfg.PUBLIC_CATALOG_TIMEOUT_MS || 6500));
    return Promise.race([
      Promise.resolve(promise),
      new Promise(function(resolve) {
        window.setTimeout(function() {
          resolve({ __dtCatalogTimeout: true, key: key });
        }, timeoutMs);
      })
    ]);
  }

  async function withPublicCatalogCache(key, loader) {
    var cached = readPublicCatalogCache(key);
    if (cached.hit) return cached.value;
    if (publicCatalogPending[key]) return publicCatalogPending[key];

    publicCatalogPending[key] = (async function() {
      var value;
      try {
        value = await withPublicCatalogTimeout(loader(), key);
      } catch (error) {
        console.warn('Catalogo local: error de API, usando cache si existe:', key, error);
        if (cached.stale && cached.value) return cached.value;
        return [];
      } finally {
        delete publicCatalogPending[key];
      }
      if (value && value.__dtCatalogTimeout) {
        console.warn('Catalogo local: la API tardo demasiado, usando cache si existe:', key);
        if (cached.stale && cached.value) return cached.value;
        return [];
      }
      if (!Array.isArray(value) || value.length > 0) {
        writePublicCatalogCache(key, value);
      }
      return value;
    })();

    return publicCatalogPending[key];
  }

  function productLookupCode(product) {
    return String((product && (product.codigo || product.code || product.model || product.sku || product.ref)) || '').trim();
  }

  function productLookupName(product) {
    return String((product && (product.name || product.nombre || product.producto || product.description)) || '').trim();
  }

  function productLookupKey(product) {
    var id = String((product && (product.accessId || product.id_productos || product.productId)) || '').trim();
    var code = normalizeProductImageCode(productLookupCode(product));
    return id || code || normalizeImageKey(productLookupName(product));
  }

  function firstMercadoLibreImage(result) {
    var pictures = (result && result.pictures) || [];
    for (var i = 0; i < pictures.length; i++) {
      if (/mlstatic\.com/i.test(pictures[i] || '')) return pictures[i];
    }
    var thumb = (result && (result.thumbnail || result.secure_thumbnail)) || '';
    return /mlstatic\.com/i.test(thumb) ? thumb : '';
  }

  async function findMercadoLibreImage(product) {
    if (cfg.MERCADO_LIBRE_AUTO_IMAGE_SEARCH === false) return '';
    if (!product || product.image) return (product && product.image) || '';
    var code = productLookupCode(product);
    if (!code) return '';

    var key = productLookupKey(product);
    if (!key) return '';

    var cacheKey = ML_IMAGE_CACHE_PREFIX + key;
    var cached = safeLocalStorageGet(cacheKey);
    if (cached) return cached;

    if (mlImageRequests[key]) return mlImageRequests[key];

    mlImageRequests[key] = (async function() {
      try {
        var params = new URLSearchParams();
        params.set('codigo', code);
        params.set('limit', '1');
        var name = productLookupName(product);
        if (name) params.set('name', name);

        var response = await fetch('api/ml-search.php?' + params.toString(), { cache: 'no-store' });
        if (!response.ok) return '';
        var data = await response.json();
        if (!data || !data.ok || !data.results || !data.results.length) return '';

        var image = firstMercadoLibreImage(data.results[0]);
        if (image) safeLocalStorageSet(cacheKey, image);
        return image;
      } catch (error) {
        return '';
      } finally {
        delete mlImageRequests[key];
      }
    }());

    return mlImageRequests[key];
  }

  function formatCurrency(currency) {
    return currency || cfg.CURRENCY || 'ARS';
  }

  function normalizeDni(dni) {
    return String(dni || '').replace(/\D/g, '');
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function authEmailForDni(dni) {
    return 'dni-' + normalizeDni(dni) + '@dimension3.local';
  }

  function authEmailForCustomer(customer) {
    return normalizeEmail(customer && customer.email) || authEmailForDni(customer && customer.dni);
  }

  var PROFILE_COLUMNS = 'user_id,cliente_id,dni,nombre,apellido,email,telefono,direccion,provider';

  function mapCustomer(row) {
    if (!row) return null;
    return {
      id: row.id,
      accessId: row.id_access || null,
      dni: normalizeDni(row.dni),
      name: [row.nombre, row.apellido].filter(Boolean).join(' ').trim() || 'Cliente',
      firstName: row.nombre || '',
      lastName: row.apellido || '',
      email: row.email || '',
      phone: row.telefono || '',
      address: row.direccion || '',
      raw: row
    };
  }

  function mapProfile(row) {
    if (!row) return null;
    var firstName = row.nombre || '';
    var lastName = row.apellido || '';
    return {
      userId: row.user_id,
      clienteId: row.cliente_id || null,
      dni: normalizeDni(row.dni),
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || row.email || 'Cliente',
      firstName: firstName,
      lastName: lastName,
      email: row.email || '',
      phone: row.telefono || '',
      address: row.direccion || '',
      provider: row.provider || '',
      raw: row
    };
  }

  function mergeProfileUser(user, profile) {
    if (!profile) return user;
    var firstName = profile.firstName || user.firstName || '';
    var lastName = profile.lastName || user.lastName || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name || profile.name || 'Cliente';

    return Object.assign({}, user, {
      dni: profile.dni || user.dni || '',
      clienteId: profile.clienteId || user.clienteId || null,
      name: name,
      firstName: firstName,
      lastName: lastName,
      email: profile.email || user.email || '',
      phone: profile.phone || user.phone || '',
      address: profile.address || user.address || '',
      provider: profile.provider || user.provider || 'email',
      profile: profile.raw || null
    });
  }

  async function fetchCustomerByDni(dni) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb || !cleanDni) return { customer: null, error: null };

    var result = await sb
      .from('clientes')
      .select('id,id_access,dni,nombre,apellido,email,telefono,direccion')
      .eq('dni', cleanDni)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase cliente error:', result.error.message);
      return { customer: null, error: result.error };
    }

    return { customer: mapCustomer(result.data), error: null };
  }

  async function fetchProfileByUserId(userId) {
    var sb = getClient();
    if (!sb || !userId) return { profile: null, error: null };

    var result = await sb
      .from('perfiles')
      .select(PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase perfil error:', result.error.message);
      return { profile: null, error: result.error };
    }

    return { profile: mapProfile(result.data), error: null };
  }

  async function upsertProfileFromCustomer(authUser, customer) {
    var sb = getClient();
    if (!sb || !authUser || !customer) return { profile: null, error: null };

    var result = await sb
      .from('perfiles')
      .upsert({
        user_id: authUser.id,
        cliente_id: customer.id,
        dni: customer.dni || null,
        nombre: customer.firstName || '',
        apellido: customer.lastName || '',
        email: customer.email || authUser.email || '',
        telefono: customer.phone || '',
        direccion: customer.address || '',
        provider: 'dni'
      }, { onConflict: 'user_id' })
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase crear perfil DNI error:', result.error.message);
      return { profile: null, error: result.error };
    }

    return { profile: mapProfile(result.data), error: null };
  }

  function buildAccountUser(customer, authUser) {
    var meta = authUser && authUser.user_metadata ? authUser.user_metadata : {};
    var firstName = customer.firstName || meta.first_name || meta.nombre || '';
    var lastName = customer.lastName || meta.last_name || meta.apellido || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || customer.name || meta.name || 'Cliente';

    return {
      id: authUser && authUser.id ? authUser.id : 'dni-' + customer.dni,
      dni: customer.dni,
      clienteId: customer.id,
      name: name,
      firstName: firstName,
      lastName: lastName,
      email: customer.email || meta.profile_email || '',
      phone: customer.phone || meta.phone || meta.telefono || '',
      address: customer.address || meta.address || meta.direccion || '',
      avatar: '',
      provider: 'dni',
      loginTime: new Date().toISOString()
    };
  }

  function splitFullName(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  }

  function buildEmailAccountUser(authUser, fallback) {
    var meta = authUser && authUser.user_metadata ? authUser.user_metadata : {};
    var name = fallback.name || meta.name || (authUser && authUser.email) || 'Cliente';
    var parts = splitFullName(name);
    var firstName = meta.first_name || meta.nombre || parts.firstName;
    var lastName = meta.last_name || meta.apellido || parts.lastName;

    return {
      id: authUser && authUser.id ? authUser.id : 'email-' + (fallback.email || ''),
      dni: normalizeDni(meta.dni || fallback.dni || ''),
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || name,
      firstName: firstName,
      lastName: lastName,
      email: meta.profile_email || fallback.email || (authUser && authUser.email) || '',
      phone: meta.phone || meta.telefono || '',
      address: meta.address || meta.direccion || '',
      avatar: meta.avatar_url || meta.picture || '',
      provider: fallback.provider || (authUser && authUser.app_metadata && authUser.app_metadata.provider) || 'email',
      loginTime: new Date().toISOString()
    };
  }

  async function registerEmailAccount(data) {
    var sb = getClient();
    var name = String(data.name || '').trim();
    var email = normalizeEmail(data.email);
    var password = data.password || '';
    var cleanDni = normalizeDni(data.dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!name || !email || !password) return { user: null, error: { message: 'Completá todos los campos.' } };

    if (cleanDni && cleanDni.length < 7) return { user: null, error: { message: 'DNI invalido.' } };

    if (cleanDni) {
      var lookup = await fetchCustomerByDni(cleanDni);
      if (lookup.error) {
        return { user: null, error: { message: 'No pudimos validar ese DNI. Proba de nuevo.' } };
      }
      if (lookup.customer) {
        return {
          user: null,
          activateDni: true,
          error: {
            message: 'Tu DNI ya esta cargado en el sistema. Anda a Activar DNI para crear tu contrasena y usar tus datos del local.'
          }
        };
      }
    }

    var result = await sb.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { name: name, dni: cleanDni || '' }
      }
    });

    if (result.error) return { user: null, error: result.error };
    if (!result.data || !result.data.user) {
      return { user: null, error: { message: 'No se pudo crear la cuenta.' } };
    }

    return {
      user: buildEmailAccountUser(result.data.user, { name: name, email: email, dni: cleanDni }),
      needsVerification: !(result.data && result.data.session),
      error: null
    };
  }

  async function loginEmailAccount(email, password) {
    var sb = getClient();
    var cleanEmail = normalizeEmail(email);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanEmail || !password) return { user: null, error: { message: 'Completá todos los campos.' } };

    var result = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (result.error) return { user: null, error: result.error };
    return { user: buildEmailAccountUser(result.data.user, { email: cleanEmail }), error: null };
  }

  async function signInWithGoogle(redirectTo) {
    var sb = getClient();
    if (!sb) return { error: { message: 'Supabase no esta disponible.' } };

    var result = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || window.location.href
      }
    });

    return { error: result.error || null };
  }

  async function getActiveSession(sb) {
    if (!sb || !sb.auth) return { data: { session: null }, error: null };

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return sessionResult;

    var session = sessionResult.data && sessionResult.data.session;
    if (!session) return sessionResult;

    var expiresAtMs = Number(session.expires_at || 0) * 1000;
    var shouldRefresh = !session.access_token || (expiresAtMs && expiresAtMs - Date.now() < 120000);
    if (!shouldRefresh || typeof sb.auth.refreshSession !== 'function') return sessionResult;

    var refreshResult = await sb.auth.refreshSession();
    if (refreshResult.error) return refreshResult;
    return refreshResult.data && refreshResult.data.session ? refreshResult : sessionResult;
  }

  // Devuelve la cuenta actualmente logueada en Supabase Auth.
  // Si el email interno es dni-XXXX@dimension3.local, tambien busca el cliente local por DNI.
  async function getCurrentAccount() {
    var sb = getClient();
    if (!sb) return { user: null, error: null };

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return { user: null, error: sessionResult.error };

    var authUser = sessionResult.data && sessionResult.data.session
      ? sessionResult.data.session.user
      : null;
    if (!authUser) return { user: null, error: null };

    var meta = authUser.user_metadata || {};
    var dniMatch = String(authUser.email || '').match(/^dni-(\d+)@dimension3\.local$/);
    var dniFromAuth = normalizeDni(meta.dni || (dniMatch && dniMatch[1]));
    var user = null;

    var customerForProfile = null;
    if (dniFromAuth) {
      var lookup = await fetchCustomerByDni(dniFromAuth);
      if (lookup.customer) {
        customerForProfile = lookup.customer;
        user = buildAccountUser(lookup.customer, authUser);
      }
    }

    if (!user) {
      user = buildEmailAccountUser(authUser, {
        email: authUser.email || '',
        provider: authUser.app_metadata && authUser.app_metadata.provider
      });
    }

    var profileResult = await fetchProfileByUserId(authUser.id);
    if (!profileResult.profile && customerForProfile) {
      profileResult = await upsertProfileFromCustomer(authUser, customerForProfile);
    }
    if (profileResult.profile) user = mergeProfileUser(user, profileResult.profile);

    return { user: user, error: null };
  }

  // Activa una cuenta web usando un DNI que ya vino desde Access.
  // Sirve para que el cliente vea compras/reparaciones historicas del local.
  async function registerCustomerByDni(dni, password) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanDni) return { user: null, error: { message: 'Ingresá un DNI válido.' } };

    var lookup = await fetchCustomerByDni(cleanDni);
    if (lookup.error) return { user: null, error: lookup.error };
    if (!lookup.customer) {
      return {
        user: null,
        error: {
          message: 'Tu DNI no se encuentra en esta base de datos. Por favor crea una cuenta nueva o consultanos por WhatsApp.'
        }
      };
    }

    var result = await sb.auth.signUp({
      email: authEmailForCustomer(lookup.customer),
      password: password,
      options: {
        data: {
          dni: cleanDni,
          cliente_id: lookup.customer.id,
          name: lookup.customer.name
        }
      }
    });

    if (result.error) {
      var msg = String(result.error.message || '').toLowerCase();
      if (msg.includes('registered') || msg.includes('already')) {
        return { user: null, error: { message: 'Este DNI ya tiene contraseña. Ingresá desde la pestaña Ingresar.' } };
      }
      return { user: null, error: result.error };
    }

    var user = buildAccountUser(lookup.customer, result.data.user);
    if (result.data && result.data.session) {
      var profile = await upsertProfileFromCustomer(result.data.user, lookup.customer);
      if (profile.profile) user = mergeProfileUser(user, profile.profile);
    }

    return {
      user: user,
      needsVerification: !(result.data && result.data.session),
      verificationEmail: authEmailForCustomer(lookup.customer),
      error: null
    };
  }

  // Login por DNI: convierte el DNI al email interno y autentica contra Supabase.
  async function loginCustomerByDni(dni, password) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanDni) return { user: null, error: { message: 'Ingresá un DNI válido.' } };

    var lookup = await fetchCustomerByDni(cleanDni);
    if (lookup.error) return { user: null, error: lookup.error };
    if (!lookup.customer) return { user: null, error: { message: 'No encontramos los datos de ese DNI.' } };

    var auth = await sb.auth.signInWithPassword({
      email: authEmailForCustomer(lookup.customer),
      password: password
    });

    if (auth.error) return { user: null, error: auth.error };

    var profile = await upsertProfileFromCustomer(auth.data.user, lookup.customer);
    var user = buildAccountUser(lookup.customer, auth.data.user);
    if (profile.profile) user = mergeProfileUser(user, profile.profile);

    return { user: user, error: null };
  }

  async function updateCustomerProfile(dni, data) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb || !cleanDni) return { customer: null, error: null };

    var payload = {
      nombre: data.firstName || '',
      apellido: data.lastName || '',
      email: data.email || '',
      telefono: data.phone || '',
      direccion: data.address || ''
    };

    var result = await sb
      .from('clientes')
      .update(payload)
      .eq('dni', cleanDni)
      .select('id,dni,nombre,apellido,email,telefono,direccion')
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase guardar cliente error:', result.error.message);
      return { customer: null, error: result.error };
    }

    return { customer: mapCustomer(result.data), error: null };
  }

  async function updateAccountProfile(data) {
    var sb = getClient();
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return { user: null, error: sessionResult.error };
    if (!sessionResult.data || !sessionResult.data.session) {
      return {
        user: null,
        error: {
          message: 'Tu email todavía no está verificado. Confirmalo desde tu correo y después iniciá sesión para guardar los datos.'
        }
      };
    }

    var authUser = sessionResult.data.session.user;
    var firstName = data.firstName || '';
    var lastName = data.lastName || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || data.email || 'Cliente';
    var cleanDni = normalizeDni(data.dni);
    var provider = data.provider || (authUser.app_metadata && authUser.app_metadata.provider) || 'email';
    var clienteId = data.clienteId || null;

    if (!clienteId && cleanDni) {
      var customerLookup = await fetchCustomerByDni(cleanDni);
      if (customerLookup.customer) clienteId = customerLookup.customer.id;
    }

    var profilePayload = {
      user_id: authUser.id,
      cliente_id: clienteId,
      dni: cleanDni || null,
      nombre: firstName,
      apellido: lastName,
      email: data.email || authUser.email || '',
      telefono: data.phone || '',
      direccion: data.address || '',
      provider: provider
    };

    var profileResult = await sb
      .from('perfiles')
      .upsert(profilePayload, { onConflict: 'user_id' })
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (profileResult.error) {
      if (profileResult.error.code === '23505') {
        return { user: null, error: { message: 'Ese DNI ya está usado por otra cuenta.' } };
      }
      return { user: null, error: profileResult.error };
    }

    var payload = {
      name: name,
      first_name: firstName,
      last_name: lastName,
      nombre: firstName,
      apellido: lastName,
      dni: data.dni || '',
      profile_email: data.email || '',
      phone: data.phone || '',
      telefono: data.phone || '',
      address: data.address || '',
      direccion: data.address || ''
    };

    var result = await sb.auth.updateUser({ data: payload });
    if (result.error) console.warn('Supabase metadata perfil error:', result.error.message);

    var updatedAuthUser = result.data && result.data.user ? result.data.user : authUser;
    var baseUser = buildEmailAccountUser(updatedAuthUser, {
      email: data.email || updatedAuthUser.email || '',
      provider: provider
    });
    if (provider === 'dni') baseUser.provider = 'dni';

    return {
      user: mergeProfileUser(baseUser, mapProfile(profileResult.data)),
      error: null
    };
  }

  async function signOutAccount() {
    var sb = getClient();
    if (sb) await sb.auth.signOut();
  }

  async function changeAccountPassword(password) {
    var sb = getClient();
    if (!sb) return { error: { message: 'Supabase no esta disponible.' } };
    var result = await sb.auth.updateUser({ password: password });
    return { error: result.error || null };
  }

  function parseMoney(value) {
    var normalized = String(value || '').replace(',', '.');
    var amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function normalizeInvidStockValue(stock, status) {
    var text = normalizeCatalogText(status || '');
    if (text) {
      if (text.indexOf('sin stock') !== -1 || text.indexOf('agot') !== -1) return 0;
      if (text.indexOf('bajo stock') !== -1) return 2;
      if (text.indexOf('stock ok') !== -1 || text.indexOf('dispon') !== -1 || text.indexOf('stock') !== -1) return 10;
    }

    var numeric = stock !== null && stock !== undefined && stock !== '' ? Number(stock) : null;
    if (Number.isFinite(numeric)) {
      if (numeric <= 0) return 0;
      return numeric === 1 ? 10 : numeric;
    }
    return 0;
  }

  function getInvidSalePrice(price, currency) {
    var amount = Number(price || 0);
    if (!Number.isFinite(amount) || amount <= 0) return 0;

    var sourceCurrency = String(currency || 'USD').toUpperCase();
    if (sourceCurrency !== 'USD') return amount;

    var usdRate = Number(cfg.INVID_USD_RATE || 0);
    if (!Number.isFinite(usdRate) || usdRate <= 0) return 0;

    var markup = Number(cfg.INVID_MARKUP_RATE || 0);
    if (!Number.isFinite(markup) || markup < 0) markup = 0;

    return Math.round(amount * usdRate * (1 + markup));
  }

  function getInvidMinWebPrice() {
    var minPrice = Number(cfg.INVID_MIN_WEB_PRICE || 0);
    return Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0;
  }

  function isInvidWebPriceAllowed(price) {
    var amount = Number(price || 0);
    return Number.isFinite(amount) && amount >= getInvidMinWebPrice();
  }

  function getInvidRowWebPrice(row) {
    if (!row || !row.invid_id) return 0;
    var sourceCurrency = formatCurrency(row.invid_moneda || 'USD');
    var sourcePrice = parseMoney(row.invid_precio_final || row.invid_precio || 0);
    return getInvidSalePrice(sourcePrice, sourceCurrency);
  }

  function formatStoreMoney(value) {
    var amount = Number(value || 0);
    var hasCents = Math.abs(amount - Math.round(amount)) > 0.009;
    return (cfg.CURRENCY_SYMBOL || '$') + amount.toLocaleString('es-AR', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  function isTruthy(value) {
    var normalized = String(value || '').trim().toLowerCase();
    return value === true || normalized === 'true' || normalized === 'si' || normalized === '1' || normalized === '-1';
  }

  function webOrderStatus(row) {
    var payments = Array.isArray(row && row.pagos) ? row.pagos : [];
    var hasRefund = payments.some(function(payment) {
      return String(payment && payment.estado || '').toLowerCase() === 'devuelto';
    });
    if (hasRefund) return { status: 'refunded', label: 'Devuelto' };

    var status = String(row && row.estado || '').toLowerCase();
    if (status === 'entregado') return { status: 'delivered', label: 'Entregado' };
    if (status === 'pagado') return { status: 'shipped', label: 'Pagado' };
    if (status === 'confirmado') return { status: 'shipped', label: 'Confirmado' };
    if (status === 'cancelado') return { status: 'cancelled', label: 'Cancelado' };
    if (status === 'fallido') return { status: 'cancelled', label: 'Fallido' };
    return { status: 'pending', label: 'Pendiente' };
  }

  function orderDateValue(order) {
    var date = new Date(String(order && order.date || '').replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function orderItemSignature(item) {
    var productId = String((item && (item.productId || item.id_productos)) || '').trim();
    var code = String((item && (item.code || item.codigo)) || '').trim();
    var name = String((item && (item.name || item.nombre)) || '').trim().toLowerCase();
    var qty = Number((item && (item.qty || item.cantidad)) || 0);
    var price = Number((item && (item.price || item.precio_unitario)) || 0);
    if (!Number.isFinite(qty)) qty = 0;
    if (!Number.isFinite(price)) price = 0;
    return [productId, code, name, Math.round(qty), price.toFixed(2)].join('|');
  }

  function orderSignature(items, total) {
    var itemKey = (items || []).map(orderItemSignature).sort().join('||');
    var amount = Number(total || 0);
    if (!Number.isFinite(amount)) amount = 0;
    return amount.toFixed(2) + '::' + itemKey;
  }

  function dedupeWebOrders(orders) {
    var completedKeys = {};
    (orders || []).forEach(function(order) {
      if (!order || (order.status !== 'delivered' && order.status !== 'shipped')) return;
      completedKeys[orderSignature(order.items || [], order.total)] = true;
    });

    var pendingKeys = {};
    return (orders || []).filter(function(order) {
      if (!order || order.status !== 'pending') return true;
      var key = orderSignature(order.items || [], order.total);
      if (completedKeys[key] || pendingKeys[key]) return false;
      pendingKeys[key] = true;
      return true;
    });
  }

  function paymentDisplayLabel(row) {
    var method = String(row && row.metodo_pago || '').toLowerCase();
    var payments = Array.isArray(row && row.pagos) ? row.pagos : [];
    var getnetPayment = payments.find(function(payment) {
      return String(payment && payment.proveedor || '').toLowerCase() === 'getnet';
    });
    var raw = getnetPayment && getnetPayment.raw && typeof getnetPayment.raw === 'object' ? getnetPayment.raw : null;

    if (method === 'getnet' && raw && raw.installments) {
      var label = 'Getnet ' + raw.installments + ' cuotas';
      if (raw.installment_amount) label += ' de ' + formatStoreMoney(raw.installment_amount);
      return label;
    }
    if (method === 'mercadopago') return 'Mercado Pago';
    if (method === 'whatsapp') return 'WhatsApp';
    return row && row.metodo_pago ? row.metodo_pago : '';
  }

  function mergeAccountData(base, extra) {
    var out = Object.assign({}, base || {});
    Object.keys(extra || {}).forEach(function(key) {
      var value = extra[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        out[key] = value;
      }
    });
    return out;
  }

  async function fetchWebOrders(limit) {
    var sb = getClient();
    if (!sb) return { orders: [], error: { message: 'Supabase no esta disponible.' } };

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return { orders: [], error: sessionResult.error };
    var session = sessionResult.data && sessionResult.data.session;
    if (!session || !session.user) return { orders: [], error: null };

    var result = await sb
      .from('pedidos')
      .select('id,external_reference,created_at,estado,metodo_pago,cliente_id,dni,nombre,apellido,email,telefono,direccion,subtotal,iva,total,pagos(id,proveedor,estado,monto,external_payment_id,external_preference_id,raw,created_at),pedido_items(id,id_productos,codigo,nombre,descripcion,categoria,subcategoria,imagen_url,precio_unitario,cantidad,subtotal)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit || 40);

    if (result.error) return { orders: [], error: result.error };

    var orders = (result.data || []).map(function(row) {
      var state = webOrderStatus(row);
      var items = row.pedido_items || [];
      var buyerName = [row.nombre || '', row.apellido || ''].filter(Boolean).join(' ').trim();
      if (!buyerName) buyerName = row.email || '';
      return {
        id: row.external_reference || row.id,
        rawId: row.id,
        typeLabel: 'Pedido',
        date: row.created_at || '',
        status: state.status,
        statusLabel: state.label,
        paymentMethod: paymentDisplayLabel(row),
        buyerName: buyerName,
        buyerEmail: row.email || '',
        buyerDni: row.dni || '',
        buyerPhone: row.telefono || '',
        buyerAddress: row.direccion || '',
        clienteId: row.cliente_id || null,
        total: parseMoney(row.total),
        subtotal: parseMoney(row.subtotal),
        tax: parseMoney(row.iva),
        source: 'web',
        payments: row.pagos || [],
        items: items.map(function(item) {
          var qty = Number(item.cantidad || 0);
          var subtotal = parseMoney(item.subtotal);
          return {
            id: item.id,
            productId: item.id_productos || '',
            name: item.nombre || 'Producto',
            code: item.codigo || '',
            qty: qty,
            price: parseMoney(item.precio_unitario),
            subtotal: subtotal,
            image: item.imagen_url || ''
          };
        })
      };
    });

    return {
      orders: dedupeWebOrders(orders),
      error: null
    };
  }

  // Historial de compras: combina facturas sincronizadas desde Access con pedidos web.
  async function fetchAccountOrders(limit) {
    var sb = getClient();
    if (!sb) return { orders: [], error: { message: 'Supabase no esta disponible.' } };

    var accountResult = await getCurrentAccount();
    if (accountResult.error) return { orders: [], error: accountResult.error };
    var account = accountResult.user || null;
    var clienteId = account && account.clienteId ? account.clienteId : null;

    if (!clienteId) return fetchWebOrders(limit || 40);

    var invoicesQuery = sb
      .from('facturas')
      .select('id_factura,id_cliente,fecha,vendedor,subtotal,descunto,pagotarjeta,total')
      .eq('id_cliente', clienteId)
      .order('fecha', { ascending: false })
      .limit(limit || 40);

    var invoices = await invoicesQuery;

    if (invoices.error) return { orders: [], error: invoices.error };

    var rows = invoices.data || [];
    var invoiceIds = rows.map(function(row) { return row.id_factura; }).filter(Boolean);
    if (!invoiceIds.length) return fetchWebOrders(limit || 40);

    var detailsResult = await sb
      .from('detallefactura')
      .select('id_detallefactura,numerofactura,id_producto,cantidad,subtotal')
      .in('numerofactura', invoiceIds);

    if (detailsResult.error) return { orders: [], error: detailsResult.error };

    var details = detailsResult.data || [];
    var productIds = details
      .map(function(row) { return row.id_producto; })
      .filter(Boolean)
      .filter(function(id, index, arr) { return arr.indexOf(id) === index; });

    var productsById = {};
    if (productIds.length) {
      var productsResult = await sb
        .from('productos')
        .select('id_productos,producto,codigo,descripcion')
        .in('id_productos', productIds);

      if (productsResult.error) return { orders: [], error: productsResult.error };
      (productsResult.data || []).forEach(function(product) {
        productsById[product.id_productos] = product;
      });
    }

    var detailsByInvoice = {};
    details.forEach(function(detail) {
      if (!detailsByInvoice[detail.numerofactura]) detailsByInvoice[detail.numerofactura] = [];
      var product = productsById[detail.id_producto] || {};
      var quantity = parseMoney(detail.cantidad);
      var subtotal = parseMoney(detail.subtotal);
      detailsByInvoice[detail.numerofactura].push({
        id: detail.id_detallefactura,
        name: product.producto || product.descripcion || ('Producto #' + (detail.id_producto || '')),
        code: product.codigo || '',
        qty: quantity,
        price: quantity ? subtotal / quantity : subtotal,
        subtotal: subtotal
      });
    });

    return {
      orders: rows.map(function(row) {
        return {
          id: row.id_factura,
          typeLabel: 'Factura',
          date: row.fecha || '',
          status: 'delivered',
          statusLabel: 'Compra',
          total: parseMoney(row.total),
          subtotal: parseMoney(row.subtotal),
          discount: parseMoney(row.descunto),
          cardPayment: isTruthy(row.pagotarjeta),
          seller: row.vendedor || '',
          buyerName: account.name || '',
          buyerEmail: account.email || '',
          buyerDni: account.dni || '',
          buyerPhone: account.phone || '',
          buyerAddress: account.address || '',
          clienteId: clienteId,
          items: detailsByInvoice[row.id_factura] || []
        };
      }).concat((await fetchWebOrders(limit || 40)).orders || []).sort(function(a, b) {
        return orderDateValue(b) - orderDateValue(a);
      }).slice(0, limit || 40),
      error: null
    };
  }

  // Historial de reparaciones: lee ordenes del local sincronizadas desde Access.
  async function fetchAccountRepairs(limit) {
    var sb = getClient();
    if (!sb) return { repairs: [], error: { message: 'Supabase no esta disponible.' } };

    var repairsResult = await sb
      .from('ordendereparacion')
      .select('id_ordenes,id_clientes,id_consola,fecha_de_entrada,falla,estado,retirado,usuario')
      .order('fecha_de_entrada', { ascending: false })
      .limit(limit || 40);

    if (repairsResult.error) return { repairs: [], error: repairsResult.error };

    var repairs = repairsResult.data || [];
    var consoleIds = repairs
      .map(function(row) { return row.id_consola; })
      .filter(Boolean)
      .filter(function(id, index, arr) { return arr.indexOf(id) === index; });

    var consolesById = {};
    if (consoleIds.length) {
      var consolesResult = await sb
        .from('consolas')
        .select('id_consola,tipo,modelo,serie,pegatina')
        .in('id_consola', consoleIds);

      if (consolesResult.error) return { repairs: [], error: consolesResult.error };
      (consolesResult.data || []).forEach(function(item) {
        consolesById[item.id_consola] = item;
      });
    }

    return {
      repairs: repairs.map(function(row) {
        var consoleItem = consolesById[row.id_consola] || {};
        var retired = isTruthy(row.retirado);
        var consoleName = [consoleItem.tipo, consoleItem.modelo].filter(Boolean).join(' ');
        var realStatus = row.estado || (retired ? 'Retirado' : '');
        return {
          id: row.id_ordenes,
          date: row.fecha_de_entrada || '',
          status: retired ? 'delivered' : (row.estado ? 'pending' : ''),
          statusLabel: realStatus,
          issue: row.falla || '',
          state: row.estado || '',
          retired: retired,
          consoleName: consoleName,
          serial: consoleItem.serie || '',
          sticker: consoleItem.pegatina || '',
          user: row.usuario || ''
        };
      }),
      error: null
    };
  }

  function mapProduct(row) {
    var stock = row.stock !== null && row.stock !== undefined ? Number(row.stock) : null;
    var byOrder = isTruthy(row.producto_sinstock) || isTruthy(row.prodcuto_sinstock);

    return {
      id: row.slug,
      name: row.nombre,
      price: Number(row.precio_venta || 0),
      currency: formatCurrency(row.moneda),
      category: row.categoria_slug || '',
      icon: 'inventory_2',
      subtitle: row.descripcion || row.codigo || row.categoria || 'Consultar',
      badge: stock === 0 ? 'Consultar' : '',
      image: resolveProductImage(row, row.codigo, row.nombre, row.descripcion),
      source: 'supabase',
      sourceLabel: row.categoria || 'Catalogo',
      sourceFile: 'catalogo.html?sub=' + encodeURIComponent(row.categoria_slug || ''),
      slug: row.slug,
      accessId: row.id_viejo || null,
      codigo: row.codigo || '',
      code: row.codigo || '',
      description: row.descripcion || '',
      stock: stock,
      availabilityLabel: 'En local',
      deliveryLabel: 'En local',
      fulfillment: 'local',
      simpleDetail: true,
      byOrder: byOrder,
      producto_sinstock: byOrder
    };
  }

  async function fetchProductsByCategorySlugs(slugs) {
    var sb = getClient();
    if (!sb) return [];

    var categorySlugs = slugs.filter(Boolean).filter(function(slug, index, arr) {
      return arr.indexOf(slug) === index;
    }).sort();
    if (!categorySlugs.length) return [];

    return withPublicCatalogCache('products-slugs-' + categorySlugs.join('|'), async function() {
      var result = await sb
        .from('productos')
        .select('id,id_viejo,nombre,slug,codigo,descripcion,imagen_url,categoria,categoria_slug,precio_venta,moneda,stock,activo,producto_sinstock')
        .eq('activo', true)
        .in('categoria_slug', categorySlugs)
        .order('nombre', { ascending: true });

      if (result.error) {
        console.warn('Supabase productos error:', result.error.message);
        return [];
      }

      return filterVisibleCatalogRows(result.data).map(mapProduct);
    });
  }

  function normalizeCatalogText(value) {
    var text = String(value || '').toLowerCase();
    if (text.normalize) {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return text;
  }

  function catalogSlug(value) {
    return normalizeCatalogText(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'catalogo';
  }

  function compactCatalogText(value) {
    return normalizeCatalogText(value)
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  var HIDDEN_CATALOG_PRODUCT_TERMS = [
    'Consola de juego',
    'Actualizacion Kinect',
    'Aoweixun HUB USB',
    'Aoweixun',
    'Benfei USB HUD',
    'Benfei',
    'Cargar Mercado Pago',
    'Estacionamiento por hora',
    'Nota de credito',
    'Sena Dolares',
    'Joystick ps3 Sony no originales',
    'Juegos Xbox one original',
    'Juegos Digitales Ps3 Ps4 Ps5',
    '701179990048',
    'Seña Dolares'
  ].map(compactCatalogText);

  function isHiddenCatalogProductRow(row) {
    if (!row) return false;
    var haystack = compactCatalogText([
      row.producto,
      row.nombre,
      row.descripcion,
      row.codigo
    ].filter(Boolean).join(' '));

    if (!haystack) return false;
    return HIDDEN_CATALOG_PRODUCT_TERMS.some(function(term) {
      if (!term) return false;
      if (term === 'consola de juego') {
        return haystack.indexOf(term) !== -1 && haystack.indexOf('playstation 5') === -1 && haystack.indexOf('ps5') === -1;
      }
      return haystack.indexOf(term) !== -1;
    });
  }

  function filterVisibleCatalogRows(rows) {
    return (rows || []).filter(function(row) {
      return !isHiddenCatalogProductRow(row);
    });
  }

  function accessGroupForCategory(category) {
    var text = normalizeCatalogText(category);
    if (text.indexOf('juegos originales') !== -1 || text.indexOf('juegos fisicos') !== -1) return 'juegos';
    if (text.indexOf('consola') !== -1) return 'consolas';
    if (text.indexOf('juego') !== -1) return 'juegos';
    if (text.indexOf('periferico') !== -1) return 'periféricos';
    if (text.indexOf('auricular') !== -1 || text.indexOf('parlante') !== -1) return 'audio';
    if (text.indexOf('hardware') !== -1 || text.indexOf('memoria') !== -1 || text.indexOf('pc') !== -1 || text.indexOf('silla') !== -1 || text.indexOf('carry') !== -1 || text.indexOf('disck') !== -1 || text.indexOf('disk') !== -1) return 'hardware';
    return 'accesorios';
  }

  function accessIconForText(category, subcategory, product) {
    var text = normalizeCatalogText([category, subcategory, product].filter(Boolean).join(' '));
    if (text.indexOf('juegos originales') !== -1 || text.indexOf('juegos fisicos') !== -1 || text.indexOf('juegos ps') !== -1 || text.indexOf('juegos xbox') !== -1 || text.indexOf('juegos nintendo') !== -1) return 'stadia_controller';
    if (text.indexOf('auricular') !== -1 || text.indexOf('headset') !== -1) return 'headset_mic';
    if (text.indexOf('parlante') !== -1) return 'speaker';
    if (text.indexOf('placa de video') !== -1 || text.indexOf('geforce') !== -1 || text.indexOf('radeon') !== -1 || text.indexOf('gpu') !== -1) return 'developer_board';
    if (text.indexOf('fuente') !== -1) return 'bolt';
    if (text.indexOf('gabinete') !== -1 || text.indexOf('pc armada') !== -1 || text.indexOf('mini pc') !== -1) return 'desktop_windows';
    if (text.indexOf('cooler') !== -1 || text.indexOf('refrigeracion') !== -1 || text.indexOf('fan') !== -1) return 'ac_unit';
    if (text.indexOf('ram') !== -1 || text.indexOf('procesador') !== -1 || text.indexOf('mother') !== -1) return 'memory';
    if (text.indexOf('memoria') !== -1 || text.indexOf('disco') !== -1 || text.indexOf('carry') !== -1 || text.indexOf('disck') !== -1 || text.indexOf('disk') !== -1 || text.indexOf('pendrive') !== -1) return 'storage';
    if (text.indexOf('cable') !== -1) return 'cable';
    if (text.indexOf('adaptador') !== -1) return 'device_hub';
    if (text.indexOf('joystick') !== -1) return 'gamepad';
    if (text.indexOf('consola') !== -1 || text.indexOf('ps') !== -1 || text.indexOf('xbox') !== -1 || text.indexOf('nintendo') !== -1) return 'sports_esports';
    if (text.indexOf('silla') !== -1) return 'chair';
    if (text.indexOf('mouse') !== -1) return 'mouse';
    if (text.indexOf('teclado') !== -1) return 'keyboard';
    if (text.indexOf('monitor') !== -1) return 'desktop_windows';
    return 'inventory_2';
  }

  function priorityFromList(text, list) {
    var normalized = normalizeCatalogText(text);
    for (var i = 0; i < list.length; i++) {
      var item = normalizeCatalogText(list[i]);
      if (normalized === item) return i;
      if (normalized.indexOf(item) !== -1) return i + 0.1;
    }
    return 999;
  }

  function accessCategoryPriority(category) {
    return priorityFromList(category, [
      'Consolas de juegos',
      'Juegos Fisicos',
      'Accesorios Consolas',
      'PC y Componentes',
      'Hardware',
      'Periféricos PC',
      'Almacenamiento',
      'Memorias',
      'Auriculares',
      'Parlantes',
      'Cables',
      'Adaptadores',
      'Accesorio Celular',
      'Silla Gamer',
      'Otros'
    ]);
  }

  function accessSubcategoryPriority(category, subcategory) {
    var cat = normalizeCatalogText(category);
    var order = [];

    if (cat.indexOf('consolas de juegos') !== -1) {
      order = [
        'Consolas Retro',
        'Consola PS4',
        'Consola Ps5',
        'Consola PS3',
        'Consola Xbox 360'
      ];
    } else if (cat.indexOf('accesorios consolas') !== -1) {
      order = [
        'Ps5',
        'Ps4',
        'Ps3',
        'Ps2',
        'Accesorios PS5',
        'Accesorios PS4',
        'Accesorios PS3',
        'Accesorios PS2',
        'Xbox One',
        'Xbox 360',
        'Xbox Serie',
        'Nintendo'
      ];
    } else if (cat.indexOf('juegos fisicos') !== -1 || cat.indexOf('juegos originales') !== -1) {
      order = [
        'Juegos Ps5',
        'Juegos Ps4',
        'Juegos Ps3'
      ];
    } else if (cat.indexOf('hardware') !== -1 || cat.indexOf('pc y componentes') !== -1) {
      order = [
        'Procesadores',
        'Procesador',
        'Microprocesadores',
        'Placas Madre',
        'Placa Madre',
        'Mothers',
        'Memorias RAM',
        'Memorias',
        'Placas de Video',
        'Placa de Video',
        'SSD / M.2',
        'Disco SSD',
        'Disco SSD M2',
        'Discos HDD',
        'Disco Rigido',
        'Carry Disco 2.55',
        'Carry Disco 3.55',
        'Fuentes',
        'Gabinetes',
        'Refrigeracion / Coolers',
        'Coolers',
        'Pasta Termica',
        'Monitores',
        'Monitor',
        'PCs Armadas / Mini PC',
        'Red',
        'Otros'
      ];
    } else if (cat.indexOf('periféricos pc') !== -1) {
      order = [
        'Combos Periféricos',
        'Monitores',
        'Monitor',
        'Teclados',
        'Mouse',
        'Mouse Pads',
        'PadMouse',
        'Joystick PC',
        'Microfono'
      ];
    } else if (cat.indexOf('almacenamiento') !== -1) {
      order = ['Pendrive', 'Memoria Flash', 'MicroSD / SD', 'Carry Disco 2.55', 'Carry Disco 3.55'];
    } else if (cat.indexOf('memorias') !== -1) {
      order = ['Pendrive', 'Memoria Flash'];
    } else if (cat.indexOf('auriculares') !== -1) {
      order = ['Auricular Gamer', 'Auricular tipo vincha', 'Auricular in ear'];
    } else if (cat.indexOf('cables') !== -1) {
      order = ['Cable HDMI', 'Cable USB', 'Cable de Red', 'Cable Corriente', 'Cable Vga', 'Cable Plug'];
    } else if (cat.indexOf('accesorio celular') !== -1) {
      order = ['Cables Celular', 'PowerBank', 'Joystick Celular'];
    }

    return priorityFromList(subcategory, order);
  }

  function compareCatalogItems(a, b) {
    var priorityDiff = accessCategoryPriority(a.name) - accessCategoryPriority(b.name);
    if (priorityDiff !== 0) return priorityDiff;
    var productDiff = Number(b.productCount || 0) - Number(a.productCount || 0);
    if (productDiff !== 0) return productDiff;
    return a.name.localeCompare(b.name, 'es');
  }

  function compareSubcategoryItems(categoryName, a, b) {
    var priorityDiff = accessSubcategoryPriority(categoryName, a.name) - accessSubcategoryPriority(categoryName, b.name);
    if (priorityDiff !== 0) return priorityDiff;
    var productDiff = Number(b.productCount || 0) - Number(a.productCount || 0);
    if (productDiff !== 0) return productDiff;
    return a.name.localeCompare(b.name, 'es');
  }

  var PHYSICAL_GAMES_CATEGORY_ID = '3';
  var CONSOLE_VISIBLE_SUBCATEGORIES = [
    { id: '72', name: 'Consolas Retro' },
    { id: '3', name: 'Consola PS4' },
    { id: '4', name: 'Consola Ps5' },
    { id: '2', name: 'Consola PS3' },
    { id: '5', name: 'Consola Xbox 360' }
  ];
  var CONSOLE_VISIBLE_IDS = CONSOLE_VISIBLE_SUBCATEGORIES.reduce(function(acc, item) {
    acc[item.id] = true;
    return acc;
  }, {});

  var PHYSICAL_GAMES_SUBCATEGORIES = [
    { id: '69', name: 'Juegos Ps5' },
    { id: '10', name: 'Juegos Ps4' },
    { id: '9', name: 'Juegos Ps3' }
  ];
  var PHYSICAL_GAMES_ALLOWED_IDS = PHYSICAL_GAMES_SUBCATEGORIES.reduce(function(acc, item) {
    acc[item.id] = true;
    return acc;
  }, {});

  function createPhysicalGamesChild(item) {
    return {
      id: 'subcat-' + item.id,
      accessSubcategoryId: item.id,
      name: item.name,
      category: 'juegos',
      icon: accessIconForText('Juegos Fisicos', item.name, ''),
      subtitle: 'Juegos fisicos originales',
      image: '',
      productCount: 0,
      children: null
    };
  }

  function createPhysicalGamesCategory() {
    return {
      id: 'cat-juegos-fisicos',
      accessCategoryId: PHYSICAL_GAMES_CATEGORY_ID,
      accessCategoryIds: [PHYSICAL_GAMES_CATEGORY_ID],
      name: 'Juegos Fisicos',
      category: 'juegos',
      icon: 'stadia_controller',
      subtitle: 'Juegos fisicos originales por consola',
      image: '',
      productCount: 0,
      useChildrenForProducts: true,
      children: PHYSICAL_GAMES_SUBCATEGORIES.map(createPhysicalGamesChild)
    };
  }

  function ensurePhysicalGamesCategory(catalog) {
    var list = (catalog || []).slice();
    var games = null;

    list.some(function(item) {
      var name = normalizeCatalogText(item.name);
      if (name === 'juegos fisicos' || name === 'juegos originales') {
        games = item;
        return true;
      }
      return false;
    });

    if (!games) {
      list.push(createPhysicalGamesCategory());
      return list.sort(compareCatalogItems);
    }

    games.id = games.id || 'cat-juegos-fisicos';
    games.name = 'Juegos Fisicos';
    games.category = 'juegos';
    games.icon = games.icon || 'stadia_controller';
    games.accessCategoryId = games.accessCategoryId || PHYSICAL_GAMES_CATEGORY_ID;
    games.accessCategoryIds = games.accessCategoryIds && games.accessCategoryIds.length ? games.accessCategoryIds : [PHYSICAL_GAMES_CATEGORY_ID];
    games.useChildrenForProducts = true;
    games.children = games.children || [];
    games.children = games.children.filter(function(child) {
      var id = String(child.accessSubcategoryId || '').trim();
      return PHYSICAL_GAMES_ALLOWED_IDS[id] || PHYSICAL_GAMES_SUBCATEGORIES.some(function(item) {
        return normalizeCatalogText(child.name) === normalizeCatalogText(item.name);
      });
    });

    PHYSICAL_GAMES_SUBCATEGORIES.forEach(function(item) {
      var exists = games.children.some(function(child) {
        return String(child.accessSubcategoryId || '') === item.id ||
          String(child.id || '') === 'subcat-' + item.id ||
          normalizeCatalogText(child.name) === normalizeCatalogText(item.name);
      });
      if (!exists) games.children.push(createPhysicalGamesChild(item));
    });

    games.children.sort(function(a, b) { return compareSubcategoryItems(games.name, a, b); });
    games.productCount = games.children.reduce(function(total, child) {
      return total + Number(child.productCount || 0);
    }, 0);
    games.subtitle = games.productCount
      ? games.productCount + ' productos en ' + games.children.length + ' subcategorias'
      : 'Juegos fisicos originales por consola';

    return list.sort(compareCatalogItems);
  }

  function shouldHideAccessCatalogChild(displayCategory, displaySubcategory, subcategoryId) {
    var categoryText = normalizeCatalogText(displayCategory);
    var subcategoryText = normalizeCatalogText(displaySubcategory);
    var id = String(subcategoryId || '').trim();

    if (categoryText === 'consolas de juegos' || categoryText === 'consolas') {
      return !CONSOLE_VISIBLE_IDS[id] && !CONSOLE_VISIBLE_SUBCATEGORIES.some(function(item) {
        return subcategoryText === normalizeCatalogText(item.name);
      });
    }

    if (categoryText === 'juegos fisicos') {
      return id === '18' || id === '19' || subcategoryText === 'juegos nintendo' || subcategoryText === 'juegos xbox one';
    }

    if (categoryText === 'auriculares') {
      return subcategoryText === 'auriculares' || subcategoryText === 'adaptador auricular';
    }

    if (categoryText === 'almacenamiento' && isPcComponentStorageSubcategory(displaySubcategory)) {
      return true;
    }

    return false;
  }

  function isPcComponentStorageSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'disco ssd',
      'disco ssd m2',
      'ssd',
      'ssd / m.2',
      'm.2',
      'nvme',
      'disco rigido',
      'disco rigido externo',
      'disco rigido notebook',
      'disco rigido nas',
      'disco rigido sata',
      'discos hdd',
      'discos hdd / externos',
      'hdd',
      'memoria ram',
      'memorias ram',
      'ram'
    ].indexOf(text) !== -1;
  }

  function isPcStorageSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'disco ssd',
      'ssd',
      'disco rigido',
      'discos hdd',
      'carry disco 2.55',
      'carry disco 3.55',
      'pendrive',
      'memoria flash',
      'microsd',
      'micro sd'
    ].indexOf(text) !== -1;
  }

  function isPcPeripheralSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'combos pc',
      'combos periféricos',
      'monitor',
      'teclados',
      'mouse',
      'padmouse',
      'joystick pc',
      'microfono'
    ].indexOf(text) !== -1;
  }

  function isPcHardwareSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'procesador',
      'procesadores',
      'microprocesadores',
      'placa madre',
      'placas madre',
      'mothers',
      'memorias',
      'memoria ram',
      'memorias ram',
      'ram',
      'placa de video',
      'placas de video',
      'fuentes',
      'gabinetes',
      'refrigeracion',
      'coolers',
      'pasta termica'
    ].indexOf(text) !== -1;
  }

  function accessDisplaySubcategoryForRow(row) {
    var subcategory = row.subcategoria || 'Subcategoria';
    var categoryText = normalizeCatalogText(row.categoria || '');
    var subcategoryText = normalizeCatalogText(subcategory);

    if (categoryText === 'accesorio pc' && subcategoryText === 'combos pc') {
      return 'Combos Periféricos';
    }

    var aliases = {
      'procesador': 'Procesadores',
      'microprocesadores': 'Procesadores',
      'placa madre': 'Placas Madre',
      'mothers': 'Placas Madre',
      'memorias': 'Memorias RAM',
      'memoria ram': 'Memorias RAM',
      'placa de video': 'Placas de Video',
      'placas de video': 'Placas de Video',
      'disco ssd': 'SSD / M.2',
      'ssd': 'SSD / M.2',
      'disco rigido': 'Discos HDD',
      'discos hdd': 'Discos HDD',
      'monitor': 'Monitores',
      'padmouse': 'Mouse Pads',
      'microfono': 'Microfonos'
    };
    if (aliases[subcategoryText]) return aliases[subcategoryText];

    return subcategory;
  }

  function accessDisplayCategoryForRow(row) {
    var category = row.categoria || 'Categoria';
    var categoryText = normalizeCatalogText(category);
    var subcategory = row.subcategoria || '';

    if (categoryText === 'juegos originales') {
      return 'Juegos Fisicos';
    }

    if ((categoryText === 'memorias' || categoryText === 'almacenamiento') && isPcComponentStorageSubcategory(subcategory)) {
      return 'PC y Componentes';
    }

    if (categoryText === 'memorias') {
      return 'Almacenamiento';
    }

    if (categoryText === 'carry disck' || categoryText === 'carry disk') {
      return 'Almacenamiento';
    }

    if (categoryText === 'hardware' || categoryText === 'hadware') {
      return 'PC y Componentes';
    }

    if (categoryText === 'accesorio pc' && isPcHardwareSubcategory(subcategory)) {
      return 'PC y Componentes';
    }

    if (categoryText === 'accesorio pc' && isPcPeripheralSubcategory(subcategory)) {
      return 'Periféricos PC';
    }

    if (categoryText === 'accesorio pc') {
      return 'PC y Componentes';
    }

    return category;
  }

  function removeLeadingAccessCode(text, code) {
    var value = String(text || '').trim();
    code = String(code || '').trim();
    if (!value || !code) return value;

    var normalizedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    var normalizedCode = code.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    var codeIndex = normalizedValue.indexOf(normalizedCode);

    if (normalizedValue.indexOf('codigo ' + normalizedCode) === 0 && codeIndex !== -1) {
      return value.slice(codeIndex + code.length).replace(/^[\s.\-:]+/, '').trim();
    }
    if (normalizedValue.indexOf(normalizedCode) === 0) {
      return value.slice(code.length).replace(/^[\s.\-:]+/, '').trim();
    }
    return value;
  }

  function mapAccessProduct(row) {
    var id = String(row.id_productos || '').trim();
    var name = row.producto || row.descripcion || ('Producto #' + id);
    var category = accessDisplayCategoryForRow(row);
    var subcategory = accessDisplaySubcategoryForRow(row);
    var code = row.codigo ? String(row.codigo).trim() : '';
    var description = row.descripcion && row.descripcion !== name ? removeLeadingAccessCode(row.descripcion, code) : '';
    var subtitle = description || subcategory;
    var group = accessGroupForCategory(category);
    var byOrder = isTruthy(row.producto_sinstock) || isTruthy(row.prodcuto_sinstock);
    var invidWebPrice = getInvidRowWebPrice(row);
    var hasAllowedSupplier = !!row.invid_id && isInvidWebPriceAllowed(invidWebPrice);
    var localImage = resolveProductImage(row, code, name, row.producto, row.descripcion);
    var supplierImage = hasAllowedSupplier ? resolveInvidApiImage({
      invid_imagen_url: row.invid_imagen_url
    }) : '';

    return {
      id: id,
      accessId: id,
      name: name,
      price: parseMoney(row.precio_de_venta),
      currency: formatCurrency('ARS'),
      category: group,
      rootCategory: group,
      subcategoryId: row.id_subcategoria2 || '',
      icon: accessIconForText(category, subcategory, name),
      subtitle: subtitle,
      badge: '',
      image: localImage || supplierImage,
      imageCandidates: [localImage, supplierImage].filter(Boolean),
      source: 'access',
      sourceLabel: subcategory,
      sourceFile: 'catalogo.html?sub=' + encodeURIComponent('subcat-' + (row.id_subcategoria2 || '')),
      slug: 'access-' + id,
      codigo: code,
      code: code,
      description: description || subcategory,
      stock: row.totalproductos !== null && row.totalproductos !== undefined ? parseMoney(row.totalproductos) : null,
      brand: row.marca || '',
      model: code || subcategory,
      sourceIntegration: hasAllowedSupplier ? 'invid' : '',
      supplierId: hasAllowedSupplier ? row.invid_id : '',
      supplierName: hasAllowedSupplier ? row.invid_titulo : '',
      supplierImage: supplierImage,
      supplierStockStatus: hasAllowedSupplier ? row.invid_stock_status : '',
      supplierWebPrice: hasAllowedSupplier ? invidWebPrice : 0,
      availabilityLabel: hasAllowedSupplier ? '48 hs de demora' : 'En local',
      deliveryLabel: hasAllowedSupplier ? '48 hs de demora' : 'En local',
      fulfillment: hasAllowedSupplier ? 'provider' : 'local',
      simpleDetail: true,
      byOrder: byOrder,
      producto_sinstock: byOrder
    };
  }

  function mapInvidProduct(row) {
    var id = String(row.id_productos || '').trim();
    var sourceCurrency = formatCurrency(row.moneda || 'USD');
    var supplierPrice = parseMoney(row.precio_de_venta);
    var stock = normalizeInvidStockValue(row.totalproductos, row.stock_status || row.invid_stock_status);
    var salePrice = getInvidSalePrice(supplierPrice, sourceCurrency);
    var rawName = row.producto || ('Invid #' + id);
    var cleanName = cleanSupplierCodeText(rawName) || ('Invid #' + id);
    var cleanDescription = cleanSupplierCodeText(row.descripcion || row.subcategoria || '');
    var cleanSourceLabel = cleanSupplierCodeText(row.subcategoria || 'Invid PC');
    var imageCandidates = collectInvidApiImages(row);
    return {
      id: 'invid-' + id,
      accessId: '',
      productId: id,
      name: cleanName,
      price: salePrice,
      currency: 'ARS',
      category: 'hardware',
      rootCategory: 'hardware',
      subcategoryId: '',
      icon: accessIconForText(row.categoria || 'Hardware', row.subcategoria || '', rawName),
      subtitle: cleanSupplierCodeText(row.marca || row.subcategoria || 'Invid PC'),
      badge: '',
      image: imageCandidates[0] || '',
      imageCandidates: imageCandidates,
      apiImageCandidates: imageCandidates,
      source: 'invid',
      sourceIntegration: 'invid',
      sourceLabel: cleanSourceLabel,
      sourceFile: 'catalogo.html?sub=' + encodeURIComponent('invid-cat-' + catalogSlug(row.subcategoria || 'invid-pc')),
      slug: 'invid-' + id,
      codigo: row.codigo || id,
      code: row.codigo || id,
      description: cleanDescription,
      stock: stock,
      brand: row.marca || '',
      model: row.codigo || id,
      supplierPrice: supplierPrice,
      supplierCurrency: sourceCurrency,
      supplierStockStatus: row.stock_status || row.invid_stock_status || '',
      availabilityLabel: '48 hs de demora',
      deliveryLabel: '48 hs de demora',
      fulfillment: 'provider',
      simpleDetail: true,
      byOrder: false,
      producto_sinstock: false
    };
  }

  async function fetchAccessCatalogTree() {
    var sb = getClient();
    if (!sb) return [];

    return withPublicCatalogCache('access-tree', async function() {
      var result = await sb.rpc('catalogo_categorias_access');
      if (result.error) {
        console.warn('Supabase catalogo categorias error:', result.error.message);
        return [];
      }

      var byCategory = {};
      (result.data || []).forEach(function(row) {
        var categoryId = String(row.id_categoria || '').trim();
        var subcategoryId = String(row.id_subcategoria2 || '').trim();
        if (!categoryId || !subcategoryId) return;

        var displayCategory = accessDisplayCategoryForRow(row);
        var displaySubcategory = accessDisplaySubcategoryForRow(row);
        var rootId = 'cat-' + catalogSlug(displayCategory);
        if (!byCategory[rootId]) {
          byCategory[rootId] = {
            id: rootId,
            accessCategoryId: null,
            accessCategoryIds: [],
            name: displayCategory,
            category: accessGroupForCategory(displayCategory),
            icon: accessIconForText(displayCategory, '', ''),
            subtitle: '',
            image: '',
            productCount: 0,
            useChildrenForProducts: false,
            children: []
          };
        }

        var count = Number(row.product_count || 0);
        if (byCategory[rootId].accessCategoryIds.indexOf(categoryId) === -1) {
          byCategory[rootId].accessCategoryIds.push(categoryId);
        }
        if (shouldHideAccessCatalogChild(displayCategory, displaySubcategory, subcategoryId)) {
          byCategory[rootId].productCount += count;
          return;
        }
        byCategory[rootId].productCount += count;
        byCategory[rootId].children.push({
          id: 'subcat-' + subcategoryId,
          accessSubcategoryId: subcategoryId,
          name: displaySubcategory,
          category: byCategory[rootId].category,
          icon: accessIconForText(displayCategory, displaySubcategory, ''),
          subtitle: count === 1 ? '1 producto' : count + ' productos',
          image: '',
          productCount: count,
          children: null
        });
      });

      return ensurePhysicalGamesCategory(Object.values(byCategory).map(function(item) {
        item.children.sort(function(a, b) { return compareSubcategoryItems(item.name, a, b); });
        item.subtitle = item.productCount + ' productos en ' + item.children.length + ' subcategorias';
        return item;
      }).sort(compareCatalogItems));
    });
  }

  async function fetchAccessProductsBySubcategory(subcategoryId) {
    var sb = getClient();
    if (!sb || !subcategoryId) return [];

    return withPublicCatalogCache('access-subcategory-' + String(subcategoryId), async function() {
      var result = await sb.rpc('catalogo_productos_access', { subcategoria_id: String(subcategoryId) });
      if (result.error) {
        console.warn('Supabase catalogo productos error:', result.error.message);
        return [];
      }

      return filterVisibleCatalogRows(result.data).map(mapAccessProduct);
    });
  }

  async function fetchAccessProductsByCategory(categoryId) {
    var sb = getClient();
    if (!sb || !categoryId) return [];

    return withPublicCatalogCache('access-category-' + String(categoryId), async function() {
      var result = await sb.rpc('catalogo_productos_categoria_access', { categoria_id: String(categoryId) });
      if (result.error) {
        console.warn('Supabase catalogo categoria productos error:', result.error.message);
        return [];
      }

      return filterVisibleCatalogRows(result.data).map(mapAccessProduct);
    });
  }

  async function fetchInvidPcCatalogTree() {
    var sb = getClient();
    if (!sb) return [];

    return withPublicCatalogCache('invid-pc-tree-all', async function() {
      var result = await sb.rpc('catalogo_invid_pc_categorias', { limite_por_categoria: 0 });
      if (result.error) {
        console.warn('Supabase catalogo Invid PC error:', result.error.message);
        return [];
      }

      var rows = result.data || [];
      if (!rows.length) return [];
      var total = rows.reduce(function(sum, row) {
        return sum + Number(row.product_count || 0);
      }, 0);

      return [{
        id: 'invid-pc',
        name: 'Invid PC',
        category: 'hardware',
        icon: 'memory',
        subtitle: total + ' productos en ' + rows.length + ' categorias',
        image: 'img/hadware.jpg',
        productCount: total,
        useChildrenForProducts: false,
        children: rows.map(function(row) {
          return {
            id: row.id,
            invidCategoryName: row.nombre,
            name: row.nombre,
            category: 'hardware',
            icon: accessIconForText('Hardware', row.nombre, ''),
            subtitle: Number(row.product_count || 0) + ' productos',
            image: row.image_url || '',
            productCount: Number(row.product_count || 0),
            children: null
          };
        }).sort(compareCatalogItems)
      }];
    });
  }

  async function fetchInvidPcProductsByCategory(categoryName) {
    var sb = getClient();
    if (!sb || !categoryName) return [];

    return withPublicCatalogCache('invid-pc-category-' + catalogSlug(categoryName) + '-all-stock', async function() {
      var result = await sb.rpc('catalogo_invid_pc_productos', {
        categoria_nombre: String(categoryName),
        limite_por_categoria: 0
      });
      if (result.error) {
        console.warn('Supabase productos Invid PC error:', result.error.message);
        return [];
      }

      return (result.data || [])
        .map(mapInvidProduct)
        .filter(function(product) {
          return Number(product.stock || 0) > 0 && isInvidWebPriceAllowed(product.price);
        });
    });
  }

  async function fetchInvidProductById(productId) {
    var sb = getClient();
    if (!sb || !productId) return null;

    return withPublicCatalogCache('invid-product-' + String(productId), async function() {
      var result = await sb.rpc('catalogo_invid_producto', { invid_id: String(productId) });
      if (result.error) {
        console.warn('Supabase producto Invid error:', result.error.message);
        return null;
      }

      var row = Array.isArray(result.data) ? result.data[0] : result.data;
      var product = row ? mapInvidProduct(row) : null;
      return product && isInvidWebPriceAllowed(product.price) ? product : null;
    });
  }

  async function fetchAccessProductById(productId) {
    var sb = getClient();
    if (!sb || !productId) return null;

    return withPublicCatalogCache('access-product-' + String(productId), async function() {
      var result = await sb.rpc('catalogo_producto_access', { producto_id: String(productId) });
      if (result.error) {
        console.warn('Supabase catalogo producto error:', result.error.message);
        return null;
      }

      var row = Array.isArray(result.data) ? result.data[0] : result.data;
      if (isHiddenCatalogProductRow(row)) return null;
      return row ? mapAccessProduct(row) : null;
    });
  }

  async function fetchProductBySlug(slug) {
    var sb = getClient();
    if (!sb || !slug) return null;

    var accessMatch = String(slug).match(/^access-(.+)$/);
    if (accessMatch) return fetchAccessProductById(accessMatch[1]);

    var invidMatch = String(slug).match(/^invid-(.+)$/);
    if (invidMatch) return fetchInvidProductById(invidMatch[1]);

    return withPublicCatalogCache('product-slug-' + String(slug), async function() {
      var result = await sb
        .from('productos')
        .select('id,id_viejo,nombre,slug,codigo,descripcion,imagen_url,categoria,categoria_slug,precio_venta,moneda,stock,activo,producto_sinstock')
        .eq('activo', true)
        .eq('slug', slug)
        .maybeSingle();

      if (result.error) {
        console.warn('Supabase producto error:', result.error.message);
        return null;
      }
      if (isHiddenCatalogProductRow(result.data)) return null;
      return result.data ? mapProduct(result.data) : null;
    });
  }

  function parseCartProductId(item) {
    var directId = item && (item.accessId || item.id_productos || item.productId);
    if (directId !== null && directId !== undefined && directId !== '') return String(directId);

    var id = String((item && item.id) || '').trim();
    var accessMatch = id.match(/^access-(.+)$/);
    return accessMatch ? accessMatch[1] : id;
  }

  function mapOrderItem(item) {
    var price = Number((item && item.price) || 0);
    var qty = Number((item && item.qty) || 1);
    if (!Number.isFinite(price) || price < 0) price = 0;
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    qty = Math.round(qty);

    return {
      id_productos: parseCartProductId(item) || null,
      codigo: (item && (item.code || item.codigo || item.ref)) || null,
      nombre: (item && item.name) || 'Producto',
      descripcion: (item && (item.description || item.subtitle)) || null,
      categoria: (item && item.category) || null,
      subcategoria: (item && item.sourceLabel) || null,
      imagen_url: (item && item.image) || null,
      precio_unitario: price,
      cantidad: qty,
      subtotal: price * qty
    };
  }

  async function getAccessToken() {
    var sb = getClient();
    if (!sb) return '';

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return '';

    var session = sessionResult.data && sessionResult.data.session;
    return session && session.access_token ? session.access_token : '';
  }

  async function findMatchingPendingOrder(sb, userId, method, itemRows, total) {
    var result = await sb
      .from('pedidos')
      .select('id,external_reference,estado,metodo_pago,subtotal,iva,total,created_at,pedido_items(id,id_productos,codigo,nombre,precio_unitario,cantidad,subtotal)')
      .eq('user_id', userId)
      .eq('estado', 'pendiente')
      .eq('metodo_pago', method || 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(12);

    if (result.error) return null;

    var targetSignature = orderSignature(itemRows.map(function(item) {
      return {
        productId: item.id_productos || '',
        code: item.codigo || '',
        name: item.nombre || '',
        qty: item.cantidad || 0,
        price: item.precio_unitario || 0
      };
    }), total);

    var rows = result.data || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var items = (row.pedido_items || []).map(function(item) {
        return {
          productId: item.id_productos || '',
          code: item.codigo || '',
          name: item.nombre || '',
          qty: Number(item.cantidad || 0),
          price: parseMoney(item.precio_unitario),
          subtotal: parseMoney(item.subtotal)
        };
      });
      if (orderSignature(items, row.total) === targetSignature) {
        return Object.assign({}, row, { items: row.pedido_items || [], reused: true });
      }
    }

    return null;
  }

  // Guarda un pedido creado en la web. Requiere sesion real para evitar pedidos anonimos.
  async function createWebOrder(data) {
    var sb = getClient();
    if (!sb) return { order: null, error: { message: 'Supabase no esta disponible.' } };

    var items = (data && data.items) || [];
    if (!items.length) return { order: null, error: { message: 'El carrito esta vacio.' } };

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return { order: null, error: sessionResult.error };
    var session = sessionResult.data && sessionResult.data.session;
    if (!session || !session.user) {
      return { order: null, error: { message: 'Inicia sesion para guardar el pedido.' } };
    }

    var account = (data && data.account) || {};
    try {
      var freshAccount = await getCurrentAccount();
      if (freshAccount && freshAccount.user) account = mergeAccountData(account, freshAccount.user);
    } catch (error) {
      console.warn('No se pudo completar la cuenta antes de crear pedido:', error);
    }

    var totals = (data && data.totals) || {};
    var itemRows = items.map(mapOrderItem);
    var fallbackSubtotal = itemRows.reduce(function(sum, item) { return sum + Number(item.subtotal || 0); }, 0);
    var subtotal = Number(totals.subtotal);
    var iva = Number(totals.iva);
    var total = Number(totals.total);
    if (!Number.isFinite(subtotal)) subtotal = fallbackSubtotal;
    if (!Number.isFinite(iva)) iva = 0;
    if (!Number.isFinite(total)) total = subtotal + iva;

    var method = (data && data.method) || 'whatsapp';
    var buyerNotes = [
      account.name ? 'Cliente: ' + account.name : '',
      account.email || session.user.email ? 'Email: ' + (account.email || session.user.email) : '',
      normalizeDni(account.dni) ? 'DNI: ' + normalizeDni(account.dni) : ''
    ].filter(Boolean).join(' | ');
    var notes = [(data && data.notes) || '', buyerNotes].filter(Boolean).join(' - ');

    var existingPending = await findMatchingPendingOrder(sb, session.user.id, method, itemRows, total);
    if (existingPending) {
      return {
        order: existingPending,
        reused: true,
        error: null
      };
    }

    var orderPayload = {
      user_id: session.user.id,
      cliente_id: account.clienteId || null,
      dni: normalizeDni(account.dni) || null,
      nombre: account.firstName || account.name || '',
      apellido: account.lastName || '',
      email: account.email || session.user.email || '',
      telefono: account.phone || '',
      direccion: account.address || '',
      estado: 'pendiente',
      metodo_pago: method,
      subtotal: subtotal,
      iva: iva,
      total: total,
      moneda: cfg.CURRENCY || 'ARS',
      notas: notes || null
    };

    var orderResult = await sb
      .from('pedidos')
      .insert(orderPayload)
      .select('id,external_reference,estado,metodo_pago,subtotal,iva,total,created_at')
      .single();

    if (orderResult.error) return { order: null, error: orderResult.error };

    var rows = itemRows.map(function(item) {
      return Object.assign({}, item, { pedido_id: orderResult.data.id });
    });

    var itemsResult = await sb
      .from('pedido_items')
      .insert(rows)
      .select('id,pedido_id,id_productos,nombre,cantidad,subtotal');

    if (itemsResult.error) {
      return {
        order: orderResult.data,
        error: {
          message: 'El pedido se creo, pero no se pudieron guardar los productos: ' + itemsResult.error.message
        }
      };
    }

    return {
      order: Object.assign({}, orderResult.data, { items: itemsResult.data || [] }),
      error: null
    };
  }

  async function deletePendingWebOrder(orderId) {
    var sb = getClient();
    var cleanId = String(orderId || '').trim();
    if (!sb) return { ok: false, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanId) return { ok: false, error: { message: 'Falta el pedido para eliminar.' } };

    var sessionResult = await getActiveSession(sb);
    if (sessionResult.error) return { ok: false, error: sessionResult.error };

    var session = sessionResult.data && sessionResult.data.session;
    if (!session || !session.user) {
      return { ok: false, error: { message: 'Inicia sesion para eliminar el pedido.' } };
    }

    var paymentsDelete = await sb
      .from('pagos')
      .delete()
      .eq('pedido_id', cleanId);

    if (paymentsDelete.error) return { ok: false, error: paymentsDelete.error };

    var itemsDelete = await sb
      .from('pedido_items')
      .delete()
      .eq('pedido_id', cleanId);

    if (itemsDelete.error) return { ok: false, error: itemsDelete.error };

    var result = await sb
      .from('pedidos')
      .delete()
      .eq('id', cleanId)
      .eq('user_id', session.user.id)
      .eq('estado', 'pendiente')
      .select('id');

    if (result.error) return { ok: false, error: result.error };

    return {
      ok: true,
      deleted: (result.data || []).length,
      error: null
    };
  }

  window.SupabaseStore = {
    isReady: isReady,
    fetchCustomerByDni: fetchCustomerByDni,
    fetchProfileByUserId: fetchProfileByUserId,
    registerEmailAccount: registerEmailAccount,
    loginEmailAccount: loginEmailAccount,
    signInWithGoogle: signInWithGoogle,
    getCurrentAccount: getCurrentAccount,
    registerCustomerByDni: registerCustomerByDni,
    loginCustomerByDni: loginCustomerByDni,
    updateAccountProfile: updateAccountProfile,
    updateCustomerProfile: updateCustomerProfile,
    signOutAccount: signOutAccount,
    changeAccountPassword: changeAccountPassword,
    fetchAccountOrders: fetchAccountOrders,
    fetchAccountRepairs: fetchAccountRepairs,
    fetchProductsByCategorySlugs: fetchProductsByCategorySlugs,
    fetchAccessCatalogTree: fetchAccessCatalogTree,
    fetchAccessProductsByCategory: fetchAccessProductsByCategory,
    fetchAccessProductsBySubcategory: fetchAccessProductsBySubcategory,
    fetchAccessProductById: fetchAccessProductById,
    fetchInvidPcCatalogTree: fetchInvidPcCatalogTree,
    fetchInvidPcProductsByCategory: fetchInvidPcProductsByCategory,
    fetchInvidProductById: fetchInvidProductById,
    fetchProductBySlug: fetchProductBySlug,
    findMercadoLibreImage: findMercadoLibreImage,
    getAccessToken: getAccessToken,
    createWebOrder: createWebOrder,
    deletePendingWebOrder: deletePendingWebOrder
  };
})();
