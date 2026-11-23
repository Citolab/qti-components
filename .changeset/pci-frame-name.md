---
'@qti-components/portable-custom-interaction': patch
'@citolab/qti-components': patch
---

The PCI iframe keeps its native frame role: it no longer has `role="application"`, so screen-reader users can still move through the PCI by headings and landmarks. A PCI that is a desktop-like widget sets `role="application"` on its own container inside its document. The redundant `aria-hidden="false"` is gone too.

Each PCI frame now has its own name, set as its `title` (and as the frame document's `<title>`): the `aria-labelledby` or `aria-label` authored on the interaction, else its `qti-prompt`, else "Interactive question N", N counting the PCIs in the item. It used to be "QTI PCI Iframe" for every PCI.
