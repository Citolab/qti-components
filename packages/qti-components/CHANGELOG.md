# @citolab/qti-components

## 10.0.0-next.14

### Major Changes

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `completionStatus` follows QTI 3 (info model §2.2.2, §2.5) and the 1EdTech conformance suite's Results Reporting reference results.

  - **completionStatus is no longer derived from validity.** Before, a non-adaptive item set `completed` or `incomplete` on every answer, from whether its interactions were valid. Now it is `not_attempted` until the item is presented, `unknown` from then on, and `completed` once an attempt of a non-adaptive item ends (after `processResponse()`), unless response processing set a value itself. An adaptive item is completed only by its response processing, as before. Whether the answers are valid is `valid` in the item context and in the computed context; to know whether an item is answered, read `valid && !isDefaultResponse` per item instead of `completionStatus === 'completed'`.
  - An item that is presented is never `not_attempted`: after a reset or a restore that says so, it is `unknown`. The test context still holds `not_attempted` for items that were never presented.
  - Response processing no longer resets `completionStatus` before a run of a non-adaptive item: it is built in and has no default.
  - `test-scoring-feedback` shows its "no response" text from the item's validity and default response, not from completionStatus.

  Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major), [CitoTestUit](../plans/host-migration/citotestuit.md#next-major), [PeilingLezen](../plans/host-migration/peilinglezen.md#next-major), [Examenkompas](../plans/host-migration/examenkompas.md#next-major).

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-end-attempt-interaction` counts the attempt it ends unless it says `count-attempt="false"`. Before, only `count-attempt="true"` counted. QTI 3 gives the attribute no default; an absent value now counts, as QTI 2.x's default `true` did and as amp-up and QTI.JS do. Fixes [#341](https://github.com/Citolab/qti-components/issues/341).

  An item whose hint or "show solution" button has no `count-attempt` now uses up an attempt when the candidate presses it, and in a test with the default `max-attempts` of 1 the item is then locked. Give such a button `count-attempt="false"`.

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - Response processing runs the way it would on a backend: once, after which the item applies the final outcome values in one update.

  Before, `processResponse` published the item context at every step: the attempt count, the reset of a non-adaptive item's outcomes to their defaults, every `qti-set-outcome-value`, the completion status. Every consumer (feedback, `test-navigation`, `test-end-attempt`, a modal) saw the in-between states, such as a score of 0 or an empty FEEDBACK. Now `qti-response-processing` runs its rules on a copy of the item context (outcomes reset for a non-adaptive item, `numAttempts` already counted), so a rule still sees what an earlier rule wrote (`SCORE = SCORE + 1` twice gives +2). When the rules are done it sends every outcome in one `cito-item-set-outcomes`; the item applies them with the completion status and the validity in one publish, then sends one `cito-item-outcomes-changed`.

  What a host notices:

  - **Changed:** `cito-item-outcome-changed` and its legacy name `qti-outcome-changed` keep their name and `detail` (`{ item, outcomeIdentifier, value }`), but are sent once per outcome after each update, with the final value, after the context is published. A handler no longer sees the reset to the defaults or a rule's in-between value.
  - **New:** `cito-item-outcomes-changed`, the same outcomes in one event: `detail` is `{ item, outcomes: [{ identifier, value }] }`, sent once per update. After `processResponse` it lists every outcome of the item.
  - **New:** `cito-item-set-outcomes`, a request a host sends on the item with the outcomes a backend returned: `detail` is `{ outcomes: [{ identifier, value }], responseProcessed? }`. The item applies them in one update, synchronously. With `responseProcessed: true` it also ends the attempt the way `processResponse` does: a non-adaptive item whose processing left completionStatus `unknown` becomes `completed` (see the completionStatus changeset) and `qti-item-context-updated` goes out with `responseProcessed`.
  - A run that throws counts the attempt and applies no outcomes. Before, it also left the outcomes the rules had set before the error, and completionStatus at `null`.
  - `qti-set-outcome-value` no longer reaches the item: `qti-response-processing` takes it and writes to its own copy of the item context, which only a run sends to the item.
  - `qti-response-processing`'s `process()` is now `processResponse({ numAttempts })`, with the attempt count the item keeps, and sends its result instead of applying it; call `item.processResponse()` to score. The item no longer knows the element's class, only that it has `processResponse`.
  - **Removed:** `item.updateResponseVariable` from the helper a `qti-custom-operator` script gets: response processing reads responses, it does not change them. `item.getVariable` and `item.updateOutcomeVariable` stay.

  Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major), [PeilingLezen](../plans/host-migration/peilinglezen.md#next-major), [Examenkompas](../plans/host-migration/examenkompas.md#next-major), [CitoTestUit](../plans/host-migration/citotestuit.md#next-major) (nothing to do).

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-navigation` disables an item once it has used its attempts, so the candidate can no longer change the answer after the last attempt is ended (`test-end-attempt`). The rule is the one `test-end-attempt` already used for its own button: a non-adaptive item with `max-attempts` above 0 (default 1) and `numAttempts >= max-attempts`. Adaptive items, `max-attempts="0"` (unlimited) and items in a `submission-mode="simultaneous"` part (one attempt each, processed when the part ends; the answer may change until then) are never disabled, and nothing is locked with `auto-score-items`, where every change is scored as an attempt.

  It reads the computed context, so it holds for every item on screen (`navigate="section"`) and for a restored `qtiTest.state` (disabled as soon as the item loads), and it releases the item when its attempts are back to zero. Only an item the navigation disabled itself is released: a host or view that sets `disabled` on an item keeps it so.

  A practice test that lets the candidate check again must say so in its package: `<qti-item-session-control max-attempts="0" />`. QTI's default is one attempt, also without `qti-item-session-control`, so a plain package now locks each item after its first attempt. Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major).

### Minor Changes

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - When an attempt ends, the response of every `qti-end-attempt-interaction` other than the one used is `false` (QTI info model §2.4.5): a hint requested in an earlier attempt no longer stays `true` when the candidate ends the next attempt another way.

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-end-attempt-interaction` follows its item: it cannot be pressed while the item is `disabled` or `readonly`, or once an adaptive item has set `completionStatus` to `completed`. QTI says an adaptive item that sets `completed` closes its session, so no further attempt can start (info model §2.2.2). Before, the button stayed enabled and every press ran response processing again. Fixes [#342](https://github.com/Citolab/qti-components/issues/342).

- [#307](https://github.com/Citolab/qti-components/pull/307) [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-end-attempt require-answer>` stays disabled until the item has a valid, non-default response, independent of `allow-skipping`.

### Patch Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`7bb058f`](https://github.com/Citolab/qti-components/commit/7bb058ff4a4755677fda7c4a2ebdddac42767f68) Thanks [@herrKlein](https://github.com/herrKlein)! - A `qti-response-if`, `qti-response-else-if`, `qti-outcome-if` or `qti-outcome-else-if` whose condition is a boolean variable or base value applies only when it is `true`. Before, `false` was read as the string `'false'`, which is truthy, so `<qti-response-if><qti-variable identifier="HINT"/>` ran whenever HINT had a value. The spec's own adaptive examples test booleans this way. Fixes [#340](https://github.com/Citolab/qti-components/issues/340).

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - An inline choice can have an empty placeholder: `data-prompt=""` (or an empty `inlineChoicePrompt` in the item configuration) is kept. Before, an empty value counted as missing and the placeholder fell back to `select`.

  An empty placeholder now lines up with the sentence: the closed field keeps the same text baseline as when it shows an answer, so the line no longer changes height once a choice is made.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - An auto-sized inline choice opens a menu exactly as wide as the closed field. The option rows (`qti-inline-choice`) were `inline-flex`, so the shrink-to-fit menu measured them side by side and came out as wide as all options together; they are block-level `flex` rows now. The measured trigger width also counts the gap before the chevron (the widest option was cut off by a few pixels) and no longer adds the menu's border. An empty value or prompt (`data-prompt=""`) keeps the field and the prompt row one line tall instead of collapsing.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53) Thanks [@herrKlein](https://github.com/herrKlein)! - The open inline choice menu reads as one shape with the field: one border on the seam instead of the field's and the menu's stacked, and square corners at the bottom of the menu.

  With an empty `data-prompt`, the empty prompt row is no longer shown while nothing is chosen. Once a choice is made, that row is a clear button (an x glyph) that empties the answer again; its accessible name is `Clear`, overridable with `data-clear-label`.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`b1cb7e9`](https://github.com/Citolab/qti-components/commit/b1cb7e90df09765608e1ffe2d766e7974883f8a2) Thanks [@herrKlein](https://github.com/herrKlein)! - A select-point picture scales with its column by default. The component already sized the slotted picture `max-width: 100%; height: auto`, but the item theme's reset gives every picture inside an interaction `max-width: none`, a light-DOM rule that outranks `::slotted()`, so a 1024px picture overflowed a narrower column. The theme now restates the fluid sizing for the select-point picture (a direct child), as it does for graphic-gap-match. A picture smaller than its column keeps its own size. Clicks are still recorded in the picture's own pixels (its `width`/`height`) and markers placed in percentages, so the answer is the same at any displayed size.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`5856bfc`](https://github.com/Citolab/qti-components/commit/5856bfc3bc60075b9c19b9e3a6a77f77ac50a3cd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls look the same on a page that uses a CSS reset, such as Tailwind's preflight.

  A reset like `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }` is a rule of the page, and a page rule beats the `:host` rules of a shadow root, whatever its layer or specificity. `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link`, `test-submit`, `test-check-item` and `test-bookmark` painted their padding and border on the host, so on such a page they lost both: a label against the edge of its fill, and no border.

  The look now sits on an inner element, `<span class="control" part="button">`, in the shadow tree, where the page's `*` does not reach. The host keeps only what a reset leaves alone: its display, the cursor and the radius its focus ring follows. Nothing changes on a page without a reset. The inner element is also a new part: `test-next::part(button)` repaints the control from a host stylesheet.

  `item-show-correct-response`, `item-show-candidate-correction` and `test-show-correct-response` get the same treatment: their padding is on the inner `div`.

  If a host styled the controls by their host box (a `padding` or `border` set on `test-next` itself), that moves to `::part(button)`. The `--test-button-*` slots work as before.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-end-attempt` ends the attempt of its own item when it has one, like `test-bookmark`.

  Stamped into a `<template item-ref>`, each item gets its own button, which ends the attempt of that item and is `disabled` by that item's state (`max-attempts`, `numAttempts`, an optimal or completed attempt). With `<qti-test navigate="section">` every item of the section is on screen, so a candidate can check them one by one in any order. A new `item` attribute (an item-ref identifier) names the item from anywhere. In the toolbar, without either, it follows the item on screen as before.

  `cito-test-end-attempt` carries the item as `{ itemId }`; `test-navigation` then processes that item's response instead of the one on screen. Without `itemId` nothing changes.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`85437ae`](https://github.com/Citolab/qti-components/commit/85437aef3e4febe3c8b1540485bdbfc6f2bc9540) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-navigation` no longer throws while building a section's `completed` when one of its items has no `completionStatus` in the test context.

## 10.0.0-next.13

### Major Changes

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - `inlineChoiceAutosize` is on by default. An inline choice is as wide as its widest option from the start, so choosing an option no longer widens the field and reflows the sentence around it. A `qti-input-width-*` class still wins; set `configContext.inlineChoiceAutosize: false` for the old behaviour, where the field sizes to the option shown. Host notes: `plans/host-migration/kennisnet.md`, `plans/host-migration/citotestuit.md`.

## 10.0.0-next.12

### Patch Changes

- [#335](https://github.com/Citolab/qti-components/pull/335) [`e0aed5d`](https://github.com/Citolab/qti-components/commit/e0aed5d24309fef6dbe350b503d86e0e2bc6064f) Thanks [@herrKlein](https://github.com/herrKlein)! - With `navigate="item"`, a `test-section-link` (a `cito-test-navigate` request of type `section`) now makes the section's first item the active one. Before, no item was active, so `test-next` and `test-prev` stayed disabled and item links highlighted nothing. The whole section still loads, and `navigate="section"` is unchanged. Since that first item is now the active item, `test-check-item`, `test-end-attempt` and the scoring buttons act on it. Hosts: see "Section link in item mode" in `plans/host-migration/kennisnet.md` and `plans/host-migration/citotestuit.md` ([#332](https://github.com/Citolab/qti-components/issues/332)).

## 10.0.0-next.11

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

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls (`test-prev`, `test-next`, item and section links, end attempt, ...) look neutral by default, and `test-next` is the primary action.

  They used to be white with a blue border and black text, painted from the shared `--qti-component-*` tokens. Now the neutral look is a white button with a thin gray border and the surrounding text colour, with a faint gray hover, and `test-next` is solid dark with white text. There are no shadows, glows or transitions. The focus ring and the disabled look are unchanged.

  The controls no longer read `--qti-component-border-color`, `--qti-component-background-color` or `--qti-component-color`, so changing those tokens repaints interactions and no longer the test controls. To repaint the controls, set the `--test-button-*` slots on the test:

  - `--test-button-background-color`, `--test-button-color`, `--test-button-border-color`, `--test-button-hover-background-color` for the neutral look.
  - New: `--test-button-primary-background-color`, `--test-button-primary-color`, `--test-button-primary-hover-background-color` for `test-next`. Setting the neutral slots no longer repaints `test-next`.

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

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-stamp` is no longer described as deprecated. Its JSDoc (and so the custom-elements manifest and the Storybook docs) said it would be removed, but it is the kept `stamp` plugin; the description now says what it renders.

## 10.0.0-next.10

### Minor Changes

- [#318](https://github.com/Citolab/qti-components/pull/318) [`b410a9f`](https://github.com/Citolab/qti-components/commit/b410a9f628da90986044a664f5aa12e46ed3b0ea) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-submit>` scores the test: on click it asks the test to submit (`cito-test-submit`), which runs outcome processing and then dispatches `cito-test-submitted`. `qtiTest.submit()` does the same from code. `qtiTest.outcomeProcessing()` now starts every run from the test outcomes' declared defaults, as QTI does and as the documentation already said; before, a rule that adds to its own outcome, such as `SCORE_TOTAL = sum + SCORE_TOTAL`, grew on every run.

## 10.0.0-next.9

### Patch Changes

- [#316](https://github.com/Citolab/qti-components/pull/316) [`b58d409`](https://github.com/Citolab/qti-components/commit/b58d4093456e38c992bf08cbbbc85ddf97abea40) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - The PCI iframe is now exactly as high as its content: it no longer adds 100px of empty space below it. The iframe keeps the width of its host instead of a fixed pixel width, so a PCI follows the item layout when it gets narrower, e.g. when QTI layout columns stack.

## 10.0.0-next.8

### Patch Changes

- [#310](https://github.com/Citolab/qti-components/pull/310) [`16a7f1d`](https://github.com/Citolab/qti-components/commit/16a7f1d92be2a25dcb866460ccc2cb7dfdc94609) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - `test-print-item-variables` prints a record value field by field (`time: 3.6, point: 455 250`, e.g. the response of a portable custom interaction) instead of `[object Object]`, for the value and the correct response. A correct response of `0` is printed instead of left out.

## 10.0.0-next.7

### Minor Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - The PCI iframe no longer loads anything from a public CDN. RequireJS (2.3.8, minified) and the QTI 3 shared vocabulary stylesheet (`native.css`: `qti-layout-row`, `qti-well`, `qti-padding-*`, …) are inlined into the iframe from this version of qti-components. It used to load RequireJS from cdnjs, and the whole qti-components bundle and `item.css` from unpkg (`@latest`). That bundle and the full `item.css` are not needed to run a PCI and are no longer loaded by default: a host that wants them in the iframe names its own copy with `data-components-cdn-url` / `data-components-css-url` (for example its own build of `@citolab/qti-components/cdn/index.js` and `item.css`). `data-require-js-url` still loads a different RequireJS instead of the inlined one. `@qti-components/theme` exports the vocabulary sheet as text: `@qti-components/theme/native-css`.

### Patch Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Record-cardinality responses for portable custom interactions. A `qti-response-declaration` with `cardinality="record"` now reads its correct response (`qti-value field-identifier="…" base-type="…"`) into a field map and keeps the declared field base types. A PCI that reports a record in QTI Appendix C JSON (`{ record: [{ name, base: { float | point | … } }] }`) has it stored as that field map (`{ time: '4.12', point: '455 250' }`) instead of `"[object Object]"`, gets it back in `boundTo` typed by the declaration, and receives the record correct response in `responseDeclaration`. `qti-field-value` accepts a variable declared with `cardinality="record"` and reports the field's base type, so `qti-gte`/`qti-lte` compare a float field and `qti-inside` tests a point field. `qti-correct` returns a record's correct response. `BaseType` gains `point`, and `@qti-components/base` exports `RecordValue`, `isRecordValue`, `readRecordFieldValues` and `inferRecordFieldBaseType`.

  Comparisons (`qti-gt`, `qti-gte`, `qti-lt`, `qti-lte`) with a NULL operand are NULL (false), as in QTI: a missing response or a missing record field used to count as 0, so `lte(RESPONSE, 5)` passed without a response.

  The PCI iframe takes the language of the interaction (the nearest `lang` or `xml:lang`, else the page's `lang`) instead of always `lang="en"`, so a PCI that follows `lang` shows its own texts in the item's language.

## 10.0.0-next.6

### Patch Changes

- [#305](https://github.com/Citolab/qti-components/pull/305) [`f700c5d`](https://github.com/Citolab/qti-components/commit/f700c5d4d0acd4219797211b1078c539fa43c62c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Graphic gap match: when the graphic is drawn narrower than its declared width, the drop areas and the gap images now scale with it. The measured chip size no longer acts as each hotspot's minimum size (a hotspot's box is its `coords`), gap images scale by the graphic's factor (`--qti-graphic-scale`) in the bank and in the hotspot, and the drag clone accounts for that zoom so a drop lands where it is aimed.

## 10.0.0-next.5

### Major Changes

- [#261](https://github.com/Citolab/qti-components/pull/261) [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd) Thanks [@herrKlein](https://github.com/herrKlein)! - Removed `<test-paging-buttons-stamp>` and `<test-section-buttons-stamp>`, deprecated since before 9.0. Use `<test-stamp>` with a repeat: `<test-stamp><template><template type="repeat" repeat="{{ activeTestpart.items }}">…</template></template></test-stamp>` for items, `activeTestpart.sections` for sections. The repeated variable is still `item`.

  Behaviour difference: the removed elements listed the items (or sections) of every test part; the repeat lists those of the active test part. No surveyed host source uses either element.

- [#261](https://github.com/Citolab/qti-components/pull/261) [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd) Thanks [@herrKlein](https://github.com/herrKlein)! - The optional pieces of `qti-test` become plugins (`print`, `scoring`, `stamp`, `tts`, `view`): sets of files that use only the test's public API, with nothing in the core referring to them. Text-to-speech has its own folder; the others stay in `components/`. `@qti-components/test` still registers them, and the package root still exports them. The new entry `@qti-components/test/plugins/elements` lists every plugin's `{ tag, ctor }` entries for a scoped registry. A boundary spec (`plugin-boundary.spec.ts`) fails on a reference to a plugin from outside its folder and on an import of test internals; guide: Storybook "Guides / Test plugins".

  - **`computedContext.itemElement(identifier)`** (`@qti-components/base` type, set by `test-navigation`): the rendered `qti-assessment-item` for an item-ref identifier, looked up when called. Text-to-speech now reads only `computedContext`; it no longer uses the session context, reaches into `test-container`'s shadow root, or uses the test's internal context. A player that follows navigation must sit inside `<test-navigation>` (CitoTestUit and qti-player already place it there).

  Breaking:

  - A text-to-speech player that follows navigation must sit inside `<test-navigation>`, where `computedContext` is provided. Before, it found the item from anywhere on the page; outside `<test-navigation>` it now reads nothing. CitoTestUit and qti-player already place it inside.
  - Deep imports of the plugin files change: `components/test-item-to-speech/test-item-to-speech.js` is now `tts/test-item-to-speech.js`, and `components/index.js` no longer exports the plugins. Import from the package root or `@qti-components/test/plugins/elements`.

### Minor Changes

- [#261](https://github.com/Citolab/qti-components/pull/261) [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd) Thanks [@herrKlein](https://github.com/herrKlein)! - Test plugins can keep state that survives a reload. `QtiTestState.session.plugins` holds one JSON entry per plugin name; a plugin writes it with the request `cito-test-update-plugin-state` (`{ plugin, value }`, `null` removes the entry) and reads it from `computedContext.plugins` (or `pluginState(computedContext, name)`, typed by augmenting `QtiTestPluginState`). A host that already stores `state` stores it, because a change fires `cito-test-state-changed`. Entries of plugins that are not loaded are kept on a round trip. No `version` bump: the field is optional.

- [#261](https://github.com/Citolab/qti-components/pull/261) [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd) Thanks [@herrKlein](https://github.com/herrKlein)! - New plugin `<test-bookmark>`: a toggle (`role="button"`, `aria-pressed`) inside `<test-navigation>` that marks an item to come back to. In the toolbar it marks the item on screen; in `<template item-ref>` each item gets its own button, which marks that item. The marks are the item-ref identifiers in `state.session.plugins.bookmarks`, so a host that stores `state` stores them and a reloaded test shows them again. It reflects `bookmarked` and `disabled` on the host for styling; `bookmarkedItems(computedContext)` gives a host's own navigation the marks.

  CitoTestUit can replace `marked` on its context items with it; see `plans/host-migration/citotestuit.md`.

### Patch Changes

- [#261](https://github.com/Citolab/qti-components/pull/261) [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-stamp>` updates its context in `navigate="section"` too. It used to wait for an active item, and a test showing a section has none, so the template kept its empty defaults. `activeItem` is `{}` there; `activeSection`, `activeTestpart` and `test` (with `test.plugins`) are filled.

## 10.0.0-next.4

### Major Changes

- [#302](https://github.com/Citolab/qti-components/pull/302) [`c585b34`](https://github.com/Citolab/qti-components/commit/c585b346a510c533ae253c22335f7d6f578dda42) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-check-item>` no longer reaches into `<test-container>`'s shadow root. After ending the attempt it switches the test to a view, named by its new `view` attribute (default `scorer`), through `cito-test-switch-view`.

  Behaviour change: `[view]` content for other views, including `candidate`, is hidden while that view is active; before, every `[view]` element was shown. Use `<test-view-toggle>` to switch back. No surveyed host uses `<test-check-item>`.

## 10.0.0-next.3

### Minor Changes

- [#300](https://github.com/Citolab/qti-components/pull/300) [`e7bee3a`](https://github.com/Citolab/qti-components/commit/e7bee3a22d2f7ea1ae515ccc92a9e87e7eec5aeb) Thanks [@herrKlein](https://github.com/herrKlein)! - New test-level expression `qti-number-presented`: the number of selected item refs that have been presented to the candidate, with the same `section-identifier`, `include-category` and `exclude-category` filters as `qti-number-selected`. An item is presented once its `completionStatus` has left `not_attempted`, so items a linear test part passed over (pre-conditions, branch rules) and items not reached yet are not counted. Use it for totals over the candidate's own route, such as a maximum score of one point per presented item.

  - A presented item no longer keeps a `not_attempted` the test context held for it (a restored session, or values set with `updateItemVariables` before the item was reached): presenting an item starts its first attempt, so it takes the item's own status.

- [#300](https://github.com/Citolab/qti-components/pull/300) [`e7bee3a`](https://github.com/Citolab/qti-components/commit/e7bee3a22d2f7ea1ae515ccc92a9e87e7eec5aeb) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTest.getTestFeedback(access?)` returns the `qti-test-feedback` elements that apply after outcome processing, so a host no longer filters them by hand. `qti-test-feedback` reads its `access` attribute (`atEnd`, the default, or `during`) and gets `matches(value)`: whether it applies for a value of its `outcome-identifier`, honouring `show-hide` and container values. It still renders nothing where it is declared: where and when to show it stays up to the host.

## 10.0.0-next.2

### Patch Changes

- [#298](https://github.com/Citolab/qti-components/pull/298) [`54ad14e`](https://github.com/Citolab/qti-components/commit/54ad14e4cf57ea95ccbc917ed734e46c6184c528) Thanks [@herrKlein](https://github.com/herrKlein)! - Adaptive items (`adaptive="true"`) are done when their response processing sets `completionStatus` to `completed`, not when `max-attempts` is reached. QTI 3 does not apply `max-attempts` to adaptive items, but the player did, so in a linear test with `max-attempts="1"` Next unlocked after a wrong first attempt while the item still had its next phase to show.

  - `test-navigation`: `done` for an adaptive item is `completionStatus === 'completed'`.
  - `test-end-attempt` is disabled once an adaptive item is completed.

## 10.0.0-next.1

### Minor Changes

- [#289](https://github.com/Citolab/qti-components/pull/289) [`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7) Thanks [@herrKlein](https://github.com/herrKlein)! - Sequencing in linear test parts: new `qti-pre-condition` and `qti-branch-rule` elements (`target` is an item ref, section or test part, or `EXIT_SECTION` / `EXIT_TESTPART` / `EXIT_TEST`). A "next" step in a linear part now skips items, sections and test parts whose pre-condition is false and follows the first branch rule that is true; nonlinear parts, deep links and item links are untouched. An expression that throws fails open for a pre-condition and does not branch for a rule; one that gives NULL (e.g. an unknown variable) is false. The first item of a linear part is checked against its pre-conditions too.

  - New public notifications: `cito-test-items-skipped` (`detail.ids`: the item refs passed over) and `cito-test-end-reached` (`EXIT_TEST`, or no eligible item left).
  - `qti-variable` can read an item session with `ITEMREF.VAR` (e.g. `Q01.SCORE`); an item that was never presented gives NULL.
  - `qti-match` and the other comparisons now work on `boolean` values (they were always false), so the `qti-end-attempt-interaction` pattern can be matched.

## 10.0.0-next.0

### Major Changes

- [#292](https://github.com/Citolab/qti-components/pull/292) [`8984eab`](https://github.com/Citolab/qti-components/commit/8984eab2eacc6b7d7a9b9454c3c21334cb18dfc3) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-extended-text-interaction` reads `min-strings`, defaulting to 0 as in the QTI spec. An empty field is now valid unless `min-strings="1"` is set; it used to be invalid. Items that relied on that (e.g. gating next or end-attempt on an answer) must add `min-strings="1"`.

### Minor Changes

- [#285](https://github.com/Citolab/qti-components/pull/285) [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3) Thanks [@herrKlein](https://github.com/herrKlein)! - The test's public events get the `cito-` prefix, declared in one module (`public-events.ts`): requests `cito-test-navigate`, `cito-test-end-attempt`, `cito-test-update-outcome`, `cito-test-switch-view`; notifications `cito-test-navigated` (new: sent only after a navigation succeeded and rendered), `cito-test-navigation-started`, `cito-test-navigation-failed`, `cito-test-rendered`, `cito-test-loaded`, `cito-test-state-changed`, `cito-item-ref-connected`.

  - **Deprecated:** the old names (`qti-request-navigation`, `test-end-attempt`, `test-update-outcome-variable`, `on-test-switch-view`, `qti-navigation-loading-started`, `qti-navigation-error`, `qti-test-loaded`, `qti-assessment-test-connected`, `qti-state-changed`, `qti-assessment-item-ref-connected`) are still sent and handled, with the same `detail`. They go in the next major. A request sent under an old name (`qti-request-navigation`, `test-end-attempt`, …) logs a one-time `console.warn` naming the new one.
  - `qti-navigation-loading-ended` is unchanged and deprecated without a replacement: it also fires on failure and cancellation. Use navigated / failed.

  Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.

- [#285](https://github.com/Citolab/qti-components/pull/285) [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3) Thanks [@herrKlein](https://github.com/herrKlein)! - The item's public events get the `cito-` prefix, declared in `public-events.ts` and exported from `@qti-components/elements`: `cito-item-response-changed`, `cito-item-outcome-changed`, `cito-item-rendered` and `cito-item-rubric-placement` (cancelable). `detail` is unchanged.

  - **Deprecated:** `qti-interaction-changed`, `qti-outcome-changed` and `qti-rubric:discretionary-placement` are still sent and handled next to the new names, and go in the next major. An old name sent into the test logs a one-time `console.warn` naming the new one. A rubric listener that cancels either name keeps the block where it is.
  - `qti-assessment-item-connected` stays: it is internal plumbing for the test and item container. Hosts use `cito-item-rendered`.

  Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.

### Patch Changes

- [#283](https://github.com/Citolab/qti-components/pull/283) [`4476095`](https://github.com/Citolab/qti-components/commit/4476095f7cb1939ce780980f3a7a3317fc86c5c0) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make `qti-graphic-gap-match-interaction` fit its container, with its drop areas scaling along — as `qti-hotspot-interaction` already does.

  **The graphic overflowed, and its drop areas could not follow it.** An item declares the graphic at the size its `coords` were authored in — often a full-resolution picture, `width="1600"`. The interaction rendered it at exactly that size, so in a two-column layout or on a phone it ran far past its column. Capping the picture alone would not have helped: the drop areas were written as pixel offsets (`left: 79px`), so a narrower picture would have left them on the wrong part of it.

  The drop areas are now placed with `positionShapes`, the helper the hotspot interaction uses: percentages of the graphic's declared size, inside a slot that is exactly the graphic's box. The graphic takes `max-width: 100%; height: auto` and keeps the aspect ratio its width/height attributes declare (pinned as `aspect-ratio`, because an `<object>` derives none from its attributes and an `<img>` defers to its bitmap's). It never upscales. `ellipse` and `poly` drop areas, which the pixel code skipped, are positioned too.

  The theme restates the fluid sizing for the graphic (a direct child of the interaction), because `reset.css` gives every picture inside an interaction `max-width: none`, which outranks the component's `::slotted()` rule. A draggable's own picture is untouched and keeps the same size in the bank and in its drop area.

  With `qti-choices-left` / `qti-choices-right` the image slot is now capped at 75% instead of forced to it, so it stays the graphic's box.

  Not covered: a drop area still grows to fit the largest draggable (`--qti-dropzone-min-*`), so on a heavily scaled graphic a small drop area can be larger than its authored shape. `qti-hotspot-interaction` has the same `reset.css` override issue and is left for a separate change.

- [#291](https://github.com/Citolab/qti-components/pull/291) [`0fb1914`](https://github.com/Citolab/qti-components/commit/0fb19146d8015e6b76a576671adea0d92051d891) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-slider-interaction` starts at the response declaration's `qti-default-value`, and no longer saves its lower bound as the response before the candidate moves it ([#290](https://github.com/Citolab/qti-components/issues/290)).

  QTI 3 gives a slider no initial position of its own: it starts at the default of its response variable, or has no value. The slider used to seed itself with `lower-bound` on connect and publish that, which overwrote a declared default, and let a candidate pass `allow-skipping="false"` with a value they never chose. Now:

  - With a `qti-default-value`, the slider shows it and the response is that value.
  - Without one, the response is `null` until the candidate moves the slider. The knob rests at the lower bound with no value label. (With `lower-bound="0"` nothing was saved before either.)
  - Setting `response` (or `reset()`, which used to do nothing) shows the value without publishing it; only the candidate's input is published.
  - The slider exposes `aria-valuemin`, `aria-valuemax` and `aria-valuenow` through `ElementInternals`.

## 9.4.0

### Minor Changes

- [#228](https://github.com/Citolab/qti-components/pull/228) [`b0f1c6d`](https://github.com/Citolab/qti-components/commit/b0f1c6d4cc885d361247ac41973874659f6494e0) Thanks [@herrKlein](https://github.com/herrKlein)! - Interactions, feedback and `readonly` now follow the item context instead of being pushed to by the item. The public members are unchanged, and the timing was kept on purpose: `item.variables = …` shows the values in rendered interactions straight away, and `setOutcomeVariable` / `processResponse` leave `showStatus` correct when they return. This is covered by this repo's own stories and specs. It has not been run against a host application, so hosts should check the flows below before upgrading.

  What changes:

  - An interaction adopts the item's value for its response when that value changes to something other than what the interaction last published. A score or timer updating, or the candidate's own answer coming back, does not rewrite it. An interaction that registers after the variables were set now picks them up, and an unanswered item no longer overwrites a `response` attribute on the interaction.
  - `QtiFeedback` decides its own `showStatus` from the item context. `checkShowFeedback()` stays public. The `qti-register-feedback` event is no longer sent. Nothing in this repo or in the host code we looked at listened to it, but a listener would now hear nothing.
  - Feedback is only decided when its outcome changed or an attempt was made. The one visible difference: restoring variables equal to the declared defaults, on an item with no attempt yet, no longer switches on a `show-hide="hide"` modal feedback (it used to open on a restore of nothing). Block and inline feedback decide when they connect and are unchanged. A custom feedback that extends `QtiFeedback` directly behaves like the modal.
  - `readonly` on `qti-assessment-item` is published in the item context (`ItemContext.readonly`) and the interactions follow it. A `readonly` attribute present from the start now applies; before, only a change after the first render did.

  To check in a host:

  - Review or replay screens that assign `item.variables` or `item.responses` and read the interactions right after.
  - Code that sets an outcome and reads or patches the feedback straight after, including observers on the feedback's DOM.
  - Custom interactions whose `response` setter is not safe to call again with the same value. The base class calls it when the item's value changes and the interaction did not publish that value itself.
  - Custom feedback that reached into `QtiFeedback`'s private `_context`. It is now a read-only getter.

- [#229](https://github.com/Citolab/qti-components/pull/229) [`c5d80aa`](https://github.com/Citolab/qti-components/commit/c5d80aa2a5e2e1e09853931cc758a3677ed42593) Thanks [@herrKlein](https://github.com/herrKlein)! - `disabled` on `qti-assessment-item` is now published in the item context (`ItemContext.disabled`) and the interactions follow it, the same way they already follow `readonly`. The item no longer sets it on each registered interaction. Setting `item.disabled` still locks and unlocks the interactions.

  What changes:

  - A `disabled` attribute present on the item from the start now applies. Before, only a change after the first render did.
  - An interaction that was authored `disabled` stays so inside an item that does not mention `disabled`. The item only touches it when `item.disabled` is set.
  - An interaction that registers after the item was disabled now comes up disabled.

  Covered by this repo's stories; not run against a host application. Hosts that lock submitted items by setting `item.disabled` (Kennisnet) should check that flow.

- [#231](https://github.com/Citolab/qti-components/pull/231) [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9) Thanks [@herrKlein](https://github.com/herrKlein)! - Items publish whether their interactions are valid, as `ItemContext.valid`, and the test reads it from there instead of asking every loaded item to validate on each update. The item checks when an answer changes, when it connects, and after answers are handed in through `variables`. `qti-assessment-item` also exposes a read-only `itemContext` (the whole context, declarations included), which the test used to reach for as a private field.

  This fixes a bug: after a restore (`qtiTest.state`) or after coming back to an answered item, `ComputedItem.valid` stayed `false` until some later update, because it was read before the answer was adopted. In a section with `allow-skipping="false"` that kept `test-end-attempt` disabled on an item that was already answered.

  What to check in a host:

  - Components that read `ComputedItem.valid` from `computedContext`: it now settles after a restore and after navigating back.
  - `test-end-attempt` in sections that do not allow skipping.
  - Inline validation messages. Read from the code, not observed: `validate()` on an interaction can update its inline message, and the test used to call it on every update of the test. It is now called when the item's answers change.

  Covered by this repo's stories; not run against a host application. Host migration: [PeilingLezen](plans/host-migration/peilinglezen.md), the only surveyed host that consumes `computedContext`.

- [#230](https://github.com/Citolab/qti-components/pull/230) [`7937fd5`](https://github.com/Citolab/qti-components/commit/7937fd52870a18938f24c3f835d591f6b644cc3c) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiContext` (the `QTI_CONTEXT` variable: test, candidate and environment identifiers plus the optional shuffle `seed`) is now provided by `qti-test`, and the test reads the seed from itself instead of reaching into `test-navigation`. Set it with `qtiTest.qtiContext = …`.

  `test-navigation.qtiContext` is deprecated and kept as an alias: reading it returns the enclosing test's value and writing it replaces that value, so hosts that set the seed there keep working. It is removed in the next major, and writing it prints one console warning per element naming the replacement. Reading it does not warn, and neither does the library's own writing. Before this change it was a second provider; now there is one value, so the two can no longer disagree. The alias finds the test across shadow roots. Set before the navigation is inside a `qti-test` (a React host sets props before attaching the element), a write is held and handed over when it connects.

  Covered by this repo's stories: the seed through both routes gives the same shuffle order, including a story that builds the elements in the order React does, which also passes on the previous release. Not run against a host application. CitoTestUit, which passes its per-session seed as the `qtiContext` prop of `<test-navigation>`, is the flow to check.

  Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).

  Everything deprecated, and what is planned for the next major: the new Deprecations page.

- [#225](https://github.com/Citolab/qti-components/pull/225) [`6e87e20`](https://github.com/Citolab/qti-components/commit/6e87e20ddb86495c08d3469fdb6e6de61675c108) Thanks [@herrKlein](https://github.com/herrKlein)! - Add `qtiTest.state` and the `qti-state-changed` event: one value to persist and restore a candidate's test session (item variables, per-interaction state, test outcomes, position) without declaration metadata or the answer key. The state can be assigned before the test loads and is applied before the first item does. Also restores per-interaction state (e.g. a PCI's `getState()`) into an item when it loads, and makes `navigate="section"` start at the restored section.

  `updateItemVariables()` now updates the test context immutably, so components reading it update and `qti-state-changed` fires; values for items that have not loaded yet are kept instead of dropped. Its values no longer need a `type` (only for a variable the item does not declare), and an optional third argument sets per-interaction state.

  Deprecated, to be removed in the next major: the `qti-test-context-updated` event (listen to `qti-state-changed` instead), and `SessionContext.navItemLoading` / `navTestLoading`, which were never set.

  ## Migration for hosts

  No breaking change: `testContext`, `qti-test-context-updated` and `navigateTo` still work, so nothing has to change on upgrade. Recommended, because it removes workarounds:

  - **Persist** from `qti-state-changed` (or read `qtiTest.state`) instead of `qti-test-context-updated`. The payload is built after the update, so it is never stale, and it no longer carries declaration metadata or the answer key.
  - **Restore** by assigning `qtiTest.state = saved`, before or after load, instead of assigning `testContext` and calling `navigateTo`. The restored position is applied for you, and assigning no longer needs a guard against a late restore overwriting newer answers.
  - **Keep your own fields** (current item, pages, manual scores) next to the stored `state`.
  - **Pass the shuffle seed again on every load.** It is deliberately not part of `state`: set it through `test-navigation.qtiContext` (`asSeed`) as before, or the restored order changes.
  - **`href` is not in `state`.** Read it from the `qti-assessment-item-ref` instead of from the context.
  - **Bookmarks are not in `state` yet.** A host that stores them as `marked` on context items must keep using `testContext` for those until `state.session` carries them.

  Per host (read from source, not run):

  - **Kennisnet** (7.28.1, own republish): replace the `qti-test-context-updated` save and the `testContext` restore in `store/events.ts`, and drop the by-hand store rebuild in `mutators.ts`, which existed because assigning emitted nothing. `updateItemVariables` now fires `qti-state-changed`, so the "doesn't fire reliably" workaround in `check-item.ts` can go. Take `href` from the item-ref (`check-item.ts`).
  - **CitoTestUit** (9.3.0): replace the save in `AssessmentPlayerView.tsx` with `qti-state-changed`, and the guarded one-time `testContext` restore plus `navigateTo` with `state`. The live `qtiTest.testContext` read for stale payloads is no longer needed. Keep the `qtiContext` seed. Bookmarks (`marked`) stay on `testContext` for now.
  - **PeilingLezen** (7.1–7.14, imports surveyed only): its components consume `testContext` / `computedContext`, which are unchanged. Nothing to do; `state` is available once it upgrades.

  `SessionContext.navItemLoading` / `navTestLoading` were never set. Stop reading them before the next major.

- [#232](https://github.com/Citolab/qti-components/pull/232) [`c572724`](https://github.com/Citolab/qti-components/commit/c572724b9f2a57cabac632354b49f6caf8911533) Thanks [@herrKlein](https://github.com/herrKlein)! - Components inside a `qti-test` now find it through context instead of `closest('qti-test')`. `closest()` stops at the first shadow root, so a `test-container` or item-ref that a host renders inside its own component skipped `postLoadTestTransformCallback` and `<template item-ref>` without a word; context crosses shadow roots. The context is internal to `@qti-components/test` and not exported.

  A `ContextRoot` is attached to `document.documentElement`, once per page, when `@qti-components/base` loads. It holds a context request nobody answered and asks again when a provider connects, so a component that upgrades before the element providing its context still gets the value. It holds subscribing requests only, which every `@consume` in the library is, and holds them weakly. Code that registers elements in order is not affected.

  What to check in a host:

  - Anything that renders `test-navigation`, `test-container` or items inside a custom element's shadow root under a `qti-test`: `postLoadTestTransformCallback` and `<template item-ref>` now apply there.
  - Pages that run other Lit contexts of their own: the root is page-wide and sees their unanswered requests too. It only replays them when a provider shows up, so nothing changes unless one was being missed.

  Covered by this repo's stories and specs; not run against a host application. Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).

- [#254](https://github.com/Citolab/qti-components/pull/254) [`24337a8`](https://github.com/Citolab/qti-components/commit/24337a83f98677b5f5152009ca215f70d6fa611a) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-item-to-speech>`:

  - Skips content that is not rendered (hidden feedback, a scorer-only rubric block) and reads it once it is shown.
  - Decides which item to read from where it is placed: inside a `qti-assessment-item-ref` (e.g. a `<template item-ref>`) it reads that item; anywhere else it follows the navigation cursor, as before.
  - Keeps working after navigating to the item already on screen.

  `item-ref-id` is removed: a player in a `<template item-ref>` already reads its own item without it. A player outside any item ref that used `item-ref-id` to pin one item now follows navigation instead.

### Patch Changes

- [#253](https://github.com/Citolab/qti-components/pull/253) [`614c666`](https://github.com/Citolab/qti-components/commit/614c666eb28117e9dd8d432c00465793704448a2) Thanks [@herrKlein](https://github.com/herrKlein)! - A shared stimulus is placed as its whole `qti-assessment-stimulus` instead of only its `qti-stimulus-body`, so the content inherits the stimulus' `xml:lang` and text-to-speech and screen readers read it in the right language. The new `qti-assessment-stimulus` element generates no box (`display: contents`), so layout is unchanged. It drops the stimulus' QTI `title` when placed, which would otherwise show as a tooltip over the whole passage.

- [#234](https://github.com/Citolab/qti-components/pull/234) [`aeda9f1`](https://github.com/Citolab/qti-components/commit/aeda9f10f7a816a90b671632957b96cce3502d90) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTest.outcomeProcessing()` now finds the test's own outcome processing when the test is loaded through `test-container`. The container renders the test into its own shadow root, which the old lookup on `qti-test` could not see, so the call found nothing, returned `false` and did nothing. With a test rendered straight into `qti-test` it behaved as before.

  No surveyed host calls it. If one does, it now runs where it used to be a silent no-op, so check what it was relied on to do.

  Covered by a story that loads a test with an `<qti-outcome-processing>` through `test-container`, which fails on the old code.

- [#226](https://github.com/Citolab/qti-components/pull/226) [`9e52bb7`](https://github.com/Citolab/qti-components/commit/9e52bb7720ab9b47895e57fd80410486bacf29b1) Thanks [@herrKlein](https://github.com/herrKlein)! - Keep restored template values. An item handed template values through `variables` — when it is revisited in a test, or a session is resumed — no longer draws new ones in template processing, so the candidate sees the question they answered. Template processing still runs, so correct responses are derived from the restored values, and values restored after processing re-derive them. Values restored before a template declaration has registered are kept too.

  ## Migration for hosts

  No API change. A behaviour change for hosts that resume sessions: an item revisited or restored with template values now shows those values instead of drawing new ones. A host that relied on a fresh draw on every visit must clear the item's template values before restoring. Hosts that restore through `qtiTest.state` (or `testContext`) need no change: **Kennisnet**, **CitoTestUit** and **PeilingLezen** all benefit without code changes.

- [#227](https://github.com/Citolab/qti-components/pull/227) [`0fe97cf`](https://github.com/Citolab/qti-components/commit/0fe97cf00fa96710ce38754c05282b1eb03ef53d) Thanks [@herrKlein](https://github.com/herrKlein)! - Label the session context `sessionContext` instead of `testContext`, so it is told apart from the test context in devtools. The context itself is unchanged.

  ## Migration for hosts

  Only affects code that finds the context by its label, such as devtools filters. Components consuming the context, including PeilingLezen's custom interactions, are unaffected.

## 9.3.0

### Minor Changes

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - Add `item` to the `<template item-ref>` model on `qti-assessment-item-ref`.

  `item` is this ref's entry in the computed context — the same object the stamps iterate as `item` —
  so a template can show `{{ item.index }}`, `{{ item.score }} / {{ item.maxScore }}` and the rest of
  the item's state. The element subscribes to the context, so the template re-renders as scores come
  in. Undefined until the test has computed it.

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls (`test-next`, `test-prev`, `test-item-link`, `test-section-link`,
  `test-check-item`, `test-end-attempt` and the text-to-speech buttons) share one resting look that
  reads the qti-theme tokens — `--qti-component-*` for the box, `--qti-bg-active` on hover,
  `--qti-focus-*` for a `:focus-visible` ring — with the theme's defaults as fallbacks, so they
  follow a brand and still look the same without qti-theme loaded. This replaces the light-grey
  fill. `--test-button-*` slots (`background-color`, `color`, `border-color`, `border-radius`,
  `hover-background-color`, `size`) repaint the test controls alone.

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-item-to-speech`: speak each element in its own language, a player per item, and pick mode.

  - **Language resolution.** Each reading element is spoken in the language of the nearest `lang`
    (or `xml:lang`): the element, its closest ancestor — across shadow roots — then `<html lang>`,
    and only then the `language` attribute, which is now a fallback.
  - **A player per item.** `item-ref-id` pins a player to one `qti-assessment-item-ref`, so it reads
    that item whatever the navigation cursor points at. That makes a player per item possible on a
    section page, for instance from a `<template item-ref>`:
    `<test-item-to-speech item-ref-id="{{ identifier }}">`. Unset, the player follows
    `navItemRefId` as before.
  - **Several players on a page** share the browser's one speech queue: starting one stops any other,
    a player never cancels speech or clears highlights it does not own, and moving to another section
    stops every player, pinned or not.
  - **Pick mode.** `<test-tts-pick>` highlights every reading element; a click on one starts reading
    from there. The player reflects it as `:state(picking)`.
  - Reading elements now include `qti-prompt` and `qti-simple-choice`, and nested matches are read
    once. Prev/next stay enabled before the elements have been collected, and play after the last
    element starts the item over.
  - **Icon buttons.** The controls draw SVG icons instead of text glyphs, so every button has the
    same box, each with an English accessible name. Slotted content still replaces the default, and
    a slotted `<svg>` is sized like it; `label` (plus `pause-label` on `<test-tts-play>`) names the
    button, which a slotted icon needs. The controller lays its controls out as a wrapping row.

## 9.2.0

### Minor Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Complete `qti-contains`, and with it fix how every operator compares a directed pair.

  `qti-contains` carried its own `TODO: implement this for other types than directedPair`. Two things
  were wrong, and both changed scores:

  - **It tested intersection, not containment.** For `multiple` cardinality the check was
    `intersection.length > 0`, so one shared value was enough: `[A,B]` "contained" `[A,C]`. The spec
    wants every value of the second container present in the first, multiplicity included. Ordered
    containers were not handled at all; they now need the second to appear as a contiguous
    sub-sequence, so `[A,B,C]` contains `[B,C]` but not `[C,A]` or `[A,C]`.
  - **Only `directedPair` worked.** Every other base type hit an `unsupported baseType` error and
    returned false. All base types work now, compared the way `ScoringHelper` compares them.

  A first sub-expression of single cardinality is not what the spec describes — it wants two
  containers — but items in the wild write that and mean `qti-member`. That shape keeps working, with
  a warning, rather than silently scoring 0.

  **`directedPair` comparison ignored direction.** `ScoringHelper.compareSingleValues` sorted both
  operands the moment it split them, which made the `baseType === 'pair'` sort below it dead code and
  every directed pair order-insensitive: a candidate who matched the right two identifiers the wrong
  way round scored as correct. Only `pair` is unordered; a `directedPair` is now compared as written.

  This reaches every operator that compares values — `qti-match`, `qti-equal`, `qti-member`,
  `qti-contains` — so gap-match, associate and order interactions all score directed pairs correctly
  now. Nothing in the test or story suites depended on the old leniency, but authored items that did
  will score differently. `compareSingleValues` gained a spec of its own, since a mistake in it is a
  mistake in all of those operators at once.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Support `<qti-custom-operator definition="…">`, the way items authored against the Citolab QTI
  scoring engine name a custom operator. Until now only `class="js.org"` was understood — inline
  JavaScript out of a CDATA section — so an item carrying a `definition` fell through to that path
  with no code to run and contributed nothing to its score.

  `definition` is matched whole, prefix included, against operators the host registers with
  `registerCustomOperator` from `@qti-components/base`. The three the scoring engine ships are built
  in — `Trim`, `ToAscii` (decomposes and drops combining marks) and `ParseCommaDecimal` (the first
  comma becomes a dot) — each under the `depcp:`, `questify:` and `qade:` prefixes. Registering a key
  a built-in already uses overrides it, which is how a delivery engine replaces one it disagrees with.
  An operator is handed the calculated values of the element's child expressions in document order and
  returns the value of the expression. A `definition` nothing provides is NULL rather than an error, so
  the surrounding expression can test it with `qti-is-null`.

  The two mechanisms do not interact and `class="js.org"` is unchanged; `definition` is checked first.

  One fix came with it. `QtiExpression.getVariables()` had no case for `qti-custom-operator`, and
  since that element is not a `QtiExpression` — it has `calculate` but no `getResult` — the default
  branch threw on it, logged "default not sufficient" and yielded null. A custom operator nested in
  another expression therefore handed its parent nothing, which is the shape nearly every real use
  has (`<qti-match><qti-custom-operator …/>…`). It now contributes its value, with the base type read
  off that value rather than declared.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Stop every expression element re-rendering on every context change.

  `QtiExpression` rendered `<pre>${JSON.stringify(this.result, null, 2)}</pre>` beside its slot — a
  development aid nobody could see, because expressions live inside `qti-response-processing`, which is
  `display: none`. Worse, it re-ran constantly: `@consume` subscribes through `ContextConsumer`, which
  calls `host.requestUpdate()` itself on every context change, "in case this value is used in a
  template". Here it was not, and dropping `@state()` from the consumed properties does nothing about
  it — the subscription drives the update, not the decorator.

  Measured on an item with 30 response-processing rules, which holds 180 expression elements: 50 test
  context updates produced **9000 renders** — one per element per update — each serialising its result.
  The test context changes on every keystroke in a text entry.

  The template is constant, so the elements now render once and never again, and `result` is no longer
  `@state()` (nothing renders it, and response processing writes it on every expression of every rule
  it walks). The same 50 updates now produce **0 renders**, and the loop went from 10ms to 3ms. The
  context subscriptions stay: `calculate()` reads the current values when a rule invokes it.

  Replacing the debug `<pre>`, `QtiExpression` exposes a public `lastResult` — what the last
  `calculate()` produced. That is the supported way to inspect a scoring run: process the responses,
  then walk the rule tree reading `lastResult` off each expression to get the whole tree annotated with
  its values. It costs nothing when unused, and gives a tool more than the `<pre>` ever did, which was
  one hidden element's JSON.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - **Expression results no longer claim to be integers, which changes comparisons.** Elements reached
  through `QtiExpression.getVariables` that declare no base type — every operator without a case of its
  own, and `qti-custom-operator` — were all labelled `integer`. `ScoringHelper.compareSingleValues`
  parses an integer with `parseInt`, so every non-integer result was truncated before it was compared:

  ```
  equal( divide(5, 2), 2.4 )   was true    // 2.5 and 2.4 both truncated to 2
  ```

  The base type is now read off the value: a whole number is `integer`, a fractional one `float`, a
  boolean `boolean`, anything else text. Items comparing the result of a `qti-divide`, `qti-product`,
  `qti-math-operator` or similar against a decimal will score differently — correctly — where they used
  to match on the truncated integer.

  **A NULL result is now an operand rather than a gap.** An expression evaluating to NULL was handled
  inconsistently: the old default branch kept it as a variable with a null value, while newer cases
  returned nothing and the operand was filtered out of the list entirely. Dropping it both hides the
  NULL from `qti-is-null` and shifts every operand after it, so a binary operator with a NULL first
  argument silently reads its second as its first. Every path now yields a variable whose value is
  null.

  **`qti-correct` naming an undeclared response no longer crashes the run.** It found the variable,
  deliberately defaulted it to null, and then dereferenced that null — `Cannot read properties of null
(reading 'baseType')` — taking down the whole response processing. A typo in an `identifier`, or an
  expression evaluated before its declaration registered, was enough. It is an unresolved variable, so
  it is NULL.

  `qti-is-null` gained a related fix: its `if (!variables)` guard never fired, because an empty array
  is truthy, and the read after it threw. An operand that resolves to nothing is now NULL.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Let an operator declare the base type its result always has, instead of guessing it from the value.

  The QTI vocabulary fixes the result type of some operators regardless of their operands:
  `qti-divide` is a float even when it divides two integers exactly, `qti-round` an integer whatever it
  rounds. Reading the type off the computed value cannot know that — `divide(8, 2)` is `4`, which looks
  like an integer — and `compareSingleValues` parses an integer with `parseInt`, so the other operand
  was compared with its fraction discarded:

  ```
  equal( divide(8, 2), 2.5 )   was true
  ```

  `QtiExpression` gains a `resultBaseType` that operators override. Declared as `float`:
  `qti-divide`, `qti-power`, `qti-math-constant`, `qti-stats-operator`, `qti-integer-to-float`,
  `qti-round-to`, and `qti-math-operator` for everything but `floor`, `ceil` and `signum`. Declared as
  `integer`: `qti-integer-divide`, `qti-integer-modulus`, `qti-round`, `qti-truncate`,
  `qti-container-size`, and those three `qti-math-operator` functions. Operators whose type follows
  their operands — a `qti-sum` of integers is an integer — declare nothing and are still read off the
  value.

  This is the root-cause half of the earlier `baseType: 'integer'` change, which stopped every result
  being labelled an integer but still inferred from the value.

  Alongside it, an integer comparison no longer truncates a fractional operand. `parseInt` reads "2"
  and "2.5" as the same number, so a response genuinely declared `base-type="integer"` matched a
  candidate's "4.5" against a correct "4". When either side has a fractional part the two are not the
  same number and are compared in full; two whole values still go through `parseInt`, keeping its
  tolerance of input like "12 euro".

  Covered end to end by a new item fixture, because no item in this repo computes with `qti-divide` or
  `qti-math-operator` — 0 of 295 — so nothing exercised numeric comparison through real response
  processing.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - **Interpolation tables now match on ranges, which changes existing scores.** An entry's
  `source-value` is the lower bound of a range, not a value to match exactly, and `include-boundary`
  (default `true`) says whether the bound itself is in range. Entries are tested in document order and
  the first one the value clears wins.

  We matched exactly and ignored `include-boundary` entirely, so a value between two entries found
  nothing and scored 0. Read this one before upgrading: a table in this repo's own fixture
  (`3 -> 2`, `2 -> 1`, `1 -> 0`, `0 -> 0`, every entry `include-boundary="false"`) now scores a raw 3 as
  1 where it used to be 2, and a raw 2 as 0 where it used to be 1. If your tables were authored
  against the old exact matching, their scores move. This also diverges deliberately from the Citolab
  scoring engine, which documents exact matching rather than ranges.

  `OutcomeVariable.interpolationTable` changes type with it, from `Map<number, number>` to an ordered
  `InterpolationTableEntry[]` — a Map keyed by source value cannot express a bound, a boundary rule or
  document order.

  `qti-lookup-outcome-value` returns `null` rather than `0` when nothing matches, and leaves the
  outcome at the default its declaration gave it instead of writing a score the table never specified.
  It never wrote on a miss before either; only the return value changed.

  **`qti-equal` supports `tolerance-mode="absolute"` and `"relative"`.** Both previously logged
  "toleranceMode is not supported yet" and returned false whatever the values, so a tolerant
  comparison could never succeed. `tolerance` takes one or two numbers (one means both sides);
  `absolute` reads them as offsets around the second expression, `relative` as percentages of it.
  `include-lower-bound` and `include-upper-bound` default to true and are read off the attribute
  rather than declared as Lit boolean properties, because QTI writes `include-lower-bound="false"` and
  Lit's boolean converter takes the mere presence of an attribute as true.

  **`qti-exit-test`** ends a test's outcome processing, the counterpart of `qti-exit-response` and
  caught the same way in `QtiOutcomeProcessingProcessor`.

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

- [#219](https://github.com/Citolab/qti-components/pull/219) [`aee42e6`](https://github.com/Citolab/qti-components/commit/aee42e664e5c2dce5630cce0493118bff8655e7c) Thanks [@herrKlein](https://github.com/herrKlein)! - Finish the `<template item-ref>` hook on `qti-assessment-item-ref`.

  The element has carried a `myTemplate` property and a `render()` that branches on it since the
  stamp components were written, but the one line that resolves the template was commented out, so
  `myTemplate` was never assigned and the branch was dead. A host that wanted to put its own chrome
  around every item — a bookmark, an index number, a score badge — had no seam at all, and the only
  way in was to replace the registered element.

  Put a `<template item-ref>` in the light DOM of your `<qti-test>` and every item-ref in the test
  renders with it:

  ```html
  <qti-test>
    <template item-ref>
      <div class="badge">{{ identifier }}</div>
      {{ xmlDoc }}
    </template>
    …
  </qti-test>
  ```

  The template is the whole render, so it places `{{ xmlDoc }}` itself; leaving it out renders the
  chrome and no item. Without a template the element renders the item exactly as before, so this is
  additive — nothing that works today changes.

  The model is `ItemRefTemplateModel`: `xmlDoc`, `identifier`, `href`, `category`, and `itemRef` as
  the escape hatch for a template that needs a handler or a host value, reached through a property on
  the element.

  Two fixes to the commented code it replaces. The lookup assumed the ref always sits directly inside
  a shadow root (`getRootNode().host.closest('qti-test')`), which throws for a ref in plain light DOM
  and for one nested deeper than one root; it now climbs root by root and gives up quietly when there
  is no enclosing `<qti-test>`. And `myTemplate` was declared as an always-assigned
  `TemplateFunction`, which it never was — it is now `TemplateFunction | null`, matching
  `test-scoring-buttons`.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the four expressions and rules the scoring engine supports and we had no element for at
  all. Each was previously an unknown tag: inert, silently contributing nothing to a score.

  `qti-math-constant` returns `pi` or `e` as a float, and NULL for a name outside that vocabulary.

  `qti-exit-response` ends the attempt's response processing. An exit can sit at any depth — inside a
  `qti-response-condition` branch, inside a `qti-response-processing-fragment` — and has to stop every
  rule after it, not just its own siblings, so it throws a `QtiExitResponseSignal` that
  `qti-response-processing` catches at the top of the run. Unwinding the stack reaches every one of
  those loops without each having to report upwards. The outcomes set before the exit are kept,
  because a `qti-set-outcome-value` has already dispatched by the time the signal is thrown. Anything
  that is not the signal rethrows, so a genuine error in a rule still surfaces.

  `qti-response-processing-fragment` runs its rules in place, in document order, exactly as if they
  had been written where the fragment sits. A fragment held in a separate file is still not pulled
  in, because `qti-include` is not resolved — only the rules authored inside the element run.

  `qti-number-selected` counts the item references the test selected, narrowed by
  `section-identifier`, `include-category` and `exclude-category`. It counts the item refs in the
  document rather than the entries in the test context, so it is the same set `qti-test-variables`
  aggregates over and it is right before any item has been attempted.

  The last two share how they choose item refs, so that selection moved into one place
  (`internal/item-ref-selection`). `qti-test-variables` gains `section-identifier` from the move —
  it filtered by category but had no way to scope to a section.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Close the gaps between our scoring and the QTI expression vocabulary, found by comparing against
  the Citolab QTI scoring engine's supported-feature list. Four of these silently produced a wrong
  score rather than failing.

  **`qti-test-variables` never aggregated anything.** The test-level expression that sums an
  item variable across the test — the one that computes a test's total — always returned 0, or
  threw. Three faults stacked:

  - It resolved the test element from a `qti-assessment-test-connected` listener on itself, but that
    event bubbles _up_ from the test while the expression sits inside that test's
    `qti-outcome-processing`. The listener never fired. It now walks up with `closest()`.
  - The item-ref query read `qti-asssessment-test qti-assessment-item-ref` — three s's, and a
    descendant selector that would match nothing even spelled right, since it runs _on_ the test
    element. `test-base.ts` already had the correct form.
  - `exclude-category` overwrote the `include-category` result instead of narrowing it, so an item
    passing both attributes was decided by the exclude list alone. Both now apply, and each side
    reads `category` as the space-separated list the spec defines.

  **`weight-identifier` was a no-op.** `QtiAssessmentItemRef.weigths` was an empty `Map` nothing ever
  wrote to: the `<qti-weight>` children in the test document were never read, so every weight fell
  back to 1 and a `value="0"` item still counted. Replaced by a `weights` getter that reads them on
  access — they are not in the DOM at construction time. This repo's own `biologie` test masked it,
  because its zero-weight items are also excluded by category.

  The misspelled `weigths` is gone rather than kept as a deprecated alias. Nothing that worked is
  broken by that: the property only ever handed back an empty Map. An alias was the first attempt,
  but two accessors where one returns the other sends the custom-elements-manifest analyzer's type
  parser circular, failing `pnpm run cem`.

  **`qti-math-operator` `log` returned the natural logarithm.** The QTI vocabulary defines `log` as
  base 10 and `ln` as natural; both called `Math.log`. Any item using `log` scored against the wrong
  curve. Items relying on the old behaviour should move to `ln`, which is unchanged. Also adds
  `secant`/`cosecant`/`cotangent` (and the short `sec`/`csc`/`cot`), `toDegrees` and `toRadians`,
  which had no implementation and fell through to a null.

  **`qti-pattern-match` was unanchored.** `new RegExp(pattern).test(value)` matches a substring, so
  `[0-9]+` accepted `"abc123"`. XML Schema pattern semantics match the whole value; the pattern is
  now wrapped as `^(?:…)$` so a top-level alternation cannot escape the anchors. Compiled with the
  unicode flag first so `\p{L}` category escapes work, falling back without it for patterns that flag
  rejects.

  **`qti-field-value` threw on a missing field.** `qti-is-null` over a `qti-field-value` is the
  specified way to ask whether a record carries a field, which requires a missing one to be an
  ordinary NULL — throwing aborted the whole response-processing run instead. Every failure path is
  now NULL.

  **`qti-integer-modulus` disagreed with `qti-integer-divide` on negatives.** The divide rounds down
  (`Math.floor`) while the modulus used JavaScript's `%`, which truncates toward zero: `-7 divide 3`
  gave `-3` but `-7 modulus 3` gave `-1`, where floored division leaves `2`. The remainder is now
  computed to pair with the divide.

  **`qti-stats-operator` implemented two of six functions.** `median`, `popVariance`,
  `sampleVariance` and `sampleSD` warned and returned null; only `mean` and `popSD` worked. A sample
  statistic over a single observation is NULL rather than a division by zero.

  **`qti-match-table` was not read at all.** `qti-outcome-declaration` parsed only
  `qti-interpolation-table`, so `qti-lookup-outcome-value` against a match table always scored 0.
  Match-table targets keep their authored spelling, since a match table may map onto identifiers or
  strings rather than numbers.

  **`qti-repeat` had no iteration cap.** `number-repeats` may name a variable, so a bad value could
  build an unbounded container and hang the tab. Capped at 1000, matching the scoring engine.

### Patch Changes

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Support `shape="default"` area map entries, which neither render nor score.

  A `default` area is the whole image. QTI 3.0 §7.9 ends its coords list with "default: no
  coordinates should be given", but the XSD makes `coords` `use="required"`, so real items carry
  filler — `0,0,100%,100%` in Citolab/qti-components#83. Both places that read an area treated that
  filler as geometry:

  `positionShapes` knew `circle`, `rect`, `ellipse` and `poly`, so a `default` entry fell to its
  `default:` branch, logged `Unsupported shape: default` and wrote no styles at all — showing the
  correct response left the area in the DOM with no size, invisible. It now spans the image, and the
  coords are deliberately not read: HTML, where the vocabulary comes from, settles it with "This area
  is the whole image. (The coords attribute is not used.)"

  `ScoringHelper.isPointInArea` had a `case 'default'` folded in with `case 'circle'`, which demands
  exactly three coords, so it rejected every real entry as an `Invalid circle definition` and a click
  outside the other areas scored nothing. `default` now returns true for any point without reading
  coords.

  A whole-image area overlaps every other area, which made a missing `break` in
  `qti-map-response-point` reachable for the first time: a point inside a smaller area scored that
  area _and_ the catch-all. §7.4 — "each area is tested in turn, with those listed first taking
  priority in the case where areas overlap and a point falls in the intersection" — so matching now
  stops at the first area containing the point.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Stop doing expensive work for log lines nobody reads, and log at the right level.

  Two traces serialised data on every expression evaluation, whether or not anything was listening —
  `console.debug` computes its arguments regardless of the console's level:

  - `qti-multiple` logged `this.innerHTML`, serialising its whole DOM subtree. It wraps the correct
    response in most choice items, so this ran on every scoring pass.
  - `qti-default` logged `JSON.stringify(itemContext)`, serialising an item's entire variable set —
    and did it _before_ the null check that may return early.

  Two more fired per child per expression evaluation in `QtiExpression.getVariables` and carried no
  information the caller did not already have. All four are gone; no debug infrastructure gated them,
  so they were development traces rather than diagnostics anyone could rely on.

  Error conditions in `qti-lte` and `qti-gte` were reported with `console.log` rather than
  `console.error` (and `qti-gte` named itself "qte"), and the `disableAfterIfMaxChoicesReached`
  deprecation notice used `console.log` where a deprecation belongs at `console.warn`. No
  `console.log` remains in shipped source.

- [#214](https://github.com/Citolab/qti-components/pull/214) [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix a dropped picture rendering low and hanging out of its hotspot in `qti-graphic-gap-match-interaction` ([#213](https://github.com/Citolab/qti-components/issues/213)).

  `qti-gap-img` never called `super.connectedCallback()`, so Lit never enabled updating and the element had no shadow root — which made `qti-gap-img.styles.ts`, the stylesheet that centres the picture, dead code. The source already carried a note saying exactly that. Without it the authored `<img>` / `<object>` was laid out as an inline replaced element on a text baseline rather than centred: it sat low in the chip with the line box's descender space below it.

  On the 1EdTech "Airport Tags" example, whose hotspot `A` is authored `coords="12,108,39,121"` (27x13) around an 18x9 picture, the picture rendered 7px down from the hotspot top, 2.5px below its centre, with its bottom 3px past the box. The chip also measured 18px tall for a 9px picture, and that measurement feeds `--qti-dropzone-min-height` — so the hotspot itself was inflated to 27x18 and the box on screen was not the box in the item either.

  `qti-gap-img` now calls `super.connectedCallback()` and renders a `<slot part="label">`, matching `qti-gap-text`, the sibling chip that always did this correctly. The chip is the size of its picture, the hotspot keeps the size its `coords` declare, and the picture lands centred inside it.

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix `qti-graphic-order-interaction` on the QTI 3 spec form of an ordering item ([#209](https://github.com/Citolab/qti-components/issues/209)). Two defects, either of which broke it on its own.

  **RESPONSE ignored the candidate's ordering.** The interaction only wrote `aria-ordervalue` on each hotspot; the response itself was published by `ChoicesMixin` as the set of _checked_ choices in **DOM order** — the one thing an ordering must not do. `ChoicesMixin.maxChoices` also defaults to `1`, so each click cleared the previous hotspot and made the interaction a `radiogroup` of `radio`s. Clicking A, D, C, B left `RESPONSE` as the single identifier `"B"` where the `ordered` cardinality declaration expects `["A","D","C","B"]`, so response processing never scored the item — while the pins painted 1-2-3-4 and made it look right.

  The response is now the ordering: `max-choices` defaults to `0` (no limit, QTI's default for an ordering), the interaction publishes the ordered identifier list itself, and pins plus `aria-ordervalue` are derived from the response rather than kept as a second copy of it. Deselecting a hotspot renumbers the rest by falling out of the array, and a response set from anywhere else — a restored attempt, a correct-response display, an author setting the property — now repaints the pins.

  **An `<object>` graphic left every hotspot unpositioned.** QTI 3 carries the graphic as `<object type="image/png" data="…">`, which is what the spec's own graphic interaction examples use, but the hotspots were positioned against `querySelector('img')`. On a spec-form item that is `null`, `positionShapes` threw, and no hotspot got a position — so all of them collapsed onto the theme's `100%x100%` and stacked as one large box below the graphic. Only items that had been through a converter rendered at all.

  `findGraphic` now accepts `<img>` and `<object type="image/*">` alike, and `positionShapes` resolves the coordinate space from either — including the two forms where the attributes cannot supply it. `width`/`height` are **optional** on the QTI `<object>` (only `data` and `type` are required), so a graphic that declares no size falls back to the bitmap's own, probed by loading the same URL and cached per element. And QTI's `LengthDType` is `[0-9]+%?`, so `width="50%"` is valid markup on either form: a percentage is a layout instruction, not a coordinate space, and reading it as `50px` used to push every hotspot off the graphic — it now falls back to the intrinsic size too. A graphic whose size cannot be resolved at all is reported instead of silently writing `NaN%` and leaving the hotspots full-size.

  `qti-hotspot-interaction`, `qti-graphic-associate-interaction` and `qti-select-point-interaction` make the same `img`-only assumption and are not covered here.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Read two QTI attributes that never reached their properties.

  Lit derives an attribute name by lowercasing the property, so a camelCase property bound to a
  hyphenated QTI attribute has to name it explicitly. Two did not, and the attribute silently never
  arrived — no error, just the default.

  `qti-equal-rounded`'s `rounding-mode` was read as `roundingmode`, so every comparison used the
  `significantFigures` default. An item asking for **3 decimal places got 3 significant figures**: at
  that precision 54.598 and 54.608 are both 54.6, so a wrong answer scored full marks. The existing
  `decimalPlaces` specs did not catch it, because their values round the same under either mode.

  `qti-assessment-item`'s `time-dependent` was read as `timedependent`, so `timeDependent` stayed null
  and an item declaring `time-dependent="true"` still reported false to `test-navigation`, which reads
  it to build the computed item context.

  Found by running a computed-answer item end to end — template processing works out an answer with
  `qti-divide` and `qti-math-operator`, and response processing compares the candidate against it with
  `qti-equal-rounded`. Nothing in the repo exercised that shape before.

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Report a malformed item instead of rendering the browser's XML parse error as the item ([#211](https://github.com/Citolab/qti-components/issues/211)).

  `DOMParser.parseFromString(text, 'text/xml')` never throws: on a malformed document it returns a _document describing the failure_, an HTML page reading "This page contains the following errors…". `parseXML` and `loadXML` handed that straight back, `toHTML` copied it into the DOM node by node, and the player rendered the browser's error page as the item's content — silently, because `item-container` wraps both entry points in a `try`/`catch` that nothing ever reached.

  Both now detect the parser-error document and throw, carrying the parser's own message so the line and column of the real problem survive. The error document is matched by its namespace rather than by tag name, so an item that legitimately contains an element named `parsererror` is not mistaken for a failure.

  Leading whitespace and a BOM before the XML declaration are stripped before parsing. A blank line in front of `<?xml` is fatal to the letter of the XML spec, and it is also one of the most common artefacts of an item that has been through an editor or a copy and paste — the parser already tolerated the analogous BOM case. That is the input that surfaced this: it rendered as `error on line 2 at column 6: Invalid processing instruction: <?xml`.

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Stop mangling fractional outcome values on comma-decimal locales.

  `convertNumberToUniversalFormat` ran `.replace('.', '')` over `Number.prototype.toString()`, which
  always uses `.` regardless of locale. On any browser whose locale uses a decimal comma (nl, de, fr,
  ...) that deleted the separator instead of converting it: a score of `0.5` was stored as `"05"` and
  `1.5` as `"15"`, so every SCORE with a fraction came out ten times too big. On dot-decimal locales
  the other branch called `toLocaleString()`, which grouped thousands — `1234.5` became `"1,234.5"`.

  Both branches are gone. `toString()` already produces QTI's format — a plain decimal with `.` and no
  grouping — on every locale. Affects `qti-set-outcome-value`, `qti-lookup-outcome-value`,
  `qti-set-template-value` and `qti-set-correct-response`.

## 9.1.0

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

### Patch Changes

- [#206](https://github.com/Citolab/qti-components/pull/206) [`3984227`](https://github.com/Citolab/qti-components/commit/39842270a207dfb43e0cd95a9a63faaaaf6a8989) Thanks [@herrKlein](https://github.com/herrKlein)! - Make `@heximal/templates` a dependency of `@qti-components/test` instead of a peer.

  A peerDependency says "there must be exactly one of these, and you own the choice". Neither half is
  true here: `@heximal/templates` is a templating library used by seven files inside one package, it
  has no singleton requirement, and no consumer has any reason to hold an opinion about its version.
  Peering it just forced every consumer to install a transitive implementation detail by hand.

  That was a real failure, not a theoretical one. Under an install that does not auto-install peers —
  Yarn 2+, or pnpm with `auto-install-peers=false` — the published `@qti-components/test@1.6.1` cannot
  resolve its own import:

  ```
  @heximal/templates  ->  MODULE_NOT_FOUND
  ```

  As a plain dependency it now installs automatically, and the consumer declares nothing.

  `lit` and `@lit/context` stay peers, where the reasoning does hold: two copies of Lit mean two
  `ReactiveElement` base classes, so `instanceof` fails across them, and Lit's own multi-version
  warning fires.

- [#204](https://github.com/Citolab/qti-components/pull/204) [`bea30e9`](https://github.com/Citolab/qti-components/commit/bea30e9c6df3e2e71d14b4deaa6c3de288a6e92d) Thanks [@herrKlein](https://github.com/herrKlein)! - Declare the shared runtime dependencies through a pnpm catalog, so Lit cannot drift out of
  alignment again.

  `lit` was hand-written in 62 places across 34 manifests at two different ranges — `^3.3.1` in every
  `peerDependencies` block, `^3.3.3` in every `devDependencies` block — and `@citolab/qti-components`
  declared `^3.3.3` as a hard `dependency`. A consumer pinned to 3.3.1 or 3.3.2 could satisfy the
  parts and not the umbrella, which is how a package manager ends up installing a second copy of Lit.
  Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them) and two
  `@lit/context` registries; because the contexts in `@qti-components/base` are keyed with a unique
  `Symbol()` rather than `Symbol.for`, every `@consume` then silently never resolves — no error, no
  log.

  `lit`, `@lit/context` and `@heximal/templates` now live in the `catalog:` block of
  `pnpm-workspace.yaml`, and every manifest references them as `"catalog:"`. The peer and dev ranges
  are unified on `^3.3.1`, the wider of the two: it still installs 3.3.3 locally, and narrowing it
  would exclude consumers the sibling packages already accept.

  The only change to a published manifest is `@citolab/qti-components`'s `dependencies.lit`, which
  widens from `^3.3.3` to `^3.3.1` to match its own parts. Every other packed manifest is byte
  identical — `pnpm pack` and `pnpm publish` resolve `catalog:` back to the real range in
  `dependencies`, `devDependencies` and `peerDependencies` alike. No resolved version changes.

  Two pieces of tooling had to move with it, because **npm does not understand the `catalog:`
  protocol and copies the literal string through**:

  - `tools/testing/consumer-types.mjs` now packs with `pnpm pack` instead of `npm pack`, and asserts
    the packed manifest contains no leftover `catalog:` or `workspace:` range.
  - The pkg.pr.new prerelease workflow now passes `--pnpm`. pkg-pr-new shells out to `<pm> pack` and
    that pm defaults to npm, so without the flag every prerelease tarball would have declared
    `"lit": "catalog:"` — not a version range — and failed to install downstream.

  The `storybook` override also moves to the catalog, retiring the deprecated `$storybook`
  version-reference syntax that publint was warning about.

## 9.0.0

### Major Changes

- [#203](https://github.com/Citolab/qti-components/pull/203) [`a5739c6`](https://github.com/Citolab/qti-components/commit/a5739c6327dd3e850081dfd76f6b5923d3fbbfdd) Thanks [@herrKlein](https://github.com/herrKlein)! - `@citolab/qti-components/corrections` is now a drop-in alternative to the package root. Where the root registers the standard delivery elements, this registers the same set with the correction variants substituted for the tags they cover, plus the correction-only controls:

  ```html
  <script type="module">
    import '@citolab/qti-components/corrections';
  </script>
  ```

  Elements without a correction variant — the processing operators, most test controls, interactions like media and upload — still get their standard constructor, so the page works as a whole.

  **Breaking:** that subpath previously only re-exported `@qti-components/corrections` and registered nothing. It still exports everything it did, but importing it now defines custom elements. Anything importing it purely for the mixins, types or constructors should move to the package root.

  Importing `@citolab/qti-components` is unchanged.

  Registration is first-wins and silently so — every `register.ts` guards with `if (!customElements.get(tag))` — so importing both entry points leaves the correction variants inactive with no error. The corrections entry detects that and warns, naming the tags it could not claim.

### Minor Changes

- [`0822231`](https://github.com/Citolab/qti-components/commit/0822231381b8b4d5d6f98c524e86cf2ef42f12ce) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the `qti-printed-variable` formatting attributes: `format`, `base`, `index`, `power-form`, `field`, `delimiter` and `mapping-indicator`.

  The element rendered its value with `JSON.stringify(value, null, 2)` and declared none of these attributes, so every printed variable came out as JSON: a single value carried its quotes (`"ChoiceA"`, `"1"`), and an ordered or multiple variable printed as a pretty-printed array —

  > Here is a set of numbers: `["-98",\n  "2",\n  "-70",\n  "48"]`

  — instead of a delimited list. That is what made the mc_stat2 example look like it was printing nothing useful ([#134](https://github.com/Citolab/qti-components/issues/134)).

  Now a container prints its values joined by `delimiter` (default `;`), a record prints `name=value` pairs using `mapping-indicator` (default `=`), `index` selects one value of an ordered variable (1-based), `field` selects one field of a record, `base` prints an integer in another number base, `power-form` prints numeric values in exponential form, and `format` applies a printf-style conversion string (`%.2f`, `Score: %d`, flags `-+ 0#`, width, precision, and the conversions `d i u o x X f F e E g G s c`). A NULL variable — absent, null, or an empty container — prints nothing.

  Closes [#202](https://github.com/Citolab/qti-components/issues/202).

### Patch Changes

- [#201](https://github.com/Citolab/qti-components/pull/201) [`eac8b80`](https://github.com/Citolab/qti-components/commit/eac8b80db65b08c01314fc5a6fd9630afbae3541) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - No-op `test-navigation`'s candidate events when there is nothing to act on.

  The navigation buttons are clickable before a test document has loaded — a failed
  `assessment.xml` fetch leaves them enabled indefinitely — so a click could reach a handler
  that dereferenced the test element, the item-ref and its assessment item unguarded, throwing
  `TypeError: Cannot read properties of undefined (reading 'querySelector')`.

  `test-end-attempt` now resolves the item through the existing `activeAssessmentItem` getter and
  `test-update-outcome-variable` through `#assessmentItemFor`, each returning early when nothing is
  rendered. Autoscoring resolves the item from the interaction event's own path, so
  `qti-interaction-changed` also returns early for a change raised outside an assessment item.

  `test-show-correct-response` and `test-show-candidate-correction` need no change: they are handled
  by `TestNavigationCorrection` in qti-corrections, which already resolves the item through optional
  chaining.

- [`1252a5b`](https://github.com/Citolab/qti-components/commit/1252a5b0f6c9dc1205101ab9844729c6a9e2918c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix drops being refused by a drop target that spans the full width of its interaction.

  `closestCornersWithInventoryPriority` — the default collision algorithm for slotted drag-drop — ranks zones by **average corner distance**, which grows with a zone's own dimensions: the corners of a wide target are far from the drag even when the drag sits dead centre in it. The inventory container then won the `distance <= droppableDistance * 1.5` comparison, so the chip animated back to the source set and the response stayed empty.

  A `qti-match-interaction` whose second match set holds a single target hit this every time, because one target renders full-width. That is the item reported in [#145](https://github.com/Citolab/qti-components/issues/145): four image choices and one "The biggest obtuse angle" target that nothing could be dropped into.

  The closest droppable now wins outright when the drop point is inside it, which is size-independent — mirroring the absolute priority the inventory container already had for the same test. Scoped to the closest droppable on purpose: it settles droppable-vs-inventory and never which droppable wins, so overlapping targets (a filled `qti-associable-hotspot` grown over its neighbour, say) stay the corner ranking's business.

## 8.2.0

### Minor Changes

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Gate linear navigation and further attempts on item doneness.

  An item is done once an attempt has ended and either reached the optimal outcome or exhausted its
  `max-attempts`. `test-navigation` computes that centrally and publishes `done` and `optimal` on the
  computed context.

  Optimality is judged from the scored outcome where there is one — `SCORE` having reached `MAXSCORE`,
  which handles partial-credit and `qti-mapping` items correctly — and otherwise from an exact match
  against the declared `qti-correct-response`. Items with neither (essays, info items) count as done
  after one attempt, since there is no optimal value to require.

  It is latched only when `processResponse` ends an attempt: `qti-assessment-item` now flags that
  context update with `responseProcessed`, so a mid-attempt selection never counts. A restored session
  seeds the latch once from the persisted context.

  `test-next` in linear/individual mode gates on `done` in place of "any attempt ended", and
  `test-end-attempt` is additionally disabled once a non-adaptive item's last ended attempt was
  already optimal — there is nothing left to improve.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-item-session-control`, and honour `max-attempts` and `allow-skipping`.

  The element exposes the QTI 3.0 `ItemSessionControl` attributes, and `test-navigation` cascades
  them from test-part to section to item into the computed context, so every item carries the
  settings that apply to it.

  `test-end-attempt` reads that cascade: it is disabled once a non-adaptive item has reached its
  `max-attempts` (`max-attempts="0"` means unlimited), and — when `allow-skipping` is false — while
  the active item's response is still invalid or untouched. Adaptive items are exempt from the
  attempt limit, since they are meant to keep iterating.

  The computed context gains `valid` and `isDefaultResponse` per item to support that, alongside
  `maxAttempts` and `allowSkipping`.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Apply the `show-feedback` constraint per the QTI `ItemSessionControl` rules.

  `test-navigation` cascades `show-feedback` from the session control into the computed context, and
  `QtiFeedback` consults it.

  The constraint governs exactly one state: after the end of the last attempt. Until then the spec
  requires any applicable feedback to be shown — "a value of max-attempts greater than 1, by
  definition, indicates that any applicable feedback must be shown" — and only "once the maximum
  number of allowed attempts have been used (or for adaptive items, completionStatus has been set to
  completed)" does `show-feedback` decide. So the gate asks whether the item is out of attempts, which
  is answered per item kind:

  - adaptive items ignore `max-attempts` entirely, and are out of attempts only once
    `completionStatus` is `completed`;
  - `max-attempts="0"` means no limit, so that state is never reached and feedback always shows;
  - otherwise, once `numAttempts` reaches `max-attempts`, `show-feedback` decides, defaulting to
    false.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reveal the solution after an ended attempt when `show-solution` says so.

  `test-navigation` settles item doneness on an ended attempt and hands it to a new
  `afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
  needed because the computed context only catches up on the next update, after the event has finished
  bubbling.

  `TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
  an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
  The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
  corrections rendering, not to item session control.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep the test-level outcomes a test document declares.

  Test-level `qti-outcome-declaration` elements register themselves into the test context as they
  connect, by dispatching `qti-register-variable`. They are children of `qti-assessment-test`, so they
  connect — and register — _before_ the test element announces `qti-assessment-test-connected`.

  The test host reset its context on that announcement, which threw every one of those registrations
  away. No test-level outcome could then be read or set: `getOutcome` returned nothing, and
  `qti-set-outcome-value` at test level reported the identifier as unavailable.

  `test-container` now announces a new test document with `qti-testdoc-loaded` at the point it assigns
  it, and the host resets on that instead. Lit's re-render is async, so the reset still lands before
  any child of the new document connects. `qti-assessment-test-connected` keeps its remaining job of
  adding the item-refs, and now preserves what the document registered.

  This also removes a dead guard: the old handler tested `testContext.items.length > 0` immediately
  after assigning the initial context, so the condition could never hold.

### Patch Changes

- [#199](https://github.com/Citolab/qti-components/pull/199) [`9073338`](https://github.com/Citolab/qti-components/commit/9073338d093389485b43449e53043c451e04159a) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix inherited attributes/members/slots/events/csspart metadata silently missing from the generated custom elements manifest and JSX types for components that only inherited an API from a mixin/base class and didn't declare an entry of their own. Caused by a breaking change in `@wc-toolkit/cem-utilities@1.6.0` that `@wc-toolkit/cem-inheritance` relies on; `@wc-toolkit/cem-utilities` is now pinned to `1.2.0` until upstream is fixed ([wc-toolkit/cem-inheritance#30](https://github.com/wc-toolkit/cem-inheritance/issues/30)).

- [`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix the drag-handle grip rendering off-centre on `qti-gap-text` chips and `qti-simple-associable-choice` chips (used by gap-match, associate and match interactions).

  The grip is a theme-drawn `::before` on `::part(control)`, centred with `vertical-align: middle` — a line-box/font-metric alignment, not a geometric one. `qti-gap-text` and `qti-simple-associable-choice` gave their `control` div no layout of its own, so the glyph's position drifted with font/line-height. `[part='control']` now flex-centres its content (`display: flex; align-items: center; justify-content: center`), matching the fix `qti-simple-choice` already had for its own control.

- [#198](https://github.com/Citolab/qti-components/pull/198) [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Resolve test-level outcomes in variable expressions.

  The `variable` expression and `getVariables()` only consulted item scope, so a test-level outcome
  that had just been set — a total summed in outcome processing, say — could not be read back:
  `<qti-variable identifier="TEST_SCORE"/>` resolved to `undefined` and threw once used in a
  comparison.

  Item scope is resolved first, then the test-level outcome variables, mirroring how
  `qti-printed-variable` already does it — and an unresolved identifier now returns `null` instead of
  throwing. This is the pattern the QTI 3.0 spec's own feedback examples rely on: set a total via
  `qti-test-variables`, then branch on it with `qti-variable` in an `outcomeCondition`.

## 8.1.0

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

- [#193](https://github.com/Citolab/qti-components/pull/193) [`7c7619c`](https://github.com/Citolab/qti-components/commit/7c7619c4a9ab8e98ec6ab7e5bfcc5475bc32aa3e) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-outcome-condition` with its `qti-outcome-if` / `qti-outcome-else-if` / `qti-outcome-else`
  branches.

  `outcomeCondition` is the QTI 3.0 counterpart of `responseCondition` and the element the spec's
  own feedback examples branch on. Without it, an `outcomeProcessing` block that uses one had no
  element to match and its rules never ran.

  The two conditions are structurally identical — a container that walks its branches in order and
  processes the sub-rules of the first one that applies — so that behaviour now lives in a shared
  `QtiConditionBase` / `QtiConditionIfBase` / `QtiConditionElseBase` family that both the response-
  and outcome- elements extend. `qti-response-condition` and its branches keep their existing
  behaviour.

### Patch Changes

- [`29ed97e`](https://github.com/Citolab/qti-components/commit/29ed97ef79018aa99d941e7d425ac72fa9100abf) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Substitute response processing templates in the element's own custom element registry.

  `qti-response-processing` with a `template="…/rptemplates/map_response.xml"` attribute replaces its
  children with the built-in rules for that template. It parsed them with
  `document.createRange().createContextualFragment()`, and the fragment parsing algorithm takes its
  registry from the context node — `document`, so the global registry. In a player rendered into a
  shadow root with a scoped registry whose tags are also defined globally, every substituted rule was
  upgraded with the global class instead of the scoped one, so a registry that overrides a rule (what
  `qti-corrections` does) never saw its own element.

  The rules are now parsed through the element's own `innerHTML`, where the context element is the
  `qti-response-processing` itself and its registry — scoped or global — is the one that upgrades
  them. An unrecognised template name also leaves the authored children in place instead of clearing
  them.

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

- [#191](https://github.com/Citolab/qti-components/pull/191) [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reject `load()` when the XML fetch fails.

  `qtiTransformTest().load()` and `qtiTransformManifest().load()` wrapped `loadXML` in a `new
Promise` that only ever called `resolve`. When the fetch failed — offline, CORS, a 404 — the
  rejection had no handler, so it escaped as an unhandled rejection and the promise the caller was
  awaiting never settled. A player awaiting `load()` hung there with no error to render and no way
  to retry.

  Both now `await loadXML` directly, so the failure propagates to the caller and an abort still
  surfaces as `AbortError`. Successful loads resolve with the api as before.

## 8.0.2

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

## 8.0.1

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.

## 8.0.0

### Major Changes

BREAKING: the umbrella republished on top of the workspace's breaking batch. The umbrella bundles every `@qti-components/*` package into its own `dist`, so their breaking changes are breaking here.

#### Drop sizing and drag-and-drop internals

`interactions-core`, `theme`, `base`, `order-interaction`, `match-interaction`

- A drop is now either a **measured slot** or a **flat-floor card**, decided per interaction rather than per drop. Order's drops size from their chips instead of stretching to a grid track.
- **Six CSS custom properties removed:**

  | removed                        | use instead                                       |
  | ------------------------------ | ------------------------------------------------- |
  | `--qti-drop-min-height`        | `--qti-dropzone-min-height`                       |
  | `--qti-drop-min-width`         | `--qti-dropzone-min-width`                        |
  | `--qti-match-target-min-width` | `--qti-dropzone-min-width` (fallback `150px`)     |
  | `--qti-drop-gap`               | declare `gap` on your own `::part(drop)` rule     |
  | `--qti-dropzone-padding`       | declare `padding` on your own `::part(drop)` rule |
  | `--qti-form-size`              | `--qti-control-size`                              |

- The `qti-droppable` **attribute is gone**; drop targets carry the custom state `:state(droppable)` only. Migrate `[qti-droppable]` and `:state(drop)` → `:state(droppable)`.
- New exports from `interactions-core`: `DropzoneAutoSizeMixin`, `MenuAutoSizeMixin`. Both re-measure on resize and mutation, so a late-loading image no longer leaves a drop the wrong size.
- `DragDropSlottedMixin`'s unreachable `configuration` object is removed, and `applyDropzoneAutoSizing`'s trailing `hostWindow` parameter moved into `options`.

See `packages/qti-theme/DROP-SIZING.md` for the full model.

#### `qti-match-interaction` tabular mode

The `<table>` / `<tr>` / `<td>` scaffolding is replaced by a CSS grid with subgrid wrappers, sharing its shadow structure with the editor's tabular implementation. Input cells are now `<label>`-wrapped, so clicking anywhere on a cell toggles it.

- `::part(table)` → `::part(grid)`
- `::part(row)` → `::part(input-cell)` (or drop it; rows are no longer a styled boundary)
- `::part(checkmark)` is gone — the checkmark is drawn by the `check-checkbox-checked` mask
- `--qti-match-rows` / `--qti-match-cols` are now written on the inner `[part='grid']`, not on the host

#### `qti-inline-choice-interaction`

The open control renders as one shape, and autosizing measures option rows rather than the menu — fixing a control that grew by one chevron on every open, and one that came out ~60px too wide. The measured width is written on `::part(trigger)`, not the host. The anchor is renamed `--qti-inline-choice-trigger` → `--qti-inline-choice-anchor`. Consumer CSS reaching into the old trigger/menu structure needs revisiting.

Four component-local custom properties removed in favour of shared tokens: `--qti-inline-choice-overlay-z-index` → `--qti-overlay-z-index`, `--qti-inline-choice-popover-z-index` → `--qti-popover-z-index`, `--qti-inline-choice-motion-duration-fast` → `--qti-motion-duration-fast`, `--qti-inline-choice-trigger-gap` → `--qti-glyph-gap`.

#### `item.css`

Ships from `@qti-components/theme` 2.0.0, which carries the removed custom properties and the retargeted parts above.

### Minor Changes

- **Portable custom interactions** now receive `responseDeclaration` and `status` in their `getInstance` configuration, so a PCI can render the correct response itself instead of having it pushed in as a candidate response. `correctResponse` is only sent when `status` is `solution` or `review`. Implements the design agreed in [1EdTech/qti-project-management#210](https://github.com/1EdTech/qti-project-management/issues/210).
- **The theme covers editor documents.** `reset.css` is scoped to `.ProseMirror` as well as `qti-item-body`, and a new `prose.css` gives plain author markup (tables, lists, headings, rules) a look.
- **Shared `correct-response` codec** extracted into `@qti-components/base` (`parseCorrectResponseAttribute` / `serializeCorrectResponseAttribute` and value-shape helpers), so the runtime and downstream editors cannot drift.
- `::part(drag)` selectors added for associate, match, order, gap-match and graphic-gap-match, letting host applications style a placed fake-drag element with the same declarations as runtime drags.

### Patch Changes

- **The drag clone stays visible in fullscreen.** `createDragClone` now resolves its host instead of assuming the interaction's root, and corrects for a containing block that establishes a new coordinate space for `position: fixed` children.
- **A placed chip can shrink to its drop**, so it is the same box in the bank and in the drop when the bank is narrower than the chip's label (`flex: 0 0 auto` → `0 1 auto`).
- **PCI show-correct-response repaired** — the correction viewer no longer clones the live iframe or relies on an instance-level `connectedCallback`, and no longer duplicates the original's `id`.
- **Inline-choice answers the internal correct-response mode with the full variant**, matching text-entry, instead of painting a competing `part="correct-option"` marker that blanked the candidate's answer. The withholding rule is now an overridable `withholdsFullCorrectResponseWhenCorrect` hook.
- **The PCI iframe is built with `srcdoc`** instead of a `blob:` object URL, so a player serving package resources through a Service Worker sees the interaction's requests. `<base href>` now points at `data-base-url` rather than the site origin.
- `::part(drag)` selectors no longer silently drop in Chrome — an in-list CSS comment made Chrome's nesting parser discard the selector that followed it.

### Vocabulary

Three non-spec `qti-`-prefixed presentation classes removed — `qti-layout-offset12`, `qti-choices-stacking-6`, `qti-input-width-5` — and two internally-minted ones moved to the `cito-` prefix: `qti-dialog` → `cito-dialog`, and `qti-graphic-order-marker` → `cito-graphic-order-marker`. The last is applied to light-DOM children, so **any downstream stylesheet targeting `.qti-graphic-order-marker` must be updated**. The `qti-` prefix is reserved by 1EdTech for standardized vocabulary maintained outside the schema, so minting names inside it risks a silent collision.
