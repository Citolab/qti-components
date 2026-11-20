# @qti-components/graphic-associate-interaction

## 2.0.0-next.5

### Major Changes

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
