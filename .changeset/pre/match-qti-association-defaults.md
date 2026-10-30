---
'@qti-components/match-interaction': major
'@qti-components/interactions-core': patch
'@qti-components/gap-match-interaction': patch
'@qti-components/graphic-gap-match-interaction': patch
'@citolab/qti-components': major
---

A match interaction without `max-associations` now allows one association, QTI's default (information model §5.89), instead of any number; a second association is reported with the default max-selections message (refused only where the host sets `disableAfterMaxReached`). Without `min-associations` it requires none, also QTI's default, instead of one. Items that leave `max-associations` out and expect several pairs need `max-associations="0"` (unlimited) or their real limit. Conformance: Q13-L2-D110. Host notes: `plans/host-migration/kennisnet.md`, `plans/host-migration/citotestuit.md`. Each drag-and-drop interaction now declares its own QTI default: the shared mixin's `max-associations` is a plain property (0), and gap match and graphic gap match set 1 themselves instead of the mixin checking their tag names; their behaviour is unchanged.
