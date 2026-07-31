---
'@qti-components/inline-choice-interaction': major
'@qti-components/theme': minor
---

`qti-inline-choice-interaction`: correct the autosize measurement, and make the
open control read as one shape.

**Autosizing measures rows, not the menu**

The measurement moved to `MenuAutoSizeMixin` (see the other changeset) and three
bugs came out with it, all only visible on repetition:

- It fed itself. The menu is anchor-positioned with `min-width:
  anchor-size(width)`, so it is never narrower than the trigger — and the result
  was written back to the trigger with the chevron's width added. The control
  grew by one chevron every time the menu opened, without limit.
- It measured the SUM of every option. The rows are `display: inline-flex`, so a
  `max-content` menu lays them all on one line: two rows of 53px and 284px
  produced 343px instead of 284px, and the trigger came out ~60px too wide with
  a hole between the value and the chevron. Worse with every option added.
  Rows are measured one at a time now, and the widest wins.
- The chevron was measured with a client rect while it rotates on open, and a
  client rect reports the transformed box — so the width jittered by a few
  pixels on every open. `offsetWidth` is the layout box.

Autosizing is still opt-in through `configContext.inlineChoiceAutosize`, and an
explicit `qti-input-width-*` class still wins. That precedence is enforced in JS
(the measurement is skipped), because the measured value is written as an inline
style and would otherwise out-rank the class.

**The measured width moved into the shadow root.** It is written on the trigger,
not on the host — `::part(trigger)` is the element whose `min-width` reads it.
Anything reading `--qti-inline-choice-width` off the host's inline style must
read it from the trigger instead.

**The open control**

- The menu anchors to the HOST, not to the trigger. The host paints the field
  border and the trigger sits inside it, so the open menu was 1px narrower than
  the closed control on each side. The anchor is renamed
  `--qti-inline-choice-trigger` → `--qti-inline-choice-anchor` to match.
- Open, the edges that meet lose their rounding: the host squares its bottom
  corners, the menu its top. Driven by a new custom state `:state(open)` on the
  host, published when the popover toggles. Paint only.
- The menu has no padding of its own; rows go edge to edge and each row pays
  `--qti-padding-box`, the same token the trigger pays — so the selected value
  and the option rows start on the same vertical line. Option rows are square,
  since the menu clips them.

**Removed custom properties** (all component-local, each read once, each
reachable from nowhere else):

| removed | use instead |
|---|---|
| `--qti-inline-choice-overlay-z-index` | `--qti-overlay-z-index` |
| `--qti-inline-choice-popover-z-index` | `--qti-popover-z-index` |
| `--qti-inline-choice-motion-duration-fast` | `--qti-motion-duration-fast` |
| `--qti-inline-choice-trigger-gap` | `--qti-glyph-gap` |

The last one was `calc(var(--qti-gap) / 2)`, the arithmetic the spacing
vocabulary rules out. `--qti-glyph-gap` already means the space between a glyph
and the thing it annotates — the same token the drag grip and the correction
badge spend — and lands on the same 8px, now scaling with the text rather than
the root.
