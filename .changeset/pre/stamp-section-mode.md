---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`<test-stamp>` updates its context in `navigate="section"` too. It used to wait for an active item, and a test showing a section has none, so the template kept its empty defaults. `activeItem` is `{}` there; `activeSection`, `activeTestpart` and `test` (with `test.plugins`) are filled.
