---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

The test's public events get the `cito-` prefix, declared in one module (`public-events.ts`): requests `cito-test-navigate`, `cito-test-end-attempt`, `cito-test-update-outcome`, `cito-test-switch-view`; notifications `cito-test-navigated` (new: sent only after a navigation succeeded and rendered), `cito-test-navigation-started`, `cito-test-navigation-failed`, `cito-test-rendered`, `cito-test-loaded`, `cito-test-state-changed`, `cito-item-ref-connected`.

- **Deprecated:** the old names (`qti-request-navigation`, `test-end-attempt`, `test-update-outcome-variable`, `on-test-switch-view`, `qti-navigation-loading-started`, `qti-navigation-error`, `qti-test-loaded`, `qti-assessment-test-connected`, `qti-state-changed`, `qti-assessment-item-ref-connected`) are still sent and handled, with the same `detail`. They go in the next major. A request sent under an old name (`qti-request-navigation`, `test-end-attempt`, …) logs a one-time `console.warn` naming the new one.
- `qti-navigation-loading-ended` is unchanged and deprecated without a replacement: it also fires on failure and cancellation. Use navigated / failed.

Host entries: `plans/host-migration/{kennisnet,citotestuit,peilinglezen}.md`.
