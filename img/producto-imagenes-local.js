// producto-imagenes-local.js - overrides manuales desde img/productos.
(function() {
  var existing = window.DT_PRODUCT_IMAGE_MAP || {};

  function normalizeCode(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');
  }

  function localImage(fileName) {
    return 'img/productos/' + encodeURIComponent(fileName).replace(/%2F/g, '/');
  }

  var items = [
    { id: '690', code: '6984521291670', file: '[6984521291670] Auricular Intra Manos Libres Samsung AKG S21 Ultra.png' },
    { id: '936', code: '6957939002176', file: 'Adaptador Bluetooth 5.4 nano usb mercury MA530.webp' },
    { id: '863', code: '727373082340', file: 'Adaptador Joystick Ps4 TCON.webp' },
    { id: '916', code: 'gamestick', file: 'All gamestick x2 consola retro.webp' },
    { id: '776', code: 'ardmu', file: 'Arcade Doble Multiconsola.webp' },
    { id: '97', code: '8809055013506', file: 'Auricular JBL (Replica).webp' },
    { id: '897', code: '6984521291687', file: 'Auricular Samsung Replica Galaxy S10+ Caja Chica.png' },
    { id: '377', code: '6290132559574', file: 'Auricular Sport SF-A41 HI-FI.webp' },
    { id: '841', code: '723540566101', file: 'Auricular Tame AU-1236.webp' },
    { id: '930', code: '7799145022451', file: 'auriculares inalambricos inpods 12 I12.webp' },
    { id: '931', code: '7798137707109', file: 'Auriculares Noga Voice NGV-400.webp' },
    { id: '846', code: '7892020463117', file: 'Base cargadora joystick ps5.webp' },
    { id: '919', code: '7892020468129', file: 'Base de carga joystick ps5.png' },
    { id: '914', code: '7892024072360', file: 'Base joystick ps4 Luz led.jpg' },
    { id: '73', code: '7892025180514', file: 'bateria joystick Xbox one.webp' },
    { id: '63', code: '7955165120021', file: 'Cable Audio Video ps2 AV.webp' },
    { id: '409', code: '6290132557891', file: 'Cable usb Cargador Joystick PS4.webp' },
    { id: '406', code: '6290132558140', file: 'Cable USB Ps3 1.5M Data Cable.webp' },
    { id: '407', code: '6290132557983', file: 'Cable VGA 1.5M.jpg' },
    { id: '237', code: '6939025361267, 6923381599519', file: 'Cable video compuesto Ps2 Ps3.webp' },
    { id: '598', code: 'cajaxbox', file: 'Caja pilas joystick Xbox 360.webp' },
    { id: '828', code: 'gtvs', file: 'Consola Game TV Stick Your Name Gamer.avif' },
    { id: '852', code: 'popiel', file: 'Consola portatil Pop It electronico.webp' },
    { id: '915', code: '699252589106', file: 'Consola portatil X6.webp' },
    { id: '58', code: '7851766310871', file: 'Cubre grip x4.webp' },
    { id: '302', code: '4567833560065', file: 'D_Q_NP_831147-MLA79987574616_102024-F.webp' },
    { id: '217', code: '814290013868', file: 'Dead Alliance Day One Edition Ps4.webp' },
    { id: '441', code: 'fsil3', file: 'Funda Silicola Ps3.webp' },
    { id: '126', code: 'Fundas de silicona', file: 'Funda silicona PS4.webp' },
    { id: '920', code: 'gastickall', file: 'gamestick AllGames (ps5).webp' },
    { id: '962', code: '7793367191179', file: 'Inova Cable de Datos.webp' },
    { id: '837', code: '7798137713810', file: 'Micr\u00f3fono Noga Vintage MIC-2030 PC Cardioide color plateado.webp' },
    { id: '937', code: '0742832292160', file: 'MOUSE GAMER RAPTOR STORM GRIP 4 BOTONES 3600DPI 7 COLORES.webp' },
    { id: '925', code: '6971252211107', file: 'Mouse Gamer Retroiluminado T-Wolf v1 Optico 1200Dpi USB RGB.webp' },
    { id: '861', code: '6971252210575', file: 'Mouse Gamer T-Wolf V15 Celeste Retroiluminado 1600 Dpi USB.webp' },
    { id: '968', code: '7798137705020', file: 'Noga Stormer NG-8620.webp' },
    { id: '939', code: '0742832295482', file: 'Pad Mouse Raptor Ultra Glide Antideslizante Impermeable Xl Color Negro.webp' },
    { id: '48', code: '7798137380654', file: 'Parlantes 2.1 Noga.jpg' },
    { id: '961', code: '740617309829', file: 'Pendrive Kingston 64 GB.webp' },
    { id: '379', code: '6290132559239', file: 'receptor de musica inalambrico BT-163.webp' },
    { id: '963', code: '6970791124848', file: 'Seisa Fast 2USB Charge Kit.jpg' },
    { id: '967', code: '658921887714', file: 'Sentech ST-HS450.webp' },
    { id: '918', code: '723540563964', file: 'Sup + joystick gme-61020.jpg' },
    { id: '969', code: '6780201379627', file: 'Sy830mv.webp' },
    { id: '865', code: '097855088741', file: 'Teclado Logitech K120 QWERTY espa\u00f1ol color negro.webp' },
    { id: '599', code: '6973410620158', file: 'Teclado Para Una Mano Shipido.webp' },
    { id: '794', code: 'EWGY58864', file: 'Cable Mallado 2 Hembra Auricularesmicrofono A Plug 3.5mm Macho.webp' }
  ];

  var localById = {};
  var localByCode = {};
  items.forEach(function(item) {
    var image = localImage(item.file);
    localById[item.id] = image;
    String(item.code || '').split(/[,;|\n\r]+/).forEach(function(code) {
      code = normalizeCode(code);
      if (code) localByCode[code] = image;
    });
  });

  window.DT_PRODUCT_IMAGE_MAP = Object.assign({}, existing, {
    meta: Object.assign({}, existing.meta || {}, {
      localOverrides: {
        generatedAt: '2026-06-08T00:00:00.000Z',
        source: 'img/productos',
        totalItems: items.length
      }
    }),
    byId: Object.assign({}, existing.byId || {}, localById),
    byCode: Object.assign({}, existing.byCode || {}, localByCode),
    ids: Object.assign({}, existing.ids || {}, localById),
    codes: Object.assign({}, existing.codes || {}, localByCode)
  });
}());
