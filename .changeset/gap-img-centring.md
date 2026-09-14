---
'@qti-components/interactions-core': patch
'@citolab/qti-components': patch
---

Fix a dropped picture rendering low and hanging out of its hotspot in `qti-graphic-gap-match-interaction` (#213).

`qti-gap-img` never called `super.connectedCallback()`, so Lit never enabled updating and the element had no shadow root — which made `qti-gap-img.styles.ts`, the stylesheet that centres the picture, dead code. The source already carried a note saying exactly that. Without it the authored `<img>` / `<object>` was laid out as an inline replaced element on a text baseline rather than centred: it sat low in the chip with the line box's descender space below it.

On the 1EdTech "Airport Tags" example, whose hotspot `A` is authored `coords="12,108,39,121"` (27x13) around an 18x9 picture, the picture rendered 7px down from the hotspot top, 2.5px below its centre, with its bottom 3px past the box. The chip also measured 18px tall for a 9px picture, and that measurement feeds `--qti-dropzone-min-height` — so the hotspot itself was inflated to 27x18 and the box on screen was not the box in the item either.

`qti-gap-img` now calls `super.connectedCallback()` and renders a `<slot part="label">`, matching `qti-gap-text`, the sibling chip that always did this correctly. The chip is the size of its picture, the hotspot keeps the size its `coords` declare, and the picture lands centred inside it.
