---
'@qti-components/base': minor
'@citolab/qti-components': minor
---

Stop every expression element re-rendering on every context change.

`QtiExpression` rendered `<pre>${JSON.stringify(this.result, null, 2)}</pre>` beside its slot — a
development aid nobody could see, because expressions live inside `qti-response-processing`, which is
`display: none`. Worse, it re-ran constantly: `@consume` subscribes through `ContextConsumer`, which
calls `host.requestUpdate()` itself on every context change, "in case this value is used in a
template". Here it was not, and dropping `@state()` from the consumed properties does nothing about
it — the subscription drives the update, not the decorator.

Measured on an item with 30 response-processing rules, which holds 180 expression elements: 50 test
context updates produced **9000 renders** — one per element per update — each serialising its result.
The test context changes on every keystroke in a text entry.

The template is constant, so the elements now render once and never again, and `result` is no longer
`@state()` (nothing renders it, and response processing writes it on every expression of every rule
it walks). The same 50 updates now produce **0 renders**, and the loop went from 10ms to 3ms. The
context subscriptions stay: `calculate()` reads the current values when a rule invokes it.

Replacing the debug `<pre>`, `QtiExpression` exposes a public `lastResult` — what the last
`calculate()` produced. That is the supported way to inspect a scoring run: process the responses,
then walk the rule tree reading `lastResult` off each expression to get the whole tree annotated with
its values. It costs nothing when unused, and gives a tool more than the `<pre>` ever did, which was
one hidden element's JSON.
