# QTI Theme Styling Contract

Status: active
Scope: packages/qti-theme/src/styles/qti-theme/\*\*

This document defines the required cascade, ownership, and verification rules for interaction styling.
Treat this as normative. If implementation and this document disagree, update one of them in the same change.

## 1. Layer contract

The theme must declare the layer stack in this exact order in
packages/qti-theme/src/styles/qti-theme/index.css:

1. qti-components.global
2. qti-components.interactions.base
3. qti-components.interactions.states
4. qti-components.interactions.corrections
5. qti-components.overrides

Precedence rule: later layer wins at equal specificity.

## 2. Ownership by layer

qti-variables.css groups its tokens into these same layers. The declaring layer records which kind
of rule owns a token; it does not scope readability — custom properties are inherited computed
values, so any layer can read a token declared in any other.

### qti-components.global

- Cross-interaction semantics only.
- Shared chip, placeholder, drag-highlight, return-anchor, and correction-badge rules.
- Must not contain interaction-specific geometry.
- Tokens: brand palette, rhythm/timing, surfaces and border, icon masks.

### qti-components.interactions.base

- Interaction-local baseline paint and structure.
- Neutral appearance only (no candidate-correction judgement colors).
- May define stable geometry needed for rendering.
- Tokens: form/dropzone/inline geometry, field and textarea radii.

### qti-components.interactions.states

- Interaction-local state paint for :state(...).
- Must express dynamic UI states (checked, dragging, placeholder, candidate-\*, etc.).
- Must not change layout metrics when toggling state.
- Tokens: selection, chip placeholder, drop-target highlight vocabulary.

### qti-components.interactions.corrections

- Answer-key and correction-view paint, including full-correct-response.
- Owns answer-blue treatment and answer check glyphs.
- Can override base/states paint where answer-key semantics require it.
- Tokens: correct / incorrect / partially-correct (plus -light variants), answer key.

### qti-components.overrides

- Optional downstream overrides (vendor or host-specific).
- Never used for fixing base contract violations.
- Declares no tokens; it exists for downstream consumers.

## 3. Selector contract

### States

- Use :state(...) for interaction semantics.
- State rules belong in interactions.states unless the state is explicitly cross-interaction, then in global.
- State styles should paint, not reflow.

### Parts

- Use ::part(...) for shadow-resident affordances and correction badges.
- Use stable part tokens (for example drag, drag-control, correction-\*).
- Do not rely on chained ::part() across multiple shadow boundaries.

### Drag/drop channels

- Light-DOM drags and floating clones are styled via state/attribute channels in global.
- Shadow-resident dropped drags are styled via ::part(drag).
- Both channels must remain visually equivalent for shared semantics.

## 4. Visual precedence contract

1. Base paint defines neutral interaction appearance.
2. State paint overrides base for live interaction semantics.
3. Corrections paint overrides base/state when showing the answer key.

Required outcomes:

- Candidate-correct dropped drags are green.
- Candidate-incorrect dropped drags are red.
- Placeholder/dragging sources render as placeholders, preserving footprint.
- Full-correct-response answers render blue.

## 5. Change rules

- Any new interaction stylesheet must use explicit qti-components.interactions.\* layers.
- Do not add new interaction-specific rules to qti-states.css unless they are truly cross-interaction.
- If a rule moves layers, include a short note in the PR describing why its ownership changed.

## 6. Verification contract

Run at minimum:

1. pnpm run build
2. VRT=1 pnpm vitest run --project vrt --reporter=dot

Regression gate:

- .storybook/vitest.vrt.setup.ts contains a story-specific assertion for
  qti-corrections-qti-corrections-kennisnet-all-items--sleepvraag-opties-boven.
- That assertion must continue to detect both green and red dropped-drag candidate tints.

If this contract changes, update this file and the VRT guard in the same PR.

## 7. Property contract — the theme does not do layout

The theme is **spacing, sizing and paint**. Where a box goes, and whether it is in flow at all,
belongs to the `.styles.ts` beside the component that owns the box.

| Class            | Properties                                                                                                                                                                                  | Theme |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Paint            | `color`, `background*`, `box-shadow`, `outline*`, `opacity`, `mask*`, `cursor`, `transition`, `visibility`, `font-*`, `text-*`, `transform` / `rotate`                                          | yes   |
| Border           | `border*`, `border-radius`                                                                                                                                                                    | yes   |
| Spacing          | `margin*`, `padding*`, `gap`                                                                                                                                                                  | yes   |
| Sizing           | `width`, `height`, `min-*`, `max-*`, `box-sizing`                                                                                                                                             | yes   |
| Layout           | `display`, `position`, `inset` / `top` / `right` / `bottom` / `left`, `float`, `clear`, `flex*`, `grid*`, `justify-*`, `align-*`, `place-*`, `order`, `overflow*`, `vertical-align`, `z-index`, `white-space`, `columns`, `aspect-ratio` | no    |

Enforced by `qti/no-layout-in-theme` (`tools/stylelint/no-layout-in-theme.mjs`), scoped to this
directory. Note that it and `qti/no-layout-in-transient-state` disagree on purpose: inside a
transient state `padding` and `width` *are* layout, because toggling them reflows the page, while in
the theme they are exactly what belongs.

### Two exceptions

1. **Borders**, as above. A border has width, but it is paint that happens to occupy space, and a
   substrate cannot express itself without it.

2. **Theme-authored pseudo-elements.** A `::before` / `::after` the theme itself creates may place
   its own box, because there is no component to delegate to — the theme invented the element. The
   sharpest case is `[data-drag-clone]::before`: the drag handle on a div the drag-drop JS builds at
   pointer-down and appends to `document.body`, where no shadow root exists at all. The licence
   covers the generated box and nothing else.

### Reaching what a shadow root cannot select

Some elements are light-DOM grandchildren of a slotted node — a `qti-simple-associable-choice` inside
a `qti-simple-match-set`, say. No selector in the interaction's shadow root reaches them, because
`::slotted()` takes no descendants, and the element cannot tell which arrangement it is in.

Hand the decision over as a custom property and spend it in the component:

```css
/* theme */
qti-match-interaction.qti-match-tabular qti-simple-match-set {
  --qti-choice-align-items: center;
}
```

```ts
/* qti-simple-associable-choice.styles.ts */
:host { align-items: var(--qti-choice-align-items, normal); }
```

The theme still decides; the box model stays with the component. The same pattern carries
`--qti-choice-label-display`, `--qti-control-display`, `--qti-chip-justify-content` and
`--qti-match-target-min-width`.

### Hiding

`display: none` is layout — it removes a box from flow. An interaction hides its own parts:

- the answer key's chip bank, on `:host([answer-key])`. The attribute is set on the clone by
  `CorrectResponseMixin`; the theme cannot see it, because `.full-correct-response` is on the wrapper
  *around* the interaction and only a document selector reaches that.
- the native radio/checkbox under `.qti-input-control-hidden`, via `--qti-control-display`.

---

## 8. See also

- **`DROP-SIZING.md`** — the drop/drag sizing vocabulary: which four tokens exist, why a drop is
  either a slot or a card, why the inset is additive, and why a chip never resizes when it lands.
  It is the worked example of §7's "hand the decision over as a custom property" rule, and of
  preferring a deeper selector over a new token name.
