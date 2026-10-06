---
'@qti-components/elements': patch
'@citolab/qti-components': patch
---

Keep restored template values. An item handed template values through `variables` — when it is revisited in a test, or a session is resumed — no longer draws new ones in template processing, so the candidate sees the question they answered. Template processing still runs, so correct responses are derived from the restored values, and values restored after processing re-derive them. Values restored before a template declaration has registered are kept too.
