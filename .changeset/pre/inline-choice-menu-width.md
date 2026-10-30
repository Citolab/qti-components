---
'@qti-components/inline-choice-interaction': patch
'@qti-components/interactions-core': patch
'@citolab/qti-components': patch
---

An auto-sized inline choice opens a menu exactly as wide as the closed field. The option rows (`qti-inline-choice`) were `inline-flex`, so the shrink-to-fit menu measured them side by side and came out as wide as all options together; they are block-level `flex` rows now. The measured trigger width also counts the gap before the chevron (the widest option was cut off by a few pixels) and no longer adds the menu's border. An empty value or prompt (`data-prompt=""`) keeps the field and the prompt row one line tall instead of collapsing.
