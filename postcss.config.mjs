import autoprefixer from 'autoprefixer';
import postcssApply from 'postcss-class-apply/dist/index.js';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
// import postcssNested from 'postcss-nested';
export default {
  plugins: [
    postcssImport(), // This should be first: inlines every @import into one stream so mixin
    // definitions (in qti-base) precede their uses (in the interaction files).
    // postcssNested(),
    // Transition: postcss-mixins (@define-mixin / @mixin) and postcss-class-apply (@apply) run side
    // by side so the theme can migrate one file at a time. mixins BEFORE apply, so an @apply left
    // inside an expanded mixin body still gets resolved. postcss-class-apply is dropped once
    // `grep @apply` reaches zero. See plans/theme-merge-and-shadow-style-cleanup.md.
    postcssMixins(),
    postcssApply(),
    autoprefixer()
  ]
};
