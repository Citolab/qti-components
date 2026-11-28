---
'@qti-components/inline-choice-interaction': patch
'@citolab/qti-components': patch
---

An inline choice can have an empty placeholder: `data-prompt=""` (or an empty `inlineChoicePrompt` in the item configuration) is kept. Before, an empty value counted as missing and the placeholder fell back to `select`.

An empty placeholder now lines up with the sentence: the closed field keeps the same text baseline as when it shows an answer, so the line no longer changes height once a choice is made.
