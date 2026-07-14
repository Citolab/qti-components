# QTI Interactions → Figma Design System — Reference Model & Build Plan

> Goal: a complete, accurate reference model of every QTI interaction element — its role, relations,
> visual footprint, inline/block behaviour, multi-function reuse, and its **states + parts** as they
> actually exist in this codebase — so a Figma design system can be built with a 1:1 mapping to the
> runtime paint contract.
>
> Sources: QTI 3.0 Implementation Guide §3.2 + Appendix B.1 (via `qti` MCP), and the repo
> (`packages/interactions/`, `packages/qti-theme/`). Both were read in full for this document.

---

## Part A — The Reference Model (Phase 0 discovery, consolidated)

### A1. Interaction inventory, where used, and relations

**Legend for "visual class":** `paint` = looks change only (color/border/icon, no reflow), `layout` = arranges
children in a box, `size` = has intrinsic measurable dimensions the design must specify. Most interactions are all three.

| # | Interaction element | Spec §3.2 | Model | Child / sub-part elements | Graphic? | Registered in repo |
|---|---|---|---|---|---|---|
| 1 | `qti-choice-interaction` | 3.2.2 | select 1..n | `qti-simple-choice`, `qti-prompt` | no | ✅ |
| 2 | `qti-order-interaction` | 3.2.10 | order (drag) | `qti-simple-choice`, `qti-prompt` | no | ✅ |
| 3 | `qti-associate-interaction` | 3.2.12 | drag-drop associate | `qti-simple-associable-choice`, `qti-prompt` | no | ✅ |
| 4 | `qti-match-interaction` | 3.2.9 | associate (grid or drag) | 2× `qti-simple-match-set` › `qti-simple-associable-choice` | no | ✅ |
| 5 | `qti-gap-match-interaction` | 3.2.5 | drag-into-gap | `qti-gap-text` / `qti-gap-img` (chips), `qti-gap` (slots) | no | ✅ |
| 6 | `qti-hottext-interaction` | 3.2.7 | select text spans | `qti-hottext` | no | ✅ |
| 7 | `qti-inline-choice-interaction` | 3.2.8 | select 1 (dropdown) | `qti-inline-choice`, `qti-label` | no | ✅ |
| 8 | `qti-text-entry-interaction` | 3.2.3 | type (short) | — | no | ✅ |
| 9 | `qti-extended-text-interaction` | 3.2.4 | type (long) | `qti-prompt` | no | ✅ |
| 10 | `qti-slider-interaction` | 3.2.18 | pick numeric | `qti-prompt` | no | ✅ |
| 11 | `qti-hotspot-interaction` | 3.2.6 | click image areas | `qti-hotspot-choice` + `img`/`picture` | **yes** | ✅ |
| 12 | `qti-select-point-interaction` | 3.2.17 | click point(s) | `img`/`picture` | **yes** | ✅ |
| 13 | `qti-graphic-order-interaction` | 3.2.11 | order hotspots | `qti-hotspot-choice` + image | **yes** | ✅ |
| 14 | `qti-graphic-associate-interaction` | 3.2.13 | connect hotspots (lines) | `qti-associable-hotspot` + image | **yes** | ✅ |
| 15 | `qti-graphic-gap-match-interaction` | 3.2.14 | drag chip onto hotspot | `qti-gap-text`/`qti-gap-img`, `qti-associable-hotspot` + image | **yes** | ✅ |
| 16 | `qti-position-object-interaction` | 3.2.16 | position marker | `img` inside `qti-position-object-stage` | **yes** | ✅ (+ stage element) |
| 17 | `qti-media-interaction` | 3.2.15 | play media | `audio`/`video` | no | ✅ |
| 18 | `qti-upload-interaction` | 3.2.19 | upload file | `qti-prompt` | no | ✅ |
| 19 | `qti-end-attempt-interaction` | 3.2.21 | button / end attempt | — (button) | no | ✅ |
| 20 | `qti-drawing-interaction` | 3.2.20 | draw on canvas | `img` canvas | **yes** | ⚠ spec-only (not found registered) |
| 21 | `qti-custom-interaction` | 3.2.22 | custom (deprecated) | custom | — | ✅ |
| 22 | `qti-portable-custom-interaction` | 3.2.23 | PCI (custom JS) | custom | — | ✅ (+ `-test` harness) |

**Reusable sub-part elements** (`packages/interactions/core/src/elements/`):
`qti-simple-choice`, `qti-simple-associable-choice`, `qti-hottext`, `qti-inline-choice`, `qti-gap`,
`qti-gap-text`, `qti-gap-img`, `qti-hotspot-choice`, `qti-associable-hotspot`, `qti-prompt`.

**Two "trap" names — NOT separate elements:**
- **`qti-match-tabular`** is not an element. It is `qti-match-interaction` **+ class `.qti-match-tabular`** (class-toggle → grid mode). Own stylesheet `qti-match-interaction-tabular.styles.ts` / theme `qti-match-interaction-tabular.css`.
- **`qti-simple-match-set`** is a light-DOM structural wrapper (used as a CSS selector); it is never `customElements.define`d — inert.

**The text↔graphic counterpart pairs** (same interaction model, different medium — model them as one Figma component family with a "graphic" boolean):
Match ↔ Gap-Match ↔ Graphic-Gap-Match · Order ↔ Graphic-Order · Associate ↔ Graphic-Associate · Hotspot ↔ Choice (select).

---

### A2. Which elements have visuals — size / layout / paint

| Element | size | layout | paint | Notes |
|---|:--:|:--:|:--:|---|
| `qti-choice-interaction` | ✓ | ✓ | ✓ | container lays out choice rows (orientation + stacking classes) |
| `qti-simple-choice` | ✓ | ✓ | ✓ | the atom: control + control-mark + label + marker |
| `qti-order-interaction` | ✓ | ✓ | ✓ | bank + ordered drop slots |
| `qti-associate-interaction` | ✓ | ✓ | ✓ | bank + drop-row grid |
| `qti-match-interaction` | ✓ | ✓ | ✓ | flex (drag) or grid (tabular) |
| `qti-gap-match-interaction` | ✓ | ✓ | ✓ | chip bank + prose with gaps |
| `qti-simple-associable-choice` | ✓ | — | ✓ | chip; also a drop target (`part="drop"`) |
| `qti-gap-text` / `qti-gap-img` | ✓ | — | ✓ | draggable chip |
| `qti-gap` | ✓ | ✓ | ✓ | drop slot inside prose (flex) — **layout-invariant box** |
| `qti-hottext` | ✓ | — | ✓ | inline selectable span |
| `qti-inline-choice-interaction` | ✓ | — | ✓ | trigger + menu + options |
| `qti-text-entry-interaction` | ✓ | — | ✓ | input field (width classes) |
| `qti-extended-text-interaction` | ✓ | ✓ | ✓ | textarea (height-lines + counter) |
| `qti-slider-interaction` | ✓ | ✓ | ✓ | rail + knob + ticks + value |
| `qti-hotspot-choice` / `qti-associable-hotspot` | ✓ | — | ✓ | positioned region over image |
| graphic-* interactions | ✓ | ✓ | ✓ | image backdrop + positioned overlays/lines |
| `qti-correction badge` (shared) | ✓ | — | ✓ | pure paint marker (correct/incorrect/partial) |
| `qti-prompt` | — | — | ✓ | text only; no box of its own |
| `qti-end-attempt-interaction` | ✓ | — | ✓ | button |
| `qti-media` / `qti-upload` / `custom` / `PCI` | ✓ | (platform) | ✓ | rendering largely delegated |

**Layout-invariance contract** (already established in this repo — see `plans/…` and memory):
drop slots and chips are **constant-size boxes**; states **paint**, they never reflow. Any Figma variant that
changes size on `filled`/`over`/`correct` violates the contract. Encode that as a rule, not a suggestion.

---

### A3. Inline vs block

**Inline (sits inside a run of prose / text flow):**
- `qti-hottext` — `inline-flex`
- `qti-gap-text` — `inline-flex`
- `qti-gap` — `flex` box embedded in prose (a block slot *within* a text line)
- `qti-inline-choice` / `qti-inline-choice-interaction` — `inline` / `inline-flex`
- `qti-text-entry-interaction` — `inline-block`
- `qti-end-attempt-interaction` — button, appears inline in examples
- `qti-hotspot-interaction`, `qti-position-object-stage`, graphic-gap chip region — host `inline-block`

**Block (own layout region, breaks the flow):**
- `qti-choice-interaction`, `qti-order-interaction`, `qti-associate-interaction`,
  `qti-match-interaction`, `qti-gap-match-interaction`, `qti-extended-text-interaction`,
  `qti-slider-interaction`, `qti-select-point-interaction`, all `qti-graphic-*`,
  `qti-position-object-interaction`, `qti-upload-interaction`, `qti-portable-custom-interaction`.

> Design implication: inline elements need a Figma **text-baseline-aligned** frame (fits in a sentence);
> block elements are top-level auto-layout frames.

---

### A4. Multi-function elements (one element, several roles)

| Element | Roles | How the role is expressed |
|---|---|---|
| `qti-simple-choice` | **selectable option** (in choice) **or** **draggable card** (in order) | custom state `:state(radio\|checkbox)` vs `:state(drag)`; derived from parent + `draggablesSelector` |
| `qti-simple-associable-choice` | **draggable chip** in one match-set **and** **drop target** in the other; also chip in associate | exposes both `part="label"`/drag grip **and** `part="drop"`; state `:state(drag)` + `:state(filled)` |
| `qti-match-interaction` | **drag-drop** panel **or** **tabular grid** (radio/checkbox matrix) | `.qti-match-tabular` class-toggle → different parts (`grid`, `input-cell`, token `control checked`) |
| `qti-gap-text` / `qti-gap-img` | **bank chip** or **placed-in-gap chip** | same element, cloned into gap; placed clone marked `::part(drag)` + `exportparts` |
| `qti-hotspot-choice` | **selectable region** (hotspot) or **orderable region** (graphic-order) | shared element across §3.2.6 and §3.2.11 |
| `qti-associable-hotspot` | **line endpoint** (graphic-associate) or **drop target** (graphic-gap-match) | `part="drop"` + `:state(filled)` |

> In Figma these become **one master component with a `role` variant property**, not duplicated components.
> This is the single most important structural decision for keeping the library small.

---

### A5. States & Parts contract (as it exists in the codebase)

This is the exact paint contract the theme uses — Figma variant properties should mirror it 1:1.

#### Parts (CSS Shadow Parts — the "slots" a designer styles)

**Shared choice/chip anatomy:**
`control` (radio/checkbox indicator or drag grip) · `control-mark` (inner dot/check) · `label` (content) ·
`marker` (enumeration a/b/c) · `drop` (inner drop region) · `correction` badge
(+ `correction-correct` / `correction-incorrect` / `correction-partially-correct`).

**Placed-chip forwarding** (`drag-drop-slotted.mixin.ts`): `exportparts` remaps a placed chip to
`drag-control`, `drag-label`, and forwards `correction*`; a placed clone is tagged bare `::part(drag)`.

**Per-interaction parts (key ones):**
- Choice: `prompt`, `slot`, `message`
- Order: `container`, `drags`, `drops`, `drop`, `drag` (+ flag tokens `active`/`enabled`/`filled`)
- Associate: `drags`, `drops`, `drop-row`, `drop`, `message` (+ `active`/`enabled`)
- Gap-match: `drags`, `drops`, `message`
- Match tabular: `grid`, `corner`, `cols-wrap`, `c-header`, `rows-wrap`, `r-header`, `checkbox-grid`, `input-cell` (+ in-cell `control`/`control-mark` tokens)
- Inline choice: `trigger`, `value`, `dropdown-icon`(`-open`), `menu`, `option`(`-prompt`/`-selected`), `option-content`, `correct-option`
- Slider: `slider`, `bounds`, `ticks`, `rail`, `knob`, `value`, `knob-correct`
- Text entry: `input`, `correct` · Extended text: `textarea` · End attempt: `button`
- Graphic associate: `line`, `correct-line`, `point`, `message` · Select-point: `point`

#### States (two representation mechanisms)

**A. Custom states** (`ElementInternals.states`, selected via `:state(...)`) — on real custom elements:
- Role: `radio`, `checkbox`, `drag`
- Availability: `disabled`, `readonly`
- Selection: `checked`, plus answer-key `correct-response` / `incorrect-response`
- Correction result: `candidate-correct`, `candidate-incorrect`, `candidate-partially-correct`
- Drag lifecycle: `dragging`, `placeholder`
- Drop slot: `filled`
- Host drag mode: `dragzone-active`, `dragzone-enabled`

**B. Part-token flags** (where the drop target is a plain `<div>` that can't carry `:state()`) —
tokens appended to the `part` list, reached as `::part(active)`, `::part(enabled)`, `::part(filled)`,
hover via drop token. Match-tabular cells encode the whole state vocab as part tokens
(`control checked`, `control-mark radio checked`, `control checked correct/incorrect`).

**C. Class toggles:** `.qti-match-tabular`, `.full-correct-response` (hides drag bank),
`.correct`/`.partiallyCorrect`/`.incorrect` (extended text), and the layout/skin classes
(`.qti-orientation-*`, `.qti-choices-stacking-*`, `.qti-choices-top|bottom|left|right`,
`.qti-input-width-*`, `.qti-labels-*`, `.qti-selections-light|dark`, `.qti-gap-placement`,
`.qti-input-control-hidden`).

> **The canonical state set to build as Figma variants** (applies to the choice/chip atom):
> `role` = radio | checkbox | drag ·
> `selected` = off | checked ·
> `availability` = enabled | disabled | readonly ·
> `correction` = none | correct | incorrect | partial ·
> `answer-key` = none | correct-response | incorrect-response ·
> (drop targets add) `fill` = empty | filled, `dropzone` = idle | active | enabled | hover.

#### Themes (paint skins — model as Figma modes/variables)
`packages/qti-theme/src/styles/`: base `qti-theme/`, `qti-minimal/`, `qti-native/`, and
`overrides/kennisnet/`. Same part/state selectors, different values → **Figma variable collections
with a mode per theme** (default / minimal / native / kennisnet).

---

## Part B — Can this become a Figma? (verdict)

**Yes — and cleanly, because the contract is already state+part based rather than ad-hoc CSS.**
Caveats and the honest boundary of what "I" can do:

1. **I cannot click inside Figma.** There is no Figma tool/MCP connected this session. What I *can*
   produce is everything that drives Figma:
   - a **W3C Design Tokens JSON** (`tokens.json`) with a mode per theme (default/minimal/native/kennisnet)
     — importable via Tokens Studio / Figma Variables import;
   - a **component + variant matrix spec** (every element, every variant property above) that either a
     designer builds, or a **Figma Plugin API script** generates programmatically (I can write that script);
   - **anatomy diagrams** (part maps) per element.
2. **The mapping is 1:1 and low-risk** because parts→layers and states→variant-properties already exist
   as named vocabulary in the code. No interpretation needed.
3. **The one thing to enforce in Figma:** the layout-invariance contract — chips and drop slots are
   fixed-size; states only repaint. Build atoms as fixed-size components with variant properties that
   never change dimensions.

Recommended path: **tokens JSON + a Figma plugin generator script**, so the library stays in sync with
the code contract instead of being hand-drawn and drifting.

---

## Part C — Phased build plan

### Phase 0 — Discovery ✅ (this document)
The reference model above is the Phase 0 output. No assumptions: interaction list from spec §3.2,
part/state names grepped from source. **Verification:** every part/state name here appears verbatim in
`packages/interactions/**` or `packages/qti-theme/**` (grep before building).

### Phase 1 — Token foundation
**Implement:** extract the paint values (color/space/radius/border/typography) from
`packages/qti-theme/src/styles/{qti-theme,qti-minimal,qti-native,overrides/kennisnet}` into a W3C
Design Tokens `tokens.json` with **one mode per theme**.
**Copy from:** the CSS custom properties actually declared in those files (do not invent token names).
**Verify:** token count per theme matches the distinct `--qti-*` / semantic vars in `item.css` + per-interaction files; round-trip a couple of values by eye against the compiled CSS.
**Anti-pattern guard:** do not create tokens for values that aren't themeable in code.

### Phase 2 — Atomic components (the reused parts)
Build these as fixed-size Figma components with variant properties from §A5:
1. **Choice atom** (`control`, `control-mark`, `label`, `marker`) — variants: role × selected × availability × correction × answer-key. Covers `qti-simple-choice` + hottext + tabular cell.
2. **Chip atom** (`control`/grip, `label`, `correction`) — variants: state=idle|drag|dragging|placeholder × correction. Covers `qti-gap-text`, `qti-simple-associable-choice` (drag face).
3. **Drop slot** (`drop`) — variants: fill=empty|filled × dropzone=idle|active|enabled|hover. Covers `qti-gap`, order/associate drops, `qti-associable-hotspot`.
4. **Correction badge** — correct|incorrect|partial (pure paint).
**Verify:** each atom's layers are named exactly after its `part` tokens; no variant changes the frame size (layout-invariance).

### Phase 3 — Interaction assemblies
Compose atoms into each interaction using its per-interaction parts (§A5) and layout classes (§A2/A3):
choice, order, associate, match (drag + `.qti-match-tabular` grid as a variant), gap-match, hottext,
inline-choice, text-entry, extended-text, slider, and the graphic family (image backdrop + overlay atoms).
Model text↔graphic counterparts (§A1) as **one family with a `graphic` boolean** where practical.
**Verify:** every interaction renders its `message`/`prompt` slot; inline interactions sit on a text baseline frame, block ones are top-level auto-layout.

### Phase 4 — Variant/state matrix + theme modes
Wire every component to the Phase-1 variable modes so switching mode = switching theme.
Produce the full state matrix page (the §A5 canonical state set) as a visual QA sheet.
**Verify:** flipping the mode changes only paint, never layout; the four themes all render.

### Phase 5 — Verification
- Grep-check: every Figma layer/variant name exists as a real `part`/`:state`/class token in the repo.
- Visual parity: spot-check 3–4 interactions against the running Storybook (`.storybook` VRT baselines
  in `apps/e2e/.../__screenshots__`) — especially kennisnet, which has the most overrides.
- Layout-invariance audit: confirm no state variant changes size on any atom.
- Optionally: write a Figma Plugin API generator so the library regenerates from `tokens.json` + the
  component spec, keeping it in sync with the code contract.

---

## Anti-patterns to avoid
- Treating `qti-match-tabular` or `qti-simple-match-set` as their own components (they aren't elements).
- Duplicating multi-function elements instead of using a `role` variant (§A4).
- Letting a state variant resize a chip/slot (violates the layout-invariance contract).
- Inventing part/state names — the vocabulary is closed; grep first.
- Assuming `qti-drawing-interaction` exists in the repo (spec-only; not registered here).
