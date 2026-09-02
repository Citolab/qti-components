---
'@qti-components/base': minor
'@qti-components/theme': minor
'@qti-components/interactions-core': minor
'@citolab/qti-components': minor
---

Keep interactions working where custom states are unsupported.

Interactions track selection and correct/incorrect marking through `internals.states`, with bare
state names (`checked`, `radio`, `correct-response`, …). Two browser profiles cannot service that,
and on both, picking a choice throws rather than registering:

- Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so `internals.states` is
  `undefined` and reading it throws.
- Chrome and Edge before the CSS custom-state spec change expose `states` but reject names that do
  not start with `--`, so `states.add('radio')` throws a `SyntaxError`.

`attachInternals` is unguarded throughout the interaction base classes, which puts the hard support
floor at Safari 16.4 — inside the range that breaks.

`@qti-components/base` now classifies custom-state support by behaviour — `missing`, `legacy` or
`modern`, probing a throwaway element rather than sniffing versions — and on the first two replaces
`states` with a permissive `Set` that also mirrors its contents to a space-separated `data-state`
attribute on the host. Where `states` works natively nothing is installed and nothing changes.

The mirror is needed because these browsers' CSS parsers also drop any selector list containing
`:state()`, so checked, correct-response and drag styling never rendered there either. The theme's
built stylesheets now pair every `:state(x)` with a `[data-state~='x']` arm, applied at build time by
`tools/postcss/custom-state-fallback.mjs`. `:is()` is what makes the pairing work in both
directions: its forgiving parsing means a browser that does not understand `:state()` keeps the
attribute arm, while a browser that does keeps matching the state arm.
