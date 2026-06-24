---
'@qti-components/theme': patch
---

Fix `::part(drag)` selectors silently dropping in Chrome. The selectors
introduced in 1.5.0 were merged into the existing comma-separated drag
selector list with a CSS comment between commas. Chrome's nesting parser
silently drops the selector that follows an in-list comment, so
`qti-order-interaction::part(drag)` and `qti-associate-interaction::part(drag)`
never actually matched. Extracted them into their own blocks so the comment
sits outside the selector list.
