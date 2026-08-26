// producto-imagenes-juegos-extra.js - portadas extra para juegos fisicos sin match en DixGamer.
// Las URLs externas se descargan como archivos locales para que el catalogo no dependa de servidores externos.
(function() {
  var existing = window.DT_PRODUCT_IMAGE_MAP || {};
  var extraById =   {
      "157": "img/juegos-dixgamer/ps4-157-juegos-digitales-ps3-ps4-ps5.jpg",
      "179": "img/juegos-dixgamer/ps4-179-evolve-ultimate-edition-ps4.jpg",
      "187": "img/juegos-dixgamer/ps4-187-battleborn-ps4-juego-fisico.jpg",
      "207": "img/juegos-dixgamer/ps4-207-starblood-arena-ps4.webp",
      "209": "img/juegos-dixgamer/ps4-209-ratchet-and-clank-playstation-hit-ps4.webp",
      "217": "img/juegos-dixgamer/ps4-217-dead-alliance-day-one-edition-ps4.jpg",
      "225": "img/juegos-dixgamer/ps4-225-tom-clancy-rainbow-six-siege-ps4.webp",
      "233": "img/juegos-dixgamer/ps4-233-metal-gear-survive-ps4.jpg",
      "677": "img/juegos-dixgamer/ps4-677-nba-2k16-ps4-orignal.jpg",
      "723": "img/juegos-dixgamer/ps4-723-sniper-ghost-warrior-3-ps4-fisico.jpg",
      "742": "img/juegos-dixgamer/ps4-742-ratchet-and-clank-playstation-4-fisico.webp",
      "763": "img/juegos-dixgamer/ps4-763-assassins-creed-chronicles-ps4-original.jpg",
      "786": "img/juegos-dixgamer/ps4-786-ni-no-kuni-ii-revenant-kingdom-ps4.webp",
      "787": "img/juegos-dixgamer/ps4-787-tales-of-berseria-ps4-fisico.jpg",
      "891": "img/juegos-dixgamer/ps4-891-producto-891.webp",
      "970": "img/juegos-dixgamer/ps4-970-whatch-dogs-legion-ps4-original.webp",
      "971": "img/juegos-dixgamer/ps4-971-red-dead-redemption-2-ps4-original.jpg",
      "972": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "973": "img/juegos-dixgamer/ps4-973-producto-973.jpg",
      "975": "img/juegos-dixgamer/ps4-975-producto-975.webp",
      "976": "img/juegos-dixgamer/ps4-976-producto-976.webp",
      "977": "img/juegos-dixgamer/ps4-977-producto-977.webp",
      "1010": "img/juegos-dixgamer/ps4-1010-the-old-blood.jpg",
      "1013": "img/juegos-dixgamer/ps4-1013-fifa-2016.jpg",
      "1038": "img/juegos-dixgamer/ps4-1038-resident-evil-5.jpg",
      "1039": "img/juegos-dixgamer/ps4-1039-minecraft.jpg",
      "1040": "img/juegos-dixgamer/ps4-1040-need-for-speed-payback.jpg",
      "1041": "img/juegos-dixgamer/ps4-1041-valentino-rossi.jpg",
      "1042": "img/juegos-dixgamer/ps4-1042-dragon-ball-xenoverse-2.jpg",
      "1043": "img/juegos-dixgamer/ps4-1043-hitman-2.jpg"
  };
  var extraByCode =   {
      "4902370552171": "img/juegos-dixgamer/ps4-891-producto-891.webp",
      "887256019525": "img/juegos-dixgamer/ps4-763-assassins-creed-chronicles-ps4-original.jpg",
      "710425474798": "img/juegos-dixgamer/ps4-187-battleborn-ps4-juego-fisico.jpg",
      "814290013868": "img/juegos-dixgamer/ps4-217-dead-alliance-day-one-edition-ps4.jpg",
      "710425476983": "img/juegos-dixgamer/ps4-179-evolve-ultimate-edition-ps4.jpg",
      "083717203292": "img/juegos-dixgamer/ps4-233-metal-gear-survive-ps4.jpg",
      "5026555421232": "img/juegos-dixgamer/ps4-677-nba-2k16-ps4-orignal.jpg",
      "722674122139": "img/juegos-dixgamer/ps4-786-ni-no-kuni-ii-revenant-kingdom-ps4.webp",
      "711719512455": "img/juegos-dixgamer/ps4-742-ratchet-and-clank-playstation-4-fisico.webp",
      "711719526346": "img/juegos-dixgamer/ps4-209-ratchet-and-clank-playstation-hit-ps4.webp",
      "816293016143": "img/juegos-dixgamer/ps4-723-sniper-ghost-warrior-3-ps4-fisico.jpg",
      "711719509172": "img/juegos-dixgamer/ps4-207-starblood-arena-ps4.webp",
      "722674120906": "img/juegos-dixgamer/ps4-787-tales-of-berseria-ps4-fisico.jpg",
      "3004374AC": "img/juegos-dixgamer/ps4-225-tom-clancy-rainbow-six-siege-ps4.webp",
      "711719548034": "img/juegos-dixgamer/ps4-975-producto-975.webp",
      "884095202125": "img/juegos-dixgamer/ps4-976-producto-976.webp",
      "711719542292": "img/juegos-dixgamer/ps4-977-producto-977.webp",
      "711719547006": "img/juegos-dixgamer/ps4-973-producto-973.jpg",
      "887256090708": "img/juegos-dixgamer/ps4-970-whatch-dogs-legion-ps4-original.webp",
      "710425478901": "img/juegos-dixgamer/ps4-971-red-dead-redemption-2-ps4-original.jpg",
      "710425570360": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "JD34": "img/juegos-dixgamer/ps4-157-juegos-digitales-ps3-ps4-ps5.jpg",
      "3004374-AC": "img/juegos-dixgamer/ps4-225-tom-clancy-rainbow-six-siege-ps4.webp",
      "093155170889": "img/juegos-dixgamer/ps4-1010-the-old-blood.jpg",
      "014633734546": "img/juegos-dixgamer/ps4-1013-fifa-2016.jpg",
      "013388560301": "img/juegos-dixgamer/ps4-1038-resident-evil-5.jpg",
      "711719549246": "img/juegos-dixgamer/ps4-1039-minecraft.jpg",
      "014633735222": "img/juegos-dixgamer/ps4-1040-need-for-speed-payback.jpg",
      "662248918655": "img/juegos-dixgamer/ps4-1041-valentino-rossi.jpg",
      "722674120425": "img/juegos-dixgamer/ps4-1042-dragon-ball-xenoverse-2.jpg",
      "883929639571": "img/juegos-dixgamer/ps4-1043-hitman-2.jpg"
  };
  var extraByName = {
      "grand theft auto 5 ps4 original": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "grand theft auto v ps4 original": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "gta 5 ps4 original": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "gta v ps4 original": "img/juegos-dixgamer/ps4-972-grand-theft-auto-5-ps4-original.jpg",
      "resident evil 5": "img/juegos-dixgamer/ps4-1038-resident-evil-5.jpg",
      "minecraft": "img/juegos-dixgamer/ps4-1039-minecraft.jpg",
      "need for speed payback": "img/juegos-dixgamer/ps4-1040-need-for-speed-payback.jpg",
      "need fpr speed payback": "img/juegos-dixgamer/ps4-1040-need-for-speed-payback.jpg",
      "valentino rossi": "img/juegos-dixgamer/ps4-1041-valentino-rossi.jpg",
      "dragon ball xenoverse 2": "img/juegos-dixgamer/ps4-1042-dragon-ball-xenoverse-2.jpg",
      "hitman 2": "img/juegos-dixgamer/ps4-1043-hitman-2.jpg"
  };

  window.DT_PRODUCT_IMAGE_MAP = Object.assign({}, existing, {
    meta: Object.assign({}, existing.meta || {}, {
      juegosExtra: {
        generatedAt: "2026-08-12T16:00:00.000Z",
        source: "dixgamer-local-plus-official-fallbacks",
        totalItems: Object.keys(extraById).length
      }
    }),
    byId: Object.assign({}, existing.byId || {}, extraById),
    byCode: Object.assign({}, existing.byCode || {}, extraByCode),
    byName: Object.assign({}, existing.byName || {}, extraByName)
  });
}());
