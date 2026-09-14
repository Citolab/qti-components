# @qti-components/item

## 1.4.4

### Patch Changes

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

- Updated dependencies [[`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce)]:
  - @qti-components/theme@2.2.0

## 1.4.3

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

- Updated dependencies [[`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d)]:
  - @qti-components/base@2.0.1
