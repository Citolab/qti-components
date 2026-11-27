---
'@qti-components/delivery': minor
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`readItemFacts(item)` in `@qti-components/delivery` reads what a `qti-assessment-item` says about itself from its XML (`adaptive`, `timeDependent`, `hasCorrectResponse`, `hasResponseProcessing`, `externalScored`, `label`, `title`, `identifier`), with no browser and no element registered. `qti-test` reads them when it fetches an item, and `computedContext` items carry them from there instead of from the rendered item on `qti-assessment-item-connected` (roadmap 1, T1c).

Fix: a computed item's `externalScored` now has the `external-scored` value of the item's `SCORE` outcome declaration (`human` or `externalMachine`). It was always null, because the attribute was read as `externalScored`; `test-scoring-feedback` now shows the external-scoring texts for such items. A host's `itemData` still overrides it.
