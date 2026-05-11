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
