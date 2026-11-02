---
'@qti-components/graphic-gap-match-interaction': patch
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

Make `qti-graphic-gap-match-interaction` fit its container, with its drop areas scaling along — as `qti-hotspot-interaction` already does.

**The graphic overflowed, and its drop areas could not follow it.** An item declares the graphic at the size its `coords` were authored in — often a full-resolution picture, `width="1600"`. The interaction rendered it at exactly that size, so in a two-column layout or on a phone it ran far past its column. Capping the picture alone would not have helped: the drop areas were written as pixel offsets (`left: 79px`), so a narrower picture would have left them on the wrong part of it.

The drop areas are now placed with `positionShapes`, the helper the hotspot interaction uses: percentages of the graphic's declared size, inside a slot that is exactly the graphic's box. The graphic takes `max-width: 100%; height: auto` and keeps the aspect ratio its width/height attributes declare (pinned as `aspect-ratio`, because an `<object>` derives none from its attributes and an `<img>` defers to its bitmap's). It never upscales. `ellipse` and `poly` drop areas, which the pixel code skipped, are positioned too.

The theme restates the fluid sizing for the graphic (a direct child of the interaction), because `reset.css` gives every picture inside an interaction `max-width: none`, which outranks the component's `::slotted()` rule. A draggable's own picture is untouched and keeps the same size in the bank and in its drop area.

With `qti-choices-left` / `qti-choices-right` the image slot is now capped at 75% instead of forced to it, so it stays the graphic's box.

Not covered: a drop area still grows to fit the largest draggable (`--qti-dropzone-min-*`), so on a heavily scaled graphic a small drop area can be larger than its authored shape. `qti-hotspot-interaction` has the same `reset.css` override issue and is left for a separate change.
