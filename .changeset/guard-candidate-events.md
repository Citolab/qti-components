---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

No-op `test-navigation`'s candidate events when there is nothing to act on.

The navigation buttons are clickable before a test document has loaded — a failed
`assessment.xml` fetch leaves them enabled indefinitely — so a click could reach a handler
that dereferenced the test element, the item-ref and its assessment item unguarded, throwing
`TypeError: Cannot read properties of undefined (reading 'querySelector')`.

`test-end-attempt` now resolves the item through the existing `activeAssessmentItem` getter and
`test-update-outcome-variable` through `#assessmentItemFor`, each returning early when nothing is
rendered. Autoscoring resolves the item from the interaction event's own path, so
`qti-interaction-changed` also returns early for a change raised outside an assessment item.

`test-show-correct-response` and `test-show-candidate-correction` need no change: they are handled
by `TestNavigationCorrection` in qti-corrections, which already resolves the item through optional
chaining.
