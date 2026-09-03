---
'@qti-components/test': minor
'@qti-components/base': minor
'@citolab/qti-components': minor
---

Add `qti-item-session-control`, and honour `max-attempts` and `allow-skipping`.

The element exposes the QTI 3.0 `ItemSessionControl` attributes, and `test-navigation` cascades
them from test-part to section to item into the computed context, so every item carries the
settings that apply to it.

`test-end-attempt` reads that cascade: it is disabled once a non-adaptive item has reached its
`max-attempts` (`max-attempts="0"` means unlimited), and — when `allow-skipping` is false — while
the active item's response is still invalid or untouched. Adaptive items are exempt from the
attempt limit, since they are meant to keep iterating.

The computed context gains `valid` and `isDefaultResponse` per item to support that, alongside
`maxAttempts` and `allowSkipping`.
