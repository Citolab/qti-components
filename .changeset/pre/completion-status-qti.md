---
'@qti-components/base': major
'@qti-components/elements': major
'@qti-components/test': major
'@citolab/qti-components': major
---

`completionStatus` follows QTI 3 (info model §2.2.2, §2.5) and the 1EdTech conformance suite's Results Reporting reference results.

- **completionStatus is no longer derived from validity.** Before, a non-adaptive item set `completed` or `incomplete` on every answer, from whether its interactions were valid. Now it is `not_attempted` until the item is presented, `unknown` from then on, and `completed` once an attempt of a non-adaptive item ends (after `processResponse()`), unless response processing set a value itself. An adaptive item is completed only by its response processing, as before. Whether the answers are valid is `valid` in the item context and in the computed context; to know whether an item is answered, read `valid && !isDefaultResponse` per item instead of `completionStatus === 'completed'`.
- An item that is presented is never `not_attempted`: after a reset or a restore that says so, it is `unknown`. The test context still holds `not_attempted` for items that were never presented.
- Response processing no longer resets `completionStatus` before a run of a non-adaptive item: it is built in and has no default.
- `test-scoring-feedback` shows its "no response" text from the item's validity and default response, not from completionStatus.

Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major), [CitoTestUit](../plans/host-migration/citotestuit.md#next-major), [PeilingLezen](../plans/host-migration/peilinglezen.md#next-major), [Examenkompas](../plans/host-migration/examenkompas.md#next-major).
