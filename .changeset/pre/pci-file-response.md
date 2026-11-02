---
'@qti-components/portable-custom-interaction': patch
'@citolab/qti-components': patch
---

A PCI bound to a response with base-type `file` no longer loses its file. The item now stores the PCI's `{ data, mime, name }` as a data URL, the value `qti-upload-interaction` stores for the same file, instead of `"[object Object]"`. A PCI gets `{ data, mime }` back in `boundTo`, also for a data URL an upload interaction stored. The same applies to `list` file responses, `file` record fields, and template and context variables. The file name is not kept, as with an upload.
