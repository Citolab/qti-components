---
'@qti-components/base': major
'@qti-components/test': major
'@qti-components/corrections': patch
'@citolab/qti-components': major
---

Each item in `computedContext` carries its resolved `qti-item-session-control` as `sessionControl`: all seven attributes (`maxAttempts`, `showFeedback`, `allowReview`, `showSolution`, `allowComment`, `allowSkipping`, `validateResponses`), each from the closest level that declares it, else its QTI default. The type is `SessionControl` from `@qti-components/base`.

Breaking: the flat `maxAttempts`, `showFeedback`, `showSolution` and `allowSkipping` on the computed item are gone; read `item.sessionControl.<name>` (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)). `allow-review`, `allow-comment` and `validate-responses` are carried, with no effect in the player yet (roadmap 1, T3).
