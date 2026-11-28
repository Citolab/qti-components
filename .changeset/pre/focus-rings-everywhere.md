---
'@qti-components/theme': minor
'@qti-components/match-interaction': minor
'@qti-components/corrections': patch
'@citolab/qti-components': minor
---

One focus ring, on everything you can pick, and a tabular match you can answer from the keyboard.

- **The ring shows when you pick with the mouse too.** Choices (on the radio or checkbox, or round the box for `qti-input-control-hidden`), hottext, hotspots, graphic order and associate hotspots, select-point points, an inline choice's trigger, the slider and a tabular match cell ring on `:focus`, not only `:focus-visible`. Chips and drops too, except a lifted chip's placeholder. A gap in gap match swaps its dashed edge for the solid ring while it has focus; before, a gap reached with Tab, or by a keyboard drag, showed no focus at all.
- **Slider:** the ring goes round the knob.
- **Hottext** has a pointer cursor in every variant.
- **Tabular match** (`qti-match-tabular`): each cell's radio or checkbox is a real input, visually hidden over the cell, instead of `hidden`. It takes Tab focus; the arrow keys move within a row and Space toggles a checkbox, natively. Before, the grid could not be answered from a keyboard at all. The cell rings inside its edge. The row and column header cells leave the tab order (`tabindex="-1"`).
- **Corrections:** `qti-simple-choice` registered by the corrections package had a focusable inner control (`tabindex="0"`), so every choice took two Tab presses. One now.
