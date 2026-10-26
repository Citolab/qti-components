# @qti-components/theme

## 2.3.0-next.5

### Minor Changes

- [#346](https://github.com/Citolab/qti-components/pull/346) [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3) Thanks [@herrKlein](https://github.com/herrKlein)! - The default theme gives rubric blocks and feedback a look of their own, makes its cards white, and gives its focus ring a colour.

  - `qti-rubric-block`: a light-grey callout with a thick grey border on its start side, instead of the blue info border.
  - `qti-feedback-block`, `qti-feedback-inline`, `qti-modal-feedback`: one look, a light-grey bubble with large rounded corners, no border and a hard darker shadow below it; inline feedback is the same as a pill and keeps the height of its line. Rubric and feedback are told apart by shape, so it holds in black and white.
  - `.qti-well` is white by default (it was a light tint), for items on a light-grey page. `--cito-color-well` still sets another fill.
  - The focus ring is a mid blue in the default theme (3:1 against both surfaces). A brand that sets `--cito-color-primary` keeps its primary as the ring, as before; `--cito-color-focus` sets the ring on its own.

## 2.3.0-next.4

### Patch Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - The open inline choice menu reads as one shape with the field: one border on the seam instead of the field's and the menu's stacked, and square corners at the bottom of the menu.

  With an empty `data-prompt`, the empty prompt row is no longer shown while nothing is chosen. Once a choice is made, that row is a clear button (an x glyph) that empties the answer again; its accessible name is `Clear`, overridable with `data-clear-label`.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`b1cb7e9`](https://github.com/Citolab/qti-components/commit/b1cb7e90df09765608e1ffe2d766e7974883f8a2) Thanks [@herrKlein](https://github.com/herrKlein)! - A select-point picture scales with its column by default. The component already sized the slotted picture `max-width: 100%; height: auto`, but the item theme's reset gives every picture inside an interaction `max-width: none`, a light-DOM rule that outranks `::slotted()`, so a 1024px picture overflowed a narrower column. The theme now restates the fluid sizing for the select-point picture (a direct child), as it does for graphic-gap-match. A picture smaller than its column keeps its own size. Clicks are still recorded in the picture's own pixels (its `width`/`height`) and markers placed in percentages, so the answer is the same at any displayed size.

## 2.3.0-next.3

### Minor Changes

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-layout-col*` columns now stack when their `qti-layout-row` is 767px wide or less, instead of when the viewport is. An item in a narrow pane or beside other content on a wide screen now collapses to one column too. The row is a size container (`container-type: inline-size`), so it must not be placed in a shrink-to-fit parent.

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - Four optional tier-1 inputs, so a brand can be made of tokens alone: `--cito-shadow-chip` sets a chip's resting lift (the shadow `--cito-depth` works out otherwise), and `--cito-color-order-placed`, `--cito-color-order-placed-content` and `--cito-color-order-placed-border` give an order interaction's placed chip a look of its own, and `--cito-color-well` fills a `.qti-well` (the base-200 tint otherwise). Unset, nothing changes.

## 2.3.0-next.2

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The default theme is black and white, and dark mode works.

  - **Black and white.** The default `--cito-color-primary` is the text colour itself: near-black on a light page, near-white on a dark one, with `--cito-color-primary-content` the opposite. A selected choice is a black fill with white text; the focus ring, the active border, the drop highlight and the placeholder tint follow. Only the four state colours keep their hue, because they carry meaning (answer key, correct, partially correct, incorrect). A brand sets its colour with `--cito-color-primary`; a brand that sets `--qti-primary` still wins, as before.
  - **Dark mode.** `qti-item-body` now takes its text colour from `--cito-color-base-content`, a `light-dark()` pair, so the words flip together with the surfaces when the page's `color-scheme` is dark. Before, an item inherited the page's text colour, which left dark text on dark fields on a page that had not set its own. The dark surfaces are neutral greys now (`oklch(20% 0 none)` and `oklch(96% 0 none)`) instead of a blue-tinted slate.

  **Hosts:** item text is the theme's colour now, not the page's. A host that wants its own body text colour in items sets `--cito-color-base-content`.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Chips answer the pointer more clearly, and the drop a chip will land in shows.

  - **Hover:** a chip's edge takes the active border colour under the pointer (`--qti-border-active`); its fill stays. Before, 8% of the text colour was mixed into the fill, which turned every white chip grey. Only on a fine pointer that can hover.
  - **Focus ring on release:** a chip shows its focus ring once the button is released, not while it is pressed (`:focus:not(:active)`), because a press may be the start of a drag.
  - **Placeholder:** the hole a lifted or placed chip leaves hides the chip's handle too, not only its text. A theme that colours its handles (`--cito-color-drag-icon`) left the handle standing in the hole.
  - **Drop target under the chip:** while you drag, the drop the chip is over gets the highlight fill and a ring in the active border colour just outside its edge (new `@mixin drop-over`), in order, associate, match, gap match and graphic gap match. The drag code already flagged that target (`:state(hover)`, or `::part(hover)` on order and associate slots), but the faint wash every droppable target gets (`enabled`) came later in each stylesheet and painted over it.
  - **No hover on other chips during a drag:** the chips a dragged chip passes over keep their resting edge while the interaction is in `:state(dragzone-active)`.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A choice selects the moment it is pressed.

  - **`qti-simple-choice` activates on `pointerdown`** (primary button), not on release: holding a choice down already shows it selected. The `click` that follows is swallowed, so a checkbox does not toggle back. Keyboard (Space, Enter) and a programmatic `.click()` work as before. A choice used as a drag chip (order interaction, `qti-draggable`) still waits for the click, because there a press starts the drag. `ActiveElementMixin` takes this as an option, `ActiveElementMixin(Base, type, { activateOn: 'press' })`; the default stays `'click'`.
  - **No grey press tint on choices and chips.** The selection is a choice's press feedback now, and a chip's is its drag; the `:active` wash on top of either is gone. The test controls keep theirs, because they act on release.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Compact chips and boxed choices, and the extended-text badge on the end side.

  - **Chips** (order, match, associate) and **choices drawn as boxes** (`qti-input-control-hidden`) have a compact box: `--qti-drag-padding` is ¾ by 1½ spacing units (6px × 12px, was 8px × 0.8em), with the field line height, so they are 38px tall instead of 48px. A boxed choice reads it through the new `--qti-choice-box-padding`. Drops follow the chip they are sized from. Gap-match chips keep their inline-field box; choices with a radio or checkbox are unchanged.
  - **Extended text** reserves the correction gutter at the end of the line instead of the start, and the badge sits there, top end corner. An ungraded answer no longer starts indented by the badge's room.

  Six Kennisnet VRT baselines are regenerated: the four match items and the two order items, whose chips and drops get smaller. The open question is unchanged: that suite does not grade it.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A disabled interaction looks disabled.

  - **Disabled paints in one muted grey**, `--qti-color-disabled` (40% of the text colour into the surface): its text, edges, controls, chips and handles, and the mark of what is selected, which stays visibly selected. Not opacity, which faded the selected answer with the rest and let the background through. It applies to every interaction with the `disabled` attribute and to a single choice with `:state(disabled)`, by re-valuing the paint tokens on that element (`interactions/qti-disabled.css`). Before, only the cursor changed. Corrections still show their verdict colours.
  - **Readonly is unchanged**: full look, only the cursor, so an answered test in review stays readable.
  - **A disabled choice takes no focus** from a mouse press (`ActiveElementMixin`), as a disabled native control does; before, a click on it showed the focus ring.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A theme sets a chip's handle and edge.

  - **Drag handle:** six small round dots by default (was six square blocks). Set the shape with the new optional input `--cito-icon-drag` (a mask `url()`) and its colour with `--cito-color-drag-icon` (the chip's text colour by default). A correction still recolours the handle along with the chip.
  - **Chip edge:** `--cito-color-chip-border` (new, optional) is a drag chip's border colour; `transparent` gives borderless cards. It defaults to the component border, as before.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - One focus ring, on everything you can pick, and a tabular match you can answer from the keyboard.

  - **The ring shows when you pick with the mouse too.** Choices (on the radio or checkbox, or round the box for `qti-input-control-hidden`), hottext, hotspots, graphic order and associate hotspots, select-point points, an inline choice's trigger, the slider and a tabular match cell ring on `:focus`, not only `:focus-visible`. Chips and drops too, except a lifted chip's placeholder. A gap in gap match swaps its dashed edge for the solid ring while it has focus; before, a gap reached with Tab, or by a keyboard drag, showed no focus at all.
  - **Slider:** the ring goes round the knob.
  - **Hottext** has a pointer cursor in every variant.
  - **Tabular match** (`qti-match-tabular`): each cell's radio or checkbox is a real input, visually hidden over the cell, instead of `hidden`. It takes Tab focus; the arrow keys move within a row and Space toggles a checkbox, natively. Before, the grid could not be answered from a keyboard at all. The cell rings inside its edge. The row and column header cells leave the tab order (`tabindex="-1"`).
  - **Corrections:** `qti-simple-choice` registered by the corrections package had a focusable inner control (`tabindex="0"`), so every choice took two Tab presses. One now.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Words on an image, and points in the right place.

  - **Select point:** a response given in the markup (`response="203 159"`) now shows its marker where it belongs. It was rendered before the image's size was read and placed against a width of 1, thousands of percent off the image.
  - **Graphic gap match with words:** a `qti-gap-text` chip is a label box, the inline-field box that gap-match chips have, in the bank and once placed on the image; an image tile (`qti-gap-img`) stays plain. A placed word carries the part `drag drag-text` (new) next to `drag`, so a theme can tell a word from a tile. A placed chip no longer shrinks in a hotspot narrower than it (`qti-associable-hotspot`). An empty hotspot shows a dashed edge at rest, unless the interaction has `qti-unselected-hidden`.
  - **Select point marker on any picture:** the marker gets a halo that follows its colour, white round a dark marker and black round a light one (lightness below or above 0.7, derived with relative colour syntax), so it stays visible on a dark or busy image. Set the colour with the new optional input `--cito-color-marker` (the primary by default) and the shape with `--cito-icon-marker` (a mask; the pin by default), with `--cito-marker-anchor` saying where that shape points: `-100%` stands it on the point by its bottom, like the pin, `-50%` centres it, for a ring or a star. `--qti-select-point-halo` overrides the derived halo. The marker's shape is now drawn by its `::before`, so the halo can follow it.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Everything that sits in a sentence has one box. A text entry, an inline choice, a hottext, a gap-match chip and the gap it goes into are all the same height as a line of text (`--qti-line-height`, 30px at 16px), with the same padding: `--qti-inline-padding-block` above and below (`--cito-size-field`, 2px) and the new `--qti-inline-padding-inline` either side (one `--qti-spacing`, 8px). They share the field line height (`--qti-field-line-height`) too.

  - **Inline choice** was about 6px shorter than a text entry: its trigger had `line-height: normal`.
  - **Text entry and inline choice** have 8px either side instead of 16px; their correction badge sits 8px from the end, the same distance.
  - **Hottext** takes the inline-field padding (was 2px 4px) and margins, so a word to select is the size of a field.
  - **Gap match** chips take the inline-field padding instead of a chip's 8px × 0.8em, in the bank and in a gap, so a sentence with gaps is no taller than one without. A gap draws its dashed edge as an inset outline, not a border, so it is exactly the chip's size.

  Six Kennisnet VRT baselines are regenerated: the two text entry items, the dropdown, the two hottext items and the gap-match item. Those with gaps or hottext get shorter (the gap-match item from 608px to 462px).

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - One focus ring, and a neutral border by default.

  - **Neutral border.** `--qti-border-color` is a grey derived from the base colours (`color-mix(in oklab, var(--cito-color-base-content) 45%, var(--cito-color-base-100))`, about 3.3:1 on white) instead of the primary colour, so fields, choices, tables and drops are no longer drawn in the brand blue at rest. The primary still marks what is active or selected. A brand that wants its colour on every edge sets `--qti-border-color: var(--qti-primary)`, as the Kennisnet sheet now does.
  - **One focus ring.** `@mixin foc` is an `outline` (`--qti-focus-border-width` in `--qti-focus-color`, now the primary colour, `--qti-focus-offset` outside the box) on `:focus-visible`, not a `box-shadow` on `:focus`. A mouse click on a choice or a chip no longer shows a ring, and a focused chip keeps its lift. The theme no longer writes `outline: none` anywhere.
    - A text entry is ringed on its host (`:focus-within`), around the border you see; the input inside draws no ring of its own (Chrome drew an orange one). An extended text is ringed on its textarea, an inline choice on its trigger, pushed out past the field's border (`--qti-focus-offset-past-border`) so it sits where a text entry's does. Rows in the inline choice menu are ringed inside (`--qti-focus-offset-inset`), because the menu clips.
    - A choice with a radio or checkbox shown rings the control, as a native one does. A choice drawn as a box (`qti-input-control-hidden`) rings the whole box.
    - A stacked choice is pulled out by the ring's reach less (`--qti-choice-outdent`), so the ring round its radio stays inside the column.
    - Associate's bank chip gets the theme's ring; before, only a placed chip did.
  - **`qti-simple-choice` takes focus on its host.** It no longer delegates focus into its shadow root, and its `part="control"` no longer has a `tabindex`. The host already carried `tabindex="0"` and handled the keys. Delegating meant the host never matched `:focus-visible`, so a theme could not ring it, and a choice whose control is hidden (`qti-input-control-hidden`) had nothing to delegate to and could not be reached with Tab at all. `document.activeElement` is the choice, as before.

  The two Kennisnet multiple-choice VRT baselines are regenerated: their radios and checkboxes sit 4px further right, inside the prose edge, so a focus ring round them stays inside the column. Nothing else in the suite moved.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The chip you drag is opaque and raised.

  - **No more half-transparent clone.** The drag code no longer writes `opacity: 0.8` on the clone, and a dropped chip no longer fades in from 0.8. It also no longer copies the chip's resting `box-shadow` onto the clone inline, where it outranked the theme.
  - **The theme raises it.** A chip in flight (`[data-drag-clone]`) takes `--qti-drag-elevation`, a soft shadow from the text colour. Set your own with the new optional input `--cito-shadow-drag` (any `box-shadow`, `none` for flat). A graphic-gap-match image tile stays as it is.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The hole a lifted or spent chip leaves is a tint of the primary colour with an inset shadow and no border, in every theme (`--qti-placeholder-bg`, `--qti-placeholder-shadow`). Before, the theme left the resting chip there without its label: a bordered white box by default, and a solid block for a brand with filled chips. The rule is a bare `:state(placeholder)` in the `interactions.states` layer, so a brand restyles the hole with the same selector and no specificity contest. Graphic gap match keeps its own placeholder.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-well` and `qti-bordered` are drawn by the theme.

  The QTI 3 shared CSS the theme ships (vocabulary §2.12) leaves their colours to hooks it never defines, so a `.qti-bordered` box drew no border at all (its `border` declaration pointed at an undefined `--table-border-color` and was dropped), and a `.qti-well` got its padding and nothing else. The theme now fills those hooks from its own tokens: `--table-border-color` is `--qti-border-color`, `--foreground` the text colour, and a well is `--qti-color-base-200` inside `--qti-border` with no inset shadow (`--well-bg`, `--well-border`, `--well-box-shadow`). Its corner follows `--qti-radius-box` instead of a fixed 4px. A brand that restyles its borders restyles both with them.

  One Kennisnet VRT baseline is regenerated: _Woorden selecteren (niet herkenbaar)_ wraps its sentences in `qti-bordered`, which now shows its border (4px taller).

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Items read more comfortably by default: a taller line height, columns that start level, choices aligned with the prose, and air around inline fields.

  - **Line height.** `qti-item-body` sets `line-height: var(--qti-line-height)`. Browsers and normalize sheets leave it at about 1.15, which put every sentence against the next. The token is derived from the height of an inline field (a field line, plus its block padding and border, about 30px for 16px text), so a line holding a text entry is no taller than the lines around it. Rendered items only: an editor document keeps its own. Re-value `--qti-line-height` to change it, or set it to `normal` to get the old look back. **Items get taller**, from 2% for a short item to about 30% for a matrix or a hottext, so a host that fixes the height of an item box may need more room.
  - **Aligned tops.** A `qti-prompt` no longer carries space above itself, and the first child of a `qti-layout-col*` starts at the column's top edge. Side-by-side columns line up whatever opens them: a heading, a paragraph or an interaction.
  - **Inline elements.** `qti-text-entry-interaction`, `qti-inline-choice-interaction` and `qti-gap` get `var(--qti-inline-gap)` of margin on both sides (a quarter of the spacing unit), so they no longer touch the words around them. Text entry and inline choice also take a block padding of `var(--qti-inline-padding-block)` (a quarter of the spacing unit, not a whole one), so the line holding a field stays close to the height of the lines around it. Both tokens are re-valued on the host or any ancestor.
  - **Choices line up with the text.** A choice with a visible control is pulled out by the room it reserves for its selected paint (`--qti-choice-outdent`, its padding plus its border), so the radio or checkbox sits on the same edge as the paragraphs around it and the selected paint reaches into the gutter. Set `--qti-choice-outdent: 0` for the old indent, or inside a box that clips its content.
  - **Choice spacing.** `qti-choice-interaction` no longer puts a fixed `10px` between its choices: its gap is `--qti-choice-gap`, `0` by default, because each choice's own padding already spaces a list. The theme sets it to the spacing unit for choices drawn as boxes (`qti-input-control-hidden`), where the visible borders need air between them.

  The Kennisnet VRT baselines are regenerated: every item is 8px to 310px taller, and stacked choices sit one padding further left, level with the prompt.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls take their colours from the theme, and everything a candidate presses answers the press.

  - **Test controls** (`test-next`, `test-prev`, item and section links, submit, check, end attempt, bookmark, the text-to-speech buttons) read the theme's tier-1 tokens instead of literal colours. The neutral button is the page's surface (`--cito-color-base-100`) with the theme's border; `test-next` is filled with `--cito-color-neutral` and labelled in `--cito-color-neutral-content`. Hover and press mix the content colour into the fill (`--qti-hover-mix`, `--qti-active-mix`). Without the theme they fall back to the system colours `Canvas`, `CanvasText` and `Highlight`, so they follow the page's `color-scheme`. Every `--test-button-*` slot still works; new are `--test-button-active-background-color` and `--test-button-primary-active-background-color`. Hover now applies only on a device with a fine pointer, so it no longer sticks after a tap.
  - **A press is visible.** Test controls, choices and chips (gap-match, match, associate, order) darken a little while pressed (`@mixin press`), paint only.
  - **Text to speech.** The highlights are see-through tints of `--cito-color-info` (the element being read) and `--cito-color-warning` (the word being spoken), re-valued with `--test-tts-element-highlight` and `--test-tts-word-highlight`. A pressed TTS button falls back to `Highlight` without the theme.
  - **A choice with a radio or checkbox shown has no fill**: it shows the page behind it, not the theme's white surface. Its selection and its correction are painted on the radio or checkbox, as before. A choice drawn as a box (`qti-input-control-hidden`) keeps its fill. While pressed, a chip that has been lifted (its placeholder) does not darken.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A small set of tier-1 tokens, modelled on a daisyUI theme block, is now enough to give QTI its own look. They are the public styling API, so they carry the public prefix `cito-`, like the `cito-` events; everything derived from them keeps `qti-`. Everything else is derived from them with `color-mix(in oklab, …)`. See `packages/qti-theme/CONTRACT.md` §8 and [the host notes](../plans/host-migration/README.md).

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

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The theme's tokens are sorted into tiers, written down in `packages/qti-theme/CONTRACT.md` §8: tier 1 are the brand knobs (the only tokens with literal values), tier 2 is derived from them, tier 3 are the variables the theme hands to a component. In `qti-variables.css` a tier-1 token is tagged `/* t1 */`.

  Every token block is now also declared on `[data-qti-theme]`. Set tier-1 tokens on an element with that attribute and the derived tokens inside it follow, so a part of a page can carry its own theme. Before, a derived token such as `--qti-bg-active` kept the value worked out at `:root`, whatever an ancestor of the item set.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - End attempt and upload look like the test controls.

  - **End attempt:** its button (`::part(button)`) is drawn like Previous and the item links: the theme's surface, border and radius, with the same hover, press and focus ring, and muted when disabled. It was the browser's default button.
  - **Upload:** the file input carries a new part, `input`, and its button (`::part(input)::file-selector-button`) is drawn the same way; the file name beside it takes the item's type and colour.
  - Both read the `--test-button-*` slots with the test controls' defaults, through the new `@mixin test-button`, so a host that repaints its test buttons repaints these too.

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Radio and checkbox marks sit dead centre at any size, and a plain hottext has the field surface.

  - **Marks:** `--qti-control-size` and the marks drawn inside a control (the radio's dot, the checkbox's tick box) are rounded to an even number of pixels. At a fractional size (19.2px with `--cito-size-selector: 0.3em`) the gap round the dot was fractional, the ring and the dot antialiased differently, and the dot looked off centre. At the default 16px nothing changes.
  - **Hottext:** a hottext without `qti-input-control-hidden` or `qti-unselected-hidden` fills with the field surface (`--qti-bg`), as a text entry does, so on a tinted page or in a theme without borders a word still shows it can be picked. On a white page nothing changes.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A chip placed in a drop now gets the theme's hover, press and focus ring (gap-match, match, associate, order). These rules were nested under `::part(drag)` and compiled to `:is(…::part(drag)):hover`, a selector the browser drops because a pseudo-element cannot sit inside `:is()`. They are written flat now and sit in the `interactions.states` layer, after the chip's own paint, so the hover and press tint win over it. A placed chip reached with Tab shows one solid `--qti-focus-color` outline. The order interaction's drop shows the theme ring on `:focus-visible` too. Two nested attribute rules after `::part()` (`[dragging]` on a placed chip, `[enabled]` on an order drop) are removed; they could never match.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The theme's keyboard focus ring now shows on the placed chip in graphic-gap-match and on the point in select-point. Those rules were nested under `::part()` and compiled to `:is(…::part(…)):focus-visible`, which matches nothing in any browser; they are written as one selector now. Graphic-gap-match bank chips and match targets get the theme ring too, where they showed the browser's default ring: they had no focus rule, and match's ring sat on the drop part, which never takes focus.

  The build no longer wraps a `:state()` that follows `::part()` in its `[data-state]` fallback (`::part(drag):is(:state(x), [data-state~='x'])`). That form worked only because browsers parse `:is()` forgivingly; it is now emitted as plain `::part(drag):state(x)`, in a rule of its own when it shared a selector list with other selectors. No visible change.

## 2.3.0-next.1

### Minor Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - The PCI iframe no longer loads anything from a public CDN. RequireJS (2.3.8, minified) and the QTI 3 shared vocabulary stylesheet (`native.css`: `qti-layout-row`, `qti-well`, `qti-padding-*`, …) are inlined into the iframe from this version of qti-components. It used to load RequireJS from cdnjs, and the whole qti-components bundle and `item.css` from unpkg (`@latest`). That bundle and the full `item.css` are not needed to run a PCI and are no longer loaded by default: a host that wants them in the iframe names its own copy with `data-components-cdn-url` / `data-components-css-url` (for example its own build of `@citolab/qti-components/cdn/index.js` and `item.css`). `data-require-js-url` still loads a different RequireJS instead of the inlined one. `@qti-components/theme` exports the vocabulary sheet as text: `@qti-components/theme/native-css`.

## 2.2.2-next.0

### Patch Changes

- [#283](https://github.com/Citolab/qti-components/pull/283) [`4476095`](https://github.com/Citolab/qti-components/commit/4476095f7cb1939ce780980f3a7a3317fc86c5c0) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make `qti-graphic-gap-match-interaction` fit its container, with its drop areas scaling along — as `qti-hotspot-interaction` already does.

  **The graphic overflowed, and its drop areas could not follow it.** An item declares the graphic at the size its `coords` were authored in — often a full-resolution picture, `width="1600"`. The interaction rendered it at exactly that size, so in a two-column layout or on a phone it ran far past its column. Capping the picture alone would not have helped: the drop areas were written as pixel offsets (`left: 79px`), so a narrower picture would have left them on the wrong part of it.

  The drop areas are now placed with `positionShapes`, the helper the hotspot interaction uses: percentages of the graphic's declared size, inside a slot that is exactly the graphic's box. The graphic takes `max-width: 100%; height: auto` and keeps the aspect ratio its width/height attributes declare (pinned as `aspect-ratio`, because an `<object>` derives none from its attributes and an `<img>` defers to its bitmap's). It never upscales. `ellipse` and `poly` drop areas, which the pixel code skipped, are positioned too.

  The theme restates the fluid sizing for the graphic (a direct child of the interaction), because `reset.css` gives every picture inside an interaction `max-width: none`, which outranks the component's `::slotted()` rule. A draggable's own picture is untouched and keeps the same size in the bank and in its drop area.

  With `qti-choices-left` / `qti-choices-right` the image slot is now capped at 75% instead of forced to it, so it stays the graphic's box.

  Not covered: a drop area still grows to fit the largest draggable (`--qti-dropzone-min-*`), so on a heavily scaled graphic a small drop area can be larger than its authored shape. `qti-hotspot-interaction` has the same `reset.css` override issue and is left for a separate change.

## 2.2.1

### Patch Changes

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

## 2.2.0

### Minor Changes

- [#205](https://github.com/Citolab/qti-components/pull/205) [`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce) Thanks [@herrKlein](https://github.com/herrKlein)! - Ship the theme sheet as a real module, so `@qti-components/item` and `@qti-components/test` can be
  installed on their own.

  Both packages adopt the theme into their shadow root, so they need the sheet as _text_. They got it
  with `import itemCss from '../../../../qti-theme/src/item.css?inline'` — but `?inline` is
  bundler-only syntax, and `tsc` (how all 32 non-umbrella packages build) copies the specifier through
  verbatim. `@qti-components/item@1.4.3` therefore shipped that exact line. Two things wrong with it:
  the `?inline` suffix no plain bundler resolves, and the path climbs out of the package into a
  sibling directory that `files: ["dist"]` never publishes. Installing the package from npm and
  bundling it fails outright:

  ```
  ✘ [ERROR] Could not resolve "../../../../qti-theme/src/item.css?inline"
      @qti-components/item/dist/components/item-container/item-container.js:15:20
  ```

  It went unnoticed because the umbrella inlines these packages at build time and its esbuild plugin
  resolves the `?inline` right there — inside the workspace, where `dist/` sits at the same depth as
  `src/` and the relative path happens to land on a real file. Consumers of `@citolab/qti-components`
  never saw the broken specifier. Consumers of the granular packages could not get past it.

  `@qti-components/theme` now exposes `./item-css`, an ES module exporting the compiled sheet as a
  string. It is generated from the already-built `dist/item.css` rather than by running PostCSS a
  second time, and the result is byte-for-byte what the inline plugin produced (279,603 chars) — so
  the text these containers adopt is unchanged and nothing renders differently. `item-container` and
  `test-container` import that instead, and `@qti-components/theme` moves to a real `dependency` of
  `@qti-components/item` (it already was one of `@qti-components/test`) so the topological build
  order guarantees it exists first.

  Verified: with the fix, `@qti-components/item` installed from a tarball bundles cleanly and carries
  exactly one copy of the sheet.

  Also in this change:

  - **Every package now cleans before it builds.** None did, so `dist/` accumulated files whose
    sources were deleted — `@qti-components/corrections` was carrying a stale
    `dist/stories/with-correction-registry.decorator.js` from a removed source file, itself
    containing a `?inline` import. Nothing broken had actually shipped from this (the file was
    outside the published tarball), but `publish-if-needed.mjs` runs `--ignore-scripts`, so the
    tarball is whatever happens to be on disk.
  - **An eslint rule** rejects `?inline`/`?raw`/`?url` specifiers in package sources, naming the fix
    in the message. `import/no-relative-packages` had already flagged the original line and was
    silenced with an inline disable; that disable is gone. Exempt: `packages/qti-theme` (owns the
    dev-side source shim), spec/story files and `apps/*` (never compiled into a published dist).
  - The five spec files and two `apps/e2e` stories that loaded the sheet through `?inline` now use
    the same entry point as production, so they exercise the path consumers actually take rather than
    a dev-only one.
  - Removed a dead `@qti-components/theme` mapping in the root `tsconfig.json` pointing at a
    `src/index.ts` that does not exist.

## 2.1.0

### Minor Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep interactions working where custom states are unsupported.

  Interactions track selection and correct/incorrect marking through `internals.states`, with bare
  state names (`checked`, `radio`, `correct-response`, …). Two browser profiles cannot service that,
  and on both, picking a choice throws rather than registering:

  - Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so `internals.states` is
    `undefined` and reading it throws.
  - Chrome and Edge before the CSS custom-state spec change expose `states` but reject names that do
    not start with `--`, so `states.add('radio')` throws a `SyntaxError`.

  `attachInternals` is unguarded throughout the interaction base classes, which puts the hard support
  floor at Safari 16.4 — inside the range that breaks.

  `@qti-components/base` now classifies custom-state support by behaviour — `missing`, `legacy` or
  `modern`, probing a throwaway element rather than sniffing versions — and on the first two replaces
  `states` with a permissive `Set` that also mirrors its contents to a space-separated `data-state`
  attribute on the host. Where `states` works natively nothing is installed and nothing changes.

  The mirror is needed because these browsers' CSS parsers also drop any selector list containing
  `:state()`, so checked, correct-response and drag styling never rendered there either. The theme's
  built stylesheets now pair every `:state(x)` with a `[data-state~='x']` arm, applied at build time by
  `tools/postcss/custom-state-fallback.mjs`. `:is()` is what makes the pairing work in both
  directions: its forgiving parsing means a browser that does not understand `:state()` keeps the
  attribute arm, while a browser that does keeps matching the state arm.

### Patch Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Flatten native CSS nesting in the published stylesheet, and state the browser support floor.

  The theme sources use `&`-nested rules throughout and the postcss pipeline passed them through, so
  `dist/item.css` shipped 283 nested selectors. Safari below 16.5 cannot parse native nesting and
  dropped those rules. `postcss-nesting` now runs after `postcss-mixins` — the mixins can themselves
  emit nesting — leaving none in the built stylesheet.

  `.browserslistrc` gives autoprefixer an explicit floor in place of the implicit `defaults`.
  Safari/iOS 16.4 is the hard minimum, imposed by the unguarded `ElementInternals.attachInternals`
  calls in the interaction base classes.

  The same postcss config feeds the inline-css esbuild plugin, so shadow-DOM component styles get
  both behaviours too.

## 2.0.1

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.
