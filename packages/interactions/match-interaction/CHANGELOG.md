# @qti-components/match-interaction

## 2.1.0-next.2

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - One focus ring, on everything you can pick, and a tabular match you can answer from the keyboard.

  - **The ring shows when you pick with the mouse too.** Choices (on the radio or checkbox, or round the box for `qti-input-control-hidden`), hottext, hotspots, graphic order and associate hotspots, select-point points, an inline choice's trigger, the slider and a tabular match cell ring on `:focus`, not only `:focus-visible`. Chips and drops too, except a lifted chip's placeholder. A gap in gap match swaps its dashed edge for the solid ring while it has focus; before, a gap reached with Tab, or by a keyboard drag, showed no focus at all.
  - **Slider:** the ring goes round the knob.
  - **Hottext** has a pointer cursor in every variant.
  - **Tabular match** (`qti-match-tabular`): each cell's radio or checkbox is a real input, visually hidden over the cell, instead of `hidden`. It takes Tab focus; the arrow keys move within a row and Space toggles a checkbox, natively. Before, the grid could not be answered from a keyboard at all. The cell rings inside its edge. The row and column header cells leave the tab order (`tabindex="-1"`).
  - **Corrections:** `qti-simple-choice` registered by the corrections package had a focusable inner control (`tabindex="0"`), so every choice took two Tab presses. One now.

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 2.0.1-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 2.0.1-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0
