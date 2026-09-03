---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Present test feedback according to its `access` characteristic.

`qti-test-feedback` gains `access`, and evaluates against the test context rather than the item
context the inherited implementation reads:

- `during` — presented after each instance of outcome processing, while the test is in progress.
- `atEnd` — reachable only at the conclusion of the test, or of the test part the feedback sits in.
  Concluding that scope makes the feedback available rather than showing it; the candidate reaches
  it through a `test-show-feedback` button.

`test-navigation` announces `qti-part-completed` and `qti-test-completed` the first time each part,
and then the test, becomes done — it already owns the per-item view through the computed context, so
completion is detected there. Both are one-shot per test, since a part that is done stays done and
re-announcing would re-run outcome processing on every context rebuild.

`test-processing.mixin` listens for those and runs outcome processing with the scope that concluded,
which is what gives `atEnd` feedback its chance to evaluate. `outcomeProcessing()` now takes an
optional `{ atEnd, partId }`, and announces `qti-test-outcome-changed` from the assessment-test
element carrying the same scope. `qti-assessment-test` re-evaluates the test feedback below it on
that event, passing the scope through — so only the run that ended a feedback's own scope can
satisfy `atEnd`, and part-scoped feedback does not fire at the end of the whole test.

`qti-test-feedback` also renders its content now; it previously rendered nothing at all, so no test
feedback could ever be seen.
