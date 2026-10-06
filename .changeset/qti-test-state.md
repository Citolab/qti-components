---
'@qti-components/test': minor
'@citolab/qti-components': minor
'@qti-components/base': patch
---

Add `qtiTest.state` and the `qti-state-changed` event: one value to persist and restore a candidate's test session (item variables, per-interaction state, test outcomes, position) without declaration metadata or the answer key. The state can be assigned before the test loads and is applied before the first item does. Also restores per-interaction state (e.g. a PCI's `getState()`) into an item when it loads, and makes `navigate="section"` start at the restored section.

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
