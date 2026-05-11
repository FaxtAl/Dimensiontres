/* ─────────────────────────────────────────────────────────
   tailwind.config.js — Configuración de Tailwind | Dimensión Tres
   Incluir DESPUÉS del CDN de Tailwind:
     <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
     <script src="tailwind.config.js"></script>
   ───────────────────────────────────────────────────────── */

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-surface": "#ffffff",
        "inverse-surface": "#fcf9f8",
        "primary-fixed-dim": "#00deec",
        "surface-bright": "#2c2c2c",
        "secondary": "#d575ff",
        "on-tertiary-fixed-variant": "#a0764d",
        "on-error": "#490006",
        "secondary-fixed-dim": "#eaaeff",
        "surface-container-highest": "#262626",
        "on-error-container": "#ffa8a3",
        "on-tertiary": "#605f5e",
        "on-secondary-fixed": "#58007a",
        "surface-variant": "#262626",
        "on-primary-fixed": "#003f43",
        "on-surface-variant": "#adaaaa",
        "inverse-primary": "#006a71",
        "on-secondary-container": "#fff5fc",
        "secondary-dim": "#b90afc",
        "outline-variant": "#484847",
        "inverse-on-surface": "#565555",
        "surface-container": "#1a1919",
        "surface-tint": "#8ff5ff",
        "outline": "#767575",
        "surface": "#0e0e0e",
        "primary-dim": "#00deec",
        "surface-container-low": "#131313",
        "primary-fixed": "#00eefc",
        "surface-container-lowest": "#000000",
        "error": "#ff716c",
        "on-background": "#ffffff",
        "secondary-container": "#9800d0",
        "primary": "#8ff5ff",
        "surface-container-high": "#201f1f",
        "on-secondary": "#390050",
        "background": "#0e0e0e",
        "primary-container": "#00eefc",
        "on-primary": "#005d63",
        "on-primary-fixed-variant": "#005e64",
      },
      fontFamily: {
        "headline": ["Space Grotesk"],
        "body": ["Manrope"],
        "label": ["Manrope"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
    },
  },
};
