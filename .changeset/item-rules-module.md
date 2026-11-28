---
'@qti-components/delivery': minor
'@citolab/qti-components': minor
---

`itemRules` and `navigationRules`: what one item session may do now (end its attempt, submit or skip, show feedback, enter review or solution) and whether the candidate may go to the next or previous item, answered from its lifecycle state, its session control and its responses, following QTI 3 (`qti-item-session-control`) only. Pure, with JSON vectors for other runtimes. Nothing in `qti-test` reads them yet (roadmap 1, T3b1).
