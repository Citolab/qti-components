---
'@qti-components/extended-text-interaction': major
---

`qti-extended-text-interaction` reads `min-strings`, defaulting to 0 as in the QTI spec. An empty field is now valid unless `min-strings="1"` is set; it used to be invalid. Items that relied on that (e.g. gating next or end-attempt on an answer) must add `min-strings="1"`.
