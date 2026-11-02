---
'@qti-components/inline-choice-interaction': patch
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

The open inline choice menu reads as one shape with the field: one border on the seam instead of the field's and the menu's stacked, and square corners at the bottom of the menu.

With an empty `data-prompt`, the empty prompt row is no longer shown while nothing is chosen. Once a choice is made, that row is a clear button (an x glyph) that empties the answer again; its accessible name is `Clear`, overridable with `data-clear-label`.
