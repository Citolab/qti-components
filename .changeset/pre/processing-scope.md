---
'@qti-components/elements': major
'@citolab/qti-components': major
---

Response processing runs the way it would on a backend: once, after which the item applies the final outcome values in one update.

Before, `processResponse` published the item context at every step: the attempt count, the reset of a non-adaptive item's outcomes to their defaults, every `qti-set-outcome-value`, the completion status. Every consumer (feedback, `test-navigation`, `test-end-attempt`, a modal) saw the in-between states, such as a score of 0 or an empty FEEDBACK. Now `qti-response-processing` runs its rules on a copy of the item context (outcomes reset for a non-adaptive item, `numAttempts` already counted), so a rule still sees what an earlier rule wrote (`SCORE = SCORE + 1` twice gives +2). When the rules are done it sends every outcome in one `cito-item-set-outcomes`; the item applies them with the completion status and the validity in one publish, then sends one `cito-item-outcomes-changed`.

What a host notices:

- **Changed:** `cito-item-outcome-changed` and its legacy name `qti-outcome-changed` keep their name and `detail` (`{ item, outcomeIdentifier, value }`), but are sent once per outcome after each update, with the final value, after the context is published. A handler no longer sees the reset to the defaults or a rule's in-between value.
- **New:** `cito-item-outcomes-changed`, the same outcomes in one event: `detail` is `{ item, outcomes: [{ identifier, value }] }`, sent once per update. After `processResponse` it lists every outcome of the item.
- **New:** `cito-item-set-outcomes`, a request a host sends on the item with the outcomes a backend returned: `detail` is `{ outcomes: [{ identifier, value }], responseProcessed? }`. The item applies them in one update, synchronously. With `responseProcessed: true` it also ends the attempt the way `processResponse` does: a non-adaptive item whose processing left completionStatus `unknown` becomes `completed` (see the completionStatus changeset) and `qti-item-context-updated` goes out with `responseProcessed`.
- A run that throws counts the attempt and applies no outcomes. Before, it also left the outcomes the rules had set before the error, and completionStatus at `null`.
- `qti-set-outcome-value` no longer reaches the item: `qti-response-processing` takes it and writes to its own copy of the item context, which only a run sends to the item.
- `qti-response-processing`'s `process()` is now `processResponse({ numAttempts })`, with the attempt count the item keeps, and sends its result instead of applying it; call `item.processResponse()` to score. The item no longer knows the element's class, only that it has `processResponse`.
- **Removed:** `item.updateResponseVariable` from the helper a `qti-custom-operator` script gets: response processing reads responses, it does not change them. `item.getVariable` and `item.updateOutcomeVariable` stay.

Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major), [PeilingLezen](../plans/host-migration/peilinglezen.md#next-major), [Examenkompas](../plans/host-migration/examenkompas.md#next-major), [CitoTestUit](../plans/host-migration/citotestuit.md#next-major) (nothing to do).
