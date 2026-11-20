# @qti-components/extended

## 1.0.0-next.0

### Major Changes

- [#349](https://github.com/Citolab/qti-components/pull/349) [`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4) Thanks [@herrKlein](https://github.com/herrKlein)! - New package `@qti-components/extended`: the test plugins. These move here out of `@qti-components/test`: `<test-item-link>`, `<test-section-link>`, `<test-scoring-buttons>`, `<test-scoring-feedback>`, `<test-view>`, `<test-view-toggle>`, `<test-print-context>`, `<test-print-item-variables>`, `<test-print-state>` (with `formatVariableValue`), `<test-stamp>`, `<test-bookmark>` (with `bookmarkedItems`) and text-to-speech (`<test-item-to-speech>`, the `test-tts-*` buttons, `ttsElements`). The new zoom and character-sheet plugins are here too. `@qti-components/test` keeps `<test-next>`, `<test-prev>`, `<test-end-attempt>`, `<test-container>`, `<test-navigation>` and the plugin `<test-submit>`.

  **Removed:** `<test-check-item>` (`TestCheckItem`), and with it the corrections build's `TestCheckItemCorrection`. It ended the attempt of the item on screen without the guards `<test-end-attempt>` has (attempts used, answer not valid yet) and then switched the test to the scorer view. Use `<test-end-attempt>`, and `<test-view-toggle>` where the view should change too. No surveyed host used it.

  **Breaking:** `@qti-components/test`, `@citolab/qti-components` and `@citolab/qti-components/corrections` no longer register or export these plugins, and the umbrella's CDN bundle and React types no longer contain them. The extended package is not part of the umbrella: install it next to it and import it once (`import '@qti-components/extended'`). It has `@citolab/qti-components` as a peer dependency and imports from its subpaths, so the plugins share the umbrella's single copy of the test and its contexts. It registers only its own tags, so it loads in any order next to the package root or `/corrections`. `@qti-components/extended/elements` gives the `{ tag, ctor }` pairs (`qtiExtendedElements`) for a scoped registry. Tags, attributes, parts, tokens and the state entries (`session.plugins.bookmarks`) are unchanged. Two type changes come with the move: `QtiTestPluginState` no longer declares `bookmarks`, so `pluginState(context, 'bookmarks')` is a type error now (use `bookmarkedItems(context)`); and the umbrella's React types (`@citolab/qti-components/react`) no longer list the moved tags, which come from `@qti-components/extended/react` instead. The umbrella's CDN bundle is self-contained, so the extended package needs the npm build of the umbrella: loading the CDN bundle by script tag and the plugins from npm gives two copies of the test, and the plugins never see it.

  `@qti-components/test` gains a `plugin-api` entry, and the umbrella exposes it as `@citolab/qti-components/qti-test/plugin-api`. It registers nothing: the public events and their helpers, `pluginState`, the state types and `controlStyles`, the look of the test controls. A plugin in its own package builds on it through the umbrella, with the umbrella as a peer dependency.

  Host notes: `plans/host-migration/citotestuit.md` (uses text-to-speech; item links and scoring in templates), `plans/host-migration/examenkompas.md`, `plans/host-migration/kennisnet.md`, `plans/host-migration/peilinglezen.md`.

### Minor Changes

- [#349](https://github.com/Citolab/qti-components/pull/349) [`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4) Thanks [@herrKlein](https://github.com/herrKlein)! - New plugin `<test-lock>`, ported from the prototype in QTI-Extended and rebuilt on the public plugin API. It locks the test when the candidate leaves the page (another tab or window, or the page hidden) and covers it with a modal until it is unlocked. Focus moving into an iframe of the test, such as a portable custom interaction, does not lock it.

  The lock lives in the test's state under `session.plugins.lock` (`{ locked, times }`), so a host that stores `state` keeps it over a reload, and `times` shows a proctor how often the candidate left; `lockState(computedContext)` reads it. With a `code` the modal asks for it; without one only the host unlocks, with `unlock()`. It fires `lock` and `unlock`; the labels are attributes (Dutch by default) and the message is its content. It is a deterrent for a supervised session, not security: the code is in the page.

- [#349](https://github.com/Citolab/qti-components/pull/349) [`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4) Thanks [@herrKlein](https://github.com/herrKlein)! - Two new test plugins, for a candidate's toolbar.

  - **Zoom**: `<test-zoom-in>`, `<test-zoom-out>` and `<test-zoom-reset>` scale the rendered items with the CSS `zoom` property, so the page around them does not move. The level is kept in the test's state under `session.plugins.zoom` (absent at 100%), so a host that stores `state` stores it and a reloaded test shows the items at the same size. `test-zoom-reset` shows the level (`100%`) when it has no content of its own; `step`, `min` and `max` on a button set how far it goes. `zoomLevel(computedContext)` gives a host's own code the level.
  - **Character sheet**: `<test-character-sheet>` opens a sheet of characters that are not on the keyboard (`characters`, a space-separated string; the default is a Dutch set) and types the one the candidate picks into the answer field they were writing in: the last text field or text area of a rendered item that had focus. It is `disabled` until such a field had focus. The character goes in at the caret, replacing a selection, and the field gets a `change` event, so the interaction records the new answer. The sheet closes on Escape, on a click outside it and when another item comes on screen; `::part(sheet)` and `::part(key)` style it.

  Both read only `computedContext` and the public requests, so they sit anywhere inside `<test-navigation>`.

  Host notes: `plans/host-migration/citotestuit.md`, `plans/host-migration/examenkompas.md` (zoom and the character sheet replace the hosts' own zoom and symbol picker). Kennisnet and PeilingLezen have neither.

### Patch Changes

- Updated dependencies [[`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4), [`e059bf8`](https://github.com/Citolab/qti-components/commit/e059bf818ff8cb52e1ae9235718b45ccd447d4c4)]:
  - @citolab/qti-components@10.0.0-next.17
