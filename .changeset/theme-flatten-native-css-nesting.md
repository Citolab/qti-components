---
'@qti-components/theme': patch
---

Flatten native CSS nesting in the published stylesheet, and state the browser support floor.

The theme sources use `&`-nested rules throughout and the postcss pipeline passed them through, so
`dist/item.css` shipped 283 nested selectors. Safari below 16.5 cannot parse native nesting and
dropped those rules. `postcss-nesting` now runs after `postcss-mixins` — the mixins can themselves
emit nesting — leaving none in the built stylesheet.

`.browserslistrc` gives autoprefixer an explicit floor in place of the implicit `defaults`.
Safari/iOS 16.4 is the hard minimum, imposed by the unguarded `ElementInternals.attachInternals`
calls in the interaction base classes.

The same postcss config feeds the inline-css esbuild plugin, so shadow-DOM component styles get
both behaviours too.
