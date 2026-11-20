---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

With `navigate="item"`, a `test-section-link` (a `cito-test-navigate` request of type `section`) now makes the section's first item the active one. Before, no item was active, so `test-next` and `test-prev` stayed disabled and item links highlighted nothing. The whole section still loads, and `navigate="section"` is unchanged. Since that first item is now the active item, `test-check-item`, `test-end-attempt` and the scoring buttons act on it. Hosts: see "Section link in item mode" in `plans/host-migration/kennisnet.md` and `plans/host-migration/citotestuit.md` (#332).
