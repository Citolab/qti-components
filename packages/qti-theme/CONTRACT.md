# QTI Theme Styling Contract

Status: active
Scope: packages/qti-theme/src/styles/qti-theme/\*\*

This document defines the required cascade, ownership, and verification rules for interaction styling.
Treat this as normative. If implementation and this document disagree, update one of them in the same change.

## 1. Layer contract

The theme must declare the layer stack in this exact order in
packages/qti-theme/src/styles/qti-theme/index.css:

1. qti-components.reset
2. qti-components.global
3. qti-components.interactions.base
4. qti-components.interactions.brand
5. qti-components.interactions.states
6. qti-components.interactions.corrections
7. qti-components.elements
8. qti-components.overrides

Precedence rule: later layer wins at equal specificity. `interactions.brand` and `overrides` are
empty in the theme on purpose: they are where a brand sheet and a host write, and they must stay
declared so a brand's paint lands under states and corrections, not above them.

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

### qti-components.reset

- The item's base rules inside `@scope (qti-item-body)`: box sizing, margins, the line height.
- Declares no tokens.

### qti-components.interactions.brand

- A brand sheet's resting look (a host's own brand CSS). Above base, below states, so a state still wins.
- Empty in the theme. Declares no tokens.

### qti-components.elements

- Non-interaction elements and prose (`prose.css`, rubric block, modal feedback).
- Declares no tokens.

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

| Class   | Properties                                                                                                                                                                                                                               | Theme |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Paint   | `color`, `background*`, `box-shadow`, `outline*`, `opacity`, `mask*`, `cursor`, `transition`, `visibility`, `font-*`, `text-*`, `transform` / `rotate`                                                                                   | yes   |
| Border  | `border*`, `border-radius`                                                                                                                                                                                                               | yes   |
| Spacing | `margin*`, `padding*`, `gap`                                                                                                                                                                                                             | yes   |
| Sizing  | `width`, `height`, `min-*`, `max-*`, `box-sizing`                                                                                                                                                                                        | yes   |
| Layout  | `display`, `position`, `inset` / `top` / `right` / `bottom` / `left`, `float`, `clear`, `flex*`, `grid*`, `justify-*`, `align-*`, `place-*`, `order`, `overflow*`, `vertical-align`, `z-index`, `white-space`, `columns`, `aspect-ratio` | no    |

Enforced by `qti/no-layout-in-theme` (`tools/stylelint/no-layout-in-theme.mjs`), scoped to this
directory. Note that it and `qti/no-layout-in-transient-state` disagree on purpose: inside a
transient state `padding` and `width` _are_ layout, because toggling them reflows the page, while in
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
  _around_ the interaction and only a document selector reaches that.
- the native radio/checkbox under `.qti-input-control-hidden`, via `--qti-control-display`.

## 8. Token tiers

A theme is a small set of values. Everything else is worked out from them. In
`qti-variables.css` a line tagged `/* t1 */` reads a tier-1 input; every other token declared there
is tier 2. Tier 3 is never declared there.

The tier-1 tokens made for this set carry the public prefix `cito-`, like the public `cito-` events:
the prefix says "this is what you style". `qti-` belongs to 1EdTech's vocabulary, and everything
derived keeps it. Older tier-1 names (`--qti-spacing`, `--qti-motion`, `--qti-field-line-height`,
`--qti-fg`) keep their names.

| Group   | Tier-1 tokens                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| Surface | `--cito-color-base-100`, `--cito-color-base-content`                                                       |
| Brand   | `--cito-color-primary` / `-content`, `--cito-color-neutral` / `-content`, `--cito-color-chip` / `-content` |
| States  | `--cito-color-info` (answer key), `-success` (correct), `-warning` (partial), `-error` (incorrect)         |
| Shape   | `--cito-radius-field`, `--cito-radius-selector`, `--cito-radius-box`, `--cito-border-width`                |
| Size    | `--qti-spacing`, `--cito-size-selector`, `--cito-size-field`                                               |
| Type    | `--cito-font-family`                                                                                       |
| Feel    | `--cito-depth`, `--qti-motion`                                                                             |

Plus `color-scheme`, a CSS property rather than a token, which every `light-dark()` follows, and the
optional ones: `--cito-color-border` for a brand that wants every edge in its own colour (Kennisnet),
`--cito-color-chip-border` for a chip's edge, `--cito-icon-drag` and `--cito-color-drag-icon` for its
handle, `--cito-shadow-chip` for a chip at rest and `--cito-shadow-drag` for one in flight,
`--cito-color-order-placed` / `-content` / `-border` for an order interaction's placed chip when a brand
gives it its own look (Kennisnet inverts it), `--cito-color-well` for the fill of a `.qti-well` (white by
default), `--cito-color-marker`, `--cito-icon-marker` and
`--cito-marker-anchor` for the select-point marker, and `--cito-color-focus` for the focus ring (default:
the brand's `--cito-color-primary` when it sets one, else a mid blue).

**The `cito-` names are inputs, never declared by the theme.** Each is read once, with its default as
the fallback, into a `qti-` name that every rule reads:

```css
--qti-color-primary: var(--cito-color-primary, oklch(53.47% 0.1195 238.63));
```

That is what lets a value set on a page reach every item: an undeclared custom property inherits
through every shadow boundary, while one the theme declared on `:host` would be reset to its default
in every shadow root that adopts the theme (an item's own root, `test-container`).

| Tier | What it is                                                                                                                                                                                                           | Who sets it                                                                       | Where it is declared                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Brand knobs.** The values a theme is made of: surface and text colours, the semantic colours, radii, sizes, the border width, depth, the spacing unit.                                                             | A brand or a host. Setting only these gives a complete theme.                     | `qti-variables.css`, the only place in the theme that holds literals.                                                                 |
| 2    | **Derived defaults.** Everything that follows from tier 1: tints, the border colour, the focus ring, selection, corrections, the paint contract's resting look (`--qti-component-*`), the rhythm composites.         | Nobody, normally. A host may re-value one when the derived value is wrong for it. | `qti-variables.css`, as `var()`, `calc()` or `color-mix(in oklab, …)` over tier 1.                                                    |
| 3    | **Handover variables.** A decision the theme makes and a component spends (§7): `--qti-choice-gap`, `--qti-control-display`, `--qti-choice-label-display`, `--qti-choice-align-items`, `--qti-chip-justify-content`. | The theme, on the element that needs it.                                          | Nowhere at the root. The theme sets it on a selector; the component reads it with a fallback that keeps it working without the theme. |

Not a tier: the paint contract's **role slots** (`--drag-*`, `--button-*`, `--text-*`, …). A slot is
declared nowhere and read only with a tier-2 fallback (see `@mixin paint`). States and brands switch
slots; they never re-value a tier-2 token to repaint one role.

### Rules

- **Literals live in tier 1 only.** A tier-2 value is a reference, a `calc()` or a
  `color-mix(in oklab, …)` over tier 1. Exceptions, each a literal on purpose: hairlines in `px`
  (focus width, ring widths), durations, z-indices, the icon masks, the unitless ratios inside a
  derivation (a mix percentage, `* 0.625`), and the few colours that must NOT follow the theme
  because they are drawn over an author's image: the selections pair (`--qti-selections-*`) and the
  hotspot halo.
- **Colours are written in `oklch()` and mixed in `oklab`.** A gray uses `none` as its hue. A mix
  goes through `oklab` because mixing in `oklch` interpolates the hue: a warm base (hue 90) and a
  cool content colour (hue 260) came out as a GREEN border (hue 166). `oklab` mixes straight across,
  so a tint of two colours stays between them.
- **Light and dark are one set of tokens.** A tier-1 colour is `light-dark(<light>, <dark>)`. The
  theme sets no `color-scheme`: the page decides. A host that declares `color-scheme: dark` (or
  `light dark`) on the item's container gets the dark values; one that declares nothing stays light.
  A dark theme is made by switching `color-scheme`, never by redefining the tokens.
- **Set tier 1 anywhere; tier 2 follows where it is declared.** Every token block is declared on
  `:root, :host, [data-qti-theme]`. A custom property's `var()` resolves on the element that
  declares it, so tier 2 follows a `--cito-*` value on `:root`, on any shadow host (every item root
  re-derives), and on an element that carries `data-qti-theme`. Setting `--cito-*` on a plain light-DOM
  wrapper changes nothing below it until that wrapper also carries `data-qti-theme`. Because the
  inputs inherit, such a subtree keeps what its ancestors set and changes only what it states.
- **Old names are aliases.** A token that was public before the tier set existed stays, as a tier-2
  alias of its tier-1 name (`--qti-primary: var(--qti-color-primary)`). Components and rules keep
  reading the old name, so a brand that sets the old name still wins. A new rule reads the tier-1
  name when it has no older one.
- **Interaction rules read tier 2 and 3.** A rule that needs a value no token offers gets a named
  tier-2 token, not a `calc()` at the call site (see the rhythm contract in `qti-variables.css`).

## 9. Decisions behind the token set

§8 says what the rules are. This records why, and what was tried and rejected, so the same ground is
not walked twice.

- **Shaped like a daisyUI theme.** A surface, its text colour, a few brand colours with their
  `-content` partners, the four verdict colours, three radii, two sizes, a border width and a depth.
  Everything else is derived, so a brand is a handful of values.
- **The default is black and white.** Only the four verdict colours and the focus ring keep a hue; a
  brand adds its own. The ring is a mid blue that keeps 3:1 against both surfaces (WCAG 1.4.11): the
  answer key's blue was ruled out, since a ring in it reads as a correction, and a brand that sets
  `--cito-color-primary` keeps its primary as the ring.
- **Rubric and feedback are told apart by shape, not colour,** so the difference holds in black and
  white, in print and for a colour-blind candidate. A rubric block is a document: light grey with a
  thick grey bar on its start side. Feedback is a reply: a light-grey bubble with large rounded
  corners, no border and a hard darker shadow just below it; inline feedback is the same as a pill,
  padded only at its sides so its line keeps its height. The theme does not paint a verdict on it: the
  element does not know whether the answer was right. Feedback is painted on its `feedback` part,
  which has a box only while the feedback shows. A speech-bubble tail was tried and left out: it needed
  positioning in the components and several pseudo-elements, too much for a default; a brand can add
  one on `::part(feedback)::before`.
- **The default page is light grey, its cards white.** A `.qti-well` defaults to the surface colour
  (`--cito-color-well` sets another).
- **Interaction feel, as chosen for the default theme:**
  - The focus ring shows on `:focus`, so also after a mouse pick, except on a chip, where it waits
    for the release because a press may be the start of a drag. A text field rings on its host.
  - A choice selects on pointer press.
  - No grey hover or press washes.
  - Borders distract on a tinted page, which is what the Soft preset shows.
- **Rejected, and why:**
  - _Declaring the `cito-` inputs on `:root, :host`._ The presets then never reached an item: every
    shadow root that adopts the theme reset them to the default. Hence "inputs are never declared".
  - _Mixing in `oklch`._ Two tinted colours drifted to a third hue (§8).
  - _A theming story per interaction._ One editor page that shows every interaction under the
    tier-1 controls replaced them.
  - _`delegatesFocus`._ The host holds focus; the corrections' inner `tabindex` then made Tab stop
    twice.
  - _Opacity for disabled._ It faded the answer the candidate chose. A derived disabled colour is
    used instead.

## 10. Silent failures

Each of these fails with no error and no effect, and most pass lint and tests. Check them in a
browser.

- **No pseudo-class or `:state()` after `::part()` inside a nested selector.** postcss-nesting turns
  `&::part(drag) { &:hover {…} }` into `:is(…::part(drag)):hover`; a pseudo-element cannot sit inside
  `:is()`, so the rule never matches. It left hover, focus and press dead on every placed chip. Write
  the selector flat: `qti-gap-match-interaction qti-gap::part(drag):focus`.
- **`::part(x):state(y)` gets no `[data-state]` fallback.** It only works where `:state()` works, and
  a browser without `:state()` (Chrome 120) drops the whole selector list, so the build splits a mixed
  list into two rules. See the header of `tools/postcss/custom-state-fallback.mjs`;
  `tools/testing/legacy` covers old browsers.
- **The QTI 3 shared CSS reads hooks it does not define** (`--well-bg`, `--well-border`,
  `--well-box-shadow`, `--table-border-color`, `--foreground`). A `border` that names an undefined
  variable is dropped whole, so `.qti-bordered` drew nothing until the theme filled them. Before
  trusting a vocabulary class, check that its hooks have values.
- **Fractional control sizes look off-centre.** A 19.2px radio put its dot at a fractional offset:
  centred when measured, lopsided when antialiased. Control sizes round to 2px.
- **Layout properties are rejected in the theme** (§7), including ones that look harmless, such as
  `flex-shrink`. They go into the component's `*.styles.ts`.

---

## 11. See also

- **The theme editor** — Storybook `Implementation › Theming`
  (`apps/e2e/src/stories/theming/theme-editor.stories.ts`). The tier-1 inputs are its controls, and
  every interaction is on the page.
- **The presets** — `.storybook/themes.css` (Default, Light, Dark, Kennisnet, Cito, Playful, Soft),
  switched with `data-qti-theme` in `.storybook/preview.ts`. Each is a worked example of a brand made
  of tier-1 values only.
- **Host notes** — `plans/host-migration/README.md`, row "Tier-1 theme tokens".

- **`DROP-SIZING.md`** — the drop/drag sizing vocabulary: which four tokens exist, why a drop is
  either a slot or a card, why the inset is additive, and why a chip never resizes when it lands.
  It is the worked example of §7's "hand the decision over as a custom property" rule, and of
  preferring a deeper selector over a new token name.
