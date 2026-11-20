---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

Chips answer the pointer more clearly, and the drop a chip will land in shows.

- **Hover:** a chip's edge takes the active border colour under the pointer (`--qti-border-active`); its fill stays. Before, 8% of the text colour was mixed into the fill, which turned every white chip grey. Only on a fine pointer that can hover.
- **Focus ring on release:** a chip shows its focus ring once the button is released, not while it is pressed (`:focus:not(:active)`), because a press may be the start of a drag.
- **Placeholder:** the hole a lifted or placed chip leaves hides the chip's handle too, not only its text. A theme that colours its handles (`--cito-color-drag-icon`) left the handle standing in the hole.
- **Drop target under the chip:** while you drag, the drop the chip is over gets the highlight fill and a ring in the active border colour just outside its edge (new `@mixin drop-over`), in order, associate, match, gap match and graphic gap match. The drag code already flagged that target (`:state(hover)`, or `::part(hover)` on order and associate slots), but the faint wash every droppable target gets (`enabled`) came later in each stylesheet and painted over it.
- **No hover on other chips during a drag:** the chips a dragged chip passes over keep their resting edge while the interaction is in `:state(dragzone-active)`.
