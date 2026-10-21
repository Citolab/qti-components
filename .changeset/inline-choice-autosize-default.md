---
'@qti-components/inline-choice-interaction': major
'@qti-components/base': major
'@citolab/qti-components': major
---

`inlineChoiceAutosize` is on by default. An inline choice is as wide as its widest option from the start, so choosing an option no longer widens the field and reflows the sentence around it. A `qti-input-width-*` class still wins; set `configContext.inlineChoiceAutosize: false` for the old behaviour, where the field sizes to the option shown. Host notes: `plans/host-migration/kennisnet.md`, `plans/host-migration/citotestuit.md`.
