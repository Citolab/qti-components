---
'@qti-components/interactions-core': major
'@qti-components/theme': major
'@qti-components/base': major
'@qti-components/order-interaction': major
'@qti-components/match-interaction': major
'@qti-components/gap-match-interaction': minor
'@qti-components/hottext-interaction': minor
'@qti-components/graphic-order-interaction': minor
'@qti-components/media-interaction': minor
'@qti-components/custom-interaction': minor
---

BREAKING: rework how drag-and-drop interactions size their drop targets, and
extract the measurement into a reusable mixin so a host that renders the same
controls — the ProseMirror editor — can run the same code instead of a copy.

**A drop is a slot or a card** (`@qti-components/interactions-core`, `@qti-components/theme`)

The distinction is a property of the **interaction**, never of an individual
drop. gap-match, order and associate hold one chip per drop and are measured;
match's targets are categories that collect answers and take a flat floor. It is
deliberately not conditional on a drop's own `match-max`: a `match-max="1"` match
target is still a category that happens to take one answer, and it sits in a grid
beside targets that take several. Documented in the new
`packages/qti-theme/DROP-SIZING.md`, referenced from `CONTRACT.md` §8.

- Order's drops are sized from their chips on both axes now (`justify-self:
  start` plus the measured `min-width`), instead of stretching to a `1fr` grid
  track — a vertical order slot was 669px wide for a 149px chip.
- A filled single-capacity drop hides its dashed edge (gap-match, associate;
  order already did). Colour only, so the box does not move.
- Match targets keep their edge and their `4rem` floor, and gained an inset so a
  chip is not flush against the card.

**Six CSS custom properties removed** (`@qti-components/theme`)

Everything that a `::part(drop)` selector can already reach from the document is
a plain declaration now; a token is reserved for what a selector cannot reach.

| removed | replacement |
|---|---|
| `--qti-drop-min-height` | `--qti-dropzone-min-height` (fallback carries the card's `4rem`) |
| `--qti-drop-min-width` | `--qti-dropzone-min-width` |
| `--qti-match-target-min-width` | `--qti-dropzone-min-width`, fallback `150px` |
| `--qti-drop-gap` | declare `gap` on the drop's own rule |
| `--qti-dropzone-padding` | declare `padding` on the drop's own rule |
| `--qti-form-size` | `--qti-control-size` |

`--qti-drop-min-width` is why: it meant *the grid-track floor* in order (`120px`)
and *a drop's own min-width* in the match target (`0`). One name, two unrelated
jobs, and a theme setting it hit both.

`--qti-dropzone-min-width` is now read by the CHIP as well as the drop
(`@mixin drag`), which is what makes a chip and its slot the same size with no
rule relating them. A consequence: where an interaction measures, every chip
takes the width of the widest.

**`qti-droppable` attribute removed** (`@qti-components/interactions-core`)

Drop targets are marked with the custom state `:state(droppable)` only. The
runtime previously wrote both the attribute AND a state spelled `drop`; the state
is renamed to `droppable`, which is the spelling the editor already used and the
one `qti-simple-associable-choice` already accepted.

- Migration: `[qti-droppable]` → `:state(droppable)`; `:state(drop)` →
  `:state(droppable)`.
- Nothing read the attribute from JS, and it appears in no manifest or contract
  doc. Order's and associate's shadow `<div part="drop">` now carry no marker at
  all — a `<div>` cannot hold a custom state — and are reached as `::part(drop)`.

**New: `DropzoneAutoSizeMixin` and `MenuAutoSizeMixin`** (`@qti-components/interactions-core`)

Both exported from the package root, beside `VocabularyMixin`.

- `DropzoneAutoSizeMixin` was two members of `DragDropSlottedMixin`
  (`autoSizeDropzones`, dropzone measurement). It now also **re-measures**: a
  `ResizeObserver` over the chips catches text reflow, image load and font swap;
  a `MutationObserver` catches a chip added, removed or edited. Previously the
  only trigger was mount, so a late-loading image left the drop the wrong size.
- `MenuAutoSizeMixin` sizes a closed combobox to its widest option — extracted
  from `qti-inline-choice-interaction`.
- Both write their measurement to an overridable target
  (`dropzonePropertyTarget()` / `menuAutoSizePropertyTarget()`) that defaults to
  the host but can be a node inside the shadow root. That is what makes them
  usable under ProseMirror, whose mutation observer reverts an attribute — a
  `style` attribute included — and re-triggers itself on the revert.

**Removed** (`@qti-components/interactions-core`)

- `DragDropSlottedMixin`'s `configuration` object (`copyStylesDragClone`,
  `dragCanBePlacedBack`, `dragOnClick`). Nothing ever assigned it, two of the
  three fields had no reader, and being `attribute: false` AND `protected` it was
  unreachable by design.
- `applyDropzoneAutoSizing`'s trailing `hostWindow` parameter is now
  `options.hostWindow`, and the branch that wrote an inline
  `grid-template-columns` on the drops' container is gone — it only ever fired
  for match, which had measurement off.

**`@qti-components/base`**

- `Interaction.configContext` is `public`. It was `protected` and every caller
  reached it through a cast anyway; assigning it directly is the development-time
  route for configuring one interaction with no provider above it.
- `dropRegion` no longer declares `padding` or `gap`. A slot-shaped drop needs
  neither — its reservation is already the chip's border-box — and the one drop
  that wants room declares it on its own rule.
