---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

A theme sets a chip's handle and edge.

- **Drag handle:** six small round dots by default (was six square blocks). Set the shape with the new optional input `--cito-icon-drag` (a mask `url()`) and its colour with `--cito-color-drag-icon` (the chip's text colour by default). A correction still recolours the handle along with the chip.
- **Chip edge:** `--cito-color-chip-border` (new, optional) is a drag chip's border colour; `transparent` gives borderless cards. It defaults to the component border, as before.
