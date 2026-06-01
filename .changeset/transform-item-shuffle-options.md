---
'@qti-components/transformers': minor
'@citolab/qti-components': minor
---

Add shuffle opt-out to `load()` and replace retry-loop shuffle with Sattolo's algorithm. `load()` now accepts `LoadOptions { signal?, shuffle? }` so callers can pass `{ shuffle: false }` to skip auto-shuffling (e.g. review mode). `shuffleInteractions()` now uses Sattolo's algorithm — a single O(n) pass guaranteeing a derangement — replacing the previous up-to-20-retries Fisher–Yates loop.
