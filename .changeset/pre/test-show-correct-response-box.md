---
'@qti-components/corrections': patch
'@citolab/qti-components': patch
---

`test-show-correct-response` paints its box again. Its padding and border moved to an inner `div` (so a page's CSS reset leaves them alone), but its render still put the text straight in the shadow root, so the control showed as bare text. The text is in the `div` now, which is also `part="button"`, like the other test controls.

It also stays "shown" after a click: it reset itself to "show" whenever the computed context was rebuilt, because it compared the active item by object identity, and the context is rebuilt on every change, including the one its own toggle causes. It compares the item's identifier now, so it switches back only when another item comes on screen.
