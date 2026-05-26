// config.js - Configuración centralizada para Dimensión Tres
var CONFIG = {
  // Contacto
  CONTACT_PHONE: "5493534019085",
  STORE_LOCATION: "Villa María, Córdoba, Argentina",

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

  // Supabase (clave publica para navegador)
  SUPABASE_URL: 'https://gzqepncnbwbbocvbetdw.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_AR03x41l3cgySLgShkWEuA_rsHKgIXV',

  // Límites
  MAX_SEARCH_LENGTH: 100,
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,

  // Mensajes
  WHATSAPP_DEFAULT_TEXT: "Hola! Quiero consultar disponibilidad de productos"
};
