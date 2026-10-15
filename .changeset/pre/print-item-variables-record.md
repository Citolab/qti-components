---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`test-print-item-variables` prints a record value field by field (`time: 3.6, point: 455 250`, e.g. the response of a portable custom interaction) instead of `[object Object]`, for the value and the correct response. A correct response of `0` is printed instead of left out.
