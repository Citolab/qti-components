---
'@qti-components/theme': major
'@qti-components/test': major
'@qti-components/elements': major
'@qti-components/select-point-interaction': minor
'@citolab/qti-components': major
---

The public prefix is `qc-` (qti-components); `cito-` is its old name and keeps working for one major.

- **Theme inputs:** `--cito-color-primary` → `--qc-color-primary`, and so on for every tier-1 input
  (CONTRACT §8). The theme reads `var(--qc-x, var(--cito-x, <default>))`, so a page that sets only
  the old name is unchanged. Four inputs that still carried the `qti-` prefix get their public name:
  `--qc-spacing` (was `--qti-spacing`), `--qc-motion`, `--qc-line-height` (was
  `--qti-field-line-height`), `--qc-color-text` (was `--qti-fg`), plus `--qc-border-style`.
- **Fewer inputs:** `--cito-color-well`, `--cito-shadow-drag` and `--cito-color-marker` are no longer read
  (a well is the surface colour, the in-flight shadow and the marker colour derive from the text colour
  and the primary; a brand that wants another paints `.qti-well` or `::part(point)`). Tier 1 is 36
  inputs.
- **A quieter handle:** the default grip is one column of dots in a faded text colour, narrower and
  closer to the label, so the word is what a chip shows; `--qc-size-drag-icon` sets the handle's width
  for a brand with a wider icon.
- **Two faces:** `--qc-font-family-heading` sets the font of `h1`–`h6` in an item alone; unset, headings
  keep the reading font (`--qc-font-family`). The Cito preset uses PT Sans for headings only.
- **Events:** every public event `cito-*` is dispatched and handled as `qc-*` (`qc-test-navigated`,
  `qc-item-outcome-changed`, `qc-feedback-show`, …); the `cito-*` name is still sent and listened to
  for one major. The 7.x names (`qti-request-navigation`, `test-end-attempt`, `on-test-switch-view`,
  `qti-outcome-changed`, …) are no longer sent.
- **Buttons:** the test controls and the button-like interactions (end attempt, upload) read one slot
  set, `--button-*` (`--button-background-color`, `--button-color`, `--button-border-color`,
  `--button-hover-background-color`, `--button-active-background-color`, `--button-size`,
  `--button-border-radius`, `--button-primary-*`, `--button-selected-*`). `--test-button-*` are the
  old names, read as fallbacks for one major. The selected text-to-speech button carries
  `:state(selected)`.
- **Internal, documented as such:** `qti-variables.css` is one block, one line per token, with the
  old spellings (`--qti-bg`, `--qti-border-thickness`, `--qti-correct`, …) kept as aliases;
  `qti-mixins.css` keeps the mixins that carry an idea and inlines the rest (the paint role `button`
  is now `choice`); the empty `qti-components.overrides` layer is gone (write unlayered CSS or
  `@layer qti-extended`); `qti-components.interactions.brand` stays as the one theme layer a brand
  may write into.
- **The override contract** is CONTRACT §11 and the docs page "Styling and theming": set `--qc-*`;
  override on parts and states, unlayered; put that CSS in the container's `<template><style>`.

Host notes: `plans/host-migration/kennisnet.md`, `citotestuit.md`, `examenkompas.md`, `peilinglezen.md`.
