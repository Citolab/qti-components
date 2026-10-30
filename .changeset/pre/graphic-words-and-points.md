---
'@qti-components/select-point-interaction': patch
'@qti-components/interactions-core': minor
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

Words on an image, and points in the right place.

- **Select point:** a response given in the markup (`response="203 159"`) now shows its marker where it belongs. It was rendered before the image's size was read and placed against a width of 1, thousands of percent off the image.
- **Graphic gap match with words:** a `qti-gap-text` chip is a label box, the inline-field box that gap-match chips have, in the bank and once placed on the image; an image tile (`qti-gap-img`) stays plain. A placed word carries the part `drag drag-text` (new) next to `drag`, so a theme can tell a word from a tile. A placed chip no longer shrinks in a hotspot narrower than it (`qti-associable-hotspot`). An empty hotspot shows a dashed edge at rest, unless the interaction has `qti-unselected-hidden`.
- **Select point marker on any picture:** the marker gets a halo that follows its colour, white round a dark marker and black round a light one (lightness below or above 0.7, derived with relative colour syntax), so it stays visible on a dark or busy image. Set the colour with the new optional input `--cito-color-marker` (the primary by default) and the shape with `--cito-icon-marker` (a mask; the pin by default), with `--cito-marker-anchor` saying where that shape points: `-100%` stands it on the point by its bottom, like the pin, `-50%` centres it, for a ring or a star. `--qti-select-point-halo` overrides the derived halo. The marker's shape is now drawn by its `::before`, so the halo can follow it.
