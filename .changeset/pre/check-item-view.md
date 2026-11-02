---
'@qti-components/test': major
'@citolab/qti-components': major
---

`<test-check-item>` no longer reaches into `<test-container>`'s shadow root. After ending the attempt it switches the test to a view, named by its new `view` attribute (default `scorer`), through `cito-test-switch-view`.

Behaviour change: `[view]` content for other views, including `candidate`, is hidden while that view is active; before, every `[view]` element was shown. Use `<test-view-toggle>` to switch back. No surveyed host uses `<test-check-item>`.
