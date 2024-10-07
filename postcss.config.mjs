// import UnoCSS from '@unocss/postcss';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
// const apply = require("postcss-class-apply/dist/index")
import apply from 'postcss-class-apply/dist/index.js';
export default {
  plugins: [
    postcssImport(), // This should be first
    // UnoCSS(),

    // tailwindcss(),
    apply(),
    autoprefixer()
  ]
};
