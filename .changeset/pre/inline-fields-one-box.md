---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

Everything that sits in a sentence has one box. A text entry, an inline choice, a hottext, a gap-match chip and the gap it goes into are all the same height as a line of text (`--qti-line-height`, 30px at 16px), with the same padding: `--qti-inline-padding-block` above and below (`--cito-size-field`, 2px) and the new `--qti-inline-padding-inline` either side (one `--qti-spacing`, 8px). They share the field line height (`--qti-field-line-height`) too.

- **Inline choice** was about 6px shorter than a text entry: its trigger had `line-height: normal`.
- **Text entry and inline choice** have 8px either side instead of 16px; their correction badge sits 8px from the end, the same distance.
- **Hottext** takes the inline-field padding (was 2px 4px) and margins, so a word to select is the size of a field.
- **Gap match** chips take the inline-field padding instead of a chip's 8px × 0.8em, in the bank and in a gap, so a sentence with gaps is no taller than one without. A gap draws its dashed edge as an inset outline, not a border, so it is exactly the chip's size.

Six Kennisnet VRT baselines are regenerated: the two text entry items, the dropdown, the two hottext items and the gap-match item. Those with gaps or hottext get shorter (the gap-match item from 608px to 462px).
