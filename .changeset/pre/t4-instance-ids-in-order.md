---
'@qti-components/delivery': minor
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`createDeliveryState({ order })` reads the rendered test's instance ids: a `with-replacement` clone listed as `item-3#2` keeps occurrence 2 wherever ordering put it, even before its original; a bare repeat still takes the next free occurrence, and an instance listed twice is refused with a `RangeError`. `parseItemInstanceId` is the inverse of `itemInstanceId`. The delivery-state vectors gain both cases.

`QtiTestState` documents that a `with-replacement` clone is stored, navigated to and updated by its instance id (`item-3#2`), and a session with a clone resumes with each instance's own answer.
