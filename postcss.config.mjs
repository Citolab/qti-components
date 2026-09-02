import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
import postcssNesting from 'postcss-nesting';
export default {
  plugins: [
    postcssImport(), // This should be first: inlines every @import into one stream so mixin
    // definitions (in qti-base) precede their uses (in the interaction files).
    postcssMixins(),
    // Flattens native CSS nesting after the mixins that can emit it. Safari below 16.5 cannot
    // parse `&`-nested rules, and the theme sources use them throughout.
    postcssNesting(),
    autoprefixer()
  ]
};
