---
'@qti-components/interactions-core': major
'@qti-components/order-interaction': patch
'@qti-components/associate-interaction': patch
'@qti-components/gap-match-interaction': patch
'@qti-components/match-interaction': patch
'@qti-components/graphic-gap-match-interaction': patch
'@citolab/qti-components': major
---

Drag and drop: two internals cleaned up.

- The legacy drag-drop mixins (`DragDropInteractionMixin`, `drag-drop-api`, under
  `mixins/drag-drop/`) are removed. They were deprecated and no interaction used them; use
  `DragDropSlottedMixin` or `DragDropSlottedSortableMixin` from `mixins/drag-drop-observables`.
- The attribute that marks a draggable chip is `data-draggable="true"`, was `qti-draggable` (`qti-`
  is 1EdTech's prefix). It is internal plumbing, not a styling hook: style chips with `:state(chip)`
  and `::part(chip)`. A selector passed to a drag-drop mixin that names the old attribute must use
  the new one.
