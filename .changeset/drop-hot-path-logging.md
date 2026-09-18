---
'@qti-components/processing': patch
'@qti-components/base': patch
'@qti-components/test': patch
'@citolab/qti-components': patch
---

Stop doing expensive work for log lines nobody reads, and log at the right level.

Two traces serialised data on every expression evaluation, whether or not anything was listening —
`console.debug` computes its arguments regardless of the console's level:

- `qti-multiple` logged `this.innerHTML`, serialising its whole DOM subtree. It wraps the correct
  response in most choice items, so this ran on every scoring pass.
- `qti-default` logged `JSON.stringify(itemContext)`, serialising an item's entire variable set —
  and did it _before_ the null check that may return early.

Two more fired per child per expression evaluation in `QtiExpression.getVariables` and carried no
information the caller did not already have. All four are gone; no debug infrastructure gated them,
so they were development traces rather than diagnostics anyone could rely on.

Error conditions in `qti-lte` and `qti-gte` were reported with `console.log` rather than
`console.error` (and `qti-gte` named itself "qte"), and the `disableAfterIfMaxChoicesReached`
deprecation notice used `console.log` where a deprecation belongs at `console.warn`. No
`console.log` remains in shipped source.
