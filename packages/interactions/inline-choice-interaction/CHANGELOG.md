# @qti-components/inline-choice-interaction

## 3.0.0-next.4

### Patch Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - An inline choice can have an empty placeholder: `data-prompt=""` (or an empty `inlineChoicePrompt` in the item configuration) is kept. Before, an empty value counted as missing and the placeholder fell back to `select`.

  An empty placeholder now lines up with the sentence: the closed field keeps the same text baseline as when it shows an answer, so the line no longer changes height once a choice is made.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - An auto-sized inline choice opens a menu exactly as wide as the closed field. The option rows (`qti-inline-choice`) were `inline-flex`, so the shrink-to-fit menu measured them side by side and came out as wide as all options together; they are block-level `flex` rows now. The measured trigger width also counts the gap before the chevron (the widest option was cut off by a few pixels) and no longer adds the menu's border. An empty value or prompt (`data-prompt=""`) keeps the field and the prompt row one line tall instead of collapsing.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - The open inline choice menu reads as one shape with the field: one border on the seam instead of the field's and the menu's stacked, and square corners at the bottom of the menu.

  With an empty `data-prompt`, the empty prompt row is no longer shown while nothing is chosen. Once a choice is made, that row is a clear button (an x glyph) that empties the answer again; its accessible name is `Clear`, overridable with `data-clear-label`.

- Updated dependencies [[`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53)]:
  - @qti-components/base@3.0.0-next.4
  - @qti-components/interactions-core@2.2.0-next.5

## 3.0.0-next.3

### Major Changes

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - `inlineChoiceAutosize` is on by default. An inline choice is as wide as its widest option from the start, so choosing an option no longer widens the field and reflows the sentence around it. A `qti-input-width-*` class still wins; set `configContext.inlineChoiceAutosize: false` for the old behaviour, where the field sizes to the option shown. Host notes: `plans/host-migration/kennisnet.md`, `plans/host-migration/citotestuit.md`.

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 2.0.2-next.2

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 2.0.2-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 2.0.2-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0

## 2.0.1

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
  - @qti-components/interactions-core@2.0.1
