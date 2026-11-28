---
'@qti-components/transformers': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`qti-selection` takes effect: when a test loads, each section presents the item-refs and subsections its selection picks, required ones always, the same for the same `qtiContext` seed, before ordering shuffles them (implementation guide §4.5.1). `qtiTransformTest().applySelection(seed)` does it, and `test-container` calls it before `shuffleOrdering`. A `with-replacement` clone is a copy of the item-ref (or subsection) with the next instance id, `item-3#2`. A selection QTI calls an error stops the test loading; a `qti-selection` with attributes or children it does not know is ignored. Answers in a restored state for items the test does not present are dropped with a console warning. Conformance S3-L2-D1/D2 and S4-L2-D1 pass (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).
