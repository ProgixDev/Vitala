/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        background: c('--background'),
        surface: c('--surface'),
        'surface-alt': c('--surface-alt'),
        foreground: c('--foreground'),
        'muted-foreground': c('--muted-foreground'),
        border: c('--border'),
        primary: {
          DEFAULT: c('--primary'),
          deep: c('--primary-deep'),
          soft: c('--primary-soft'),
        },
        'on-primary': c('--on-primary'),
        accent: c('--accent'),
        success: c('--success'),
        warning: c('--warning'),
        emergency: {
          DEFAULT: c('--emergency'),
        },
        'on-emergency': c('--on-emergency'),
      },
      fontFamily: {
        // Body/UI (Hanken Grotesk) + Display (Fraunces, soft editorial serif).
        // Applied via the Text primitive. Fraunces is used with restraint —
        // headlines and section titles only.
        sans: ['HankenGrotesk_400Regular'],
        medium: ['HankenGrotesk_500Medium'],
        semibold: ['HankenGrotesk_600SemiBold'],
        bold: ['HankenGrotesk_700Bold'],
        display: ['Fraunces_600SemiBold'],
        'display-bold': ['Fraunces_700Bold'],
      },
      borderRadius: {
        card: '28px',
        xl2: '20px',
      },
    },
  },
  plugins: [],
};
