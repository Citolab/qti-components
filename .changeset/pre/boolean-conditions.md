---
'@qti-components/processing': patch
'@citolab/qti-components': patch
---

A `qti-response-if`, `qti-response-else-if`, `qti-outcome-if` or `qti-outcome-else-if` whose condition is a boolean variable or base value applies only when it is `true`. Before, `false` was read as the string `'false'`, which is truthy, so `<qti-response-if><qti-variable identifier="HINT"/>` ran whenever HINT had a value. The spec's own adaptive examples test booleans this way. Fixes #340.
