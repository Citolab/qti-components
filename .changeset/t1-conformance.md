---
'@qti-components/transformers': minor
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

A test loaded by URL includes every `qti-assessment-section-ref`: the referenced section replaces the reference before ordering and the transform callback, under the reference's `identifier`, with its URLs still pointing at its own files (QTI 3 info model §7.5). A test given as a string keeps the reference, with a warning.

Next and Previous follow the test's document order in nested sections; in a linear part where a section's item-refs and subsections interleave, Next could get stuck. Each `computedContext.testParts[]` carries `itemOrder`, and `itemsInOrder(testPart)` from `@qti-components/test` reads a part's items in that order (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).
