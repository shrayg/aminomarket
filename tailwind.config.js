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
    },
  },
  plugins: [],
}
