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
          50: '#f8f9fa',
          100: '#eef0f2',
          200: '#dde1e5',
          300: '#b8c1c9',
          400: '#8b99a6',
          500: '#6b7a8a',
          600: '#546170',
          700: '#424d5a',
          800: '#2a323c',
          900: '#1a1f26',
          950: '#0d1014',
        },
        accent: {
          DEFAULT: '#c4a35a',
          light: '#e8d5a3',
          dark: '#9a7b3d',
        },
      },
      fontSize: {
        'display': ['clamp(2.5rem, 8vw, 5rem)', { lineHeight: '1.05' }],
        'display-sm': ['clamp(1.75rem, 4vw, 2.5rem)', { lineHeight: '1.15' }],
      },
      letterSpacing: {
        'tight-ultra': '-0.04em',
      },
      keyframes: {
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
        'hero-slide-in-right': 'hero-slide-in-right 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-in-left': 'hero-slide-in-left 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-out-left': 'hero-slide-out-left 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-slide-out-right': 'hero-slide-out-right 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
