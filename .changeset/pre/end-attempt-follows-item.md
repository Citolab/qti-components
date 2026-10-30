---
'@qti-components/end-attempt-interaction': minor
'@citolab/qti-components': minor
---

`qti-end-attempt-interaction` follows its item: it cannot be pressed while the item is `disabled` or `readonly`, or once an adaptive item has set `completionStatus` to `completed`. QTI says an adaptive item that sets `completed` closes its session, so no further attempt can start (info model §2.2.2). Before, the button stayed enabled and every press ran response processing again. Fixes #342.
