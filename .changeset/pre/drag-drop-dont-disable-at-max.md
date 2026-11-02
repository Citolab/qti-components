---
'@qti-components/interactions-core': major
'@qti-components/base': patch
'@citolab/qti-components': major
---

Drag-and-drop interactions (match, gap match, graphic gap match, associate, order) no longer disable their drop targets once `max-associations` is reached, unless the host sets `configContext.disableAfterMaxReached: true`. The candidate can go over the maximum and the max-selections message reports it, as QTI describes ("upon violation of the max-associations constraint", vocabulary §1.2.8.3) and as choice interactions already did. Per-choice `match-max` still refuses a full target. Conformance: Q13-L2-D2, D108, D110. Host notes: `plans/host-migration/kennisnet.md`, `plans/host-migration/citotestuit.md`, `plans/host-migration/examenkompas.md`.
