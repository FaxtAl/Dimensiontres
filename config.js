// config.js - Configuración general del sitio
var CONFIG = {
  // Contacto
  CONTACT_PHONE: "5493534019085",
  STORE_LOCATION: "Villa María, Córdoba, Argentina",

  // Impuestos y moneda
  TAX_RATE: 0.21, // IVA Argentina
  CURRENCY: 'ARS',
  CURRENCY_SYMBOL: '$',

  // UI
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,

  // API (futuro)
  API_BASE_URL: 'http://localhost:3000',

  // Caché público del catálogo (minutos). Corto para que los cambios de stock se vean rápido.
  LOW_EGRESS_MODE: true,
  PUBLIC_CATALOG_CACHE_MINUTES: 1,
  PUBLIC_CATALOG_TIMEOUT_MS: 9000,
  MERCADO_LIBRE_AUTO_IMAGE_SEARCH: false,

  // Invid: precios del proveedor en USD convertidos a ARS para la venta web.
  // Cotización de respaldo; la web usa el dólar cargado en Access.
  INVID_USD_RATE: 1515,
  INVID_MARKUP_RATE: 0.30,
  INVID_MIN_WEB_PRICE: 30000,

  // Supabase publicado por Cloudflare Tunnel (clave pública para el navegador)
  SUPABASE_URL: 'https://api.dimensiontres.com',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ACJWLzQHlZjBrEguHvfOxg_3BJgxAaH',

  // Límites
  MAX_SEARCH_LENGTH: 100,
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,

  // Mensajes
  WHATSAPP_DEFAULT_TEXT: "Hola! Quiero consultar disponibilidad de productos"
};
