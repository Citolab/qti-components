---
'@qti-components/theme': minor
'@qti-components/interactions-core': minor
'@citolab/qti-components': minor
---

One focus ring, and a neutral border by default.

- **Neutral border.** `--qti-border-color` is a grey derived from the base colours (`color-mix(in oklch, var(--qti-color-base-content) 45%, var(--qti-color-base-100))`, about 3.3:1 on white) instead of the primary colour, so fields, choices, tables and drops are no longer drawn in the brand blue at rest. The primary still marks what is active or selected. A brand that wants its colour on every edge sets `--qti-border-color: var(--qti-primary)`, as the Kennisnet sheet now does.
- **One focus ring.** `@mixin foc` is an `outline` (`--qti-focus-border-width` in `--qti-focus-color`, now the primary colour, `--qti-focus-offset` outside the box) on `:focus-visible`, not a `box-shadow` on `:focus`. A mouse click on a choice or a chip no longer shows a ring, and a focused chip keeps its lift. The theme no longer writes `outline: none` anywhere.
  - A text entry is ringed on its host (`:focus-within`), around the border you see; the input inside draws no ring of its own (Chrome drew an orange one). An extended text is ringed on its textarea, an inline choice on its trigger, pushed out past the field's border (`--qti-focus-offset-past-border`) so it sits where a text entry's does. Rows in the inline choice menu are ringed inside (`--qti-focus-offset-inset`), because the menu clips.
  - A choice with a radio or checkbox shown rings the control, as a native one does. A choice drawn as a box (`qti-input-control-hidden`) rings the whole box.
  - A stacked choice is pulled out by the ring's reach less (`--qti-choice-outdent`), so the ring round its radio stays inside the column.
  - Associate's bank chip gets the theme's ring; before, only a placed chip did.
- **`qti-simple-choice` takes focus on its host.** It no longer delegates focus into its shadow root, and its `part="control"` no longer has a `tabindex`. The host already carried `tabindex="0"` and handled the keys. Delegating meant the host never matched `:focus-visible`, so a theme could not ring it, and a choice whose control is hidden (`qti-input-control-hidden`) had nothing to delegate to and could not be reached with Tab at all. `document.activeElement` is the choice, as before.

The two Kennisnet multiple-choice VRT baselines are regenerated: their radios and checkboxes sit 4px further right, inside the prose edge, so a focus ring round them stays inside the column. Nothing else in the suite moved.
