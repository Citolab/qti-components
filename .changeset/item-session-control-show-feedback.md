---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Apply the `show-feedback` constraint per the QTI `ItemSessionControl` rules.

`test-navigation` cascades `show-feedback` from the session control into the computed context, and
`QtiFeedback` consults it.

The constraint governs exactly one state: after the end of the last attempt. Until then the spec
requires any applicable feedback to be shown — "a value of max-attempts greater than 1, by
definition, indicates that any applicable feedback must be shown" — and only "once the maximum
number of allowed attempts have been used (or for adaptive items, completionStatus has been set to
completed)" does `show-feedback` decide. So the gate asks whether the item is out of attempts, which
is answered per item kind:

- adaptive items ignore `max-attempts` entirely, and are out of attempts only once
  `completionStatus` is `completed`;
- `max-attempts="0"` means no limit, so that state is never reached and feedback always shows;
- otherwise, once `numAttempts` reaches `max-attempts`, `show-feedback` decides, defaulting to
  false.
