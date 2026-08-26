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
    { queries: ['joystick', 'joystic', 'joistick', 'gamepad'], alternatives: ['joystick', 'joystic', 'joistick', 'gamepad', 'dualsense', 'dualshock'] },
    { queries: ['auricular', 'auriculares', 'auri', 'headset', 'headphone'], alternatives: ['auricular', 'auriculares', 'auri', 'headset', 'headphone'] },
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

  function queryRequirements(query) {
    var tokens = normalize(query).split(' ').filter(Boolean);
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
        requirements.push({ alternatives: [token], fuzzy: /^[a-z]+$/.test(token) && token.length >= 5 });
      }
      index++;
    }
    return requirements;
  }

  function scoreRequirement(requirement, targetTokens) {
    var best = 0;
    requirement.alternatives.forEach(function(alternative) {
      var alternativeTokens = normalize(alternative).split(' ').filter(Boolean);
      if (!alternativeTokens.length) return;
      if (containsPhrase(targetTokens, alternative)) {
        best = Math.max(best, 150 + alternativeTokens.length * 10);
        return;
      }
      if (alternativeTokens.length !== 1) return;
      var token = alternativeTokens[0];
      targetTokens.forEach(function(target) {
        if (token.length >= 4 && (target.indexOf(token) === 0 || token.indexOf(target) === 0)) {
          best = Math.max(best, 80);
        } else if (requirement.fuzzy && target.length >= 5) {
          var maxDistance = token.length >= 10 ? 2 : 1;
          if (levenshtein(token, target, maxDistance) <= maxDistance) best = Math.max(best, 45);
        }
      });
    });
    return best;
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
    return textScore + (nameScore ? 700 : 0);
  }

  return {
    normalize: normalize,
    normalizeCode: normalizeCode,
    queryRequirements: queryRequirements,
    scoreFields: scoreFields,
    scoreProduct: scoreProduct
  };
});
