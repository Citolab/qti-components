/** @type {import('tailwindcss').Config} */
/* eslint-env node */

/* 
This config is only used to preview the theme in the story
qti-theme.css. This css file imports this configuration '@config "../../tailwind.config.theme.cjs"'
and watches the classes used in the qti-theme.stories.ts for developing the UI components
*/

const tailwindconfig = require('../../../tailwind.config.cjs')

/* PK: extend the default config with content of the themes storie */
export default {
  ...tailwindconfig,
  content: ['src/styles/stories/qti-components.stories.ts']
}
