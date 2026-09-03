# @qti-components/theme

## 2.1.0

### Minor Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep interactions working where custom states are unsupported.

  Interactions track selection and correct/incorrect marking through `internals.states`, with bare
  state names (`checked`, `radio`, `correct-response`, …). Two browser profiles cannot service that,
  and on both, picking a choice throws rather than registering:

  - Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so `internals.states` is
    `undefined` and reading it throws.
  - Chrome and Edge before the CSS custom-state spec change expose `states` but reject names that do
    not start with `--`, so `states.add('radio')` throws a `SyntaxError`.

  `attachInternals` is unguarded throughout the interaction base classes, which puts the hard support
  floor at Safari 16.4 — inside the range that breaks.

  `@qti-components/base` now classifies custom-state support by behaviour — `missing`, `legacy` or
  `modern`, probing a throwaway element rather than sniffing versions — and on the first two replaces
  `states` with a permissive `Set` that also mirrors its contents to a space-separated `data-state`
  attribute on the host. Where `states` works natively nothing is installed and nothing changes.

  The mirror is needed because these browsers' CSS parsers also drop any selector list containing
  `:state()`, so checked, correct-response and drag styling never rendered there either. The theme's
  built stylesheets now pair every `:state(x)` with a `[data-state~='x']` arm, applied at build time by
  `tools/postcss/custom-state-fallback.mjs`. `:is()` is what makes the pairing work in both
  directions: its forgiving parsing means a browser that does not understand `:state()` keeps the
  attribute arm, while a browser that does keeps matching the state arm.

### Patch Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Flatten native CSS nesting in the published stylesheet, and state the browser support floor.

  The theme sources use `&`-nested rules throughout and the postcss pipeline passed them through, so
  `dist/item.css` shipped 283 nested selectors. Safari below 16.5 cannot parse native nesting and
  dropped those rules. `postcss-nesting` now runs after `postcss-mixins` — the mixins can themselves
  emit nesting — leaving none in the built stylesheet.

  `.browserslistrc` gives autoprefixer an explicit floor in place of the implicit `defaults`.
  Safari/iOS 16.4 is the hard minimum, imposed by the unguarded `ElementInternals.attachInternals`
  calls in the interaction base classes.

  The same postcss config feeds the inline-css esbuild plugin, so shadow-DOM component styles get
  both behaviours too.

## 2.0.1

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.
