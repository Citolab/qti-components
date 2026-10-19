---
'@qti-components/theme': minor
'@qti-components/corrections': minor
'@citolab/qti-components': minor
---

Compact chips and boxed choices, and the extended-text badge on the end side.

- **Chips** (order, match, associate) and **choices drawn as boxes** (`qti-input-control-hidden`) have a compact box: `--qti-drag-padding` is ¾ by 1½ spacing units (6px × 12px, was 8px × 0.8em), with the field line height, so they are 38px tall instead of 48px. A boxed choice reads it through the new `--qti-choice-box-padding`. Drops follow the chip they are sized from. Gap-match chips keep their inline-field box; choices with a radio or checkbox are unchanged.
- **Extended text** reserves the correction gutter at the end of the line instead of the start, and the badge sits there, top end corner. An ungraded answer no longer starts indented by the badge's room.

Six Kennisnet VRT baselines are regenerated: the four match items and the two order items, whose chips and drops get smaller. The open question is unchanged: that suite does not grade it.
