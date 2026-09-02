---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Hide feedback once an item is out of attempts, unless `show-feedback` says otherwise.

`test-navigation` cascades `show-feedback` from the session control into the computed context, and
`QtiFeedback` consults it: once the active item has used its `max-attempts`, a feedback block stays
off unless its session control sets `show-feedback`. A candidate who can no longer answer therefore
does not keep seeing the verdict.
