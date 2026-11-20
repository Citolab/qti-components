---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

Adaptive items (`adaptive="true"`) are done when their response processing sets `completionStatus` to `completed`, not when `max-attempts` is reached. QTI 3 does not apply `max-attempts` to adaptive items, but the player did, so in a linear test with `max-attempts="1"` Next unlocked after a wrong first attempt while the item still had its next phase to show.

- `test-navigation`: `done` for an adaptive item is `completionStatus === 'completed'`.
- `test-end-attempt` is disabled once an adaptive item is completed.
