/**
 * shared.js — Componentes compartidos | Dimensión Tres
 * Footer unificado + botón "Volver atrás" + Page Transitions
 * Incluir en todas las páginas con: <script src="shared.js"></script>
 */

(function initScrollRestoration() {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  function scrollTopOnPageEntry() {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  window.addEventListener('DOMContentLoaded', scrollTopOnPageEntry);
  window.addEventListener('pageshow', function() {
    setTimeout(scrollTopOnPageEntry, 0);
  });
})();

/* ══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS — Fade entre rutas
   ══════════════════════════════════════════════════════════════ */
(function initPageTransitions() {
  if (window.self !== window.top) return;

  var overlay = null;
  var isTransitioning = false;

  function getOverlay() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dt-page-transition';
      overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:99999',
        'background:#0e0e0e',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 0.35s cubic-bezier(.4,0,.2,1)'
      ].join(';');
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function showOverlay(callback) {
    var o = getOverlay();
    o.style.opacity = '1';
    o.style.pointerEvents = 'auto';
    setTimeout(callback, 350);
  }

  function hideOverlay(callback) {
    var o = getOverlay();
    o.style.opacity = '0';
    o.style.pointerEvents = 'none';
    setTimeout(function() {
      o.style.pointerEvents = 'none';
      if (callback) callback();
    }, 350);
  }

  function shouldIntercept(e) {
    var a = e.target.closest('a');
    if (!a) return false;
    var href = a.href;
    if (!href) return false;
    if (a.target === '_blank') return false;
    if (a.rel === 'noopener' || a.rel === 'noreferrer') return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('wa.me')) return false;
    if (href.startsWith('javascript:')) return false;
    if (a.hash && a.origin === window.location.origin && a.pathname === window.location.pathname) return false;
    var sameOrigin = a.origin === window.location.origin || a.protocol === 'file:';
    return sameOrigin;
  }

  function onLinkClick(e) {
    var a = e.target.closest('a');
    if (!shouldIntercept(e)) return;
    if (isTransitioning) return;
    e.preventDefault();
    isTransitioning = true;
    var target = a.href;
    showOverlay(function() {
      sessionStorage.setItem('dt_transition', 'in');
      window.location.href = target;
    });
  }

  document.addEventListener('click', onLinkClick);

  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      isTransitioning = false;
      hideOverlay(function() { sessionStorage.removeItem('dt_transition'); });
    }
  });

  if (sessionStorage.getItem('dt_transition') === 'in') {
    sessionStorage.removeItem('dt_transition');
    var o = getOverlay();
    o.style.opacity = '1';
    o.style.pointerEvents = 'auto';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        hideOverlay();
      });
    });
  }
})();

/* ─── FOOTER UNIFICADO ───────────────────────────────────────── */
(function injectFooter() {
  var footer = document.querySelector('footer');
  if (!footer) return;

  footer.className = 'w-full border-t border-[#1a1919] bg-[#000000]';
  footer.innerHTML =
    '<div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 px-5 md:px-8 py-12 md:py-14 w-full max-w-[1920px] mx-auto font-headline text-sm uppercase tracking-widest">' +
      '<div class="space-y-5">' +
        '<div class="text-[#00f0ff] font-bold text-xl tracking-tighter italic">DIMENSIÓN TRES</div>' +
        '<p class="text-[#adaaaa] normal-case tracking-normal max-w-xs leading-relaxed font-body">Hardware, gaming y servicio técnico en Villa María.</p>' +
        '<div class="flex gap-4">' +
          '<a class="text-[#adaaaa] hover:text-[#00f0ff] transition-all" href="index.html#contacto" title="Ubicación"><span class="material-symbols-outlined">public</span></a>' +
          '<a class="text-[#adaaaa] hover:text-[#00f0ff] transition-all" href="https://wa.me/5493535000000?text=Hola!%20Quiero%20hacer%20una%20consulta" target="_blank" rel="noopener" title="WhatsApp"><span class="material-symbols-outlined">forum</span></a>' +
          '<a class="text-[#adaaaa] hover:text-[#00f0ff] transition-all" href="mailto:contacto@dimensiontres.com" title="Email"><span class="material-symbols-outlined">mail</span></a>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<h4 class="text-white font-bold mb-5">Marcas</h4>' +
        '<div class="flex flex-col gap-3">' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="catalogo.html">Sony</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="catalogo.html">Redragon</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="catalogo.html">Razer</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="catalogo.html">Intel</a>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<h4 class="text-white font-bold mb-5">Navegación</h4>' +
        '<div class="flex flex-col gap-3">' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="index.html">Inicio</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="catalogo.html">Catálogo</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="cuenta.html">Mi Cuenta</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="index.html#servicios">Soporte Técnico</a>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<h4 class="text-white font-bold mb-5">Contacto</h4>' +
        '<div class="flex flex-col gap-3">' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2" href="https://wa.me/5493535000000?text=Hola!%20Quiero%20hacer%20una%20consulta" target="_blank" rel="noopener"><span class="material-symbols-outlined text-[18px]">chat</span> WhatsApp</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2" href="mailto:contacto@dimensiontres.com"><span class="material-symbols-outlined text-[18px]">mail</span> Email</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-2" href="index.html#contacto"><span class="material-symbols-outlined text-[18px]">location_on</span> Villa María</a>' +
        '</div>' +
        '<div class="flex flex-col gap-3 mt-6">' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="index.html#servicios">Garantía</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="cuenta.html">Privacidad</a>' +
          '<a class="text-[#adaaaa] hover:text-white hover:translate-x-1 transition-all inline-block" href="cuenta.html">Términos</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="px-5 md:px-8 py-5 border-t border-[#1a1919] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-[#484847] font-headline">' +
      '<p>© 2026 DIMENSIÓN TRES. HARDWARE, GAMING Y SERVICIO TÉCNICO.</p>' +
      '<div class="flex gap-8">' +
        '<a class="hover:text-white transition-colors" href="cuenta.html">PRIVACIDAD</a>' +
        '<a class="hover:text-white transition-colors" href="index.html#servicios">SOPORTE</a>' +
      '</div>' +
    '</div>';
})();

(function injectFloatingWhatsApp() {
  if (document.querySelector('.dt-whatsapp-float')) return;

  function buildLink() {
    var phone = (window.CONFIG && window.CONFIG.CONTACT_PHONE) || '5493535000000';
    var text = 'Hola! Quiero hacer una consulta en Dimension Tres';
    var link = document.createElement('a');
    link.className = 'dt-whatsapp-float';
    link.href = 'https://wa.me/' + encodeURIComponent(phone) + '?text=' + encodeURIComponent(text);
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'Consultar por WhatsApp');
    link.title = 'WhatsApp';
    link.innerHTML =
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
        '<path d="M16.03 3C8.86 3 3.04 8.77 3.04 15.86c0 2.27.6 4.49 1.75 6.44L3 29l6.89-1.78a13.08 13.08 0 0 0 6.14 1.53C23.19 28.75 29 22.98 29 15.89S23.19 3 16.03 3Zm0 23.57c-1.95 0-3.86-.52-5.52-1.51l-.4-.24-4.08 1.05 1.09-3.94-.26-.41a10.6 10.6 0 0 1-1.62-5.66c0-5.89 4.84-10.69 10.79-10.69 5.94 0 10.77 4.8 10.77 10.72 0 5.9-4.83 10.68-10.77 10.68Zm5.91-8.01c-.32-.16-1.9-.93-2.2-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1.01 1.24-.18.21-.37.24-.69.08-.32-.16-1.35-.49-2.57-1.57-.95-.84-1.59-1.88-1.78-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.7-.98-2.33-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.14 3.05 1.3 3.26.16.21 2.24 3.39 5.43 4.76.76.33 1.35.52 1.81.67.76.24 1.46.21 2.01.13.61-.09 1.9-.77 2.17-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z"/>' +
      '</svg>';
    document.body.appendChild(link);
  }

  if (document.body) {
    buildLink();
  } else {
    document.addEventListener('DOMContentLoaded', buildLink);
  }
})();
