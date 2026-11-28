---
'@qti-components/interactions-core': minor
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

A choice selects the moment it is pressed.

- **`qti-simple-choice` activates on `pointerdown`** (primary button), not on release: holding a choice down already shows it selected. The `click` that follows is swallowed, so a checkbox does not toggle back. Keyboard (Space, Enter) and a programmatic `.click()` work as before. A choice used as a drag chip (order interaction, `qti-draggable`) still waits for the click, because there a press starts the drag. `ActiveElementMixin` takes this as an option, `ActiveElementMixin(Base, type, { activateOn: 'press' })`; the default stays `'click'`.
- **No grey press tint on choices and chips.** The selection is a choice's press feedback now, and a chip's is its drag; the `:active` wash on top of either is gone. The test controls keep theirs, because they act on release.
