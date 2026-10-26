---
'@qti-components/base': minor
'@qti-components/interactions-core': major
'@qti-components/associate-interaction': major
'@qti-components/choice-interaction': major
'@qti-components/gap-match-interaction': major
'@qti-components/graphic-associate-interaction': major
'@qti-components/graphic-gap-match-interaction': major
'@qti-components/graphic-order-interaction': major
'@qti-components/inline-choice-interaction': major
'@qti-components/match-interaction': major
'@qti-components/order-interaction': major
'@qti-components/select-point-interaction': major
'@qti-components/slider-interaction': major
'@qti-components/text-entry-interaction': major
'@qti-components/corrections': major
'@qti-components/elements': major
'@qti-components/theme': major
'@citolab/qti-components': major
---

One vocabulary for parts and states (qti-theme `CONTRACT.md` §3). Every part is a role and a noun;
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

Host notes: `plans/host-migration/kennisnet.md`, `citotestuit.md`, `examenkompas.md`.
