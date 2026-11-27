---
'@qti-components/base': major
'@qti-components/test': major
'@citolab/qti-components': major
---

`navigation-mode` and `submission-mode` come from the test part only, as the QTI 3 XSD defines them: a section that declares either is now ignored, so the part's mode decides Prev and Next, jumps between items and the attempts lock.

Breaking: `navigationMode` and `submissionMode` are gone from `computedContext.testParts[].sections[]` and from `QtiAssessmentSection`; read them from `computedContext.testParts[]` (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).
