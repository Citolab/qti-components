---
'@qti-components/end-attempt-interaction': major
'@citolab/qti-components': major
---

`qti-end-attempt-interaction` counts the attempt it ends unless it says `count-attempt="false"`. Before, only `count-attempt="true"` counted. QTI 3 gives the attribute no default; an absent value now counts, as QTI 2.x's default `true` did and as amp-up and QTI.JS do. Fixes #341.

An item whose hint or "show solution" button has no `count-attempt` now uses up an attempt when the candidate presses it, and in a test with the default `max-attempts` of 1 the item is then locked. Give such a button `count-attempt="false"`.
