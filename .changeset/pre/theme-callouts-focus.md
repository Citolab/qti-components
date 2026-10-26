---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The default theme gives rubric blocks and feedback a look of their own, makes its cards white, and gives its focus ring a colour.

- `qti-rubric-block`: a light-grey callout with a thick grey border on its start side, instead of the blue info border.
- `qti-feedback-block`, `qti-feedback-inline`, `qti-modal-feedback`: one look, a light-grey bubble with large rounded corners, no border and a hard darker shadow below it; inline feedback is the same as a pill and keeps the height of its line. Rubric and feedback are told apart by shape, so it holds in black and white.
- `.qti-well` is white by default (it was a light tint), for items on a light-grey page. `--cito-color-well` still sets another fill.
- The focus ring is a mid blue in the default theme (3:1 against both surfaces). A brand that sets `--cito-color-primary` keeps its primary as the ring, as before; `--cito-color-focus` sets the ring on its own.
