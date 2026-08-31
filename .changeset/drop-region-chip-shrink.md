---
'@qti-components/base': patch
'@citolab/qti-components': patch
---

Let a placed chip shrink to its drop, so it is the same box in the bank and in
the drop when the bank is narrower than the chip's label.

`dropRegion` gave every drop child `flex: 0 0 auto`, on the reading that a drop
must not resize a chip. `flex-shrink: 0` does not say that. It does not preserve
the chip's size — it preserves the chip's _unconstrained max-content_ size, and
those are the same number only while the bank is wide enough to hand the chip its
full width. Below that the bank chip shrinks and wraps, as any flex item does,
and the placed chip stays pinned at max-content.

Measured on an order interaction, bank vs placed: `209x36` / `209x36` at 480px,
but `204x55` / `209x36` at 440px and `154x55` / `209x36` at 340px — a placed chip
a fixed 209px wide, overflowing a drop that had reserved exactly the right 156px
for it. The drop and the measurement were right the whole time; only the chip
inside ignored them.

`flex: 0 1 auto` fixes it, and shrinking cannot undersize a chip: the floor is
`--qti-dropzone-min-*`, which _is_ the measured chip, applied to the drop's
content box. `flex-grow: 0` is what prevents the stretch-and-centre that block
exists to prevent, and it is unchanged.

Reached CI as a font difference — the same label measures ~227px under Linux
fonts and ~209px on macOS, which puts a 480px interaction on either side of the
boundary — so `drag-drop.invariance.spec.ts` gains a narrow-bank order fixture
that wraps at any plausible text metric, instead of leaving the assertion to the
font the suite happens to run under.
