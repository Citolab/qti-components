# @qti-components/base

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
