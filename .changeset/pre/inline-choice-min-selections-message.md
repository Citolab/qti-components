---
'@qti-components/inline-choice-interaction': patch
'@citolab/qti-components': patch
---

`qti-inline-choice-interaction` now shows the author's `data-min-selections-message` when an empty response is invalid (`required="true"` or `min-choices="1"`). It read `data-min-choices-message` instead, so the message the QTI 3 vocabulary and every other interaction use was ignored and the default "Please select an option." appeared. `data-min-choices-message` is still read as a fallback. Conformance item `Advanced/Q12-inline-choice/inline-choice-sv-3` (Q12-L2-D103) now asserts the message text.
