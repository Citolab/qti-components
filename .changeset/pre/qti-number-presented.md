---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

New test-level expression `qti-number-presented`: the number of selected item refs that have been presented to the candidate, with the same `section-identifier`, `include-category` and `exclude-category` filters as `qti-number-selected`. An item is presented once its `completionStatus` has left `not_attempted`, so items a linear test part passed over (pre-conditions, branch rules) and items not reached yet are not counted. Use it for totals over the candidate's own route, such as a maximum score of one point per presented item.

- A presented item no longer keeps a `not_attempted` the test context held for it (a restored session, or values set with `updateItemVariables` before the item was reached): presenting an item starts its first attempt, so it takes the item's own status.
