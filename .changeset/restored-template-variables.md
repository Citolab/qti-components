---
'@qti-components/elements': patch
'@citolab/qti-components': patch
---

Keep restored template values. An item handed template values through `variables` — when it is revisited in a test, or a session is resumed — no longer draws new ones in template processing, so the candidate sees the question they answered. Template processing still runs, so correct responses are derived from the restored values, and values restored after processing re-derive them. Values restored before a template declaration has registered are kept too.

## Migration for hosts

No API change. A behaviour change for hosts that resume sessions: an item revisited or restored with template values now shows those values instead of drawing new ones. A host that relied on a fresh draw on every visit must clear the item's template values before restoring. Hosts that restore through `qtiTest.state` (or `testContext`) need no change: **Kennisnet**, **CitoTestUit** and **PeilingLezen** all benefit without code changes.
