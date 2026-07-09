# QTI Components — CSS Contract Audit

**Status:** investigation complete, no code changed.
**Goal:** make element names, custom states, and shadow parts the stable, consistent
styling contract across all interactions, so `qti-minimal`, `qti-cito`, and
`qti-kennisnet` can each stand alone as a complete theme.

**Out of scope:** `styles/qti-native/qti3p0.css` (+ `qti3p0-override-layout.css`).
That is the QTI 3.0 shared vocabulary stylesheet, not vendor theming.

---

## 1. What exists today

### 1.1 The four layers

| # | Layer | Location | LOC | Intent | Reality |
|---|-------|----------|-----|--------|---------|
| 0 | Spec vocabulary | `styles/qti-native/` | 1549 | QTI 3.0 shared CSS classes | out of scope |
| 1 | Shadow / structural | `packages/interactions/**/*.styles.ts` (33 files) | 957 | mandatory layout + function | leaks presentation |
| 2 | Light-DOM presentational | `styles/qti-theme/` (22 files) | 1565 | pure presentation, keyed on parts + states | is the unnamed Cito theme |
| 3 | Vendor override | `styles/overrides/kennisnet/` (17 files) | 1223 | vendor look | is a *patch*, not a theme |

Plus `styles/qti-minimal/index.css` (63 LOC), a token-only sheet.

### 1.2 How the substrates actually compose

From `.storybook/extensions/style-substrate.ts`. Note `item.css` imports **both**
`qti-native` and `qti-theme`:

```
vanilla   = native.css + minimal.css
citolab   = item.css (native + qti-theme) + normalize CDN
kennisnet = item.css (native + qti-theme) + kennisnet-override.scss
            └─ which itself pulls Bootstrap CDN + Wikiwijs bridge + FontAwesome CDN
```

**Consequences:**

- There is no Cito theme. `qti-theme` *is* the Cito theme, unnamed, carrying Cito's
  palette (`--qti-bg-active: #ffecec`, `--qti-border-active: #f86d70` in `qti-base.css`).
  It therefore cannot also serve as the neutral default.
- Kennisnet is not a theme. It is a diff applied over Cito's theme. This is the direct
  cause of its 23 `!important` declarations.
- `qti-minimal` is token-only. It defines no component rules beyond a handful for
  `qti-simple-choice`, so it cannot stand alone either.

---

## 2. The state contract

### 2.1 Source of truth

Every `internals.states.add()` call site in `packages/**/src` (excluding specs/stories):

| State | Added at | Convention |
|---|---|---|
| `--checked` | `choices.mixin.ts:314`, `qti-inline-choice-interaction.ts:441` | dashed |
| `--dragzone-active` | `drag-drop-interaction-mixin.ts:264,274,972`, `drag-drop-core.mixin.ts:777` | dashed |
| `--dragzone-enabled` | `drag-drop-interaction-mixin.ts:374,972`, `drag-drop-core.mixin.ts:777` | dashed |
| `radio` / `checkbox` | `choices.mixin.ts:283` — dynamic, `states.add(role)` | bare |
| `candidate-correct` | `interaction.ts:304`, `choices.mixin.ts:138`, `order:136`, `match:276`, `gap-match:123` | bare |
| `candidate-incorrect` | `interaction.ts:310`, and the same four sites | bare |
| `candidate-partially-correct` | `interaction.ts:307` | bare |
| `correct-response` | `choices.mixin.ts:101` | bare |
| `incorrect-response` | `choices.mixin.ts:103` | bare |
| `show-correct-response` | `interaction.ts:289` | bare |
| `disabled` | `active-element.mixin.ts:74,107` | bare |
| `readonly` | `active-element.mixin.ts:87,112` | bare |

Two conventions coexist. The dashed form is legacy `CustomStateSet` syntax, from when
the spec required a `<dashed-ident>`. Bare idents are current.

**The dashed convention has a generator:** `qti-utilities/src/decorators/prop-internal-state.ts:33`
does `states.add(\`--${stateName}\`)`, hard-coding the prefix. It is currently
**exported but used by nothing** (only its own file and `decorators/index.ts` reference it).
It must be deleted or fixed, or it will silently reintroduce dashed states.

### 2.2 Target naming

Rename dashed → bare. Final vocabulary (12 states):

```
checked  radio  checkbox  disabled  readonly
dragzone-enabled  dragzone-active
candidate-correct  candidate-partially-correct  candidate-incorrect
correct-response  incorrect-response  show-correct-response
```

Blast radius for the rename: `--checked` has 2 `states.add` sites and is matched by
14 rules in `qti-theme`, 16 in `kennisnet`, 2 in `minimal`. The `--dragzone-*` pair has
5 call sites and 30 matching rules in `qti-theme`.

### 2.3 Dead state rules — delete

| File:line | Selector | Why dead |
|---|---|---|
| `qti-theme/interactions/qti-hotspot-interaction.css:16` | `:state(--readonly)` | TS adds bare `readonly` |
| `qti-theme/interactions/qti-hotspot-interaction.css:20` | `:state(--disabled)` | TS adds bare `disabled` |
| `qti-minimal/index.css:61` | `:state(radio):state(checked)` | TS adds dashed `--checked` |

### 2.4 States with no styling

**`incorrect-response`** (`choices.mixin.ts:103`) — ⛔ **deliberately left unstyled. Do not
add a ✗ for it.**

It is set on *every* choice outside the answer key, not just the ones the candidate picked, so
it cannot be painted unconditionally. The tempting fix — `:state(incorrect-response):state(checked)`,
"you selected this and it is wrong" — was tried and reverted, because that predicate is
**exactly `:state(candidate-incorrect)`**, which every theme already styles:

```ts
// choices.mixin.ts:134-140 — candidate-incorrect
if (!candidateResponseArray.includes(choice.identifier)) return;   // must be checked
if (correctResponseArray.includes(choice.identifier)) …            // else → candidate-incorrect
```

`incorrect-response ∧ checked` ≡ `candidate-incorrect`. Styling it produced a **second** ✗ on
Kennisnet, which already draws one via `::before` on `:state(candidate-incorrect)`
(`overrides/kennisnet/qti/hottext-interaction.scss:38`). Caught by ITEM012's VRT baseline.

What remains unique to `incorrect-response` is *unchecked* distractors while the key is shown —
i.e. it is `:not(:state(correct-response))` under `show-correct-response`, carrying no
information a theme needs. **Recommend removing the state** rather than finding a use for it.

**`show-correct-response`** (`interaction.ts:289`) — ✅ styled. Set on the interaction *host*.
It only reaches the host where the base implementation runs: `qti-extended-text-interaction` (no
override) and `qti-inline-choice-interaction` (the single override that calls `super`).
Everything using `ChoicesMixin` or the drag-drop mixins overrides the method without calling
`super` and marks individual choices instead. Verified by test; styled as a dashed
`--qti-correct` outline in the new shared `qti-theme/qti-states.css`.

`qti-states.css` is the home for states set by the base `Interaction` that mean the same
thing on every interaction. Per-interaction states stay in their own files.

**Lesson:** before styling a state, check whether an existing state already denotes the same
set. `correct-response`/`incorrect-response` (answer key) and
`candidate-correct`/`candidate-incorrect` (the candidate's own picks) overlap on the checked
choices.

### 2.5 The ARIA fallback selectors

`qti-theme` pairs most `:state(...)` selectors with an `[aria-*='true']` fallback.
Verified status:

- `[aria-disabled='true']` and `[aria-readonly='true']` — **currently LIVE.**
  `active-element.mixin.ts:49-63` declares both properties with `reflect: true` and
  `attribute: 'aria-disabled'` / `'aria-readonly'`, so they do reflect to the host.
- `[aria-checked='true']` — **DEAD.** No property anywhere binds the `aria-checked`
  attribute. Only `internals.ariaChecked` is set (`active-element.mixin.ts:104`,
  `choices.mixin.ts:315`, `qti-inline-choice-interaction.ts:435`), and ElementInternals
  ARIA properties populate the accessibility tree only — they never reflect to attributes.

12 dead `[aria-checked='true']` rules:

```
qti-theme/interactions/qti-choice-interaction.css:21,59
qti-theme/interactions/qti-hotspot-interaction.css:13,31,56
qti-theme/interactions/qti-order-interaction.css:84,102
qti-theme/interactions/qti-graphic-order-interaction.css:18
qti-theme/interactions/qti-graphic-associate-interaction.css:17,35
overrides/kennisnet/qti/choice-interaction.scss:65,101
```

### 2.6 DECIDED — stop reflecting `aria-disabled` / `aria-readonly`

**Target:** `disabled` and `readonly` propagate through ElementInternals only — the ARIA
property for the accessibility tree, the custom state for CSS. No attribute reflection.

```ts
// active-element.mixin.ts — keep `attribute:` (author markup is still valid input),
// drop `reflect: true` (we no longer write it back out).
@property({ type: Boolean, attribute: 'aria-disabled', converter: ariaBooleanConverter })
public disabled = false;
```

This makes `:state(disabled)` / `:state(readonly)` the single styling contract, and it
resolves the current inconsistency where `[aria-checked]` is internals-only while its two
siblings are reflected.

**Blast radius — three kinds, not one.** The CSS is the easy part.

**(a) 25 CSS selectors** must lose the attribute half. Most are already paired with a
`:state()` in the same selector list, so they simply drop out:

```
qti-theme/interactions/qti-hotspot-interaction.css:17,21,34,37,69,72
qti-theme/interactions/qti-choice-interaction.css:25,29,52,69,73
qti-theme/interactions/qti-order-interaction.css:87,90,105,108
qti-theme/interactions/qti-hottext-interaction.css:54,57,77,80
qti-theme/interactions/qti-graphic-associate-interaction.css:20,23,38,41
qti-theme/interactions/qti-graphic-order-interaction.css:21,24
```

One is **not** a simple deletion — `qti-choice-interaction.css:52` uses the attributes
inside a negation:

```css
/* before */ &:not([aria-disabled='true'], [aria-readonly='true'], :state(--checked)):hover
/* after  */ &:not(:state(disabled), :state(readonly), :state(checked)):hover
```

**(b) FOUR RUNTIME READS — this is a functional regression, not a styling one.**
`drag-drop-core.mixin.ts` lines **190, 271, 300, 342** each do:

```ts
const targetDisabled = target?.hasAttribute('disabled') || target?.getAttribute('aria-disabled') === 'true';
```

If the attribute stops reflecting, **drag-and-drop silently stops respecting disabled drop
targets.** These must be migrated to read the state or the property, e.g.
`target?.internals?.states?.has('disabled')`. Nothing in CSS will warn you about this.

Also `qti-inline-choice-interaction.ts:438-439` calls `removeAttribute('aria-disabled')` /
`removeAttribute('aria-readonly')`, which becomes a no-op and should set the property instead.

**(c) Author markup keeps working.** `qti-choice-interaction.a11y.stories.ts:124,207` write
`<qti-simple-choice aria-disabled="true">` in source HTML. Because `attribute:` is retained,
that still sets the property, which still sets the state. Input direction is unaffected —
only the write-back is removed. Note the side effect: an author-set attribute stays in the
DOM, so a stray `[aria-disabled='true']` rule would match author-disabled elements but not
programmatically-disabled ones. That inconsistency is the reason to delete those selectors
rather than keep them as a fallback.

**Accessibility check:** removing reflection does not degrade the accessibility tree —
`internals.ariaDisabled` already feeds it. The caveat is tooling: some older test harnesses
and browser extensions inspect attributes rather than the a11y tree. Worth a pass over the
a11y stories after the change.

**(d) `tabindex` is NOT in scope — it must keep reflecting.** A related in-flight change had
turned it into internal state:

```diff
-    @property({ type: Number, reflect: true, attribute: 'tabindex' })
+    @state()
     public override tabIndex = 0;
```

`@state()` shadows the native `HTMLElement.tabIndex` accessor, so the `tabindex` attribute
never reaches the DOM and the element stops being focusable. This silently broke keyboard
navigation in `qti-inline-choice-interaction` (focus resolved to `null` after ArrowDown).
`tabindex` is a native focusability attribute, not an ARIA state — the "no attribute
reflection" rule applies to `aria-disabled` / `aria-readonly` only. Restored, with a comment
in the mixin explaining the distinction.

---

## 3. The part contract

### 3.1 What each component exposes today

| Component | Parts declared |
|---|---|
| `qti-choice-interaction` | `prompt` `slot` `message` |
| `qti-simple-choice` | `ch` `cha` `slot` |
| `qti-simple-associable-choice` | `ch` `slot` `dropslot` + imperative `part="qti-simple-associable-choice"` |
| `qti-gap-text` | `ch` |
| `qti-hottext` | `ch` `cha` |
| `qti-hottext-interaction` | `message` |
| `qti-order-interaction` | `container` `drags` `drops` `drop-list` + imperative `part="qti-simple-choice"` |
| `qti-associate-interaction` | `associable-choices` `drop-container` `associables-container` `drop-list` `message` |
| `qti-gap-match-interaction` | `drags` `drops` `message` |
| `qti-graphic-gap-match-interaction` | `image` `drags` `message` |
| `qti-graphic-associate-interaction` | `line` `correct-line` `point` `message` |
| `qti-graphic-order-interaction` | `message` |
| `qti-match-interaction` | `grid` `corner` `cols-wrap` `c-header` `rows-wrap` `r-header` `checkbox-grid` `input-cell` `message` + dynamic `ch`/`cha` |
| `qti-inline-choice-interaction` | `trigger` `value` `menu` `option-content` `correct-option` `dropdown-icon` |
| `qti-text-entry-interaction` | `input` `correct` |
| `qti-extended-text-interaction` | `textarea` |
| `qti-slider-interaction` | `slider` `bounds` `ticks` `rail` `knob` `value` `knob-correct` |
| `qti-end-attempt-interaction` | `button` |
| drag-drop mixins | `drags` `dropslot` |

### 3.2 `::part(drag)` — styled but never declared

`qti-theme` styles `::part(drag)` in **7 rules**. No component declares `part="drag"`,
and there are zero `exportparts` attributes in the repo:

```
qti-theme/interactions/qti-order-interaction.css:13,30
qti-theme/interactions/qti-associate-interaction.css:16,32
qti-theme/interactions/qti-gap-match-interaction.css:29
qti-theme/interactions/qti-match-interaction.css:5
qti-theme/interactions/qti-graphic-gap-match-interaction.css:40
```

**These are NOT dead — do not delete them.** The comments above each rule ("Editor fake-drag
projected into the interaction's drop-list shadow") document an integration contract with
QTI-Editor, which projects an element carrying `part="drag"` into the shadow root. The
comments ship in `packages/qti-components/cdn/index.js`, confirming this is public surface.

The rules are inert *for our own components* only because none of them sets `part="drag"`.
Adding that part (§3.6) makes these rules live for runtime and editor alike — which is
exactly what they were written for. This is the highest-value gap in the audit — see §3.5.

### 3.3 Parts named after elements

```
qti-order-interaction.ts:174          el.setAttribute('part', 'qti-simple-choice')
qti-simple-associable-choice.ts:46    this.setAttribute('part', 'qti-simple-associable-choice')
```

A part names a *role*, not the tag. Both should become `drag`.

### 3.4 `qti-match-interaction` encodes state inside part names

`qti-match-interaction.ts:332-333`:

```ts
const chPart  = `ch ${typeBase} ${checkedMarker} ${correctVariant}`.trim();  // "ch rb rb-checked rb-correct"
const chaPart = `cha ${checkedMarker} ${correctVariant}`.trim();
```

which the themes then target as `::part(cha rb-checked rb-correct)`. Every other
interaction expresses the same three axes — control type, checked, correctness — with
`:state(radio)`, `:state(checked)`, `:state(candidate-correct)`. Match must be brought
onto the state mechanism.

### 3.5 No shared vocabulary — the cost, measured

**Drop targets have five names:** `drops`, `drop-list`, `drop-container`, `dropslot`,
`associables-container`.

**The correct-answer affordance has four names:** `correct` (text-entry),
`correct-option` (inline-choice), `correct-line` (graphic-associate),
`knob-correct` (slider).

**The draggable chip has no name at all.** Because there is no `part="drag"` and no
`:state(draggable)`, `kennisnet-override.scss` must enumerate every draggable element by
tag. This six-selector list is repeated **six times** in that one file:

```css
qti-order-interaction qti-simple-choice,
qti-gap-match-interaction qti-gap-text,
qti-match-interaction:not(.qti-match-tabular) qti-simple-match-set:first-of-type qti-simple-associable-choice,
qti-match-interaction:not(.qti-match-tabular) qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice,
qti-associate-interaction qti-simple-associable-choice,
[data-drag-clone]
```

A single `part="drag"` collapses all six repetitions to `::part(drag)`.

**Inconsistent presence:**

- `ch` + `cha` pair: present on `qti-simple-choice`, `qti-hottext`, `qti-match-interaction`.
  `qti-gap-text` has `ch` only. `qti-simple-associable-choice` has `ch` only.
- `message`: present on 8 interactions, absent from order, slider, select-point,
  extended-text, end-attempt.
- `prompt`: present on `qti-choice-interaction` only.

### 3.6 Proposed canonical part vocabulary

**Universal — every interaction:**

| Part | Meaning |
|---|---|
| `prompt` | the `qti-prompt` region |
| `slot` | default content slot |
| `message` | validation / feedback message |

**Choice controls — every choice-like element:**

| Part | Meaning |
|---|---|
| `ch` | the control box (radio circle / checkbox square) |
| `cha` | the control mark (inner dot / checkmark) |

**Drag & drop — every dnd interaction:**

| Part | Meaning |
|---|---|
| `drags` | source container |
| `drag` | an individual draggable chip |
| `drops` | target container |
| `drop` | an individual drop target (replaces `dropslot`, `drop-list`, `drop-container`) |

**Correct-answer display — every interaction that shows one:**

| Part | Meaning |
|---|---|
| `correct` | the correct-answer affordance, whatever its geometry |

---

## 4. The token contract has forked

Two vocabularies are live simultaneously:

| Concept | Composite (`qti-minimal`) | Longhand (`qti-base.css`, `kennisnet`) |
|---|---|---|
| border | `--qti-border` | `--qti-border-thickness` `-style` `-color` |
| padding | `--qti-padding` | `--qti-padding-vertical` `-horizontal` |
| gap | `--qti-gap` | `--qti-gap-size` |

The shadow DOM briefly consumed **both**: an in-flight experiment had
`qti-simple-choice.styles.ts` set `border: var(--qti-border)`, `padding: var(--qti-padding)`,
`gap: var(--qti-gap)`. None of the three is defined anywhere in the `item.css` chain, so all
three resolved to nothing under the `citolab` and `kennisnet` substrates. VRT proved it:
`gap: 10px` → `gap: var(--qti-gap)` collapsed the gap to `0`, shrinking ITEM001 by 64px
(4 choices × 16px) and ITEM002 by 96px (6 × 16px).

**Resolved for now by reverting `qti-simple-choice.styles.ts` and
`qti-choice-interaction.styles.ts` to their previous form.** The composite tokens stay
declared in `qti-minimal/index.css` as the *proposal*, with a comment saying they have no
consumer yet. The shadow DOM speaks longhand again.

Naïvely defining the composites in `qti-base.css` does **not** work: it makes the shadow
`border`/`padding` take effect *on top of* the `.check` rule that `qti-theme` already applies
from the light DOM, so the choices grow instead (ITEM001 816px vs the 662px baseline). Whoever
takes step 2 must move padding/border ownership to exactly one layer, not add it to both.

**Seven variables are read by `.styles.ts` and defined by no theme:**

```
--qti-inline-choice-trigger        --qti-drop-min-width
--qti-drop-list-border             --qti-drop-list-bg-img
--qti-background-color-active-droplist
--qti-correct-response             --qti-match-rows / --qti-match-cols
```

Some are set inline from TS (`--qti-match-rows`/`-cols` are, in 6 places). The rest need
a home.

**Action:** pick one vocabulary — composite reads better at the call site and is what the
newest file (`minimal.css`) chose — then define the complete set in one canonical
`tokens.css` that every theme is required to implement in full. That file is the theme
interface.

---

## 5. `@apply` is what blocks a forkable theme

`qti-theme` is not real CSS. It depends on `postcss-class-apply` (`postcss.config.mjs`)
for `@apply button`, `@apply drag`, `@apply act`, `@apply foc`, `@apply dis`, `@apply rdo`,
`@apply check`, and friends, all defined in `qti-base.css`.

Those utility classes **are the semantic layer you want** — `.drag`, `.drop`, `.button`,
`.act`, `.foc`, `.dis` name exactly the roles and states a vendor needs to restyle. But
`postcss-class-apply` inlines them at build time, so they never reach the output. A vendor
cannot see them, cannot override `.drag`, cannot extend them.

**That is precisely why Kennisnet re-declares everything longhand and needs 23 `!important`.**

Also: `.hov` has an empty body (`qti-base.css:~340`). Every `@apply hov` in the tree
compiles to nothing.

CSS nesting and `:where()` are baseline now. The utility layer can be plain CSS classes in
a real cascade layer, keeping the same names and losing the build-time dependency.

---

## 6. De-Bootstrapping Kennisnet is nearly free

Kennisnet consumes **26 distinct `--bs-*` tokens**. Its own bridge
(`kennisnet-override.scss` + `_variables_wikiwijs.scss`) already **defines all 26**.
Set-diffed: the Bootstrap CDN supplies zero tokens that survive the cascade. The token
dependency is already nil.

What the CDN still supplies is Bootstrap *classes*. Only two families are used:

- `.btn` — and `buttons.scss:119` already reimplements `.btn` from scratch under `:host`.
- `.my-2` — and `qti-styles.scss:43` already overrides it.

**Remaining real work to drop the CDN:**

1. Inline the four FontAwesome glyphs as data-URI masks. The pattern already exists —
   `.check-mask` in `qti-base.css` is exactly this. Glyphs needed: `check`, `xmark`,
   `minus`, `grip-vertical`.
2. Audit author HTML inside item bodies for Bootstrap classes. This is the only real risk,
   and it lives outside this repo.
3. Confirm `.btn` coverage: `buttons.scss` scopes its `.btn` under `:host`, so light-DOM
   `.btn` in the document head currently falls through to Bootstrap.

---

## 7. Consolidated dead-code list

| Kind | Count | Where | Status |
|---|---|---|---|
| `[aria-checked='true']` rules, attribute never set | 12 | qti-theme ×10, kennisnet ×2 | ✅ removed |
| `[aria-disabled]`/`[aria-readonly]` rules | 25 | 6 qti-theme files | ✅ replaced with `:state()` |
| `:state(--readonly)` / `:state(--disabled)` | 2 | `qti-hotspot-interaction.css:16,20` | ✅ fixed to bare |
| `:state(checked)` (bare, should be `--checked`) | 1 | `qti-minimal/index.css:61` | ✅ resolved by rename |
| Unused decorator that hard-codes `--` prefix | 1 | `prop-internal-state.ts` | ✅ deleted |
| Duplicate `--qti-incorrect` / `--qti-correct` block | 1 | `qti-minimal/index.css:19-23` | ✅ removed |
| `& drop-list { &[shape=…] }` block | 1 | `qti-order-interaction.css:75-112` | ✅ deleted — see below |
| `qti-associable-hotspot` aria rules | 6 | `qti-graphic-associate-interaction.css` | ✅ deleted — see below |
| State added but never styled | 1 | `show-correct-response` | ✅ styled (§2.4) |
| State that duplicates `candidate-incorrect` | 1 | `incorrect-response` | ⬜ recommend removing (§2.4) |
| `@apply hov` → empty rule body | all | `.hov` in `qti-base.css` | ⬜ open (step 3) |
| `::part(drag)` rules | 7 | order ×2, associate ×2, gap-match, match, graphic-gap-match | ⬜ **keep** — QTI-Editor contract (§3.2) |

Two deletions found during implementation, both dead twice over:

- **`qti-order-interaction.css` `& drop-list { &[shape='circle'|'square'] … }`.** `<drop-list>`
  lives in the *shadow* root, so a light-DOM descendant selector can't reach it; and it never
  carries a `shape` attribute. Copy-paste from graphic-associate.
- **`qti-graphic-associate-interaction.css` `qti-associable-hotspot[aria-*]`.** That element does
  not use `ActiveElementMixin`, has no `disabled`/`readonly`/`checked` properties, no
  ElementInternals, and nothing sets those attributes on it. The interaction has therefore
  never had disabled/readonly/checked styling. Giving `qti-associable-hotspot` the mixin is a
  real gap to close later; a comment now marks the spot.

---

## 8. Layer bleed

**Presentation leaking down into Layer 1 (`.styles.ts`), where it can't be themed:**

- `qti-slider-interaction.styles.ts:42,43,78,81` — raw Tailwind greys `#d1d5db`,
  `#e5e7eb`, `#f3f4f6`, `#6b7280`. No tokens at all.
- `qti-associate-interaction.styles.ts:26` — hardcoded `1px solid`.
- `qti-order-interaction.styles.ts:58-60` — hardcoded fallbacks `#0066cc` **plus**
  `!important` inside a shadow root.
- 9 `!important` declarations total across `.styles.ts`. Nothing inside a shadow root
  should need to fight the cascade.

**Structure leaking up into Layer 2 (`qti-theme`), where it isn't presentational:**

- `qti-choice-interaction.css:33-43` — `position: relative`, `padding-right: 30px`,
  `border: 3px solid ... !important`, and literal glyph content `\02714`.
  Structure and content, not tokens.
- 19 `!important` across `qti-theme`.

---

## 9. Recommended order

Each step unblocks the next. Doing the split first would fork today's inconsistencies into
three places and require fixing each three times.

1. **Normalize the contract.** — *states half done; parts still open*
   - ✅ Rename dashed states → bare (`--checked` → `checked`, `--dragzone-*` → `dragzone-*`).
   - ✅ Delete `prop-internal-state.ts` — it hard-codes the `--` prefix and has no users.
   - ✅ Stop reflecting `aria-disabled` / `aria-readonly` (§2.6), after migrating the four
     runtime reads in `drag-drop-core.mixin.ts` to a new `isDraggableDisabled()` helper in
     `drag-drop.utils.ts`. Keep `tabindex` reflecting (§2.6d).
   - ✅ Make `:state()` the sole styling contract: all `[aria-checked]` and
     `[aria-disabled]`/`[aria-readonly]` rules removed, negation at
     `qti-choice-interaction.css:52` rewritten to `:not(:state(disabled), :state(readonly),
     :state(checked))`.
   - ✅ Style the two live-but-unstyled states: `incorrect-response` (only when also
     `checked`) and `show-correct-response`, the latter in a new shared
     `qti-theme/qti-states.css` (§2.4).
   - ✅ Storybook default substrate switched to `citolab`; `kennisnet-all-items` VRT stories
     pin `parameters.styleSubstrate: 'kennisnet'`. Note: meta-level `globals` would *lock* the
     toolbar picker (Storybook ≥ 8.3), and `globalTypes.defaultValue` must stay unset or it
     outranks the parameter.
   - ⬜ Introduce `part="drag"` / `part="drop"` (this also activates the QTI-Editor rules in
     §3.2). Unify drop-target and correct-answer part names. Move `qti-match-interaction` off
     part-encoded state. Add `prompt` / `slot` / `message` everywhere.
   - ⬜ Give `qti-associable-hotspot` the `ActiveElementMixin` so it has real states (§7).
   - ⬜ *Ship a `CONTRACT.md` documenting the frozen surface.*
2. **Freeze one token vocabulary.** Choose composite. Write `tokens.css` as the theme
   interface. Give the seven orphan variables a home. Purge hardcoded colors from `.styles.ts`.
3. **Drop `@apply`.** Promote the utility classes to real CSS in a cascade layer. Delete
   `.hov` or give it a body.
4. **Split the themes.** `qti-minimal` (neutral, complete, no brand) · `qti-cito`
   (today's `qti-theme`, renamed, standalone) · `qti-kennisnet` (standalone sibling: inline
   the `--bs-*` bridge it already owns, inline the FA glyphs, drop both CDNs).

Steps 1 and 2 are what make step 4 mechanical rather than a rewrite.
