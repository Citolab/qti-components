---
'@qti-components/item': minor
'@qti-components/base': minor
'@qti-components/test': minor
'@qti-components/transformers': minor
'@citolab/qti-components': minor
---

Remove `LoadOptions` from `qtiTransformItem.load()` and make shuffling explicit. `load()` now accepts only `(uri, signal?)` and no longer performs cache reads/writes or automatic interaction shuffling. Consumers should call `shuffleInteractions(seed?)` explicitly in the chain when needed.

Shuffling is now deterministic when a seed is provided:

- `qtiTransformItem().shuffleInteractions(seed?)` uses a seeded PRNG and Fisher-Yates on non-fixed choices only (`fixed="true"` stays in authored position).
- `qtiTransformTest().shuffleOrdering(seed?)` deterministically applies `qti-ordering shuffle="true"`, honoring fixed items and subsection `visible` / `keep-together` rules, and removes consumed `qti-ordering` elements after processing.

Omitting the seed is also deterministic (no longer `Math.random`): both methods emit a `console.warn` and fall back to a deterministic seed derived from the loaded URI (`load()`), or the constant `default-item-seed` / `default-test-seed` when no URI is available (e.g. after `parse()`).

Deterministic delivery now uses `configContext.shuffleSeed`:

- Item delivery: provide `configContext.shuffleSeed` on `<qti-item>` for seeded interaction shuffling in `item-container`.
- Test delivery: provide `configContext.shuffleSeed` on `<qti-test>` for seeded test ordering in `test-container` and seeded item shuffling in test navigation. When set, all navigated items share this single seed; when omitted, each item falls back to its own URI-derived deterministic seed.

Config context ownership in test delivery was also lifted to the top-level test host:

- `configContext` is now provided by `<qti-test>` instead of `<test-navigation>`.
- `test-navigation` and `test-container` now consume `configContext` from `<qti-test>`.
- Story/test setups that previously set `testNavigation.configContext` should set config on `qti-test` instead.
