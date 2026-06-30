/**
 * nav.js — Menú drawer mobile | Dimensión Tres
 */

function toggleMenu() {
  var drawer = document.getElementById('mobile-drawer');
  var backdrop = document.getElementById('drawer-backdrop');
  var h1 = document.getElementById('ham-1');
  var h2 = document.getElementById('ham-2');
  var h3 = document.getElementById('ham-3');

  if (!drawer || !backdrop) return;

  var isOpen = drawer.getAttribute('data-open') === 'true';

  if (isOpen) {
    drawer.setAttribute('data-open', 'false');
    drawer.style.transform = 'translateX(-100%)';
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
    if (h1) h1.style.transform = 'none';
    if (h2) h2.style.opacity = '1';
    if (h3) h3.style.transform = 'none';
    document.body.style.overflow = '';
    document.body.classList.remove('dt-mobile-menu-open');
  } else {
    drawer.setAttribute('data-open', 'true');
    drawer.style.transform = 'translateX(0)';
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
    if (h1) h1.style.transform = 'translateY(8px) rotate(45deg)';
    if (h2) h2.style.opacity = '0';
    if (h3) h3.style.transform = 'translateY(-8px) rotate(-45deg)';
    document.body.style.overflow = 'hidden';
    document.body.classList.add('dt-mobile-menu-open');
  }
}

function closeMenu() {
  var drawer = document.getElementById('mobile-drawer');
  var backdrop = document.getElementById('drawer-backdrop');
  var h1 = document.getElementById('ham-1');
  var h2 = document.getElementById('ham-2');
  var h3 = document.getElementById('ham-3');

  if (!drawer || !backdrop) return;

  drawer.setAttribute('data-open', 'false');
  drawer.style.transform = 'translateX(-100%)';
  backdrop.style.opacity = '0';
  backdrop.style.pointerEvents = 'none';
  if (h1) h1.style.transform = 'none';
  if (h2) h2.style.opacity = '1';
  if (h3) h3.style.transform = 'none';
  document.body.style.overflow = '';
  document.body.classList.remove('dt-mobile-menu-open');
}

window.addEventListener('scroll', function() {
  var drawer = document.getElementById('mobile-drawer');
  if (drawer && drawer.getAttribute('data-open') === 'true') {
    closeMenu();
  }
});
