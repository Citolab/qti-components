---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`<test-submit>` scores the test: on click it asks the test to submit (`cito-test-submit`), which runs outcome processing and then dispatches `cito-test-submitted`. `qtiTest.submit()` does the same from code. `qtiTest.outcomeProcessing()` now starts every run from the test outcomes' declared defaults, as QTI does and as the documentation already said; before, a rule that adds to its own outcome, such as `SCORE_TOTAL = sum + SCORE_TOTAL`, grew on every run.
