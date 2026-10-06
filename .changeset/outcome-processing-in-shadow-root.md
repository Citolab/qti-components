---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`qtiTest.outcomeProcessing()` now finds the test's own outcome processing when the test is loaded through `test-container`. The container renders the test into its own shadow root, which the old lookup on `qti-test` could not see, so the call found nothing, returned `false` and did nothing. With a test rendered straight into `qti-test` it behaved as before.

No surveyed host calls it. If one does, it now runs where it used to be a silent no-op, so check what it was relied on to do.

Covered by a story that loads a test with an `<qti-outcome-processing>` through `test-container`, which fails on the old code.
