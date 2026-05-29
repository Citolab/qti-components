---
'@qti-components/transformers': patch
'@qti-components/inline-choice-interaction': patch
'@qti-components/match-interaction': patch
'@citolab/qti-components': patch
---

Preserve MathML (and other foreign) namespaces when transforming QTI XML to HTML so `<math>` and its descendants render correctly in the browser. Inline-choice and match interactions now clone child nodes instead of injecting `innerHTML`/`textContent`, so embedded MathML in choices is preserved as well.
