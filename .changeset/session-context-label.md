---
'@qti-components/base': patch
'@citolab/qti-components': patch
---

Label the session context `sessionContext` instead of `testContext`, so it is told apart from the test context in devtools. The context itself is unchanged.

## Migration for hosts

Only affects code that finds the context by its label, such as devtools filters. Components consuming the context, including PeilingLezen's custom interactions, are unaffected.
