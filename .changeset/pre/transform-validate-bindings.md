---
'@qti-components/transformers': minor
'@citolab/qti-components': minor
---

`qtiTransformItem()` has a `validateBindings()` step: it throws a `QTI validation error` listing every interaction bound to a response it cannot hold, by the base-type, cardinality and max-choices / max-associations rules the information model states for each interaction (for example an inline choice interaction bound to multiple cardinality, §5.74). `load()` and `parse()` do not run it; a host calls it and shows the error. Conformance: Q12-L2-I21, Q12-L2-D21.
