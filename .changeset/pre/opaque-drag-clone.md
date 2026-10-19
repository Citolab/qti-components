---
'@qti-components/interactions-core': minor
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The chip you drag is opaque and raised.

- **No more half-transparent clone.** The drag code no longer writes `opacity: 0.8` on the clone, and a dropped chip no longer fades in from 0.8. It also no longer copies the chip's resting `box-shadow` onto the clone inline, where it outranked the theme.
- **The theme raises it.** A chip in flight (`[data-drag-clone]`) takes `--qti-drag-elevation`, a soft shadow from the text colour. Set your own with the new optional input `--cito-shadow-drag` (any `box-shadow`, `none` for flat). A graphic-gap-match image tile stays as it is.
