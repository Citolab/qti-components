/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFBEBE',
          DEFAULT: '#f86d70',
          dark: '#a1616a'
        },
        secondary: {
          light: colors.indigo[300],
          DEFAULT: colors.indigo[500],
          dark: colors.indigo[900]
        },
        focus: 'var(--qti-secondary-color)'
      }
    }
  },
  plugins: []
};
