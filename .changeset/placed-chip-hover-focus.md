---
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

A chip placed in a drop now gets the theme's hover, press and focus ring (gap-match, match, associate, order). These rules were nested under `::part(drag)` and compiled to `:is(…::part(drag)):hover`, a selector the browser drops because a pseudo-element cannot sit inside `:is()`. They are written flat now and sit in the `interactions.states` layer, after the chip's own paint, so the hover and press tint win over it. A placed chip reached with Tab shows one solid `--qti-focus-color` outline. The order interaction's drop shows the theme ring on `:focus-visible` too. Two nested attribute rules after `::part()` (`[dragging]` on a placed chip, `[enabled]` on an order drop) are removed; they could never match.
