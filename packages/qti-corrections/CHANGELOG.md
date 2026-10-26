# @qti-components/corrections

## 0.5.0-next.8

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5
  - @qti-components/elements@2.0.0-next.6
  - @qti-components/match-interaction@3.0.0-next.4
  - @qti-components/gap-match-interaction@1.2.1-next.4
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.6
  - @qti-components/associate-interaction@1.1.7-next.4
  - @qti-components/choice-interaction@1.2.0-next.4
  - @qti-components/extended-text-interaction@2.0.0-next.5
  - @qti-components/graphic-associate-interaction@1.1.6-next.4
  - @qti-components/graphic-order-interaction@1.2.2-next.4
  - @qti-components/hotspot-interaction@1.1.6-next.4
  - @qti-components/hottext-interaction@1.2.1-next.4
  - @qti-components/inline-choice-interaction@3.0.0-next.5
  - @qti-components/order-interaction@2.0.1-next.4
  - @qti-components/portable-custom-interaction@1.3.0-next.6
  - @qti-components/select-point-interaction@1.1.6-next.4
  - @qti-components/slider-interaction@1.1.6-next.5
  - @qti-components/text-entry-interaction@1.1.7-next.4
  - @qti-components/interactions@1.10.5-next.7
  - @qti-components/item@1.5.1-next.6
  - @qti-components/test@2.0.0-next.13

## 0.5.0-next.7

### Patch Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`5856bfc`](https://github.com/Citolab/qti-components/commit/5856bfc3bc60075b9c19b9e3a6a77f77ac50a3cd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls look the same on a page that uses a CSS reset, such as Tailwind's preflight.

  A reset like `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }` is a rule of the page, and a page rule beats the `:host` rules of a shadow root, whatever its layer or specificity. `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link`, `test-submit`, `test-check-item` and `test-bookmark` painted their padding and border on the host, so on such a page they lost both: a label against the edge of its fill, and no border.

  The look now sits on an inner element, `<span class="control" part="button">`, in the shadow tree, where the page's `*` does not reach. The host keeps only what a reset leaves alone: its display, the cursor and the radius its focus ring follows. Nothing changes on a page without a reset. The inner element is also a new part: `test-next::part(button)` repaints the control from a host stylesheet.

  `item-show-correct-response`, `item-show-candidate-correction` and `test-show-correct-response` get the same treatment: their padding is on the inner `div`.

  If a host styled the controls by their host box (a `padding` or `border` set on `test-next` itself), that moves to `::part(button)`. The `--test-button-*` slots work as before.

- Updated dependencies [[`7bb058f`](https://github.com/Citolab/qti-components/commit/7bb058ff4a4755677fda7c4a2ebdddac42767f68), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`5856bfc`](https://github.com/Citolab/qti-components/commit/5856bfc3bc60075b9c19b9e3a6a77f77ac50a3cd), [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d), [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`85437ae`](https://github.com/Citolab/qti-components/commit/85437aef3e4febe3c8b1540485bdbfc6f2bc9540)]:
  - @qti-components/processing@1.6.1-next.4
  - @qti-components/base@3.0.0-next.4
  - @qti-components/elements@2.0.0-next.5
  - @qti-components/test@2.0.0-next.12
  - @qti-components/inline-choice-interaction@3.0.0-next.4
  - @qti-components/interactions-core@2.2.0-next.5
  - @qti-components/item@1.5.1-next.5
  - @qti-components/interactions@1.10.5-next.6

## 0.5.0-next.6

### Minor Changes

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-show-correct-response>` is supported again (no longer deprecated) and is now a real button: it has the `button` role, takes focus, and toggles on a click anywhere on it and on Enter or Space. Before, only a click on its inner text worked.

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6), [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/inline-choice-interaction@3.0.0-next.3
  - @qti-components/base@3.0.0-next.3
  - @qti-components/test@2.0.0-next.11
  - @qti-components/interactions@1.10.5-next.5
  - @qti-components/associate-interaction@1.1.7-next.3
  - @qti-components/choice-interaction@1.2.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4
  - @qti-components/extended-text-interaction@2.0.0-next.4
  - @qti-components/gap-match-interaction@1.2.1-next.3
  - @qti-components/graphic-associate-interaction@1.1.6-next.3
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.5
  - @qti-components/graphic-order-interaction@1.2.2-next.3
  - @qti-components/hotspot-interaction@1.1.6-next.3
  - @qti-components/hottext-interaction@1.2.1-next.3
  - @qti-components/match-interaction@2.1.0-next.3
  - @qti-components/order-interaction@2.0.1-next.3
  - @qti-components/portable-custom-interaction@1.3.0-next.5
  - @qti-components/select-point-interaction@1.1.6-next.3
  - @qti-components/slider-interaction@1.1.6-next.4
  - @qti-components/text-entry-interaction@1.1.7-next.3
  - @qti-components/elements@1.10.0-next.4
  - @qti-components/item@1.5.1-next.4
  - @qti-components/processing@1.6.1-next.3

## 0.5.0-next.5

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Compact chips and boxed choices, and the extended-text badge on the end side.

  - **Chips** (order, match, associate) and **choices drawn as boxes** (`qti-input-control-hidden`) have a compact box: `--qti-drag-padding` is ¾ by 1½ spacing units (6px × 12px, was 8px × 0.8em), with the field line height, so they are 38px tall instead of 48px. A boxed choice reads it through the new `--qti-choice-box-padding`. Drops follow the chip they are sized from. Gap-match chips keep their inline-field box; choices with a radio or checkbox are unchanged.
  - **Extended text** reserves the correction gutter at the end of the line instead of the start, and the badge sits there, top end corner. An ungraded answer no longer starts indented by the badge's room.

  Six Kennisnet VRT baselines are regenerated: the four match items and the two order items, whose chips and drops get smaller. The open question is unchanged: that suite does not grade it.

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - One focus ring, on everything you can pick, and a tabular match you can answer from the keyboard.

  - **The ring shows when you pick with the mouse too.** Choices (on the radio or checkbox, or round the box for `qti-input-control-hidden`), hottext, hotspots, graphic order and associate hotspots, select-point points, an inline choice's trigger, the slider and a tabular match cell ring on `:focus`, not only `:focus-visible`. Chips and drops too, except a lifted chip's placeholder. A gap in gap match swaps its dashed edge for the solid ring while it has focus; before, a gap reached with Tab, or by a keyboard drag, showed no focus at all.
  - **Slider:** the ring goes round the knob.
  - **Hottext** has a pointer cursor in every variant.
  - **Tabular match** (`qti-match-tabular`): each cell's radio or checkbox is a real input, visually hidden over the cell, instead of `hidden`. It takes Tab focus; the arrow keys move within a row and Space toggles a checkbox, natively. Before, the grid could not be answered from a keyboard at all. The cell rings inside its edge. The row and column header cells leave the tab order (`tabindex="-1"`).
  - **Corrections:** `qti-simple-choice` registered by the corrections package had a focusable inner control (`tabindex="0"`), so every choice took two Tab presses. One now.

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3
  - @qti-components/match-interaction@2.1.0-next.2
  - @qti-components/select-point-interaction@1.1.6-next.2
  - @qti-components/test@2.0.0-next.9
  - @qti-components/choice-interaction@1.2.0-next.2
  - @qti-components/associate-interaction@1.1.7-next.2
  - @qti-components/extended-text-interaction@2.0.0-next.3
  - @qti-components/gap-match-interaction@1.2.1-next.2
  - @qti-components/graphic-associate-interaction@1.1.6-next.2
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.4
  - @qti-components/graphic-order-interaction@1.2.2-next.2
  - @qti-components/hotspot-interaction@1.1.6-next.2
  - @qti-components/hottext-interaction@1.2.1-next.2
  - @qti-components/inline-choice-interaction@2.0.2-next.2
  - @qti-components/order-interaction@2.0.1-next.2
  - @qti-components/portable-custom-interaction@1.3.0-next.4
  - @qti-components/slider-interaction@1.1.6-next.3
  - @qti-components/text-entry-interaction@1.1.7-next.2
  - @qti-components/interactions@1.10.5-next.4

## 0.4.1-next.4

### Patch Changes

- Updated dependencies [[`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a), [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a)]:
  - @qti-components/portable-custom-interaction@1.3.0-next.2
  - @qti-components/base@2.5.0-next.2
  - @qti-components/elements@1.10.0-next.3
  - @qti-components/processing@1.6.1-next.2
  - @qti-components/interactions@1.10.5-next.3
  - @qti-components/item@1.5.1-next.3
  - @qti-components/test@2.0.0-next.6

## 0.4.1-next.3

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/test@2.0.0-next.5
  - @qti-components/associate-interaction@1.1.7-next.1
  - @qti-components/choice-interaction@1.1.6-next.1
  - @qti-components/interactions-core@2.1.4-next.1
  - @qti-components/extended-text-interaction@2.0.0-next.2
  - @qti-components/gap-match-interaction@1.2.1-next.1
  - @qti-components/graphic-associate-interaction@1.1.6-next.1
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.2
  - @qti-components/graphic-order-interaction@1.2.2-next.1
  - @qti-components/hotspot-interaction@1.1.6-next.1
  - @qti-components/hottext-interaction@1.2.1-next.1
  - @qti-components/inline-choice-interaction@2.0.2-next.1
  - @qti-components/match-interaction@2.0.1-next.1
  - @qti-components/order-interaction@2.0.1-next.1
  - @qti-components/portable-custom-interaction@1.2.1-next.1
  - @qti-components/select-point-interaction@1.1.6-next.1
  - @qti-components/slider-interaction@1.1.6-next.2
  - @qti-components/text-entry-interaction@1.1.7-next.1
  - @qti-components/elements@1.10.0-next.2
  - @qti-components/interactions@1.10.5-next.2
  - @qti-components/item@1.5.1-next.2
  - @qti-components/processing@1.6.1-next.1

## 0.4.1-next.2

### Patch Changes

- Updated dependencies [[`c585b34`](https://github.com/Citolab/qti-components/commit/c585b346a510c533ae253c22335f7d6f578dda42)]:
  - @qti-components/test@2.0.0-next.4

## 0.4.1-next.1

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/test@1.10.0-next.1
  - @qti-components/base@2.4.1-next.0
  - @qti-components/associate-interaction@1.1.7-next.0
  - @qti-components/choice-interaction@1.1.6-next.0
  - @qti-components/interactions-core@2.1.4-next.0
  - @qti-components/extended-text-interaction@2.0.0-next.1
  - @qti-components/gap-match-interaction@1.2.1-next.0
  - @qti-components/graphic-associate-interaction@1.1.6-next.0
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.1
  - @qti-components/graphic-order-interaction@1.2.2-next.0
  - @qti-components/hotspot-interaction@1.1.6-next.0
  - @qti-components/hottext-interaction@1.2.1-next.0
  - @qti-components/inline-choice-interaction@2.0.2-next.0
  - @qti-components/match-interaction@2.0.1-next.0
  - @qti-components/order-interaction@2.0.1-next.0
  - @qti-components/portable-custom-interaction@1.2.1-next.0
  - @qti-components/select-point-interaction@1.1.6-next.0
  - @qti-components/slider-interaction@1.1.6-next.1
  - @qti-components/text-entry-interaction@1.1.7-next.0
  - @qti-components/elements@1.10.0-next.1
  - @qti-components/interactions@1.10.5-next.1
  - @qti-components/item@1.5.1-next.1
  - @qti-components/processing@1.6.1-next.0

## 0.4.1-next.0

### Patch Changes

- Updated dependencies [[`8984eab`](https://github.com/Citolab/qti-components/commit/8984eab2eacc6b7d7a9b9454c3c21334cb18dfc3), [`4476095`](https://github.com/Citolab/qti-components/commit/4476095f7cb1939ce780980f3a7a3317fc86c5c0), [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3), [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3), [`0fb1914`](https://github.com/Citolab/qti-components/commit/0fb19146d8015e6b76a576671adea0d92051d891)]:
  - @qti-components/extended-text-interaction@2.0.0-next.0
  - @qti-components/graphic-gap-match-interaction@1.1.6-next.0
  - @qti-components/test@1.10.0-next.0
  - @qti-components/elements@1.10.0-next.0
  - @qti-components/slider-interaction@1.1.6-next.0
  - @qti-components/interactions@1.10.5-next.0
  - @qti-components/item@1.5.1-next.0

## 0.4.0

### Minor Changes

- [#217](https://github.com/Citolab/qti-components/pull/217) [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Add `view` to `<qti-item>`, so view-tagged content — a scorer's `qti-rubric-block` above all — can be shown on an item delivered outside a test.

  QTI tags content with the audience it is for, and `item.css` hides every `[view]` element until something marks it `.show`. Only `TestViewMixin` ever did, off `sessionContext.view`. An item delivered on its own has no session, and nothing at item level did it either: `packages/qti-item` contained no occurrence of `view` at all. So the hide shipped in the _item_ stylesheet without its matching show, and a `qti-rubric-block view="scorer"` in a standalone item could not be displayed by any public API — the marker saw the question and nothing to mark against.

  The asymmetry was visible in this repo's own layout. `qti-corrections` has an item-level counterpart for every test-level correction control (`item-show-correct-response`, `item-show-candidate-correction`, `item-correct-response-mode`), but nothing matching `test-view`. And the Kennisnet VRT stories author `qti-rubric-block view="scorer"` into bare `qti-item-body` fragments with no test in the tree, where those blocks can never render.

  `ItemViewMixin` closes it, as the item-level twin of `TestViewMixin`:

  ```html
  <qti-item view="scorer">
    <item-container item-url="./path/to/item.xml"></item-container>
  </qti-item>
  ```

  It resolves the view on every change and whenever an item connects, toggling `.show` on `[view]` content inside the item, and accepts an `item-switch-view` event so a child control can drive it. A plain property rather than a session context: a session is precisely what a standalone item does not have.

  `QtiItemCorrection` pairs `scorer` with the answer key through the mixin's `updateAssessmentItemView` hook, which is byte-for-byte what `QtiTestCorrection` already does inside a test — so a marker switching view gets the rubric and the key together instead of asking for them separately. Without `@qti-components/corrections` loaded the mixin reveals the rubric and paints nothing else.

  One theme change comes with it: the structural rule is now `[view]:not(qti-item)`. `view` on content marks who it is for, but on the host it says which audience to resolve, and without the exclusion `<qti-item view="scorer">` would hide the item it configures wherever the sheet reaches the host — which it does in a shadow root that adopts `item.css` above `qti-item` rather than inside `item-container`. Both rules moved up one specificity point together, so their order relative to each other is unchanged.

  There is no item-level equivalent of `<test-view>` or `<test-view-toggle>` yet; `item-switch-view` is the hook for one.

### Patch Changes

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205), [`aee42e6`](https://github.com/Citolab/qti-components/commit/aee42e664e5c2dce5630cce0493118bff8655e7c), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/processing@1.6.0
  - @qti-components/base@2.3.0
  - @qti-components/elements@1.8.0
  - @qti-components/interactions-core@2.1.3
  - @qti-components/test@1.7.0
  - @qti-components/graphic-order-interaction@1.2.1
  - @qti-components/item@1.5.0

## 0.3.0

### Minor Changes

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reveal the solution after an ended attempt when `show-solution` says so.

  `test-navigation` settles item doneness on an ended attempt and hands it to a new
  `afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
  needed because the computed context only catches up on the next update, after the event has finished
  bubbling.

  `TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
  an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
  The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
  corrections rendering, not to item session control.

### Patch Changes

- Updated dependencies [[`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/interactions-core@2.1.1
  - @qti-components/test@1.6.0
  - @qti-components/base@2.2.0
  - @qti-components/elements@1.7.0
  - @qti-components/processing@1.4.1
