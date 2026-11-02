# @qti-components/text-entry-interaction

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

- Updated dependencies [[`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa)]:
  - @qti-components/interactions-core@3.0.0-next.7
  - @qti-components/base@3.0.0-next.6

## 1.1.7-next.4

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

## 1.1.7-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.1.7-next.2

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.7-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.1.7-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0

## 1.1.6

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.
