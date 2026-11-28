---
'@qti-components/elements': minor
'@citolab/qti-components': minor
---

The item's public events get the `cito-` prefix, declared in `public-events.ts` and exported from `@qti-components/elements`: `cito-item-response-changed`, `cito-item-outcome-changed`, `cito-item-rendered` and `cito-item-rubric-placement` (cancelable). `detail` is unchanged.

- **Deprecated:** `qti-interaction-changed`, `qti-outcome-changed` and `qti-rubric:discretionary-placement` are still sent and handled next to the new names, and go in the next major. An old name sent into the test logs a one-time `console.warn` naming the new one. A rubric listener that cancels either name keeps the block where it is.
- `qti-assessment-item-connected` stays: it is internal plumbing for the test and item container. Hosts use `cito-item-rendered`.

Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.
