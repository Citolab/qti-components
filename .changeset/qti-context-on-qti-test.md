---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`qtiContext` (the `QTI_CONTEXT` variable: test, candidate and environment identifiers plus the optional shuffle `seed`) is now provided by `qti-test`, and the test reads the seed from itself instead of reaching into `test-navigation`. Set it with `qtiTest.qtiContext = …`.

`test-navigation.qtiContext` is deprecated and kept as an alias: reading it returns the enclosing test's value and writing it replaces that value, so hosts that set the seed there keep working. It is removed in the next major, and writing it prints one console warning per element naming the replacement. Reading it does not warn, and neither does the library's own writing. Before this change it was a second provider; now there is one value, so the two can no longer disagree. The alias finds the test across shadow roots. Set before the navigation is inside a `qti-test` (a React host sets props before attaching the element), a write is held and handed over when it connects.

Covered by this repo's stories: the seed through both routes gives the same shuffle order, including a story that builds the elements in the order React does, which also passes on the previous release. Not run against a host application. CitoTestUit, which passes its per-session seed as the `qtiContext` prop of `<test-navigation>`, is the flow to check.

Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).

Everything deprecated, and what is planned for the next major: the new Deprecations page.
