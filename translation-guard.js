/**
 * Evita que los traductores automaticos alteren los nombres de los iconos
 * tipograficos de Material Symbols o la marca DimensionTres.
 */
(function initTranslationGuard() {
  var CANDIDATE_SELECTOR = '.material-symbols-outlined, [data-dt-notranslate], title, a, h1, h2, h3, p, span, div, strong';
  var BRAND_TEXT = 'dimensiontres';

  function markAsNotTranslatable(element) {
    if (!element || element.nodeType !== 1) return;
    element.setAttribute('translate', 'no');
    element.classList.add('notranslate');
  }

  function normalizedText(element) {
    return String(element.textContent || '').replace(/\s+/g, '').toLowerCase();
  }

  function protectElement(element) {
    if (!element || element.nodeType !== 1) return;

    if (element.matches('.material-symbols-outlined, [data-dt-notranslate]')) {
      markAsNotTranslatable(element);
      return;
    }

    var text = normalizedText(element);
    if (text === BRAND_TEXT || (element.tagName === 'TITLE' && text.indexOf(BRAND_TEXT) !== -1)) {
      markAsNotTranslatable(element);
    }
  }

  function protectTree(root) {
    if (!root) return;

    if (root.nodeType === 1) protectElement(root);

    if (root.querySelectorAll) {
      root.querySelectorAll(CANDIDATE_SELECTOR).forEach(protectElement);
    }
  }

  protectTree(document);

  if (!window.MutationObserver || !document.documentElement) return;

  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          protectTree(node);
          return;
        }

        if (node.nodeType === 3) {
          var current = node.parentElement;
          for (var level = 0; current && level < 4; level += 1) {
            protectElement(current);
            current = current.parentElement;
          }
        }
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
