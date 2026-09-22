(function () {
  'use strict';

  var storageKey = 'dt_cookie_preferences_v1';
  var currentChoice = '';
  var banner = null;

  function readChoice() {
    if (currentChoice) return currentChoice;
    try {
      var saved = window.localStorage.getItem(storageKey);
      if (saved === 'all' || saved === 'necessary') return saved;
    } catch (error) {}
    try {
      var sessionChoice = window.sessionStorage.getItem(storageKey);
      if (sessionChoice === 'all' || sessionChoice === 'necessary') return sessionChoice;
    } catch (error) {}
    return '';
  }

  function saveChoice(choice) {
    currentChoice = choice;
    try {
      window.localStorage.setItem(storageKey, choice);
      return;
    } catch (error) {}
    try { window.sessionStorage.setItem(storageKey, choice); } catch (error) {}
  }

  function updateOptionalMap() {
    var frame = document.querySelector('[data-dt-map-frame]');
    var placeholder = document.querySelector('[data-dt-map-placeholder]');
    if (!frame || !placeholder) return;

    if (readChoice() === 'all') {
      if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
      frame.hidden = false;
      placeholder.hidden = true;
    } else {
      frame.hidden = true;
      frame.removeAttribute('src');
      placeholder.hidden = false;
    }
  }

  function choose(choice) {
    saveChoice(choice);
    updateOptionalMap();
    if (banner) banner.hidden = true;
  }

  function openPreferences() {
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector('[data-dt-cookie-choice="' + (readChoice() || 'necessary') + '"]').focus();
  }

  function init() {
    banner = document.createElement('section');
    banner.className = 'dt-cookie-notice';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Preferencias de cookies');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="dt-cookie-copy">' +
        '<span class="dt-cookie-kicker">Tu privacidad</span>' +
        '<h2>Cookies y almacenamiento</h2>' +
        '<p>Guardamos lo necesario para el carrito y tu sesión. Si aceptás, también cargamos el mapa de Google. Podés cambiar tu elección cuando quieras. <a href="legales.html#cookies">Más información</a></p>' +
      '</div>' +
      '<div class="dt-cookie-actions">' +
        '<button type="button" data-dt-cookie-choice="necessary">Solo necesarias</button>' +
        '<button type="button" class="dt-cookie-accept" data-dt-cookie-choice="all">Aceptar</button>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-dt-cookie-choice]');
      if (button) choose(button.getAttribute('data-dt-cookie-choice'));
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-dt-cookie-settings]')) {
        event.preventDefault();
        openPreferences();
      }
      if (event.target.closest('[data-dt-allow-map]')) choose('all');
    });

    updateOptionalMap();
    if (!readChoice()) banner.hidden = false;
  }

  window.DimensionTresCookiePreferences = { open: openPreferences, getChoice: readChoice };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
