---
'@qti-components/portable-custom-interaction': patch
'@citolab/qti-components': patch
---

The PCI iframe is now exactly as high as its content: it no longer adds 100px of empty space below it. The iframe keeps the width of its host instead of a fixed pixel width, so a PCI follows the item layout when it gets narrower, e.g. when QTI layout columns stack.
