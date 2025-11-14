/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./main.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'ark-brown': {
          50: '#faf8f7',
          100: '#f5f0ec',
          200: '#e8ddd4',
          300: '#d4c4b5',
          400: '#b8a08a',
          500: '#9d7c5f',
          600: '#8b6914',
          700: '#6d4c0f',
          800: '#5a3f0c',
          900: '#4a3209',
          950: '#3d2a07'
        },
        'ark-gold': {
          500: '#d4af37',
          600: '#b8941f'
        },
        'ark-accent': {
          500: '#c0c0c0',
          600: '#a8a8a8'
        }
      }
    },
  },
  plugins: [],
}
