/**
 * Relevancia compartida del buscador de DimensionTres.
 * Mantiene las palabras escritas como requisitos y usa los alias solamente
 * como alternativas controladas. No mezcla stock, entrega ni origen.
 */
(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DimensionTresSearch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  var TEXT_FIELDS = [
    'name', 'nombre', 'title', 'titulo', 'producto', 'subtitle',
    'brand', 'marca', 'brandName',
    'model', 'modelo', 'category', 'categoria', 'rootCategory',
    'subcategory', 'subcategoria', 'originalCategory', 'originalSubcategory',
    'sourceLabel'
  ];

  var CODE_FIELDS = [
    'codigo', 'code', 'sku', 'ref', 'barcode', 'ean', 'upc',
    'id', 'accessId', 'productId', 'supplierId'
  ];

  var ALIAS_RULES = [
    { queries: ['playstation 5', 'play 5', 'ps5'], alternatives: ['playstation 5', 'play 5', 'ps5', 'sony ps5'] },
    { queries: ['playstation 4', 'play 4', 'ps4'], alternatives: ['playstation 4', 'play 4', 'ps4', 'sony ps4'] },
    { queries: ['playstation 3', 'play 3', 'ps3'], alternatives: ['playstation 3', 'play 3', 'ps3', 'sony ps3'] },
    { queries: ['playstation 2', 'play 2', 'ps2'], alternatives: ['playstation 2', 'play 2', 'ps2', 'sony ps2'] },
    { queries: ['playstation', 'play', 'pley'], alternatives: ['playstation', 'play', 'pley', 'ps5', 'ps4', 'ps3', 'ps2'] },
    { queries: ['memoria ram', 'memorias ram', 'ram'], alternatives: ['memoria ram', 'memorias ram', 'ram', 'ddr2', 'ddr3', 'ddr4', 'ddr5', 'sodimm'] },
    { queries: ['ssd', 'disco ssd'], alternatives: ['ssd', 'disco ssd', 'unidad estado solido'] },
    { queries: ['hdd', 'disco rigido'], alternatives: ['hdd', 'disco rigido', 'disco duro'] },
    { queries: ['almacenamiento'], alternatives: ['almacenamiento', 'ssd', 'hdd', 'disco rigido', 'pendrive', 'nvme'] },
    { queries: ['placa de video', 'placa video', 'gpu', 'vga'], alternatives: ['placa de video', 'placa video', 'gpu', 'vga', 'rtx', 'radeon', 'nvidia geforce'] },
    { queries: ['joystick', 'joystic', 'joistick', 'gamepad', 'control', 'controles', 'mando', 'mandos'], alternatives: ['joystick', 'joystic', 'joistick', 'gamepad', 'control', 'mando', 'dualsense', 'dualshock'] },
    { queries: ['auricular', 'auriculares', 'auri', 'headset', 'headphone', 'audifono', 'audifonos', 'audiffonos'], alternatives: ['auricular', 'auriculares', 'auri', 'headset', 'headphone', 'audifono', 'vincha'] },
    { queries: ['webcam', 'camara web', 'camara'], alternatives: ['webcam', 'camara web', 'camara', 'web cam'] },
    { queries: ['notebook', 'notebooks', 'laptop', 'portatil'], alternatives: ['notebook', 'laptop', 'portatil'] },
    { queries: ['pendrive', 'pen drive'], alternatives: ['pendrive', 'pen drive', 'memoria usb'] },
    { queries: ['cooler', 'ventilador', 'refrigeracion'], alternatives: ['cooler', 'ventilador', 'refrigeracion', 'fan'] },
    { queries: ['silla gamer', 'silla'], alternatives: ['silla gamer', 'silla', 'sillon gamer'] },
    { queries: ['teclado', 'teclados', 'keyboard'], alternatives: ['teclado', 'teclados', 'keyboard'] },
    { queries: ['mouse', 'mause', 'raton'], alternatives: ['mouse', 'mause', 'raton'] },
    { queries: ['monitor', 'monitores', 'pantalla', 'display'], alternatives: ['monitor', 'monitores', 'pantalla', 'display'] },
    { queries: ['xbox'], alternatives: ['xbox', 'x box', 'series x', 'series s'] },
    { queries: ['nintendo switch', 'switch'], alternatives: ['nintendo switch', 'switch', 'switch oled'] },
    { queries: ['motherboard', 'mother', 'placa madre', 'mainboard'], alternatives: ['motherboard', 'mother', 'placa madre', 'mainboard'] },
    { queries: ['procesador', 'cpu', 'micro'], alternatives: ['procesador', 'cpu', 'micro', 'ryzen', 'intel core'] },
    { queries: ['fuente', 'psu'], alternatives: ['fuente', 'psu', 'fuente gamer'] },
    { queries: ['gabinete', 'case'], alternatives: ['gabinete', 'case', 'pc case'] }
  ];

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeCode(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function singular(token) {
    token = String(token || '');
    if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
    if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
    return token;
  }

  function sameToken(a, b) {
    return a === b || singular(a) === singular(b);
  }

  function phraseAt(tokens, phraseTokens, index) {
    if (index + phraseTokens.length > tokens.length) return false;
    for (var i = 0; i < phraseTokens.length; i++) {
      if (!sameToken(tokens[index + i], phraseTokens[i])) return false;
    }
    return true;
  }

  function containsPhrase(tokens, phrase) {
    var phraseTokens = normalize(phrase).split(' ').filter(Boolean);
    if (!phraseTokens.length) return false;
    for (var i = 0; i <= tokens.length - phraseTokens.length; i++) {
      if (phraseAt(tokens, phraseTokens, i)) return true;
    }
    return false;
  }

  function targetTokens(value) {
    var base = normalize(value).split(' ').filter(Boolean);
    var expanded = base.slice();
    base.forEach(function(token) {
      var parts = token
        .replace(/([a-z])([0-9])/g, '$1 $2')
        .replace(/([0-9])([a-z])/g, '$1 $2')
        .split(' ')
        .filter(Boolean);
      if (parts.length > 1) parts.forEach(function(part) {
        if (expanded.indexOf(part) === -1) expanded.push(part);
      });
    });
    return expanded;
  }

  function levenshtein(a, b, max) {
    a = singular(a);
    b = singular(b);
    if (a === b) return 0;
    if (!a || !b) return Math.max(a.length, b.length);
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var previous = [];
    var beforePrevious = [];
    for (var j = 0; j <= b.length; j++) previous[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var current = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
        // Dos letras cambiadas de lugar cuentan como un solo error: "tecaldo"
        // esta a distancia 1 de "teclado", no a 2. Es el typo mas comun al tipear rapido.
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
        }
        rowMin = Math.min(rowMin, current[j]);
      }
      if (rowMin > max) return max + 1;
      beforePrevious = previous;
      previous = current;
    }
    return previous[b.length];
  }

  var QUERY_ALIASES = [];
  ALIAS_RULES.forEach(function(rule) {
    rule.queries.forEach(function(query) {
      QUERY_ALIASES.push({
        tokens: normalize(query).split(' ').filter(Boolean),
        alternatives: rule.alternatives.slice()
      });
    });
  });
  QUERY_ALIASES.sort(function(a, b) { return b.tokens.length - a.tokens.length; });

  // Nexos que la gente escribe sin pensar ("control de play", "auricular con cable").
  // Si se exigen como el resto de las palabras, dejan afuera a todos los productos
  // que no las tengan en el nombre, que son casi todos.
  var STOPWORDS = ['de', 'del', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'con', 'sin', 'para', 'por', 'y', 'o', 'a', 'en', 'al'];

  function queryRequirements(query) {
    var tokens = normalize(query).split(' ').filter(Boolean);
    var utiles = tokens.filter(function(token) { return STOPWORDS.indexOf(token) === -1; });
    if (utiles.length) tokens = utiles;
    var requirements = [];
    var index = 0;
    while (index < tokens.length) {
      var alias = QUERY_ALIASES.find(function(entry) {
        return phraseAt(tokens, entry.tokens, index);
      });
      if (alias) {
        requirements.push({ alternatives: alias.alternatives, fuzzy: false });
        index += alias.tokens.length;
        continue;
      }
      var token = tokens[index];
      if (token.length >= 2 || (/^\d+$/.test(token) && tokens.length > 1)) {
        // Desde 4 letras ya vale corregir typos: "mose" -> "mouse".
        requirements.push({ alternatives: [token], fuzzy: /^[a-z]+$/.test(token) && token.length >= 4 });
      }
      index++;
    }
    return requirements;
  }

  function scoreRequirement(requirement, targetTokens) {
    var best = 0;
    var hits = 0;
    requirement.alternatives.forEach(function(alternative) {
      var alternativeTokens = normalize(alternative).split(' ').filter(Boolean);
      if (!alternativeTokens.length) return;
      if (containsPhrase(targetTokens, alternative)) {
        best = Math.max(best, 150 + alternativeTokens.length * 10);
        hits++;
        return;
      }
      if (alternativeTokens.length !== 1) return;
      var token = alternativeTokens[0];
      targetTokens.forEach(function(target) {
        if (token.length >= 4 && target.indexOf(token) === 0) {
          // El producto empieza con lo que escribio el cliente: "tecla" -> "teclado".
          best = Math.max(best, 80);
          hits++;
        } else if (target.length >= 5 && token.indexOf(target) === 0) {
          // Escribio de mas y el producto usa la forma corta: "monitores" -> "monitor".
          // El minimo de 5 letras en la palabra del producto es lo que evita que "red"
          // (cable de red, placa de red) matchee con "redragon", o "cam" con "webcam".
          best = Math.max(best, 60);
        } else if (requirement.fuzzy && target.length >= 5) {
          var maxDistance = token.length >= 10 ? 2 : 1;
          if (levenshtein(token, target, maxDistance) <= maxDistance) best = Math.max(best, 45);
        }
      });
    });
    // "placa de video" abre en vga, radeon, geforce, rtx. Una "VGA Gigabyte Radeon"
    // pega en varios de esos; un "Cable VGA" en uno solo. El que pega en mas es el
    // que realmente es esa clase de producto, y no el que la nombra al pasar.
    return best ? best + Math.min(Math.max(hits - 1, 0), 3) * 45 : 0;
  }

  function scoreText(text, query) {
    return scoreFields([text], query);
  }

  function scoreFields(fields, query) {
    var normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) return 0;
    var tokenGroups = (fields || [])
      .map(normalize)
      .filter(Boolean)
      .map(targetTokens);
    if (!tokenGroups.length) return 0;
    var requirements = queryRequirements(normalizedQuery);
    if (!requirements.length) return 0;

    var total = 0;
    for (var i = 0; i < requirements.length; i++) {
      var best = 0;
      tokenGroups.forEach(function(tokens) {
        best = Math.max(best, scoreRequirement(requirements[i], tokens));
      });
      if (!best) return 0;
      total += best;
    }
    if (tokenGroups.some(function(tokens) { return containsPhrase(tokens, normalizedQuery); })) total += 900;
    return total + requirements.length * 25;
  }

  function collectFields(product, names) {
    product = product || {};
    return names.map(function(name) { return product[name]; }).filter(Boolean);
  }

  function isCodeLike(query) {
    var raw = String(query || '').trim();
    return /\d/.test(raw) && /^[a-z0-9._\/-]+$/i.test(raw) && normalizeCode(raw).length >= 4;
  }

  // El producto se llama exactamente lo que se busco. Quien escribe "ps5" quiere la
  // consola, no la funda para ps5 ni el juego de ps5, aunque los tres digan "ps5".
  function exactNameBonus(normalizedName, normalizedQuery) {
    if (!normalizedName) return 0;
    if (normalizedName === normalizedQuery) return 1500;
    var requirements = queryRequirements(normalizedQuery);
    if (requirements.length !== 1) return 0;
    var alternatives = requirements[0].alternatives;
    for (var i = 0; i < alternatives.length; i++) {
      if (normalize(alternatives[i]) === normalizedName) return 1500;
    }
    return 0;
  }

  function scoreProduct(product, query) {
    product = product || {};
    var normalizedQuery = normalize(query);
    var normalizedName = normalize(collectFields(product, ['name', 'nombre', 'title', 'titulo', 'producto']).join(' '));
    if ((normalizedQuery === 'ram' || normalizedQuery === 'memoria ram' || normalizedQuery === 'memorias ram') && /(^| )sin ram( |$)/.test(normalizedName)) return 0;
    if ((normalizedQuery === 'ssd' || normalizedQuery === 'disco ssd') && /(^| )sin ssd( |$)/.test(normalizedName)) return 0;
    var codeQuery = normalizeCode(query);
    var codes = collectFields(product, CODE_FIELDS).map(normalizeCode).filter(Boolean);
    if (isCodeLike(query)) {
      if (codes.some(function(code) { return code === codeQuery; })) return 5000;
      if (codeQuery.length >= 5 && codes.some(function(code) { return code.indexOf(codeQuery) !== -1; })) return 2500;
    }

    var textFields = collectFields(product, TEXT_FIELDS);
    var textScore = scoreFields(textFields, query);
    if (!textScore) return 0;

    var nameScore = scoreFields(collectFields(product, ['name', 'nombre', 'title', 'titulo', 'producto']), query);
    return textScore + (nameScore ? 700 : 0) + exactNameBonus(normalizedName, normalizedQuery);
  }

  return {
    normalize: normalize,
    normalizeCode: normalizeCode,
    queryRequirements: queryRequirements,
    scoreFields: scoreFields,
    scoreProduct: scoreProduct
  };
});
