---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Text-to-speech is now an opt-in plugin: `import '@qti-components/test/tts'` (or `@citolab/qti-components/tts`) registers `<test-item-to-speech>` and the `test-tts-*` controls; `@qti-components/test/tts/elements` gives the classes without defining them.

- **New public context `testItemsContext`** (`@qti-components/base`), provided by `qti-test`: the rendered `qti-assessment-item` for an item-ref identifier, and the element the test's events reach. Text-to-speech now uses only this and other public API; it no longer reaches into `test-container`'s shadow root or the test's internal context. Components added to a test from outside can use it the same way.
- **Deprecated:** `@qti-components/test` (and so `@citolab/qti-components`) still registers and re-exports text-to-speech, so nothing changes for existing pages. In the next major it no longer does: import `@qti-components/test/tts` / `@citolab/qti-components/tts` then.

No surveyed host uses text-to-speech (checked in `plans/public-api.md`, by reading source), so no host migration entries.
