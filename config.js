// config.js - Configuración centralizada para Dimensión Tres
var CONFIG = {
  // Contacto
  CONTACT_PHONE: "5493534019085",
  STORE_LOCATION: "Villa María, CóC?rdoba, Argentina",

  // Impuestos y moneda
  TAX_RATE: 0.21, // IVA Argentina
  CURRENCY: 'ARS',
  CURRENCY_SYMBOL: '$',

  // Promociones
  PROMO_CODES: {
    'NEXUS10': { discount: 0.10, validUntil: '2026-12-31' },
    'SETUP15': { discount: 0.15, validUntil: '2026-08-31' }
  },

  // UI
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,

  // API (futuro)
  API_BASE_URL: 'http://localhost:3000',

  // Cache publico del catalogo.
  // Antes estaba en 240 minutos y podia mostrar stock viejo demasiado tiempo.
  // Para el local conviene corto: si cambias stock en Access, la web refresca rapido.
  LOW_EGRESS_MODE: true,
  PUBLIC_CATALOG_CACHE_MINUTES: 1,
  PUBLIC_CATALOG_TIMEOUT_MS: 9000,
  MERCADO_LIBRE_AUTO_IMAGE_SEARCH: false,

  // Invid: precios del proveedor en USD -> venta web en ARS.
  // Cambiar INVID_USD_RATE cuando actualicen la cotizaci?n interna.
  INVID_USD_RATE: 1300,
  INVID_MARKUP_RATE: 0.30,
  INVID_MIN_WEB_PRICE: 30000,

  // Supabase local publicado por Cloudflare Tunnel (clave publica para navegador)
  SUPABASE_URL: 'https://api.dimensiontres.com',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ACJWLzQHlZjBrEguHvfOxg_3BJgxAaH',

  // LíL?mites
  MAX_SEARCH_LENGTH: 100,
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,

  // Mensajes
  WHATSAPP_DEFAULT_TEXT: "Hola! Quiero consultar disponibilidad de productos"
};
