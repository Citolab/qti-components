---
'@qti-components/match-interaction': major
'@qti-components/theme': major
---

BREAKING: refactor `qti-match-interaction` tabular mode to share its shadow-DOM
structure with the editor's tabular implementation and align its visual
styling with the shared design system.

**`@qti-components/match-interaction`**

- Tabular shadow template restructured. The `<table>` / `<tr>` / `<td>`
  scaffolding is gone, replaced by a CSS-grid + subgrid wrapper layout:
  `part="grid"` outer, `part="corner"` for the top-left cell, and three
  subgrid wrappers `part="cols-wrap"` / `part="rows-wrap"` /
  `part="checkbox-grid"` that carry the slotted headers and the input cells
  into the outer grid's tracks. The row/column headers come from the actual
  light-DOM `<qti-simple-associable-choice>` elements (slotted into named
  slots `match-rows` / `match-cols`) instead of being cloned into `<th>` /
  `<td>`.
- Input cells are now `<label part="input-cell">` wrapping a hidden
  `<input>` and a `<span part="ch …">` / `<span part="cha …">` indicator
  pair, mirroring `qti-choice-interaction` and `qti-hottext-interaction`.
  Clicking anywhere on the cell now toggles the input via native label
  semantics — previously only the small native input was clickable.
- Drag-drop is disabled in tabular mode (`initiateDrag` short-circuits when
  `class="qti-match-tabular"` is set). The drag-drop mixin's dropzone
  auto-sizing is skipped via an `afterCache` override and any leftover
  inline `min-width` / `min-height` / `--qti-dropzone-min-height` from a
  previous mode are stripped from the choices.
- `--qti-match-rows` / `--qti-match-cols` CSS custom properties are set
  inline on `[part='grid']` (not on the host) and drive the grid template.

**`@qti-components/theme`**

- Tabular styling split into a dedicated file
  `interactions/qti-match-interaction-tabular.css` (imported from
  `qti-interactions.css`). The drag-drop rules remain in
  `qti-match-interaction.css`.
- Radio + checkbox input styling rewritten to use the shared design-system
  classes via `@apply check-radio` / `@apply check-checkbox` /
  `@apply check-size` / `@apply check-radio-checked` /
  `@apply check-checkbox-checked` — identical look to `qti-choice-interaction`
  and `qti-hottext-interaction`. Borders use `--qti-border-color`, checked
  state uses `--qti-border-active`, sizes use `--qti-form-size`.
- Header cells and input cells use `--qti-bg-active` for hover/background
  and `--qti-border-color` for borders. Hardcoded `#ddd` borders are gone.

**Migration**

- Consumer CSS targeting the removed parts must be updated:
  - `::part(table)` → `::part(grid)`
  - `::part(row)` → `::part(input-cell)` (or drop entirely; rows are no
    longer a styled boundary)
  - `::part(checkmark)` is gone — the checkmark is now drawn by the
    `check-checkbox-checked` mask on the `cha` indicator.
- The host-level inline custom properties `--qti-match-rows` /
  `--qti-match-cols` previously written on the `qti-match-interaction`
  element are now written on the inner `[part='grid']` element. If you read
  these from JS, read them from the grid element instead.
