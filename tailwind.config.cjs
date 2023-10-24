/** @type {import('tailwindcss').Config} */
/* eslint-env node */
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

/* PK: content is en empty array which is unusual for tailwind, 
but we only use tailwind as an opiniated design token system
and we create an internal stylesheet which just styles qti-components
based on their tagname */

export default {
  corePlugins: {
    preflight: true,
  },
  content: [],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    /* PK: created a plugin for the ::part psuedo selector which tailwind
    does not support out of the box, specific for webcomponents, could add slotted also
    usage : part-[selector]:bg-red-400
    */
    plugin(function ({ matchVariant }) {
      matchVariant(
        'part',
        (value) => {
          return `&::part(${value})`;
        }
      );
    }),
  ],
}



