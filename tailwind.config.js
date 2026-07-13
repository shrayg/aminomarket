/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f7f6fb',
          100: '#eeecf6',
          200: '#ddd8eb',
          300: '#bbb3d0',
          400: '#8f87ab',
          500: '#6d658a',
          600: '#544e6d',
          700: '#413c56',
          800: '#2c283b',
          900: '#1a1726',
          950: '#0f0d16',
        },
        brand: {
          lavender: '#c4b5fd',
          purple: '#a78bfa',
          violet: '#8b5cf6',
          sky: '#7dd3fc',
          mist: '#e0f2fe',
        },
        accent: {
          DEFAULT: '#a78bfa',
          light: '#ddd6fe',
          dark: '#7c3aed',
        },
      },
      fontSize: {
        display: ['clamp(2.5rem, 8vw, 5rem)', { lineHeight: '1.05' }],
        'display-sm': ['clamp(1.75rem, 4vw, 2.5rem)', { lineHeight: '1.15' }],
      },
      letterSpacing: {
        'tight-ultra': '-0.04em',
      },
      keyframes: {
        'hero-fade': {
          '0%': { opacity: '0', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'hero-slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(56px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'hero-slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-56px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'hero-slide-out-left': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-56px)' },
        },
        'hero-slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(56px)' },
        },
      },
      animation: {
        'hero-fade': 'hero-fade 1100ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-in-right': 'hero-slide-in-right 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-in-left': 'hero-slide-in-left 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-out-left': 'hero-slide-out-left 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-out-right': 'hero-slide-out-right 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
