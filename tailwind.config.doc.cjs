/** @type {import('tailwindcss').Config} */
/* eslint-env node */

const tailwindconfig = require('./tailwind.config.cjs')

export default {
  ...tailwindconfig,
  content: ['src/docs/**/*']
}
