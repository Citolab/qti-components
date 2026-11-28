---
'@qti-components/base': patch
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`computedContext` is derived anew on every update by one function, from the test, the item facts, the candidate's state and `initContext`, never from the previous context (roadmap 1, T2c). A field taken out of `initContext` is gone at the next update, and an item's `maxScore` follows its current `MAXSCORE` instead of lagging one update behind (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).
