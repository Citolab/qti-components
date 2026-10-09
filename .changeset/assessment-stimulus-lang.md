---
'@qti-components/elements': patch
'@qti-components/test': patch
'@citolab/qti-components': patch
---

A shared stimulus is placed as its whole `qti-assessment-stimulus` instead of only its `qti-stimulus-body`, so the content inherits the stimulus' `xml:lang` and text-to-speech and screen readers read it in the right language. The new `qti-assessment-stimulus` element generates no box (`display: contents`), so layout is unchanged. It drops the stimulus' QTI `title` when placed, which would otherwise show as a tooltip over the whole passage.
