---
'@qti-components/interactions-core': patch
'@citolab/qti-components': patch
---

Fix the drag-handle grip rendering off-centre on `qti-gap-text` chips and `qti-simple-associable-choice` chips (used by gap-match, associate and match interactions).

The grip is a theme-drawn `::before` on `::part(control)`, centred with `vertical-align: middle` — a line-box/font-metric alignment, not a geometric one. `qti-gap-text` and `qti-simple-associable-choice` gave their `control` div no layout of its own, so the glyph's position drifted with font/line-height. `[part='control']` now flex-centres its content (`display: flex; align-items: center; justify-content: center`), matching the fix `qti-simple-choice` already had for its own control.
