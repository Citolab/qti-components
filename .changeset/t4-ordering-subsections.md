---
'@qti-components/transformers': minor
'@citolab/qti-components': minor
---

Section ordering follows QTI 3 (implementation guide §4.5.2): in a section with `<qti-ordering shuffle="true">`, a subsection moves as one block and stays a section, with its rubric blocks and session control, unless it is both `visible="false"` and `keep-together="false"`; only then do its item-refs and subsections merge into the parent, carrying its `qti-item-session-control`. A visible subsection with `keep-together="false"` is no longer split up. A `qti-ordering` with attributes or children other than `shuffle` is an extension for another algorithm and is ignored (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).
