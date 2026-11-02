---
'@qti-components/delivery': minor
'@citolab/qti-components': minor
---

New, experimental package: `@qti-components/delivery`, the QTI 3 delivery engine with no browser globals, so the same code runs in the browser and on a Node server. This first release holds the seeded random and the fixed-aware shuffle (moved from `@qti-components/transformers`, with identical output), the versioned delivery state (`DeliveryState`), the command and effect types, an injected clock and the interface to response and outcome processing. Its API may change in any 0.x release.
