/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

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
  plugins: [
    /* PK: created a plugin for the ::part psuedo selector which tailwind
        does not support out of the box, specific for webcomponents, could add slotted also
        usage : part-[selector]:bg-red-400
        */
    plugin(function ({ matchVariant }) {
      matchVariant('part', value => {
        return `&::part(${value})`;
      });
    })
  ]
};
