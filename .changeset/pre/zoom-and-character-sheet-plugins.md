---
'@qti-components/extended': minor
---

Two new test plugins, for a candidate's toolbar.

- **Zoom**: `<test-zoom-in>`, `<test-zoom-out>` and `<test-zoom-reset>` scale the rendered items with the CSS `zoom` property, so the page around them does not move. The level is kept in the test's state under `session.plugins.zoom` (absent at 100%), so a host that stores `state` stores it and a reloaded test shows the items at the same size. `test-zoom-reset` shows the level (`100%`) when it has no content of its own; `step`, `min` and `max` on a button set how far it goes. `zoomLevel(computedContext)` gives a host's own code the level.
- **Character sheet**: `<test-character-sheet>` opens a sheet of characters that are not on the keyboard (`characters`, a space-separated string; the default is a Dutch set) and types the one the candidate picks into the answer field they were writing in: the last text field or text area of a rendered item that had focus. It is `disabled` until such a field had focus. The character goes in at the caret, replacing a selection, and the field gets a `change` event, so the interaction records the new answer. The sheet closes on Escape, on a click outside it and when another item comes on screen; `::part(sheet)` and `::part(key)` style it.

Both read only `computedContext` and the public requests, so they sit anywhere inside `<test-navigation>`.

Host notes: `plans/host-migration/citotestuit.md`, `plans/host-migration/examenkompas.md` (zoom and the character sheet replace the hosts' own zoom and symbol picker). Kennisnet and PeilingLezen have neither.
