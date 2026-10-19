---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

`qti-well` and `qti-bordered` are drawn by the theme.

The QTI 3 shared CSS the theme ships (vocabulary §2.12) leaves their colours to hooks it never defines, so a `.qti-bordered` box drew no border at all (its `border` declaration pointed at an undefined `--table-border-color` and was dropped), and a `.qti-well` got its padding and nothing else. The theme now fills those hooks from its own tokens: `--table-border-color` is `--qti-border-color`, `--foreground` the text colour, and a well is `--qti-color-base-200` inside `--qti-border` with no inset shadow (`--well-bg`, `--well-border`, `--well-box-shadow`). Its corner follows `--qti-radius-box` instead of a fixed 4px. A brand that restyles its borders restyles both with them.

One Kennisnet VRT baseline is regenerated: *Woorden selecteren (niet herkenbaar)* wraps its sentences in `qti-bordered`, which now shows its border (4px taller).
