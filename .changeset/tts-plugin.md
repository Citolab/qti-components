---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Text-to-speech is now an opt-in plugin: `import '@qti-components/test/tts'` (or `@citolab/qti-components/tts`) registers `<test-item-to-speech>` and the `test-tts-*` controls; `@qti-components/test/tts/elements` gives the classes without defining them.

- **`computedContext.itemElement(identifier)`** (`@qti-components/base` type, set by `test-navigation`): the rendered `qti-assessment-item` for an item-ref identifier, looked up when called. Text-to-speech now reads only `computedContext`; it no longer uses the session context, reaches into `test-container`'s shadow root, or uses the test's internal context. A player that follows navigation must sit inside `<test-navigation>` (CitoTestUit and qti-player already place it there).
- **Deprecated:** `@qti-components/test` (and so `@citolab/qti-components`) still registers and re-exports text-to-speech, so nothing changes for existing pages. In the next major it no longer does: import `@qti-components/test/tts` / `@citolab/qti-components/tts` then.

No surveyed host uses text-to-speech (checked in `plans/public-api.md`, by reading source), so no host migration entries.
