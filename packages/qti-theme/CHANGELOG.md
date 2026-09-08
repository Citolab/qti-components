# @qti-components/theme

## 2.2.0

### Minor Changes

- [#205](https://github.com/Citolab/qti-components/pull/205) [`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce) Thanks [@herrKlein](https://github.com/herrKlein)! - Ship the theme sheet as a real module, so `@qti-components/item` and `@qti-components/test` can be
  installed on their own.

  Both packages adopt the theme into their shadow root, so they need the sheet as _text_. They got it
  with `import itemCss from '../../../../qti-theme/src/item.css?inline'` — but `?inline` is
  bundler-only syntax, and `tsc` (how all 32 non-umbrella packages build) copies the specifier through
  verbatim. `@qti-components/item@1.4.3` therefore shipped that exact line. Two things wrong with it:
  the `?inline` suffix no plain bundler resolves, and the path climbs out of the package into a
  sibling directory that `files: ["dist"]` never publishes. Installing the package from npm and
  bundling it fails outright:

  ```
  ✘ [ERROR] Could not resolve "../../../../qti-theme/src/item.css?inline"
      @qti-components/item/dist/components/item-container/item-container.js:15:20
  ```

  It went unnoticed because the umbrella inlines these packages at build time and its esbuild plugin
  resolves the `?inline` right there — inside the workspace, where `dist/` sits at the same depth as
  `src/` and the relative path happens to land on a real file. Consumers of `@citolab/qti-components`
  never saw the broken specifier. Consumers of the granular packages could not get past it.

  `@qti-components/theme` now exposes `./item-css`, an ES module exporting the compiled sheet as a
  string. It is generated from the already-built `dist/item.css` rather than by running PostCSS a
  second time, and the result is byte-for-byte what the inline plugin produced (279,603 chars) — so
  the text these containers adopt is unchanged and nothing renders differently. `item-container` and
  `test-container` import that instead, and `@qti-components/theme` moves to a real `dependency` of
  `@qti-components/item` (it already was one of `@qti-components/test`) so the topological build
  order guarantees it exists first.

  Verified: with the fix, `@qti-components/item` installed from a tarball bundles cleanly and carries
  exactly one copy of the sheet.

  Also in this change:

  - **Every package now cleans before it builds.** None did, so `dist/` accumulated files whose
    sources were deleted — `@qti-components/corrections` was carrying a stale
    `dist/stories/with-correction-registry.decorator.js` from a removed source file, itself
    containing a `?inline` import. Nothing broken had actually shipped from this (the file was
    outside the published tarball), but `publish-if-needed.mjs` runs `--ignore-scripts`, so the
    tarball is whatever happens to be on disk.
  - **An eslint rule** rejects `?inline`/`?raw`/`?url` specifiers in package sources, naming the fix
    in the message. `import/no-relative-packages` had already flagged the original line and was
    silenced with an inline disable; that disable is gone. Exempt: `packages/qti-theme` (owns the
    dev-side source shim), spec/story files and `apps/*` (never compiled into a published dist).
  - The five spec files and two `apps/e2e` stories that loaded the sheet through `?inline` now use
    the same entry point as production, so they exercise the path consumers actually take rather than
    a dev-only one.
  - Removed a dead `@qti-components/theme` mapping in the root `tsconfig.json` pointing at a
    `src/index.ts` that does not exist.

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
