import autoprefixer from 'autoprefixer';
import apply from 'postcss-class-apply/dist/index.js';
import postcssImport from 'postcss-import';
export default {
  plugins: [
    postcssImport(), // This should be first
    apply(),
    autoprefixer()
  ]
};
