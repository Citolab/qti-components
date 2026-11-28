---
'@qti-components/delivery': minor
'@citolab/qti-components': minor
---

The item session lifecycle (QTI 3 info model §2.2.1) as a transition table (experimental): `ITEM_LIFECYCLE` with the six states QTI names plus `modalFeedback`, and QTI's events, a pure `transition(state, event, guards)` that refuses any transition the table does not list, and `itemLifecycleGuards` / `hasAttemptsLeft`, which read the guards from an item's session control, facts, test part and variables. Nothing calls it yet; `qti-test` follows it from roadmap 1 T3b.
