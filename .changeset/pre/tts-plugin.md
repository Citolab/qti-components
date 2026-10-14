---
'@qti-components/base': minor
'@qti-components/test': major
'@citolab/qti-components': major
---

The optional pieces of `qti-test` become plugins (`print`, `scoring`, `stamp`, `tts`, `view`): sets of files that use only the test's public API, with nothing in the core referring to them. Text-to-speech has its own folder; the others stay in `components/`. `@qti-components/test` still registers them, and the package root still exports them. The new entry `@qti-components/test/plugins/elements` lists every plugin's `{ tag, ctor }` entries for a scoped registry. A boundary spec (`plugin-boundary.spec.ts`) fails on a reference to a plugin from outside its folder and on an import of test internals; guide: Storybook "Guides / Test plugins".

- **`computedContext.itemElement(identifier)`** (`@qti-components/base` type, set by `test-navigation`): the rendered `qti-assessment-item` for an item-ref identifier, looked up when called. Text-to-speech now reads only `computedContext`; it no longer uses the session context, reaches into `test-container`'s shadow root, or uses the test's internal context. A player that follows navigation must sit inside `<test-navigation>` (CitoTestUit and qti-player already place it there).

Breaking:

- A text-to-speech player that follows navigation must sit inside `<test-navigation>`, where `computedContext` is provided. Before, it found the item from anywhere on the page; outside `<test-navigation>` it now reads nothing. CitoTestUit and qti-player already place it inside.
- Deep imports of the plugin files change: `components/test-item-to-speech/test-item-to-speech.js` is now `tts/test-item-to-speech.js`, and `components/index.js` no longer exports the plugins. Import from the package root or `@qti-components/test/plugins/elements`.
