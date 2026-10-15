---
'@qti-components/portable-custom-interaction': minor
'@citolab/qti-components': minor
---

Add an opt-in `sandboxed` attribute to `qti-portable-custom-interaction`. When set, the PCI runs in an iframe with
`sandbox="allow-scripts"` (no `allow-same-origin`), so a PCI the host does not trust cannot reach the host page's DOM,
storage or credentials. The postMessage bridge works unchanged; loading by `<script>`, `<img>`, media and stylesheets
keeps working, while `fetch`/XHR of the PCI's own files needs CORS. Without the attribute nothing changes.
