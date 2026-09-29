---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

The test controls (`test-next`, `test-prev`, `test-item-link`, `test-section-link`,
`test-check-item`, `test-end-attempt` and the text-to-speech buttons) share one resting look that
reads the qti-theme tokens — `--qti-component-*` for the box, `--qti-bg-active` on hover,
`--qti-focus-*` for a `:focus-visible` ring — with the theme's defaults as fallbacks, so they
follow a brand and still look the same without qti-theme loaded. This replaces the light-grey
fill. `--test-button-*` slots (`background-color`, `color`, `border-color`, `border-radius`,
`hover-background-color`, `size`) repaint the test controls alone.
