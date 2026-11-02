# @qti-components/test

## 2.0.0-next.15

### Major Changes

- [#349](https://github.com/Citolab/qti-components/pull/349) [`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4) Thanks [@herrKlein](https://github.com/herrKlein)! - New package `@qti-components/extended`: the test plugins. These move here out of `@qti-components/test`: `<test-item-link>`, `<test-section-link>`, `<test-scoring-buttons>`, `<test-scoring-feedback>`, `<test-view>`, `<test-view-toggle>`, `<test-print-context>`, `<test-print-item-variables>`, `<test-print-state>` (with `formatVariableValue`), `<test-stamp>`, `<test-bookmark>` (with `bookmarkedItems`) and text-to-speech (`<test-item-to-speech>`, the `test-tts-*` buttons, `ttsElements`). The new zoom and character-sheet plugins are here too. `@qti-components/test` keeps `<test-next>`, `<test-prev>`, `<test-end-attempt>`, `<test-container>`, `<test-navigation>` and the plugin `<test-submit>`.

  **Removed:** `<test-check-item>` (`TestCheckItem`), and with it the corrections build's `TestCheckItemCorrection`. It ended the attempt of the item on screen without the guards `<test-end-attempt>` has (attempts used, answer not valid yet) and then switched the test to the scorer view. Use `<test-end-attempt>`, and `<test-view-toggle>` where the view should change too. No surveyed host used it.

  **Breaking:** `@qti-components/test`, `@citolab/qti-components` and `@citolab/qti-components/corrections` no longer register or export these plugins, and the umbrella's CDN bundle and React types no longer contain them. The extended package is not part of the umbrella: install it next to it and import it once (`import '@qti-components/extended'`). It has `@citolab/qti-components` as a peer dependency and imports from its subpaths, so the plugins share the umbrella's single copy of the test and its contexts. It registers only its own tags, so it loads in any order next to the package root or `/corrections`. `@qti-components/extended/elements` gives the `{ tag, ctor }` pairs (`qtiExtendedElements`) for a scoped registry. Tags, attributes, parts, tokens and the state entries (`session.plugins.bookmarks`) are unchanged. Two type changes come with the move: `QtiTestPluginState` no longer declares `bookmarks`, so `pluginState(context, 'bookmarks')` is a type error now (use `bookmarkedItems(context)`); and the umbrella's React types (`@citolab/qti-components/react`) no longer list the moved tags, which come from `@qti-components/extended/react` instead. The umbrella's CDN bundle is self-contained, so the extended package needs the npm build of the umbrella: loading the CDN bundle by script tag and the plugins from npm gives two copies of the test, and the plugins never see it.

  `@qti-components/test` gains a `plugin-api` entry, and the umbrella exposes it as `@citolab/qti-components/qti-test/plugin-api`. It registers nothing: the public events and their helpers, `pluginState`, the state types and `controlStyles`, the look of the test controls. A plugin in its own package builds on it through the umbrella, with the umbrella as a peer dependency.

  Host notes: `plans/host-migration/citotestuit.md` (uses text-to-speech; item links and scoring in templates), `plans/host-migration/examenkompas.md`, `plans/host-migration/kennisnet.md`, `plans/host-migration/peilinglezen.md`.

## 2.0.0-next.14

### Major Changes

- [#347](https://github.com/Citolab/qti-components/pull/347) [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa) Thanks [@herrKlein](https://github.com/herrKlein)! - The public prefix is `qc-` (qti-components); `cito-` is its old name and keeps working for one major.

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

### Patch Changes

- Updated dependencies [[`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa), [`0f2339a`](https://github.com/Citolab/qti-components/commit/0f2339a8f4a24c0c00dc3a8cbe63dd79018703aa)]:
  - @qti-components/base@3.0.0-next.6
  - @qti-components/elements@2.0.0-next.7
  - @qti-components/theme@3.0.0-next.6
  - @qti-components/processing@1.6.1-next.5
  - @qti-components/interactions@1.10.5-next.8

## 2.0.0-next.13

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/base@3.0.0-next.5
  - @qti-components/elements@2.0.0-next.6
  - @qti-components/theme@2.3.0-next.5
  - @qti-components/transformers@1.8.0-next.0
  - @qti-components/interactions@1.10.5-next.7

## 2.0.0-next.12

### Major Changes

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `completionStatus` follows QTI 3 (info model §2.2.2, §2.5) and the 1EdTech conformance suite's Results Reporting reference results.

  - **completionStatus is no longer derived from validity.** Before, a non-adaptive item set `completed` or `incomplete` on every answer, from whether its interactions were valid. Now it is `not_attempted` until the item is presented, `unknown` from then on, and `completed` once an attempt of a non-adaptive item ends (after `processResponse()`), unless response processing set a value itself. An adaptive item is completed only by its response processing, as before. Whether the answers are valid is `valid` in the item context and in the computed context; to know whether an item is answered, read `valid && !isDefaultResponse` per item instead of `completionStatus === 'completed'`.
  - An item that is presented is never `not_attempted`: after a reset or a restore that says so, it is `unknown`. The test context still holds `not_attempted` for items that were never presented.
  - Response processing no longer resets `completionStatus` before a run of a non-adaptive item: it is built in and has no default.
  - `test-scoring-feedback` shows its "no response" text from the item's validity and default response, not from completionStatus.

  Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major), [CitoTestUit](../plans/host-migration/citotestuit.md#next-major), [PeilingLezen](../plans/host-migration/peilinglezen.md#next-major), [Examenkompas](../plans/host-migration/examenkompas.md#next-major).

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-navigation` disables an item once it has used its attempts, so the candidate can no longer change the answer after the last attempt is ended (`test-end-attempt`). The rule is the one `test-end-attempt` already used for its own button: a non-adaptive item with `max-attempts` above 0 (default 1) and `numAttempts >= max-attempts`. Adaptive items, `max-attempts="0"` (unlimited) and items in a `submission-mode="simultaneous"` part (one attempt each, processed when the part ends; the answer may change until then) are never disabled, and nothing is locked with `auto-score-items`, where every change is scored as an attempt.

  It reads the computed context, so it holds for every item on screen (`navigate="section"`) and for a restored `qtiTest.state` (disabled as soon as the item loads), and it releases the item when its attempts are back to zero. Only an item the navigation disabled itself is released: a host or view that sets `disabled` on an item keeps it so.

  A practice test that lets the candidate check again must say so in its package: `<qti-item-session-control max-attempts="0" />`. QTI's default is one attempt, also without `qti-item-session-control`, so a plain package now locks each item after its first attempt. Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major).

### Minor Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-end-attempt require-answer>` stays disabled until the item has a valid, non-default response, independent of `allow-skipping`.

### Patch Changes

- [#307](https://github.com/Citolab/qti-components/pull/307) [`5856bfc`](https://github.com/Citolab/qti-components/commit/5856bfc3bc60075b9c19b9e3a6a77f77ac50a3cd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls look the same on a page that uses a CSS reset, such as Tailwind's preflight.

  A reset like `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }` is a rule of the page, and a page rule beats the `:host` rules of a shadow root, whatever its layer or specificity. `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link`, `test-submit`, `test-check-item` and `test-bookmark` painted their padding and border on the host, so on such a page they lost both: a label against the edge of its fill, and no border.

  The look now sits on an inner element, `<span class="control" part="button">`, in the shadow tree, where the page's `*` does not reach. The host keeps only what a reset leaves alone: its display, the cursor and the radius its focus ring follows. Nothing changes on a page without a reset. The inner element is also a new part: `test-next::part(button)` repaints the control from a host stylesheet.

  `item-show-correct-response`, `item-show-candidate-correction` and `test-show-correct-response` get the same treatment: their padding is on the inner `div`.

  If a host styled the controls by their host box (a `padding` or `border` set on `test-next` itself), that moves to `::part(button)`. The `--test-button-*` slots work as before.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`fbfc478`](https://github.com/Citolab/qti-components/commit/fbfc4785212a7ef6e146551b10057b995f99396d) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-end-attempt` ends the attempt of its own item when it has one, like `test-bookmark`.

  Stamped into a `<template item-ref>`, each item gets its own button, which ends the attempt of that item and is `disabled` by that item's state (`max-attempts`, `numAttempts`, an optimal or completed attempt). With `<qti-test navigate="section">` every item of the section is on screen, so a candidate can check them one by one in any order. A new `item` attribute (an item-ref identifier) names the item from anywhere. In the toolbar, without either, it follows the item on screen as before.

  `cito-test-end-attempt` carries the item as `{ itemId }`; `test-navigation` then processes that item's response instead of the one on screen. Without `itemId` nothing changes.

- [#307](https://github.com/Citolab/qti-components/pull/307) [`85437ae`](https://github.com/Citolab/qti-components/commit/85437aef3e4febe3c8b1540485bdbfc6f2bc9540) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-navigation` no longer throws while building a section's `completed` when one of its items has no `completionStatus` in the test context.
- Updated dependencies [[`7bb058f`](https://github.com/Citolab/qti-components/commit/7bb058ff4a4755677fda7c4a2ebdddac42767f68), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53), [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`b1cb7e9`](https://github.com/Citolab/qti-components/commit/b1cb7e90df09765608e1ffe2d766e7974883f8a2)]:
  - @qti-components/processing@1.6.1-next.4
  - @qti-components/base@3.0.0-next.4
  - @qti-components/elements@2.0.0-next.5
  - @qti-components/theme@2.3.0-next.4
  - @qti-components/interactions@1.10.5-next.6

## 2.0.0-next.11

### Minor Changes

- [#339](https://github.com/Citolab/qti-components/pull/339) [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6) Thanks [@herrKlein](https://github.com/herrKlein)! - New `<test-print-state>`: drop it anywhere inside `<qti-test>` to see the test's state (`qtiTest.state`) as a tree you can fold open and shut. It follows every `cito-test-state-changed`. A debug helper, next to `<test-print-context>` and `<test-print-item-variables>`.

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6), [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6), [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/theme@2.3.0-next.3
  - @qti-components/interactions@1.10.5-next.5
  - @qti-components/elements@1.10.0-next.4
  - @qti-components/processing@1.6.1-next.3

## 2.0.0-next.10

### Patch Changes

- [#335](https://github.com/Citolab/qti-components/pull/335) [`e0aed5d`](https://github.com/Citolab/qti-components/commit/e0aed5d24309fef6dbe350b503d86e0e2bc6064f) Thanks [@herrKlein](https://github.com/herrKlein)! - With `navigate="item"`, a `test-section-link` (a `cito-test-navigate` request of type `section`) now makes the section's first item the active one. Before, no item was active, so `test-next` and `test-prev` stayed disabled and item links highlighted nothing. The whole section still loads, and `navigate="section"` is unchanged. Since that first item is now the active item, `test-check-item`, `test-end-attempt` and the scoring buttons act on it. Hosts: see "Section link in item mode" in `plans/host-migration/kennisnet.md` and `plans/host-migration/citotestuit.md` ([#332](https://github.com/Citolab/qti-components/issues/332)).

## 2.0.0-next.9

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls (`test-prev`, `test-next`, item and section links, end attempt, ...) look neutral by default, and `test-next` is the primary action.

  They used to be white with a blue border and black text, painted from the shared `--qti-component-*` tokens. Now the neutral look is a white button with a thin gray border and the surrounding text colour, with a faint gray hover, and `test-next` is solid dark with white text. There are no shadows, glows or transitions. The focus ring and the disabled look are unchanged.

  The controls no longer read `--qti-component-border-color`, `--qti-component-background-color` or `--qti-component-color`, so changing those tokens repaints interactions and no longer the test controls. To repaint the controls, set the `--test-button-*` slots on the test:

  - `--test-button-background-color`, `--test-button-color`, `--test-button-border-color`, `--test-button-hover-background-color` for the neutral look.
  - New: `--test-button-primary-background-color`, `--test-button-primary-color`, `--test-button-primary-hover-background-color` for `test-next`. Setting the neutral slots no longer repaints `test-next`.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls take their colours from the theme, and everything a candidate presses answers the press.

  - **Test controls** (`test-next`, `test-prev`, item and section links, submit, check, end attempt, bookmark, the text-to-speech buttons) read the theme's tier-1 tokens instead of literal colours. The neutral button is the page's surface (`--cito-color-base-100`) with the theme's border; `test-next` is filled with `--cito-color-neutral` and labelled in `--cito-color-neutral-content`. Hover and press mix the content colour into the fill (`--qti-hover-mix`, `--qti-active-mix`). Without the theme they fall back to the system colours `Canvas`, `CanvasText` and `Highlight`, so they follow the page's `color-scheme`. Every `--test-button-*` slot still works; new are `--test-button-active-background-color` and `--test-button-primary-active-background-color`. Hover now applies only on a device with a fine pointer, so it no longer sticks after a tap.
  - **A press is visible.** Test controls, choices and chips (gap-match, match, associate, order) darken a little while pressed (`@mixin press`), paint only.
  - **Text to speech.** The highlights are see-through tints of `--cito-color-info` (the element being read) and `--cito-color-warning` (the word being spoken), re-valued with `--test-tts-element-highlight` and `--test-tts-word-highlight`. A pressed TTS button falls back to `Highlight` without the theme.
  - **A choice with a radio or checkbox shown has no fill**: it shows the page behind it, not the theme's white surface. Its selection and its correction are painted on the radio or checkbox, as before. A choice drawn as a box (`qti-input-control-hidden`) keeps its fill. While pressed, a chip that has been lifted (its placeholder) does not darken.

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-stamp` is no longer described as deprecated. Its JSDoc (and so the custom-elements manifest and the Storybook docs) said it would be removed, but it is the kept `stamp` plugin; the description now says what it renders.
- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/theme@2.3.0-next.2
  - @qti-components/interactions@1.10.5-next.4

## 2.0.0-next.8

### Minor Changes

- [#318](https://github.com/Citolab/qti-components/pull/318) [`b410a9f`](https://github.com/Citolab/qti-components/commit/b410a9f628da90986044a664f5aa12e46ed3b0ea) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-submit>` scores the test: on click it asks the test to submit (`cito-test-submit`), which runs outcome processing and then dispatches `cito-test-submitted`. `qtiTest.submit()` does the same from code. `qtiTest.outcomeProcessing()` now starts every run from the test outcomes' declared defaults, as QTI does and as the documentation already said; before, a rule that adds to its own outcome, such as `SCORE_TOTAL = sum + SCORE_TOTAL`, grew on every run.

## 2.0.0-next.7

### Patch Changes

- [#310](https://github.com/Citolab/qti-components/pull/310) [`16a7f1d`](https://github.com/Citolab/qti-components/commit/16a7f1d92be2a25dcb866460ccc2cb7dfdc94609) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - `test-print-item-variables` prints a record value field by field (`time: 3.6, point: 455 250`, e.g. the response of a portable custom interaction) instead of `[object Object]`, for the value and the correct response. A correct response of `0` is printed instead of left out.

## 2.0.0-next.6

### Patch Changes

- Updated dependencies [[`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a), [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a)]:
  - @qti-components/theme@2.3.0-next.1
  - @qti-components/base@2.5.0-next.2
  - @qti-components/elements@1.10.0-next.3
  - @qti-components/processing@1.6.1-next.2
  - @qti-components/interactions@1.10.5-next.3

## 2.0.0-next.5

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
- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/elements@1.10.0-next.2
  - @qti-components/interactions@1.10.5-next.2
  - @qti-components/processing@1.6.1-next.1

## 2.0.0-next.4

### Major Changes

- [#302](https://github.com/Citolab/qti-components/pull/302) [`c585b34`](https://github.com/Citolab/qti-components/commit/c585b346a510c533ae253c22335f7d6f578dda42) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-check-item>` no longer reaches into `<test-container>`'s shadow root. After ending the attempt it switches the test to a view, named by its new `view` attribute (default `scorer`), through `cito-test-switch-view`.

  Behaviour change: `[view]` content for other views, including `candidate`, is hidden while that view is active; before, every `[view]` element was shown. Use `<test-view-toggle>` to switch back. No surveyed host uses `<test-check-item>`.

## 1.10.0-next.3

### Minor Changes

- [#300](https://github.com/Citolab/qti-components/pull/300) [`e7bee3a`](https://github.com/Citolab/qti-components/commit/e7bee3a22d2f7ea1ae515ccc92a9e87e7eec5aeb) Thanks [@herrKlein](https://github.com/herrKlein)! - New test-level expression `qti-number-presented`: the number of selected item refs that have been presented to the candidate, with the same `section-identifier`, `include-category` and `exclude-category` filters as `qti-number-selected`. An item is presented once its `completionStatus` has left `not_attempted`, so items a linear test part passed over (pre-conditions, branch rules) and items not reached yet are not counted. Use it for totals over the candidate's own route, such as a maximum score of one point per presented item.

  - A presented item no longer keeps a `not_attempted` the test context held for it (a restored session, or values set with `updateItemVariables` before the item was reached): presenting an item starts its first attempt, so it takes the item's own status.

- [#300](https://github.com/Citolab/qti-components/pull/300) [`e7bee3a`](https://github.com/Citolab/qti-components/commit/e7bee3a22d2f7ea1ae515ccc92a9e87e7eec5aeb) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTest.getTestFeedback(access?)` returns the `qti-test-feedback` elements that apply after outcome processing, so a host no longer filters them by hand. `qti-test-feedback` reads its `access` attribute (`atEnd`, the default, or `during`) and gets `matches(value)`: whether it applies for a value of its `outcome-identifier`, honouring `show-hide` and container values. It still renders nothing where it is declared: where and when to show it stays up to the host.

## 1.10.0-next.2

### Patch Changes

- [#298](https://github.com/Citolab/qti-components/pull/298) [`54ad14e`](https://github.com/Citolab/qti-components/commit/54ad14e4cf57ea95ccbc917ed734e46c6184c528) Thanks [@herrKlein](https://github.com/herrKlein)! - Adaptive items (`adaptive="true"`) are done when their response processing sets `completionStatus` to `completed`, not when `max-attempts` is reached. QTI 3 does not apply `max-attempts` to adaptive items, but the player did, so in a linear test with `max-attempts="1"` Next unlocked after a wrong first attempt while the item still had its next phase to show.

  - `test-navigation`: `done` for an adaptive item is `completionStatus === 'completed'`.
  - `test-end-attempt` is disabled once an adaptive item is completed.

## 1.10.0-next.1

### Minor Changes

- [#289](https://github.com/Citolab/qti-components/pull/289) [`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7) Thanks [@herrKlein](https://github.com/herrKlein)! - Sequencing in linear test parts: new `qti-pre-condition` and `qti-branch-rule` elements (`target` is an item ref, section or test part, or `EXIT_SECTION` / `EXIT_TESTPART` / `EXIT_TEST`). A "next" step in a linear part now skips items, sections and test parts whose pre-condition is false and follows the first branch rule that is true; nonlinear parts, deep links and item links are untouched. An expression that throws fails open for a pre-condition and does not branch for a rule; one that gives NULL (e.g. an unknown variable) is false. The first item of a linear part is checked against its pre-conditions too.

  - New public notifications: `cito-test-items-skipped` (`detail.ids`: the item refs passed over) and `cito-test-end-reached` (`EXIT_TEST`, or no eligible item left).
  - `qti-variable` can read an item session with `ITEMREF.VAR` (e.g. `Q01.SCORE`); an item that was never presented gives NULL.
  - `qti-match` and the other comparisons now work on `boolean` values (they were always false), so the `qti-end-attempt-interaction` pattern can be matched.

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/elements@1.10.0-next.1
  - @qti-components/interactions@1.10.5-next.1
  - @qti-components/processing@1.6.1-next.0

## 1.10.0-next.0

### Minor Changes

- [#285](https://github.com/Citolab/qti-components/pull/285) [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3) Thanks [@herrKlein](https://github.com/herrKlein)! - The test's public events get the `cito-` prefix, declared in one module (`public-events.ts`): requests `cito-test-navigate`, `cito-test-end-attempt`, `cito-test-update-outcome`, `cito-test-switch-view`; notifications `cito-test-navigated` (new: sent only after a navigation succeeded and rendered), `cito-test-navigation-started`, `cito-test-navigation-failed`, `cito-test-rendered`, `cito-test-loaded`, `cito-test-state-changed`, `cito-item-ref-connected`.

  - **Deprecated:** the old names (`qti-request-navigation`, `test-end-attempt`, `test-update-outcome-variable`, `on-test-switch-view`, `qti-navigation-loading-started`, `qti-navigation-error`, `qti-test-loaded`, `qti-assessment-test-connected`, `qti-state-changed`, `qti-assessment-item-ref-connected`) are still sent and handled, with the same `detail`. They go in the next major. A request sent under an old name (`qti-request-navigation`, `test-end-attempt`, …) logs a one-time `console.warn` naming the new one.
  - `qti-navigation-loading-ended` is unchanged and deprecated without a replacement: it also fires on failure and cancellation. Use navigated / failed.

  Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.

### Patch Changes

- Updated dependencies [[`4476095`](https://github.com/Citolab/qti-components/commit/4476095f7cb1939ce780980f3a7a3317fc86c5c0), [`b1ea89b`](https://github.com/Citolab/qti-components/commit/b1ea89b72109f8acc7f73b88fce920cb453c21a3)]:
  - @qti-components/theme@2.2.2-next.0
  - @qti-components/elements@1.10.0-next.0
  - @qti-components/interactions@1.10.5-next.0

## 1.9.0

### Minor Changes

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

- Updated dependencies [[`614c666`](https://github.com/Citolab/qti-components/commit/614c666eb28117e9dd8d432c00465793704448a2), [`b0f1c6d`](https://github.com/Citolab/qti-components/commit/b0f1c6d4cc885d361247ac41973874659f6494e0), [`c5d80aa`](https://github.com/Citolab/qti-components/commit/c5d80aa2a5e2e1e09853931cc758a3677ed42593), [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9), [`6e87e20`](https://github.com/Citolab/qti-components/commit/6e87e20ddb86495c08d3469fdb6e6de61675c108), [`9e52bb7`](https://github.com/Citolab/qti-components/commit/9e52bb7720ab9b47895e57fd80410486bacf29b1), [`0fe97cf`](https://github.com/Citolab/qti-components/commit/0fe97cf00fa96710ce38754c05282b1eb03ef53d), [`c572724`](https://github.com/Citolab/qti-components/commit/c572724b9f2a57cabac632354b49f6caf8911533)]:
  - @qti-components/elements@1.9.0
  - @qti-components/base@2.4.0

## 1.8.0

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

## 1.7.0

### Minor Changes

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

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/processing@1.6.0
  - @qti-components/base@2.3.0
  - @qti-components/elements@1.8.0
  - @qti-components/theme@2.2.1
  - @qti-components/transformers@1.7.3

## 1.6.2

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

- Updated dependencies [[`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce)]:
  - @qti-components/theme@2.2.0

## 1.6.1

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

- Updated dependencies [[`0822231`](https://github.com/Citolab/qti-components/commit/0822231381b8b4d5d6f98c524e86cf2ef42f12ce)]:
  - @qti-components/processing@1.5.0

## 1.6.0

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

- Updated dependencies [[`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/base@2.2.0
  - @qti-components/elements@1.7.0
  - @qti-components/processing@1.4.1

## 1.5.4

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

- Updated dependencies [[`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d)]:
  - @qti-components/base@2.0.1

## 1.5.3

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.
- Updated dependencies [[`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4)]:
  - @qti-components/theme@2.0.1
