---
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

A select-point picture scales with its column by default. The component already sized the slotted picture `max-width: 100%; height: auto`, but the item theme's reset gives every picture inside an interaction `max-width: none`, a light-DOM rule that outranks `::slotted()`, so a 1024px picture overflowed a narrower column. The theme now restates the fluid sizing for the select-point picture (a direct child), as it does for graphic-gap-match. A picture smaller than its column keeps its own size. Clicks are still recorded in the picture's own pixels (its `width`/`height`) and markers placed in percentages, so the answer is the same at any displayed size.
