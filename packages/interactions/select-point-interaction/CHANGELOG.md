# @qti-components/select-point-interaction

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

- [#347](https://github.com/Citolab/qti-components/pull/347) [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa) Thanks [@herrKlein](https://github.com/herrKlein)! - The public prefix is `qc-` (qti-components); `cito-` is its old name and keeps working for one major.

  - **Theme inputs:** `--cito-color-primary` → `--qc-color-primary`, and so on for every tier-1 input
    (CONTRACT §8). The theme reads `var(--qc-x, var(--cito-x, <default>))`, so a page that sets only
    the old name is unchanged. Four inputs that still carried the `qti-` prefix get their public name:
    `--qc-spacing` (was `--qti-spacing`), `--qc-motion`, `--qc-line-height` (was
    `--qti-field-line-height`), `--qc-color-text` (was `--qti-fg`), plus `--qc-border-style`.
  - **Fewer inputs:** `--cito-color-well`, `--cito-shadow-drag` and `--cito-color-marker` are no longer read
    (a well is the surface colour, the in-flight shadow and the marker colour derive from the text colour
    and the primary; a brand that wants another paints `.qti-well` or `::part(point)`). Tier 1 is 36
    inputs.
  - **A quieter handle:** the default grip is one column of dots in a faded text colour, narrower and
    closer to the label, so the word is what a chip shows; `--qc-size-drag-icon` sets the handle's width
    for a brand with a wider icon.
  - **Two faces:** `--qc-font-family-heading` sets the font of `h1`–`h6` in an item alone; unset, headings
    keep the reading font (`--qc-font-family`). The Cito preset uses PT Sans for headings only.
  - **Events:** every public event `cito-*` is dispatched and handled as `qc-*` (`qc-test-navigated`,
    `qc-item-outcome-changed`, `qc-feedback-show`, …); the `cito-*` name is still sent and listened to
    for one major. The 7.x names (`qti-request-navigation`, `test-end-attempt`, `on-test-switch-view`,
    `qti-outcome-changed`, …) are no longer sent.
  - **Buttons:** the test controls and the button-like interactions (end attempt, upload) read one slot
    set, `--button-*` (`--button-background-color`, `--button-color`, `--button-border-color`,
    `--button-hover-background-color`, `--button-active-background-color`, `--button-size`,
    `--button-border-radius`, `--button-primary-*`, `--button-selected-*`). `--test-button-*` are the
    old names, read as fallbacks for one major. The selected text-to-speech button carries
    `:state(selected)`.
  - **Internal, documented as such:** `qti-variables.css` is one block, one line per token, with the
    old spellings (`--qti-bg`, `--qti-border-thickness`, `--qti-correct`, …) kept as aliases;
    `qti-mixins.css` keeps the mixins that carry an idea and inlines the rest (the paint role `button`
    is now `choice`); the empty `qti-components.overrides` layer is gone (write unlayered CSS or
    `@layer qti-extended`); `qti-components.interactions.brand` stays as the one theme layer a brand
    may write into.
  - **The override contract** is CONTRACT §11 and the docs page "Styling and theming": set `--qc-*`;
    override on parts and states, unlayered; put that CSS in the container's `<template><style>`.

  Host notes: `plans/host-migration/kennisnet.md`, `citotestuit.md`, `examenkompas.md`, `peilinglezen.md`.

### Patch Changes

- Updated dependencies [[`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa)]:
  - @qti-components/interactions-core@3.0.0-next.7
  - @qti-components/base@3.0.0-next.6

## 1.1.6-next.4

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

## 1.1.6-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.1.6-next.2

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Words on an image, and points in the right place.

  - **Select point:** a response given in the markup (`response="203 159"`) now shows its marker where it belongs. It was rendered before the image's size was read and placed against a width of 1, thousands of percent off the image.
  - **Graphic gap match with words:** a `qti-gap-text` chip is a label box, the inline-field box that gap-match chips have, in the bank and once placed on the image; an image tile (`qti-gap-img`) stays plain. A placed word carries the part `drag drag-text` (new) next to `drag`, so a theme can tell a word from a tile. A placed chip no longer shrinks in a hotspot narrower than it (`qti-associable-hotspot`). An empty hotspot shows a dashed edge at rest, unless the interaction has `qti-unselected-hidden`.
  - **Select point marker on any picture:** the marker gets a halo that follows its colour, white round a dark marker and black round a light one (lightness below or above 0.7, derived with relative colour syntax), so it stays visible on a dark or busy image. Set the colour with the new optional input `--cito-color-marker` (the primary by default) and the shape with `--cito-icon-marker` (a mask; the pin by default), with `--cito-marker-anchor` saying where that shape points: `-100%` stands it on the point by its bottom, like the pin, `-50%` centres it, for a ring or a star. `--qti-select-point-halo` overrides the derived halo. The marker's shape is now drawn by its `::before`, so the halo can follow it.

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.6-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.1.6-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0
