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
8. qti-components.motion

Precedence rule: later layer wins at equal specificity. `interactions.brand` is empty in the theme
on purpose: it is where a brand's resting look goes (§11), and it must stay declared so that paint
lands under states and corrections, not above them. Above the theme there is only `qti-extended`
(`item.css`) and unlayered host CSS.

## 2. Ownership by layer

The layers are the theme's own ordering: a host never names one (§11). Tokens are declared in no
layer at all (`qti-variables.css` is one block); a custom property is an inherited computed value,
so every layer reads every token.

### qti-components.global

- Cross-interaction semantics only.
- Shared chip, placeholder, drag-highlight, return-anchor, and correction-badge rules.
- Must not contain interaction-specific geometry.

### qti-components.interactions.base

- Interaction-local baseline paint and structure.
- Neutral appearance only (no candidate-correction judgement colors).
- May define stable geometry needed for rendering.

### qti-components.interactions.states

- Interaction-local state paint for :state(...).
- Must express dynamic UI states (checked, dragging, placeholder, candidate-\*, etc.).
- Must not change layout metrics when toggling state.

### qti-components.interactions.corrections

- Answer-key and correction-view paint, including full-correct-response.
- Owns answer-blue treatment and answer check glyphs.
- Can override base/states paint where answer-key semantics require it.

### qti-components.reset

- The item's base rules inside `@scope (qti-item-body)`: box sizing, margins, the line height.
- Declares no tokens.

### qti-components.interactions.brand

- A brand sheet's resting look (a host's own brand CSS). Above base, below states, so a state still wins.
- Empty in the theme. Declares no tokens.

### qti-components.motion

- How a state change feels, for every interaction: transitions, the press, the chip's tilt
  arriving. One file, `qti-motion.css`, last in the theme.
- Only `transition-*`, `scale` and `rotate`: nothing that lays out.
- Every duration and the press scale derive from `--qti-motion` (`--qc-motion`; 0 under
  prefers-reduced-motion), so one value switches all of it off.

### qti-components.elements

- Non-interaction elements and prose (`prose.css`, rubric block, modal feedback).
- Declares no tokens.

## 3. Selector contract: parts and states

Every custom element in the workspace exposes its look through parts and states, under one
vocabulary. These rules are the test for a name; the tables are the vocabulary.

### Rules

1. **One name, one meaning.** A part or state name means the same thing on every element that has
   it, and nothing else has a second name for that meaning.
2. **A part is a role, and a noun.** It names what a shadow-internal box _is_ to a theme: `control`,
   `label`, `message`, `chip`, `drop`, `bank`, `button`. Shared roles keep the shared name; an
   element invents a name only for a role no other element has.
3. **A state is an adjective or participle, and a `:state()`.** It says what the element _is right
   now_: `checked`, `disabled`, `readonly`, `open`, `filled`, `full`, `lifted`, `used`. It lives on
   the element that has internals.
4. **A state on a part is a second token with the state's exact name.** `control checked`,
   `drop filled`, `point candidate-correct`. Never a suffix (`option-selected`) and never a part
   named after a state (`correct`).
5. **Verdicts have one word each**, used as state and as part token alike: `candidate-correct`,
   `candidate-incorrect`, `candidate-partial` for the candidate's answer; `answer-key` for the
   correct response shown next to it. The badge is the part `correction`, with the verdict as its
   second token.
6. **Every styled box in a shadow root has a part, and every part is public.** Templates carry no
   classes: the component's own stylesheet selects `[part~='rail']` and the theme selects
   `::part(rail)`, so one box has one name.
7. **Full words, kebab-case, no prefix.** No tag names as part names, no `qti-`, no `c-`/`r-`.
8. **Parts and states are the only public channel.** Attributes (`data-*`, `aria-*`) and classes are
   implementation; a theme rule reads a reflected attribute only where the element has no internals
   (a `<div part="drop">` takes the state's name as a part token instead). The mouse and keyboard
   paths set the same states on the same elements.
9. **A child element owns its parts.** `qti-simple-choice::part(control)` belongs to the choice, not
   the interaction; an interaction exports nothing (`::part()` does not chain). Export is only for
   a chip cloned into another element's shadow root, and then prefixed with the chip's role:
   `chip-control`, `chip-label`. Under their bare names they would collide with the target's own
   `control` and `label` in the same shadow root, and a rule meant for the card would reach the
   chip. The badge is the exception: `correction` and its verdict tokens are forwarded unchanged,
   so one bare `::part(correction candidate-correct)` reaches it wherever the chip lives.
10. **Every part and state is documented** with `@csspart` / `@cssstate` on the element that
    exposes it; a part's state tokens are listed on its `@csspart` line.

Rules of placement: a state rule belongs in `interactions.states` unless it is cross-interaction,
then in `global`; state paint never reflows (§7); do not chain `::part()` across shadow boundaries.

### Roles (parts)

| Part                                                                                | Meaning                                                                    | On                                                                                                             |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `control`                                                                           | the box a candidate activates (a choice box, a chip's handle)              | `qti-simple-choice`, `qti-hottext`, `qti-gap-text`, chips, match cells                                         |
| `control-mark`                                                                      | the tick or dot inside a control                                           | choice, hottext, match cells                                                                                   |
| `label`                                                                             | the text of a choice or chip                                               | choice, hottext, chips                                                                                         |
| `marker`                                                                            | a choice's letter or number                                                | `qti-simple-choice`                                                                                            |
| `message`                                                                           | the validation message                                                     | every interaction                                                                                              |
| `prompt`                                                                            | the prompt slot                                                            | `qti-choice-interaction`                                                                                       |
| `choices`                                                                           | the slot holding the choices                                               | `qti-choice-interaction` (was `slot`)                                                                          |
| `chip`                                                                              | an item you drag, in the bank or placed (+ `text` on a word chip)          | placed clones, order's chips (was `drag`, `drag-text`)                                                         |
| `chip-control`, `chip-label`                                                        | a placed chip's handle and text, forwarded out of the target's shadow root | `qti-gap`, `qti-associable-hotspot`, `qti-simple-associable-choice` (were `drag-control`, `drag-label`)        |
| `bank`                                                                              | where unplaced chips live                                                  | order, match, associate, gap-match, graphic-gap-match (was `drags`)                                            |
| `drops`                                                                             | the area holding the drop targets                                          | order, associate, gap-match, graphic-gap-match                                                                 |
| `drop`                                                                              | one drop target                                                            | order, associate, `qti-gap`, `qti-associable-hotspot`, `qti-simple-associable-choice`                          |
| `row`                                                                               | one associate pair                                                         | `qti-associate-interaction` (was `drop-row`)                                                                   |
| `container`                                                                         | order's outer box                                                          | `qti-order-interaction`                                                                                        |
| `image`                                                                             | the background image                                                       | `qti-graphic-gap-match-interaction`                                                                            |
| `object`                                                                            | the image to place, beside the stage (tokens `selected`, `used`)           | `qti-position-object-interaction`                                                                              |
| `point`                                                                             | a placed marker                                                            | select-point, graphic-associate, position-object (a placed copy)                                               |
| `line`                                                                              | an association line                                                        | `qti-graphic-associate-interaction`                                                                            |
| `input`, `textarea`                                                                 | the text field                                                             | text-entry, upload; extended-text                                                                              |
| `answer-key`                                                                        | the correct answer shown next to a text field                              | `qti-text-entry-interaction` (was `answer`)                                                                    |
| `trigger`, `value`, `menu`, `option`, `option-content`, `clear-icon`, `icon`        | the dropdown and its pieces                                                | `qti-inline-choice-interaction` (`icon` was `dropdown-icon`)                                                   |
| `slider`, `rail`, `ticks`, `bounds`, `knob`, `value`                                | the slider and its pieces                                                  | `qti-slider-interaction`                                                                                       |
| `grid`, `corner`, `columns`, `rows`, `column-header`, `row-header`, `cells`, `cell` | the tabular match grid                                                     | `qti-match-interaction` (were `cols-wrap`, `rows-wrap`, `c-header`, `r-header`, `checkbox-grid`, `input-cell`) |
| `button`                                                                            | the one box of a button-like control                                       | `qti-end-attempt-interaction`, every `test-*` control                                                          |
| `correction`                                                                        | the verdict badge                                                          | every corrected element                                                                                        |
| `feedback`                                                                          | the feedback box                                                           | `qti-feedback-inline`, `-block`, `qti-modal-feedback`                                                          |
| `rubrics`                                                                           | the rubric-block slot                                                      | `qti-item-body` (was `qti-rubric-blocks`)                                                                      |
| `select`, `label`, `form`, `key`, `value`, `count`                                  | test and correction UI pieces                                              | `test-view`, `item-correct-response-mode`, `test-scoring-buttons`, `test-print-state`                          |

### States

| State                                                           | Meaning                                                               | On                                                                              | Old name                                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `disabled`, `readonly`                                          | the interaction or choice is switched off / frozen                    | interaction hosts, choices                                                      |                                                                                                                            |
| `checked`                                                       | chosen                                                                | choices, hottext, hotspot choice, inline-choice host                            |                                                                                                                            |
| `radio`, `checkbox`                                             | which kind of choice                                                  | choices, hottext                                                                |                                                                                                                            |
| `open`                                                          | the menu is open                                                      | inline-choice                                                                   |                                                                                                                            |
| `chip`                                                          | can be dragged                                                        | bank chips                                                                      | `drag`                                                                                                                     |
| `drop`                                                          | can take a chip                                                       | custom-element targets                                                          | `droppable`                                                                                                                |
| `filled`                                                        | holds at least one chip                                               | drop targets                                                                    |                                                                                                                            |
| `full`                                                          | takes no more chips                                                   | drop targets                                                                    | attribute `disabled`                                                                                                       |
| `drag-active`                                                   | a drag is in progress (target: and could take it)                     | interaction host, drop targets; the bank only when the chip comes from a target | `dragzone-active`+`-enabled`; `active`+`enabled`                                                                           |
| `drag-over`                                                     | the dragged chip is over this target                                  | drop targets                                                                    | `hover`                                                                                                                    |
| `lifted`                                                        | this chip's clone is in flight; it shows as a hole                    | chips                                                                           | `dragging`                                                                                                                 |
| `used`                                                          | every copy of this chip is placed                                     | bank chips                                                                      | `placeholder`                                                                                                              |
| `return-target`                                                 | where a re-dragged placed chip goes back to                           | bank chips                                                                      | `return-anchor`                                                                                                            |
| `candidate-correct`, `candidate-incorrect`, `candidate-partial` | the candidate's verdict                                               | corrected elements; as tokens on `correction`, `point`, `control`               | `candidate-partially-correct`; tokens `correction-*`, `correct`, `incorrect`                                               |
| `answer-key`                                                    | this element is the correct response                                  | the answer-key clone, a choice in the key; as token on `line`, `knob`, `input`  | `correct-response`, attribute `answer-key`, class `.full-correct-response`; parts `correct-line`, `knob-correct`, `answer` |
| `answer-key-shown`                                              | this interaction shows its key inline, next to the candidate's answer | interaction host (internal mode)                                                | `show-correct-response`                                                                                                    |
| `idle`, `playing`, `paused`, `picking`                          | text-to-speech                                                        | `test-item-to-speech`                                                           |                                                                                                                            |

A `<div>` target cannot carry a state, so it takes the state's name as a part token
(`::part(drop drag-over)`); `setDropFlag` writes whichever the element can carry.

### Aliases

Every "old name" above is still set, next to the new one, for one major (`STATE_ALIASES` in
`qti-base`, and a second part token in templates). The theme reads only the new names. Hosts: see
`plans/host-migration/*`.

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
2. pnpm run test:vrt (the kennisnet stories, compared by `.storybook/vitest.vrt.setup.ts`)

Regression gate: **missing.** A story-specific assertion that the §4 outcomes (green and red
dropped-drag candidate tints, blue full-correct-response) still render used to live in
`.storybook/vitest.vrt.setup.ts`; it no longer does, so today only the pixel comparison guards
them. Restoring it is roadmap phase G5.

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

A theme is a small set of values. Everything else is worked out from them. The first group of
`qti-variables.css` reads the tier-1 inputs, one line each; every other token in that file is tier 2.
Tier 3 is never declared there.

The tier-1 tokens carry the public prefix `qc-` (qti-components), like the public `qc-` events: the
prefix says "this is what you style". `qti-` belongs to 1EdTech's vocabulary, and everything derived
keeps it. `cito-` is the prefix these had before; every input is read as `var(--qc-x, var(--cito-x,
<default>))` for one major, then the old name goes.

| Group   | Tier-1 tokens                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| Surface | `--qc-color-base-100`, `--qc-color-base-content`                                                                            |
| Brand   | `--qc-color-primary` / `-content`, `--qc-color-neutral` / `-content`, `--qc-color-chip` / `-content`                        |
| States  | `--qc-color-info` (answer key), `-success` (correct), `-warning` (partial), `-error` (incorrect)                            |
| Shape   | `--qc-radius-field`, `--qc-radius-selector`, `--qc-radius-box`, `--qc-border-width`                                         |
| Size    | `--qc-spacing`, `--qc-size-selector`, `--qc-size-field`                                                                     |
| Type    | `--qc-font-family` (reading text), `--qc-font-family-heading` (h1–h6; unset: the reading font), `--qc-line-height` (fields) |
| Feel    | `--qc-depth`, `--qc-motion`, `--qc-border-style`                                                                            |

Plus `color-scheme`, a CSS property rather than a token, which every `light-dark()` follows, and the
optional ones: `--qc-color-border` for a brand that wants every edge in its own colour (Kennisnet),
`--qc-color-chip-border` for a chip's edge, `--qc-icon-drag`, `--qc-size-drag-icon` (its width; the height is the line) and `--qc-color-drag-icon` for its
handle, `--qc-shadow-chip` for a chip at rest,
`--qc-color-order-placed` / `-content` / `-border` for an order interaction's placed chip when a brand
gives it its own look (Kennisnet inverts it), `--qc-icon-marker` and
`--qc-marker-anchor` for the select-point marker, and `--qc-color-focus` for the focus ring (default:
the brand's `--qc-color-primary` when it sets one, else a mid blue).

**The `qc-` names are inputs, never declared by the theme.** Each is read once, with its default as
the fallback, into a `qti-` name that every rule reads:

```css
--qti-color-primary: var(--qc-color-primary, var(--cito-color-primary, oklch(53.47% 0.1195 238.63)));
```

That is what lets a value set on a page reach every item: an undeclared custom property inherits
through every shadow boundary, while one the theme declared on `:host` would be reset to its default
in every shadow root that adopts the theme (an item's own root, `test-container`).

| Tier | What it is                                                                                                                                                                                                           | Who sets it                                                                       | Where it is declared                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Brand knobs.** The values a theme is made of: surface and text colours, the semantic colours, radii, sizes, the border width, depth, the spacing unit.                                                             | A brand or a host. Setting only these gives a complete theme.                     | `qti-variables.css`, first group: the only place in the theme that holds literals.                                                    |
| 2    | **Derived defaults.** Everything that follows from tier 1: tints, the border colour, the focus ring, selection, corrections, the paint contract's resting look (`--qti-component-*`), the rhythm composites.         | Nobody, normally. A host may re-value one when the derived value is wrong for it. | `qti-variables.css`, as `var()`, `calc()` or `color-mix(in oklab, …)` over tier 1.                                                    |
| 3    | **Handover variables.** A decision the theme makes and a component spends (§7): `--qti-choice-gap`, `--qti-control-display`, `--qti-choice-label-display`, `--qti-choice-align-items`, `--qti-chip-justify-content`. | The theme, on the element that needs it.                                          | Nowhere at the root. The theme sets it on a selector; the component reads it with a fallback that keeps it working without the theme. |

Not a tier: the paint contract's **role slots** (`--drag-*`, `--drop-*`, `--choice-*`, `--text-*`, …), and the `--button-*` slots a test control and a button-like interaction share (`--test-button-*` are their old names, read as fallbacks for one major). A slot is
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
  declares it, so tier 2 follows a `--qc-*` value on `:root`, on any shadow host (every item root
  re-derives), and on an element that carries `data-qti-theme`. Setting `--qc-*` on a plain light-DOM
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
  `--qc-color-primary` keeps its primary as the ring.
- **Rubric and feedback are told apart by shape, not colour,** so the difference holds in black and
  white, in print and for a colour-blind candidate. A rubric block is a document: light grey with a
  thick grey bar on its start side. Feedback is a reply: a light-grey bubble with large rounded
  corners, no border and a hard darker shadow just below it; inline feedback is the same as a pill,
  padded only at its sides so its line keeps its height. The theme does not paint a verdict on it: the
  element does not know whether the answer was right. Feedback is painted on its `feedback` part,
  which has a box only while the feedback shows. A speech-bubble tail was tried and left out: it needed
  positioning in the components and several pseudo-elements, too much for a default; a brand can add
  one on `::part(feedback)::before`.
- **The default page is light grey, its cards white.** A `.qti-well` is the surface colour; a brand
  that wants another paints `.qti-well` itself.
- **Interaction feel, as chosen for the default theme:**
  - The focus ring shows on `:focus`, so also after a mouse pick, except on a chip, where it waits
    for the release because a press may be the start of a drag. A text field rings on its host.
  - A choice selects on pointer press.
  - No grey hover or press washes.
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

## 11. Overriding the theme: the third-party contract

Three rules, and nothing else to learn. What a host may rely on across releases, and how each kind of
change is released, is `plans/host-api.md` → Styling → What we promise; a change to this section
changes that page in the same commit.

1. **Set the inputs.** `--qc-*` on `:root`, or on any element that carries `data-qti-theme`. That is
   the whole theme for most hosts (§8). `--cito-*` still works for one major.
2. **Override anything else on parts and states.** `qti-gap::part(chip) { … }`,
   `qti-simple-choice:state(checked)::part(control) { … }` (§3). The theme is entirely layered, so an
   unlayered host rule wins at any specificity; `@layer qti-extended` (declared last in `item.css`)
   is only for a host that wants its own ordering. One exception: a brand's _resting_ look that the
   theme's state and correction paint must still beat (a chip colour that `:state(used)` still turns
   into a hole) goes in `@layer qti-components.interactions.brand`, the one theme layer a host may
   name. `item-container.stories.ts` (`ItemWithKennisnetOverlay`) shows it. A host may also select
   QTI element names (`qti-assessment-item-ref`, `qti-item-body`, `qti-feedback-block`, an
   interaction's own box) and the QTI shared vocabulary classes an item carries: those names are
   1EdTech's, not ours.
3. **Put the CSS where the items render.** Items render inside the shadow root of `test-container`
   or `item-container`; a document stylesheet does not cross it, custom properties do. Both
   containers adopt the content of a `<template>` child into their shadow root, so a host's
   overrides go in `<test-container><template><style>…</style></template></test-container>`.

Not API: `--qti-*` (internal, may change in a minor), the theme's other layers, the mixins (compiled
away), and the default look itself: a changed default is a minor, named under "Look" in its
changeset. A value a host needs and cannot reach through tier 1, a part or a state becomes a new
`--qc-*` input (§8); a `--qti-*` name is never made public instead.
A `test-*` control paints itself from the tier and the `--button-*` slots and exposes
`::part(button)`; that split is deliberate, so a control works on a page that loads no theme.

## 12. See also

- **The theme editor** — Storybook `Implementation › Theming`
  (`apps/e2e/src/stories/theming/theme-editor.stories.ts`). The tier-1 inputs are its controls, and
  every interaction is on the page.
- **The presets** — `.storybook/themes.css` (Default, Light, Dark, Kennisnet, Cito),
  switched with `data-qti-theme` in `.storybook/preview.ts`. Each is a worked example of a brand made
  of tier-1 values only.
- **Host notes** — `plans/host-migration/README.md`, row "Tier-1 theme tokens".

- **`DROP-SIZING.md`** — the drop/drag sizing vocabulary: which four tokens exist, why a drop is
  either a slot or a card, why the inset is additive, and why a chip never resizes when it lands.
  It is the worked example of §7's "hand the decision over as a custom property" rule, and of
  preferring a deeper selector over a new token name.
