# @qti-components/graphic-gap-match-interaction

## 1.1.6-next.4

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.6-next.3

### Patch Changes

- [#305](https://github.com/Citolab/qti-components/pull/305) [`f700c5d`](https://github.com/Citolab/qti-components/commit/f700c5d4d0acd4219797211b1078c539fa43c62c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Graphic gap match: when the graphic is drawn narrower than its declared width, the drop areas and the gap images now scale with it. The measured chip size no longer acts as each hotspot's minimum size (a hotspot's box is its `coords`), gap images scale by the graphic's factor (`--qti-graphic-scale`) in the bank and in the hotspot, and the drag clone accounts for that zoom so a drop lands where it is aimed.
- Updated dependencies [[`f700c5d`](https://github.com/Citolab/qti-components/commit/f700c5d4d0acd4219797211b1078c539fa43c62c)]:
  - @qti-components/interactions-core@2.1.4-next.2

## 1.1.6-next.2

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.1.6-next.1

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0

## 1.1.6-next.0

### Patch Changes

- [#283](https://github.com/Citolab/qti-components/pull/283) [`4476095`](https://github.com/Citolab/qti-components/commit/4476095f7cb1939ce780980f3a7a3317fc86c5c0) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make `qti-graphic-gap-match-interaction` fit its container, with its drop areas scaling along — as `qti-hotspot-interaction` already does.

  **The graphic overflowed, and its drop areas could not follow it.** An item declares the graphic at the size its `coords` were authored in — often a full-resolution picture, `width="1600"`. The interaction rendered it at exactly that size, so in a two-column layout or on a phone it ran far past its column. Capping the picture alone would not have helped: the drop areas were written as pixel offsets (`left: 79px`), so a narrower picture would have left them on the wrong part of it.

  The drop areas are now placed with `positionShapes`, the helper the hotspot interaction uses: percentages of the graphic's declared size, inside a slot that is exactly the graphic's box. The graphic takes `max-width: 100%; height: auto` and keeps the aspect ratio its width/height attributes declare (pinned as `aspect-ratio`, because an `<object>` derives none from its attributes and an `<img>` defers to its bitmap's). It never upscales. `ellipse` and `poly` drop areas, which the pixel code skipped, are positioned too.

  The theme restates the fluid sizing for the graphic (a direct child of the interaction), because `reset.css` gives every picture inside an interaction `max-width: none`, which outranks the component's `::slotted()` rule. A draggable's own picture is untouched and keeps the same size in the bank and in its drop area.

  With `qti-choices-left` / `qti-choices-right` the image slot is now capped at 75% instead of forced to it, so it stays the graphic's box.

  Not covered: a drop area still grows to fit the largest draggable (`--qti-dropzone-min-*`), so on a heavily scaled graphic a small drop area can be larger than its authored shape. `qti-hotspot-interaction` has the same `reset.css` override issue and is left for a separate change.
