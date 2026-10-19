---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The hole a lifted or spent chip leaves is a tint of the primary colour with an inset shadow and no border, in every theme (`--qti-placeholder-bg`, `--qti-placeholder-shadow`). Before, the theme left the resting chip there without its label: a bordered white box by default, and a solid block for a brand with filled chips. The rule is a bare `:state(placeholder)` in the `interactions.states` layer, so a brand restyles the hole with the same selector and no specificity contest. Graphic gap match keeps its own placeholder.
