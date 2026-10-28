# @qti-components/graphic-order-interaction

## 2.0.0-next.5

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

### Patch Changes

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

- Updated dependencies [[`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa)]:
  - @qti-components/interactions-core@3.0.0-next.7
  - @qti-components/base@3.0.0-next.6

## 1.2.2-next.4

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

## 1.2.2-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.2.2-next.2

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.2.2-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.2.2-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0

## 1.2.1

### Patch Changes

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix `qti-graphic-order-interaction` on the QTI 3 spec form of an ordering item ([#209](https://github.com/Citolab/qti-components/issues/209)). Two defects, either of which broke it on its own.

  **RESPONSE ignored the candidate's ordering.** The interaction only wrote `aria-ordervalue` on each hotspot; the response itself was published by `ChoicesMixin` as the set of _checked_ choices in **DOM order** — the one thing an ordering must not do. `ChoicesMixin.maxChoices` also defaults to `1`, so each click cleared the previous hotspot and made the interaction a `radiogroup` of `radio`s. Clicking A, D, C, B left `RESPONSE` as the single identifier `"B"` where the `ordered` cardinality declaration expects `["A","D","C","B"]`, so response processing never scored the item — while the pins painted 1-2-3-4 and made it look right.

  The response is now the ordering: `max-choices` defaults to `0` (no limit, QTI's default for an ordering), the interaction publishes the ordered identifier list itself, and pins plus `aria-ordervalue` are derived from the response rather than kept as a second copy of it. Deselecting a hotspot renumbers the rest by falling out of the array, and a response set from anywhere else — a restored attempt, a correct-response display, an author setting the property — now repaints the pins.

  **An `<object>` graphic left every hotspot unpositioned.** QTI 3 carries the graphic as `<object type="image/png" data="…">`, which is what the spec's own graphic interaction examples use, but the hotspots were positioned against `querySelector('img')`. On a spec-form item that is `null`, `positionShapes` threw, and no hotspot got a position — so all of them collapsed onto the theme's `100%x100%` and stacked as one large box below the graphic. Only items that had been through a converter rendered at all.

  `findGraphic` now accepts `<img>` and `<object type="image/*">` alike, and `positionShapes` resolves the coordinate space from either — including the two forms where the attributes cannot supply it. `width`/`height` are **optional** on the QTI `<object>` (only `data` and `type` are required), so a graphic that declares no size falls back to the bitmap's own, probed by loading the same URL and cached per element. And QTI's `LengthDType` is `[0-9]+%?`, so `width="50%"` is valid markup on either form: a percentage is a layout instruction, not a coordinate space, and reading it as `50px` used to push every hotspot off the graphic — it now falls back to the intrinsic size too. A graphic whose size cannot be resolved at all is reported instead of silently writing `NaN%` and leaving the hotspots full-size.

  `qti-hotspot-interaction`, `qti-graphic-associate-interaction` and `qti-select-point-interaction` make the same `img`-only assumption and are not covered here.

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/base@2.3.0
  - @qti-components/interactions-core@2.1.3
