# @qti-components/inline-choice-interaction

## 3.0.0-next.7

### Patch Changes

- [#356](https://github.com/Citolab/qti-components/pull/356) [`7f5175a`](https://github.com/Citolab/qti-components/commit/7f5175a47b0024b1f1119915ea75fd29c819c264) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-inline-choice-interaction` now shows the author's `data-min-selections-message` when an empty response is invalid (`required="true"` or `min-choices="1"`). It read `data-min-choices-message` instead, so the message the QTI 3 vocabulary and every other interaction use was ignored and the default "Please select an option." appeared. `data-min-choices-message` is still read as a fallback. Conformance item `Advanced/Q12-inline-choice/inline-choice-sv-3` (Q12-L2-D103) now asserts the message text.
- Updated dependencies [[`7f5175a`](https://github.com/Citolab/qti-components/commit/7f5175a47b0024b1f1119915ea75fd29c819c264)]:
  - @qti-components/base@3.0.0-next.7

## 3.0.0-next.6

### Major Changes

- [#347](https://github.com/Citolab/qti-components/pull/347) [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa) Thanks [@herrKlein](https://github.com/herrKlein)! - One vocabulary for parts and states (qti-theme `CONTRACT.md` §3). Every part is a role and a noun;
  every state is an adjective and a `:state()`; a state on a part is a second token with the state's
  name; verdicts and the answer key have one word each. The old names are still set next to the new
  ones for this major, so nothing breaks until the next one; the theme reads only the new names.

  Renames (old → new):

  - Chips and targets: `:state(drag)` → `:state(chip)`, `::part(drag)` → `::part(chip)`,
    `::part(drag-text)` → `::part(chip text)`, `::part(drags)` → `::part(bank)`,
    `:state(droppable)` → `:state(drop)`, `:state(dragging)` → `:state(lifted)`,
    `:state(placeholder)` → `:state(used)`, `:state(return-anchor)` → `:state(return-target)`.
  - A drag in progress: host `dragzone-active` + `dragzone-enabled` and target `active` + `enabled`
    → `drag-active`; target `hover` → `drag-over`; a full target gets `full` (the `disabled` attribute
    on a target stays for this major). A placed chip exports its handle and text as `chip-control` and
    `chip-label` (`drag-control`, `drag-label` still exported).
  - Keyboard drags now set the same states as pointer drags (`lifted`, `drag-active`, `drag-over`).
  - The bank is `drag-active` (`::part(bank drag-active)`) only while a chip lifted out of a target is
    in flight, when it can take the chip back; a chip lifted out of the bank leaves it unlit.
  - Verdicts: `candidate-partially-correct` → `candidate-partial`; the badge is
    `::part(correction candidate-correct|candidate-incorrect|candidate-partial)` (was
    `correction-correct` …); select-point `::part(point correct)` → `::part(point candidate-correct)`;
    match cells likewise. `:state(incorrect-response)` is gone (never styled).
  - Answer key: `:state(correct-response)` → `:state(answer-key)` (a choice in the key, the full-mode
    clone); `:state(show-correct-response)` → `:state(answer-key-shown)` (the host in internal mode);
    `::part(answer)` → `::part(answer-key)`; `::part(correct-line)` → `::part(line answer-key)`;
    `::part(knob-correct)` → `::part(knob answer-key)`. The theme no longer reads the
    `correct-response` attribute or the `.full-correct-response` class.
  - Other parts: choice `slot` → `choices`; inline-choice `option-selected|option-prompt|option-clear`
    → `option selected|prompt|clear`, `dropdown-icon(-open)` → `icon (open)`; match `c-header`,
    `r-header`, `cols-wrap`, `rows-wrap`, `checkbox-grid`, `input-cell` → `column-header`,
    `row-header`, `columns`, `rows`, `cells`, `cell`; associate `drop-row` → `row`; item-body
    `qti-rubric-blocks` → `rubrics`; graphic order `aria-ordervalue` / `aria-ordercorrectvalue` →
    `data-order` / `data-order-correct`; the sortable preview `data-drop-placeholder` →
    `data-drop-preview`.
  - `@qti-components/base` exports `setState` / `hasState` / `STATE_ALIASES`.

  Host notes: `plans/host-migration/kennisnet.md`, `citotestuit.md`, `examenkompas.md`, `peilinglezen.md`.

- [#347](https://github.com/Citolab/qti-components/pull/347) [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa) Thanks [@herrKlein](https://github.com/herrKlein)! - A validity message is timed like a native form. Too many shows at once on the change that caused it;
  too few (below `min-choices`, `min-associations`, `min-strings`, or `required`) shows only after a
  submit, the item's end attempt or a form's submit, and from then on every change reports in full. A
  reset forgets the submit. The validity itself is set on every change as before, so a form with a
  below-minimum interaction still does not submit.

  Validity is now also set before the first change and whenever a response is restored or written by a
  host, so an untouched interaction below its minimum makes a form's submit fail (breaking: such a form
  used to submit). Fixed along the way: a choice interaction parsed together with its choices (innerHTML,
  a restored item) lost its `response` attribute; a drag-drop reset left targets that held a chip
  refusing drops.

  Before, dragging a chip into a target and back showed "Please select at least 1 association." at
  once. `reportValidity()` takes an optional `{ trigger: 'change' | 'submit' }` (default `submit`);
  `ValidityKind` and `ValidityTrigger` are exported from `@qti-components/base`.

  Host notes: `plans/host-migration/citotestuit.md`, `examenkompas.md`, `peilinglezen.md`.

### Minor Changes

- [#347](https://github.com/Citolab/qti-components/pull/347) [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa) Thanks [@herrKlein](https://github.com/herrKlein)! - Every interaction that carries a response now works inside a `<form>`.

  - Inline choice, select point and upload write a form value (the chosen identifier; the points as
    `x y,x y`; the file as a base64 data URL). Select point sets validity with `min-choices` /
    `max-choices` and renders `::part(message)`.
  - Graphic associate reads `min-associations` and `max-associations`; the latter defaults to 1, as
    QTI specifies (breaking: an item without the attribute used to accept any number of lines). It
    writes a form value and sets validity. Its points are visible (rings), its lines are black with a
    white outline, a point cannot be paired with itself, "B A" is the existing "A B", each point's
    `match-max` is enforced (`:state(full)`), the chosen start point carries `:state(checked)`, Escape
    or a click on the image cancels a started line, lines have a wide remove target, and points and
    lines are reachable by keyboard.
  - Graphic order validates after the click is applied (it was one click behind).
  - Extended text reports as the candidate types, not only on blur.

  Host notes: `plans/host-migration/citotestuit.md`.

### Patch Changes

- Updated dependencies [[`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa)]:
  - @qti-components/interactions-core@3.0.0-next.7
  - @qti-components/base@3.0.0-next.6

## 3.0.0-next.5

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

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
