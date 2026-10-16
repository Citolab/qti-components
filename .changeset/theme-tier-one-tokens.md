---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

A small set of tier-1 tokens, modelled on a daisyUI theme block, is now enough to give QTI its own look. They are the public styling API, so they carry the public prefix `cito-`, like the `cito-` events; everything derived from them keeps `qti-`. Everything else is derived from them with `color-mix(in oklab, …)`. See `packages/qti-theme/CONTRACT.md` §8 and [the host notes](../plans/host-migration/README.md).

- **Colours**, in oklch: `--cito-color-base-100` and `--cito-color-base-content` (the surface and what is drawn on it); `--cito-color-primary`, `--cito-color-neutral` and `--cito-color-chip`, each with a `-content` colour that reads on it; and `--cito-color-info`, `--cito-color-success`, `--cito-color-warning`, `--cito-color-error`. The base and neutral colours are `light-dark()` pairs, so an item follows the `color-scheme` of the page it sits in. The theme sets no `color-scheme` itself, so a page that declares none stays light. Two darker surfaces, `--qti-color-base-200` and `-300`, are derived from these.
- **Chips**: `--cito-color-chip` and `--cito-color-chip-content` are a drag chip's fill and text. They default to the surface and the surrounding text (an outlined chip); a brand sets them for filled chips.
- **Radii**: `--cito-radius-field` (text entry, choice, dropdown), `--cito-radius-selector` (checkbox, chip, hottext), `--cito-radius-box` (menu, validation message, modal feedback, rubric block, match table and cards). Selector and box default to the field radius.
- **Sizes**: `--cito-size-selector` (a quarter of a radio or checkbox) and `--cito-size-field` (an inline field's block padding).
- **`--cito-border-width`**, the width of every border. `--qti-border` stays the border shorthand.
- **`--cito-font-family`**, the item's typeface, set on `qti-item-body`. `inherit` by default, so an item keeps the page's font.
- **`--cito-depth`**, 0 (default) or 1: at 1 a chip at rest gets a small lift under it.

Today's names still work. `--qti-primary`, `--qti-primary-fg`, `--qti-success`, `--qti-warning`, `--qti-error`, `--qti-info`, `--qti-bg`, `--qti-border-thickness`, `--qti-border-radius` and `--qti-control-size` are now aliases of the tier-1 tokens, and the rules keep reading them, so a brand that sets them looks as before.

Tints that mixed in sRGB and with `white` (the active surface, the placeholder, the correction and answer-key washes, the validation message, the rubric block) now mix in oklab with the theme's surface, so they follow a dark or tinted base. The difference on a light page is at most 3 of 255 in a channel; the Kennisnet VRT baselines pass unchanged. The literal greys left in the theme (the slider tick, a placed chip's ring in gap-match and graphic-gap-match, the match table's cells, the graphic-order pin) now read the base colours.

`--qti-inline-padding-block` now reads `--cito-size-field` instead of a quarter of `--qti-spacing`. It is the same 0.125rem; a host that changes `--qti-spacing` no longer changes an inline field's block padding with it.

The `--cito-*` tokens are inputs: the theme never declares them, it reads each one (with its default as the fallback) into a `--qti-` name. So a value set on the page reaches every item, including items inside a shadow root that adopts the theme, such as `test-container`. `--cito-color-border` is an optional extra input for a brand that wants every edge in its own colour.
