import autoprefixer from 'autoprefixer';
import postcssApply from 'postcss-class-apply/dist/index.js';
import postcssImport from 'postcss-import';
// import postcssNested from 'postcss-nested';
export default {
  plugins: [
    postcssImport(), // This should be first
    // postcssNested(),
    postcssApply(),
    autoprefixer()
  ]
};
