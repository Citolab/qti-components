import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
// import postcssNested from 'postcss-nested';
export default {
  plugins: [
    postcssImport(), // This should be first: inlines every @import into one stream so mixin
    // definitions (in qti-base) precede their uses (in the interaction files).
    // postcssNested(),
    // Theme styles now use only @define-mixin / @mixin in source. Keep this pipeline limited to
    // import expansion, semantic mixins, and vendor prefixing.
    postcssMixins(),
    autoprefixer()
  ]
};
