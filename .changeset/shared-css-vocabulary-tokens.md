---
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

The QTI 3 shared CSS classes `qti-bordered`, `qti-well` and `qti-underline` now render. The shared sheet (qti3p0.css, 1EdTech's, left untouched) paints them with `--table-border-color`, `--well-bg`, `--well-border`, `--well-box-shadow` and `--foreground`, which nothing declared, so a table or block the author marked bordered showed no border and a well had no fill or frame. They are now declared with the spec's own example values (`native.css`, also inlined into the PCI iframe), and in the theme `--table-border-color` follows `--qti-border-color`. Hosts that declared `--table-border-color` themselves as a workaround can drop it; declaring any of these still overrides the default.
