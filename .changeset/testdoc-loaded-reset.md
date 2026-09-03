---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Keep the test-level outcomes a test document declares.

Test-level `qti-outcome-declaration` elements register themselves into the test context as they
connect, by dispatching `qti-register-variable`. They are children of `qti-assessment-test`, so they
connect — and register — *before* the test element announces `qti-assessment-test-connected`.

The test host reset its context on that announcement, which threw every one of those registrations
away. No test-level outcome could then be read or set: `getOutcome` returned nothing, and
`qti-set-outcome-value` at test level reported the identifier as unavailable.

`test-container` now announces a new test document with `qti-testdoc-loaded` at the point it assigns
it, and the host resets on that instead. Lit's re-render is async, so the reset still lands before
any child of the new document connects. `qti-assessment-test-connected` keeps its remaining job of
adding the item-refs, and now preserves what the document registered.

This also removes a dead guard: the old handler tested `testContext.items.length > 0` immediately
after assigning the initial context, so the condition could never hold.
