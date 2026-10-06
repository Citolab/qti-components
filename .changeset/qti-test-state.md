---
'@qti-components/test': minor
'@citolab/qti-components': minor
'@qti-components/base': patch
---

Add `qtiTest.state` and the `qti-state-changed` event: one value to persist and restore a candidate's test session (item variables, per-interaction state, test outcomes, position) without declaration metadata or the answer key. The state can be assigned before the test loads and is applied before the first item does. Also restores per-interaction state (e.g. a PCI's `getState()`) into an item when it loads, and makes `navigate="section"` start at the restored section.

`updateItemVariables()` now updates the test context immutably, so components reading it update and `qti-state-changed` fires; values for items that have not loaded yet are kept instead of dropped. Its values no longer need a `type` (only for a variable the item does not declare), and an optional third argument sets per-interaction state.

Deprecated, to be removed in the next major: the `qti-test-context-updated` event (listen to `qti-state-changed` instead), and `SessionContext.navItemLoading` / `navTestLoading`, which were never set.
