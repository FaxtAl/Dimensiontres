/**
 * menu-categorias.js - Menu de categorias del drawer | DimensionTres
 *
 * El arbol es una foto del catalogo real. No se pide a Supabase en cada
 * pagina a proposito: el menu tiene que aparecer al instante y sin gastar
 * egress. Las categorias casi no cambian; los productos si, pero esos no
 * viven aca.
 *
 * PARA REGENERARLO cuando agregues o saques una categoria: abri
 * catalogo.html, espera a que cargue y corre en la consola:
 *
 *   copy(JSON.stringify((window.CATALOG||[]).map(c => ({
 *     id: c.id, name: c.name,
 *     children: (c.children||[]).map(h => ({ id: h.id, name: h.name }))
 *   })), null, 2))
 *
 * y pega el resultado en DT_CATEGORIAS.
 *
 * Los ids mezclan dos origenes a proposito: "subcat-NN" viene de Access y
 * los slugs tipo "placas-de-video" salen del arbol de Invid. Los dos
 * funcionan igual en catalogo.html?sub=...
 *
 * Capturado el 2026-08-26: 13 categorias, 52 subcategorias.
 */

var DT_CATEGORIAS = [
  { id: "cat-consolas-de-juegos", name: "Consolas de juegos", children: [
    { id: "subcat-72", name: "Consolas Retro" },
    { id: "subcat-3", name: "Consola PS4" },
    { id: "subcat-4", name: "Consola Ps5" },
    { id: "subcat-2", name: "Consola PS3" }
  ] },
  { id: "cat-juegos-fisicos", name: "Juegos Fisicos", children: [
    { id: "subcat-69", name: "Juegos Ps5" },
    { id: "subcat-10", name: "Juegos Ps4" }
  ] },
  { id: "cat-accesorios-consolas", name: "Accesorios Consolas", children: [
    { id: "subcat-12", name: "Accessorios Ps4" },
    { id: "subcat-70", name: "Accessorios Ps5" },
    { id: "subcat-14", name: "Accessorios Ps2" },
    { id: "subcat-13", name: "Accessorios Xbox 360" },
    { id: "subcat-38", name: "Accessorios Ps3" },
    { id: "subcat-15", name: "Accessorios Xbox One" }
  ] },
  { id: "cat-pc-y-componentes", name: "PC y Componentes", children: [
    { id: "subcat-59", name: "Procesadores" },
    { id: "subcat-63", name: "Placas Madre" },
    { id: "memorias-ram", name: "Memorias RAM" },
    { id: "placas-de-video", name: "Placas de Video" },
    { id: "subcat-46", name: "SSD / M.2" },
    { id: "subcat-45", name: "Discos HDD" },
    { id: "subcat-65", name: "Fuentes" },
    { id: "subcat-56", name: "Gabinetes" },
    { id: "refrigeracion-coolers", name: "Refrigeracion / Coolers" },
    { id: "pcs-armadas-mini-pc", name: "PCs Armadas / Mini PC" },
    { id: "subcat-60", name: "Red" },
    { id: "ups-energia", name: "UPS / Energia" },
    { id: "subcat-64", name: "Otros" }
  ] },
  { id: "cat-perifericos-pc", name: "Periféricos PC", children: [
    { id: "subcat-57", name: "Monitores" },
    { id: "subcat-24", name: "Mouse" },
    { id: "subcat-23", name: "Teclados" },
    { id: "subcat-25", name: "Mouse Pads" },
    { id: "subcat-26", name: "Microfonos" },
    { id: "subcat-47", name: "Combos Periféricos" },
    { id: "subcat-61", name: "Joystick PC" }
  ] },
  { id: "cat-almacenamiento", name: "Almacenamiento", children: [
    { id: "subcat-21", name: "Memoria Flash" },
    { id: "subcat-22", name: "Pendrive" },
    { id: "subcat-37", name: "Carry Disco 2.55" },
    { id: "lectores-cases", name: "Lectores y Cases" }
  ] },
  { id: "cat-cables", name: "Cables", children: [
    { id: "subcat-41", name: "Cable de Red" },
    { id: "subcat-39", name: "Cable HDMI" },
    { id: "subcat-43", name: "Cable Vga" },
    { id: "subcat-42", name: "Cable Plug 3.5" },
    { id: "subcat-44", name: "Cable USB" },
    { id: "subcat-40", name: "Cable Corriente" }
  ] },
  { id: "cat-adaptadores", name: "Adaptadores", children: [
    { id: "subcat-50", name: "Convertidor" }
  ] },
  { id: "cat-accesorio-celular", name: "Accesorio Celular", children: [
    { id: "subcat-53", name: "Cables Celular" },
    { id: "subcat-68", name: "Joystick Celular" },
    { id: "subcat-54", name: "PowerBank" }
  ] },
  { id: "cat-auriculares", name: "Auriculares", children: [
    { id: "subcat-34", name: "Auricular Gamer" },
    { id: "subcat-31", name: "Auricular in ear" },
    { id: "subcat-32", name: "Auricular tipo vincha" }
  ] },
  { id: "cat-parlantes", name: "Parlantes", children: [
    { id: "subcat-28", name: "Parlantes 2.1" }
  ] },
  { id: "cat-silla-gamer", name: "Silla Gamer", children: [
    { id: "subcat-16", name: "Silla Gamer" }
  ] },
  { id: "cat-otros", name: "Otros", children: [
    { id: "subcat-67", name: "Otros" }
  ] }
];

// Una categoria con una sola subcategoria no la muestra: la categoria ya
// trae todos sus productos y la subcategoria repetia lo mismo.
function dtSubcategoriasVisibles(cat) {
  var hijos = (cat && cat.children) || [];
  return hijos.length > 1 ? hijos : [];
}

// Devuelve el id de categoria o subcategoria abierto ahora, para marcarlo.
function dtCategoriaActiva() {
  var p = new URLSearchParams(window.location.search);
  return { cat: p.get('catid') || '', sub: p.get('sub') || '' };
}

function dtRenderMenuCategorias() {
  var host = document.getElementById('dt-menu-categorias');
  if (!host || host.dataset.listo === '1') return;

  var activo = dtCategoriaActiva();
  var frag = document.createDocumentFragment();

  DT_CATEGORIAS.forEach(function(cat) {
    var abierta = activo.cat === cat.id ||
      (cat.children || []).some(function(h) { return h.id === activo.sub; });

    var bloque = document.createElement('div');
    bloque.className = 'dt-cat';

    var head = document.createElement('button');
    head.type = 'button';
    head.className = 'dt-cat-head';
    head.setAttribute('aria-expanded', abierta ? 'true' : 'false');
    head.innerHTML = '<span>' + cat.name + '</span>' +
      '<span class="material-symbols-outlined dt-cat-chevron">expand_more</span>';

    var body = document.createElement('div');
    body.className = 'dt-cat-body' + (abierta ? ' is-open' : '');

    // "Ver todo" primero, como en la referencia: entrar a la categoria
    // completa tiene que ser un toque, no obligar a elegir subcategoria.
    var todo = document.createElement('a');
    todo.href = 'catalogo.html?catid=' + encodeURIComponent(cat.id);
    todo.className = 'dt-cat-link dt-cat-link-todo' + (activo.cat === cat.id ? ' is-active' : '');
    todo.textContent = 'Ver todo en ' + cat.name;
    body.appendChild(todo);

    // Con una sola subcategoria no se muestra: "Ver todo" ya lista lo mismo
    // (Parlantes -> Parlantes 2.1, Silla Gamer -> Silla Gamer, etc.).
    dtSubcategoriasVisibles(cat).forEach(function(hijo) {
      var a = document.createElement('a');
      a.href = 'catalogo.html?sub=' + encodeURIComponent(hijo.id);
      a.className = 'dt-cat-link' + (activo.sub === hijo.id ? ' is-active' : '');
      a.textContent = hijo.name;
      body.appendChild(a);
    });

    head.addEventListener('click', function() {
      var ahoraAbierta = body.classList.toggle('is-open');
      head.setAttribute('aria-expanded', ahoraAbierta ? 'true' : 'false');
    });

    bloque.appendChild(head);
    bloque.appendChild(body);
    frag.appendChild(bloque);
  });

  host.appendChild(frag);
  host.dataset.listo = '1';
}

document.addEventListener('DOMContentLoaded', dtRenderMenuCategorias);

/* ============================================================
   Desplegable "Productos" del nav de escritorio.
   Dos columnas: categorias a la izquierda, subcategorias de la
   que estas señalando a la derecha. Se eligio esto en vez de
   submenus anidados porque con 13 categorias los anidados
   obligan a pasar el mouse por un pasillo muy fino.
   Usa el mismo DT_CATEGORIAS que el drawer de celular.
   ============================================================ */

function dtRenderMegaMenu() {
  var panel = document.getElementById('dt-mega-menu');
  if (!panel || panel.dataset.listo === '1') return;

  var activo = dtCategoriaActiva();
  var cols = document.createElement('div');
  cols.className = 'dt-mega-cols';

  var listaCats = document.createElement('div');
  listaCats.className = 'dt-mega-cats';

  var listaSubs = document.createElement('div');
  listaSubs.className = 'dt-mega-subs';

  function pintarSubs(cat) {
    listaSubs.innerHTML = '';

    var todo = document.createElement('a');
    todo.href = 'catalogo.html?catid=' + encodeURIComponent(cat.id);
    todo.className = 'dt-mega-sub dt-mega-sub-todo';
    todo.textContent = 'Ver todo en ' + cat.name;
    listaSubs.appendChild(todo);

    dtSubcategoriasVisibles(cat).forEach(function(hijo) {
      var a = document.createElement('a');
      a.href = 'catalogo.html?sub=' + encodeURIComponent(hijo.id);
      a.className = 'dt-mega-sub' + (activo.sub === hijo.id ? ' is-active' : '');
      a.textContent = hijo.name;
      listaSubs.appendChild(a);
    });
  }

  var seleccionada = null;

  DT_CATEGORIAS.forEach(function(cat, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dt-mega-cat';
    b.innerHTML = '<span>' + cat.name + '</span>' +
      '<span class="material-symbols-outlined dt-mega-arrow">chevron_right</span>';

    function elegir() {
      if (seleccionada === b) return;
      if (seleccionada) seleccionada.classList.remove('is-active');
      b.classList.add('is-active');
      seleccionada = b;
      pintarSubs(cat);
    }

    b.addEventListener('mouseenter', elegir);
    b.addEventListener('focus', elegir);
    // En pantallas tactiles con teclado/mouse el hover no siempre llega.
    b.addEventListener('click', function() {
      elegir();
      window.location.href = 'catalogo.html?catid=' + encodeURIComponent(cat.id);
    });

    listaCats.appendChild(b);

    var esLaDelUrl = activo.cat === cat.id ||
      (cat.children || []).some(function(h) { return h.id === activo.sub; });
    if (esLaDelUrl || (!seleccionada && i === 0)) elegir();
  });

  cols.appendChild(listaCats);
  cols.appendChild(listaSubs);
  panel.appendChild(cols);
  panel.dataset.listo = '1';
}

function dtToggleMegaMenu(forzarCerrado) {
  var panel = document.getElementById('dt-mega-menu');
  var boton = document.getElementById('dt-mega-toggle');
  if (!panel) return;

  var abrir = forzarCerrado === true ? false : !panel.classList.contains('is-open');
  panel.classList.toggle('is-open', abrir);
  if (boton) boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
}

document.addEventListener('DOMContentLoaded', function() {
  dtRenderMegaMenu();

  // Cerrar al hacer clic afuera o con Escape.
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#dt-mega-menu') && !e.target.closest('#dt-mega-toggle')) {
      dtToggleMegaMenu(true);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') dtToggleMegaMenu(true);
  });
});
