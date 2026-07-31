# Drop sizing contract

How a drag-and-drop interaction decides how big a chip is, how big the drop it lands in is, and what
either looks like once it is full.

Sibling to `CONTRACT.md`, which governs the theme as a whole; this file governs one vocabulary inside
it. Read §7 of that file first — it is why sizing may be expressed as tokens at all, and why layout
(`display`, `flex`, `grid`) may not be set from the theme.

---

## 1. A drop is either a slot or a card

This is the distinction everything else follows from, and it is a property of the **interaction**,
never of an individual drop.

| | slot | card |
|---|---|---|
| interactions | gap-match, order, associate, graphic-gap-match | match |
| what it is | a socket cut to the size of one chip | a category that answers are collected into |
| height | measured — the tallest chip | a flat floor (`4rem`) |
| width | measured — the widest chip | whatever the target grid gives it |
| inset | none — the drop *is* the chip | `0.25rem` — room around the contents |
| edge when full | hidden, the chip is the only frame | kept, the card is still a card |

**Do not make this conditional on a drop's own `match-max`.** It was, briefly, and it is wrong: a
`match-max="1"` match target is still a category that happens to take one answer, and it sits in a
grid beside targets that take several. Sizing each target to its own contents makes that grid ragged.
`match-max` governs *how many chips may be placed*, which is behaviour; it governs nothing about size.

The one place a per-drop `match-max` is still read from CSS is the filled-edge rule for gap-match
(§4), where an author who writes `match-max="3"` on a gap has genuinely asked for something other
than a slot.

---

## 2. Two tokens, and no third

```
--qti-dropzone-min-height   a drop's minimum height
--qti-dropzone-min-width    a drop's minimum width — AND a chip's
```

The `min-*` pair is **written at runtime**, not declared: `DropzoneAutoSizeMixin` measures the widest
and tallest chip and publishes both on the interaction. Nothing in `qti-variables.css` assigns them.
A drop that is not measured therefore falls back, and that is how a card gets its flat floor without
a token of its own.

`--qti-dropzone-min-width` being read by **both** the drop and the chip (`@mixin drag`) is the load
bearing part. One shared name is what makes a chip and its slot the same size, with no rule relating
the two and no arithmetic. It also means "uniform chips" is not a feature with a switch — it is what
falls out of an interaction measuring at all.

### When a place needs a different value, declare it there

Not a token. `::part(drop)` already reaches every drop from the document — including a gap's, as
`qti-gap::part(drop)` — so a custom property in between adds a name without adding reach. The whole
of the card treatment is two declarations on the rule that wants them:

```css
/* qti-simple-associable-choice.styles.ts */
:host(:state(droppable)) [part~='drop'] {
  padding: 0.25rem;
  gap: 0.25rem;
}
```

Reserve a token for what a document selector genuinely **cannot** reach (CONTRACT.md §7). The two
that survive qualify: they are measurements only the interaction can take.

Six names were removed for failing that test.

| removed | now |
|---|---|
| `--qti-drop-min-height` | `--qti-dropzone-min-height`, with the card's `4rem` as its fallback |
| `--qti-drop-min-width` | `--qti-dropzone-min-width` |
| `--qti-match-target-min-width` | `--qti-dropzone-min-width`, fallback `150px` |
| `--qti-drag-min-width` | `--qti-dropzone-min-width` |
| `--qti-dropzone-padding` | gone — see §3 |
| `--qti-drop-gap` | gone — `0` is the flex initial value, so the declaration only existed to host a token |

`--qti-drop-min-width` is the cautionary tale: it meant *the grid-track floor* in order (`120px`) and
*a drop's own min-width* in the match target (`0`). One name, two unrelated jobs, and a theme setting
it hit both.

---

## 3. A slot has no inset

`dropRegion` makes `[part~='drop']` **content-box** — the one deliberate opt-out from the border-box
reset. `--qti-dropzone-min-*` is the chip's *border*-box and has to be the drop's *content* area, so
the chip fits exactly, with nothing to spare and nothing squeezed. Under border-box the reservation
would come out of the chip's own room and the drop would grow the moment a chip landed — measured,
before that: order's drop was 64px empty and 66px full, for a 1px border.

**A slot therefore needs no padding, and gets none.** There was a 1px inset, to make the drop read as
a frame a hair outside the chip. It never painted, in either state: an empty slot has nothing inside
the inset to separate from, and a filled one hides its edge (§4) — verified on a filled gap, whose
drop reports `background-color: rgba(0,0,0,0)` and `border-width: 0px`. Two invisible pixels on every
axis, and a drop 2px larger than the thing it holds.

A **card** is the exception and declares `padding` itself (§2). If a slot ever needs one, declare it
on that drop's own rule too — do not put a default back into `dropRegion`, which is imported by five
components of which two render a `part="drop"` that is not a drop at all (tabular match's header
cells, graphic-associate's 16×16 endpoint markers). Any default there is a sweep.

---

## 4. A full slot has no edge

The dashed edge says *something goes here*. Once something does, it is a second frame drawn a pixel
outside the chip's own border — two nested outlines around one word. So a **slot** drops its edge
when filled; a **card** keeps it.

Colour only:

```css
&:state(filled) { --drop-border-color: transparent; }
```

`@mixin paint drop` binds border-width and border-color to separate slots, so switching the colour
keeps the box identical. `border-style: none` would collapse the width and move every word on the
line the instant a chip landed — the exact reflow `qti-gap.styles.ts` and the invariance spec exist
to prevent. This is also CONTRACT.md §2's rule for the `states` layer: a state must not change layout
metrics.

Order reaches its drop as `::part(filled)` because a `<div>` cannot carry a custom state; gap-match
and the rest use `:state(filled)` on the element. Same rule, two spellings, for the reason
`setDropFlag` documents.

---

## 5. The chip never resizes on landing

`drag-drop.invariance.spec.ts` asserts two things, per interaction:

- **"a chip is the same chip wherever it lives"** — bank, in flight, dropped.
- **"an empty drop is already the size of the chip it will hold"** — filling it does not resize it.

Both follow from §2 rather than being maintained by hand: the chip has its width in the bank already,
because chip and drop read the same measured token.

`width: 100%` on a placed chip produces the same still image and breaks both. It is what order used
to do, and why order was the single entry in `CHIP_BOX_KNOWN_BAD` — a 55px chip in the bank became
666px once dropped. If you are reaching for it, size the slot from the chip instead; that is what
`justify-self: start` plus the measured `min-width` on order's drop now does.

---

## 6. When it re-measures

`DropzoneAutoSizeMixin` measures on mount **and whenever a chip changes size**, via a `ResizeObserver`
over the chips.

The observer catches text reflow, image load and font swap in one mechanism; a `MutationObserver`
needs `characterData: true` and still misses the image. It writes only when the measured value
actually changed — without that guard, writing a size that changes layout re-triggers the observer
and the browser reports `ResizeObserver loop limit exceeded`.

It observes the **chips**, never the drops. A drop's size is downstream of a chip's, so observing
drops is observing the mixin's own output.

Where the measurements land is `dropzonePropertyTarget()`, the host by default. Custom properties
inherit down the flat tree, so any ancestor of the drops works — which is what lets the editor use
the same mixin: writing `style` on a ProseMirror-managed host is reverted by its mutation observer,
and the revert re-triggers the observer that wrote it, so there it returns a node inside the shadow
root instead.

---

## 7. Checklist for a change here

1. Are you adding a token? Try a selector setting one of the four first (§2).
2. Are you keying on `match-max`? It should almost certainly be the interaction (§1).
3. Are you setting `padding` or `min-*` inside `:state(…)`? That reflows on toggle — `qti/no-layout-in-transient-state` will tell you, and §4 shows the paint-only alternative.
4. Run `npx vitest run` — `drag-drop.invariance.spec.ts` is the guard for §5.
5. Run `VRT=1 npx vitest run --project vrt`. The Kennisnet corpus covers every drag-drop interaction; **`matrixvraag` (ITEM010) must not move** — it is tabular match, so nothing here should reach it, and if it moves a drop-side guard has failed.
