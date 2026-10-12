---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

The optional pieces of `qti-test` become plugins (`print`, `scoring`, `stamp`, `tts`, `view`): sets of files that use only the test's public API, with nothing in the core referring to them. Text-to-speech has its own folder; the others stay in `components/`. `@qti-components/test` still registers and exports all of them, so nothing changes for hosts. The new entry `@qti-components/test/plugins/elements` lists every plugin's `{ tag, ctor }` entries for a scoped registry. A boundary spec (`plugin-boundary.spec.ts`) fails on a reference to a plugin from outside its folder and on an import of test internals; guide: Storybook "Guides / Test plugins".

- **`computedContext.itemElement(identifier)`** (`@qti-components/base` type, set by `test-navigation`): the rendered `qti-assessment-item` for an item-ref identifier, looked up when called. Text-to-speech now reads only `computedContext`; it no longer uses the session context, reaches into `test-container`'s shadow root, or uses the test's internal context. A player that follows navigation must sit inside `<test-navigation>` (CitoTestUit and qti-player already place it there).
- `test-check-item` switches the session view; see its own changeset.
