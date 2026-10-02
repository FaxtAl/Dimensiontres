/**
 * bot.js - Asistente "Tito" de preguntas frecuentes.
 *
 * Responde por palabras clave con los datos del local (horario, dirección,
 * pagos, reparaciones, garantía). Las consultas de productos usan el buscador
 * del sitio (search-global.js) o llevan al catálogo.
 * El texto se arma con textContent, sin innerHTML.
 */
(function() {
  if (window.__dtBotLoaded) return;
  window.__dtBotLoaded = true;

  // Datos del local (los mismos de index.html y legales.html)
  var STORE = {
    address: 'Bartolomé Mitre 212, Centro, Villa María',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Bartolomé Mitre 212, Villa María, Córdoba'),
    // Lunes (1) a sábado (6). Minutos desde las 00:00, hora de Argentina.
    days: [1, 2, 3, 4, 5, 6],
    shifts: [[9 * 60, 13 * 60], [16 * 60 + 30, 20 * 60 + 30]],
    hoursText: 'lunes a sábado de 9:00 a 13:00 y de 16:30 a 20:30'
  };

  var JOKES = [
    '¿Por qué la PC fue al psicólogo? Porque tenía demasiadas ventanas abiertas.',
    'Un técnico nunca dice "no sé". Dice "hay que abrirlo".',
    'El RGB no te da más FPS, pero te da más autoestima.',
    'Los joysticks con drift no están rotos: están explorando el mundo por su cuenta.',
    'Mi relación con el lag es como con un ex: aparece justo cuando estoy ganando.',
    'Le pregunté a una fuente genérica cuántos watts tenía. Me dijo "los suficientes" y empezó a oler raro.',
    '¿Sabés cuál es el colmo de un gamer? Pedir "una más y me voy a dormir" a las 4 de la mañana.'
  ];

  var QUICK = [
    { label: '¿Están abiertos?', text: 'están abiertos?' },
    { label: 'Busco un producto', text: 'busco un producto' },
    { label: 'Reparaciones', text: 'reparaciones' },
    { label: 'Cómo pago', text: 'como pago' },
    { label: 'Contame un chiste', text: 'contame un chiste' }
  ];

  // Foto del botón y de la cabecera del chat.
  var AVATAR_SRC = 'img/bot-tito.jpg?v=20260916';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var jokeIndex = Math.floor(Math.random() * JOKES.length);
  var greeted = false;
  var busy = false;
  var els = {};

  function phone() {
    return (window.CONFIG && window.CONFIG.CONTACT_PHONE) || '5493534019085';
  }

  function whatsappUrl(text) {
    return 'https://wa.me/' + encodeURIComponent(phone()) + '?text=' + encodeURIComponent(text || 'Hola! Tengo una consulta en DimensionTres');
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function has(text, words) {
    return words.some(function(word) {
      return new RegExp('(^| )' + word + '( |$)').test(text);
    });
  }

  // Horario: se calcula con la hora de Argentina.
  function storeNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/Cordoba',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).formatToParts(new Date());
      var get = function(type) {
        var part = parts.filter(function(p) { return p.type === type; })[0];
        return part ? part.value : '';
      };
      var dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var hour = Number(get('hour')) % 24;
      return { day: dayMap[get('weekday')], minutes: hour * 60 + Number(get('minute')) };
    } catch (error) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function formatMinutes(total) {
    var h = Math.floor(total / 60);
    var m = total % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  }

  function hoursReply() {
    var now = storeNow();
    var openDay = STORE.days.indexOf(now.day) !== -1;
    var current = openDay && STORE.shifts.filter(function(s) { return now.minutes >= s[0] && now.minutes < s[1]; })[0];
    if (current) {
      return 'Sí, estamos abiertos hasta las ' + formatMinutes(current[1]) + '. Vení que el mate está caliente (el de los técnicos, no te ilusiones). Atendemos ' + STORE.hoursText + '.';
    }
    var later = openDay && STORE.shifts.filter(function(s) { return now.minutes < s[0]; })[0];
    if (later) {
      return 'Ahora estamos cerrados, pero volvemos hoy a las ' + formatMinutes(later[0]) + '. Atendemos ' + STORE.hoursText + '.';
    }
    var tomorrowOpen = STORE.days.indexOf((now.day + 1) % 7) !== -1;
    return 'Ahora estamos cerrados' + (tomorrowOpen ? ', volvemos mañana a las 9:00' : ', volvemos el lunes a las 9:00') + '. Hasta los técnicos necesitan reiniciarse. Atendemos ' + STORE.hoursText + '.';
  }

  // Armado de mensajes
  function scrollToEnd() {
    els.log.scrollTop = els.log.scrollHeight;
  }

  function addMessage(from, parts) {
    var msg = document.createElement('div');
    msg.className = 'dt-bot-msg dt-bot-msg--' + from;
    (Array.isArray(parts) ? parts : [parts]).forEach(function(part) {
      if (typeof part === 'string') {
        var p = document.createElement('p');
        p.textContent = part;
        msg.appendChild(p);
      } else if (part) {
        msg.appendChild(part);
      }
    });
    els.log.appendChild(msg);
    scrollToEnd();
    return msg;
  }

  function link(label, href, external) {
    var a = document.createElement('a');
    a.className = 'dt-bot-link';
    a.href = href;
    a.textContent = label;
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  }

  function links() {
    var wrap = document.createElement('div');
    wrap.className = 'dt-bot-links';
    Array.prototype.slice.call(arguments).forEach(function(a) { wrap.appendChild(a); });
    return wrap;
  }

  function setChips(list) {
    els.chips.textContent = '';
    (list || []).forEach(function(chip) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dt-bot-chip';
      b.textContent = chip.label;
      b.addEventListener('click', function() { ask(chip.text, chip.label); });
      els.chips.appendChild(b);
    });
  }

  function thinking() {
    var dots = addMessage('bot', null);
    dots.classList.add('dt-bot-msg--thinking');
    dots.setAttribute('aria-label', 'Tito está escribiendo');
    for (var i = 0; i < 3; i++) dots.appendChild(document.createElement('span'));
    return dots;
  }

  function wait(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, reduceMotion ? 0 : ms); });
  }

  // Productos: usa el buscador del sitio si está en la página.
  var FILLER = ['tenes', 'tenés', 'tienen', 'tiene', 'hay', 'precio', 'precios', 'cuanto', 'sale', 'salen', 'cuesta', 'cuestan',
    'busco', 'buscando', 'quiero', 'queria', 'necesito', 'vendes', 'venden', 'stock', 'de', 'del', 'la', 'el', 'los', 'las',
    'un', 'una', 'unos', 'unas', 'para', 'me', 'que', 'algun', 'alguna', 'con', 'y', 'o', 'por', 'favor', 'hola', 'buenas', 'en'];

  function productQuery(text) {
    return text.split(' ').filter(function(word) { return word && FILLER.indexOf(word) === -1; }).join(' ').trim();
  }

  async function searchProducts(query) {
    var catalogLink = link('Buscar "' + query + '" en el catálogo', 'catalogo.html?q=' + encodeURIComponent(query));
    var search = window.DimensionTresSearchGlobal;
    if (!search) {
      return ['Esa te la busco en el catálogo, que tiene los precios al día:', links(catalogLink)];
    }

    var products = [];
    try {
      products = await search.loadProducts();
    } catch (error) {
      products = [];
    }
    if (!products.length) {
      return ['Se me trabó el depósito y no pude revisar el stock. Probá en el catálogo:', links(catalogLink)];
    }

    var found = search.getSuggestions(products, query).slice(0, 3);
    if (!found.length) {
      return [
        'Revolví todo el depósito y no encontré "' + query + '". Probá con otras palabras (marca o modelo) o preguntanos, que capaz lo conseguimos.',
        links(catalogLink, link('Preguntar por WhatsApp', whatsappUrl('Hola! Estoy buscando: ' + query), true))
      ];
    }

    var list = document.createElement('div');
    list.className = 'dt-bot-products';
    found.forEach(function(product) {
      var a = document.createElement('a');
      a.className = 'dt-bot-product';
      a.href = search.productUrl(product);

      var name = document.createElement('span');
      name.className = 'dt-bot-product-name';
      name.textContent = product.name || 'Producto';

      var meta = document.createElement('span');
      meta.className = 'dt-bot-product-meta';
      var price = search.formatPrice(product.price);
      var fromProvider = product.fulfillment === 'provider' || product.sourceIntegration === 'invid';
      meta.textContent = (price || 'Consultar precio') + ' · ' + (fromProvider ? 'llega en 48 hs' : 'en el local');

      a.appendChild(name);
      a.appendChild(meta);
      list.appendChild(a);
    });

    return [
      found.length === 1 ? 'Encontré esto:' : 'Encontré estos, recién salidos del depósito:',
      list,
      links(link('Ver todos los resultados', 'catalogo.html?q=' + encodeURIComponent(query)))
    ];
  }

  // Respuestas
  function reply(text) {
    var t = normalize(text);

    if (has(t, ['boludo', 'boluda', 'pelotudo', 'forro', 'idiota', 'estupido', 'tarado', 'mierda', 'puto'])) {
      return { parts: 'Tranqui, que yo solo soy un bot con un destornillador. ¿En qué te ayudo?', chips: QUICK };
    }
    if (/^(hola|holis|buenas|buen dia|buenos dias|buenas tardes|buenas noches|hey|que tal)( |$)/.test(t) && t.length < 25) {
      return { parts: '¡Hola! ¿Qué preguntita tenés hoy?', chips: QUICK };
    }
    if (has(t, ['gracias', 'grax', 'genio', 'crack', 'joya', 'buenisimo'])) {
      return { parts: '¡De nada! Si la PC empieza a hacer ruidos raros, ya sabés dónde encontrarme.', chips: QUICK };
    }
    if (has(t, ['chau', 'adios', 'nos vemos', 'hasta luego'])) {
      return { parts: '¡Chau! Que el ping te sea leve.' };
    }
    if (has(t, ['chiste', 'chistes', 'humor', 'reir', 'gracioso'])) {
      var joke = JOKES[jokeIndex % JOKES.length];
      jokeIndex++;
      return { parts: joke, chips: [{ label: 'Otro chiste', text: 'otro chiste' }, { label: 'Volver a lo serio', text: 'hola' }] };
    }
    if (has(t, ['horario', 'horarios', 'abierto', 'abiertos', 'abren', 'abre', 'cierran', 'cierra', 'atienden', 'hora'])) {
      return { parts: hoursReply(), chips: [{ label: '¿Dónde están?', text: 'donde estan' }, { label: 'Busco un producto', text: 'busco un producto' }] };
    }
    // "local" no se usa como palabra clave: suele ser parte de una búsqueda.
    if (has(t, ['donde', 'direccion', 'ubicacion', 'ubicados', 'mapa', 'como llego'])) {
      return {
        parts: ['Estamos en ' + STORE.address + '. Si te perdés, preguntá por los que saben de joysticks con drift.', links(link('Abrir en Google Maps', STORE.mapsUrl, true))],
        chips: [{ label: '¿Están abiertos?', text: 'están abiertos?' }]
      };
    }
    if (has(t, ['envio', 'envios', 'envian', 'mandan', 'correo', 'retiro', 'retirar', 'entrega', 'domicilio'])) {
      return { parts: 'Por ahora trabajamos con retiro en el local, en ' + STORE.address + '. Cuando tu pedido está listo te avisamos, así no tenés que esperar al cartero mirando por la ventana.', chips: QUICK };
    }
    if (has(t, ['48', 'demora', 'pedido especial', 'a pedido', 'proveedor', 'cuanto tarda', 'tarda'])) {
      return { parts: 'Los productos que dicen "48 hs de demora" los traemos del proveedor: tardan unas 48 hs en llegar al local. Los que dicen "en local" ya los tenemos acá.', chips: QUICK };
    }
    if (has(t, ['pago', 'pagar', 'pagos', 'cuotas', 'tarjeta', 'transferencia', 'mercado pago', 'mercadopago', 'efectivo', 'debito', 'credito'])) {
      return { parts: 'Podés pagar por transferencia, al mismo precio, o con tarjeta por Mercado Pago, también en cuotas. Lo elegís en el carrito, antes de confirmar. Aceptamos plata, no figuritas.', chips: QUICK };
    }
    if (has(t, ['garantia', 'garantias', 'devolucion', 'cambio', 'falla', 'fallado', 'roto'])) {
      return {
        parts: ['Todo lo que vendemos tiene garantía; el plazo depende de cada producto. Si algo falla, escribinos y lo vemos.', links(link('Ver cómo funciona la garantía', 'legales.html#garantia'))],
        chips: QUICK
      };
    }
    // "pantalla" no se usa como palabra clave: suele ser un producto.
    if (has(t, ['reparacion', 'reparaciones', 'reparar', 'arreglar', 'arreglo', 'tecnico', 'service', 'servicio', 'drift', 'no prende', 'limpieza', 'formatear'])) {
      return {
        parts: [
          'Reparamos consolas, joysticks (sí, el drift también), PCs y notebooks. El presupuesto depende de qué le pasó al equipo, así que lo mejor es contarnos por WhatsApp.',
          links(link('Consultar una reparación', whatsappUrl('Hola! Quiero consultar por un servicio técnico'), true))
        ],
        chips: QUICK
      };
    }
    if (has(t, ['mi pedido', 'pedido', 'pedidos', 'compra', 'cuenta', 'factura'])) {
      return {
        parts: ['Tus pedidos están en Mi cuenta. Si querés saber en qué anda uno, escribinos y te contamos.', links(link('Ir a Mi cuenta', 'cuenta.html'), link('Preguntar por WhatsApp', whatsappUrl('Hola! Quiero consultar por mi pedido'), true))],
        chips: QUICK
      };
    }
    if (has(t, ['whatsapp', 'humano', 'persona', 'hablar', 'contacto', 'telefono', 'llamar', 'vendedor'])) {
      return { parts: ['Te paso con alguien de carne y hueso:', links(link('Escribir por WhatsApp', whatsappUrl(), true))] };
    }
    if (has(t, ['quien sos', 'sos un bot', 'bot', 'tito', 'como te llamas'])) {
      return { parts: 'Soy Tito, el bot del local. No tomo mate, pero me lo imagino muy rico. Sé de horarios, pagos, reparaciones, productos y chistes malos.', chips: QUICK };
    }
    if (t === 'busco un producto' || t === 'producto' || t === 'productos') {
      return { parts: 'Dale, escribime qué buscás. Por ejemplo: "ryzen 5", "joystick ps5" o "fuente 650w".' };
    }

    var query = productQuery(t);
    if (query.length >= 3) {
      return { search: query };
    }
    return {
      parts: ['Uh, eso no está en mi manual. ¿Te paso con una persona de verdad?', links(link('Escribir por WhatsApp', whatsappUrl(), true))],
      chips: QUICK
    };
  }

  async function ask(text, label) {
    if (busy) return;
    var clean = String(text || '').trim();
    if (!clean) return;
    busy = true;
    els.input.disabled = true;
    setChips([]);
    addMessage('user', label || clean);

    var dots = thinking();
    var answer = reply(clean);
    var parts = answer.parts;
    if (answer.search) {
      await wait(250);
      parts = await searchProducts(answer.search);
      answer.chips = [{ label: 'Buscar otra cosa', text: 'busco un producto' }, { label: '¿Están abiertos?', text: 'están abiertos?' }];
    } else {
      await wait(500);
    }
    dots.remove();
    addMessage('bot', parts);
    setChips(answer.chips || []);

    busy = false;
    els.input.disabled = false;
    if (els.panel.classList.contains('is-open')) els.input.focus();
  }

  // Interfaz
  function avatarImg(className) {
    var img = document.createElement('img');
    img.className = className;
    img.src = AVATAR_SRC;
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('error', function() {
      // Sin foto: inicial sobre círculo celeste.
      var fallback = document.createElement('span');
      fallback.className = className + ' is-fallback';
      fallback.textContent = 'T';
      img.replaceWith(fallback);
    });
    return img;
  }

  function open() {
    els.panel.hidden = false;
    // Se espera un cuadro para que se vea la transición de apertura.
    requestAnimationFrame(function() { els.panel.classList.add('is-open'); });
    els.launcher.setAttribute('aria-expanded', 'true');
    document.body.classList.add('dt-bot-open');
    if (!greeted) {
      greeted = true;
      addMessage('bot', '¡Buenas! Soy Tito, el técnico de DimensionTres. Sé de precios, horarios, reparaciones y chistes malos (en ese orden de calidad). ¿Qué preguntita tenés?');
      setChips(QUICK);
    }
    setTimeout(function() { els.input.focus(); }, reduceMotion ? 0 : 120);
  }

  function close() {
    els.panel.classList.remove('is-open');
    els.launcher.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('dt-bot-open');
    setTimeout(function() {
      if (!els.panel.classList.contains('is-open')) els.panel.hidden = true;
    }, reduceMotion ? 0 : 180);
    els.launcher.focus();
  }

  function build() {
    if (document.querySelector('.dt-bot-launcher')) return;

    var launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'dt-bot-launcher';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'dt-bot-panel');
    launcher.setAttribute('aria-label', 'Abrir chat con Tito');
    launcher.title = '¿Preguntita?';
    launcher.appendChild(avatarImg('dt-bot-launcher-img'));

    var panel = document.createElement('section');
    panel.id = 'dt-bot-panel';
    panel.className = 'dt-bot-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con Tito, el técnico de DimensionTres');
    panel.innerHTML =
      '<header class="dt-bot-head">' +
        '<div class="dt-bot-avatar" aria-hidden="true"></div>' +
        '<div class="dt-bot-title"><strong>Tito</strong><span>Técnico de DimensionTres, bot y medio</span></div>' +
        '<button type="button" class="dt-bot-close" aria-label="Cerrar chat">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</header>' +
      '<div class="dt-bot-log" role="log" aria-live="polite"></div>' +
      '<div class="dt-bot-chips"></div>' +
      '<form class="dt-bot-form">' +
        '<label class="dt-bot-sr" for="dt-bot-input">Escribí tu pregunta</label>' +
        '<input id="dt-bot-input" class="dt-bot-input" type="text" maxlength="160" autocomplete="off" placeholder="Escribí tu preguntita...">' +
        '<button type="submit" class="dt-bot-send">Enviar</button>' +
      '</form>';

    panel.querySelector('.dt-bot-avatar').appendChild(avatarImg('dt-bot-avatar-img'));
    document.body.appendChild(panel);
    document.body.appendChild(launcher);

    els.launcher = launcher;
    els.panel = panel;
    els.log = panel.querySelector('.dt-bot-log');
    els.chips = panel.querySelector('.dt-bot-chips');
    els.input = panel.querySelector('.dt-bot-input');

    launcher.addEventListener('click', function() {
      if (panel.classList.contains('is-open')) close();
      else open();
    });
    panel.querySelector('.dt-bot-close').addEventListener('click', close);
    panel.querySelector('.dt-bot-form').addEventListener('submit', function(event) {
      event.preventDefault();
      var value = els.input.value;
      els.input.value = '';
      ask(value);
    });
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
