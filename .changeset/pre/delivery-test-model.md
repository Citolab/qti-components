---
'@qti-components/delivery': minor
'@qti-components/test': major
'@citolab/qti-components': major
---

`@qti-components/delivery` builds the test model from a `qti-assessment-test`'s markup: `buildTestModel` returns the test parts and, in document order, the nested sections and item-refs, with `qti-item-session-control` resolved per attribute, under Node (xmldom) and in the browser alike.

`test-navigation` now builds `computedContext` from that model instead of querying the rendered test. Two behaviour changes for tests that nest sections or declare part of a `qti-item-session-control` below another one (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)):

- A nested section is listed once in `computedContext.testParts[].sections`, with only its own item-refs, so every item appears once; item `index` follows the test's document order.
- Session control inherits per attribute, as QTI 3 says: an item-ref that declares only `show-feedback` keeps its section's `max-attempts`, and a nested section inherits from its parent section.
