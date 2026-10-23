---
'@qti-components/test': major
'@citolab/qti-components': major
---

`test-navigation` disables an item once it has used its attempts, so the candidate can no longer change the answer after the last attempt is ended (`test-end-attempt`). The rule is the one `test-end-attempt` already used for its own button: a non-adaptive item with `max-attempts` above 0 (default 1) and `numAttempts >= max-attempts`. Adaptive items, `max-attempts="0"` (unlimited) and items in a `submission-mode="simultaneous"` part (one attempt each, processed when the part ends; the answer may change until then) are never disabled, and nothing is locked with `auto-score-items`, where every change is scored as an attempt.

It reads the computed context, so it holds for every item on screen (`navigate="section"`) and for a restored `qtiTest.state` (disabled as soon as the item loads), and it releases the item when its attempts are back to zero. Only an item the navigation disabled itself is released: a host or view that sets `disabled` on an item keeps it so.

A practice test that lets the candidate check again must say so in its package: `<qti-item-session-control max-attempts="0" />`. QTI's default is one attempt, also without `qti-item-session-control`, so a plain package now locks each item after its first attempt. Host migration: [Kennisnet](../plans/host-migration/kennisnet.md#next-major).
