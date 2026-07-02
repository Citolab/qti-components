# Pure-attribute correct-response coverage for every interaction

## Goal

Every QTI interaction that supports a correct-response should be **fully
controllable from markup**:

- `response="…"` — set a candidate response from an attribute.
- `correct-response="…"` — set the correct answer from an attribute (already
  exists on every interaction via `Interaction` base).
- `show-correct-response` / `show-full-correct-response` /
  `show-candidate-correction` — each toggles its visual mode dynamically
  (set or remove at runtime → visual changes immediately, no reload).

So a Storybook story can demonstrate every view mode of every interaction
**purely through HTML attributes**, with no `play()` step calling methods on
the web component and no `qti-assessment-item` / `configContext` provider.

## What's already done (DO NOT redo)

Already landed on the current branch — verify before changing, don't
re-implement:

- `CorrectResponseMixin` extracted from base into
  [packages/qti-base/src/mixins/correct-response.mixin.ts](packages/qti-base/src/mixins/correct-response.mixin.ts).
  Back-compat `Interaction = CorrectResponseMixin(LeanInteraction)`.
- `ChoicesMixin` split — per-choice CR display moved to
  [packages/interactions/core/src/mixins/choices/choice-correct-response.mixin.ts](packages/interactions/core/src/mixins/choices/choice-correct-response.mixin.ts)
  (`ChoiceCorrectResponseMixin`).
- `ChoicesMixin` gained a `response` attribute (lines 64–77) via the
  canonical codec, plus `firstUpdated` (lines 105–111) that applies initial
  response to choice DOM. So **choice / hottext / hotspot / graphic-order**
  via `ChoicesMixin` already have the `response` attribute working.
- `qti-choice-interaction.correctresponse.stories.ts` has the canonical
  `AllViewModesOverview` story (~line 444). This is the **template**.

## Out of scope (call out, don't do)

- Per-interaction CR-override extraction into mixin files (was Phase 3 of
  `plans/separate-correct-response.md`). Keep overrides inline on the class.
- Dual-registration entrypoints (`register.ts` + `register-with-correct-response.ts`).
- Stripping `correct-response` from interactions that "shouldn't" have it
  (`extended-text`, `upload`, `media`, `custom`, `end-attempt`,
  `position-object`). Leave them as-is.
- `LeanInteraction`-extending refactors.

**Allowed breaking surface: CSS only.** Visual states/classes/parts MAY
change. Behavior surface and TypeScript surface MUST stay back-compat.

---

## Phase 0 — Discovery (DONE)

Sources read (three Explore agents over the repo):

### Per-interaction state matrix

| Interaction | `response` declaration | Type | Attribute settable today? | Watcher on response? | firstUpdated applies response? | Override method name |
|---|---|---|---|---|---|---|
| `inline-choice` | getter/setter L219–227 | `string \| null` | ⚠️ via setter; no attribute | None | No | `toggleInternalCorrectResponse` (L229) ✅ |
| `text-entry` | `@state()` L24–25 | `string \| null` | No (no attribute) | Yes L29–35 | No | `toggleInternalCorrectResponse` (L107) ✅ |
| `order` | inherited (DragDrop) | `string[]` | No | No | partial L162 | `toggleInternalCorrectResponse` (L66) ✅, `toggleCandidateCorrection` (L102) |
| `match` | `@state() _response` L34 | `string \| string[]` | partial (getter/setter L36–43) | No | No | `toggleInternalCorrectResponse` (L180) ✅, `toggleCandidateCorrection` (L231) |
| `gap-match` | inherited (DragDrop) | `string[]` (pairs) | No | No | No | `toggleCorrectResponse` (L28) ❌, `toggleCandidateCorrection` (L93) |
| `slider` | getter/setter L32–41 | `string` (numeric) | No (private `#value`) | None | No | `toggleCorrectResponse` (L43) ❌ |
| `graphic-associate` | `@state() _response` L26–27 | `string[] \| null` | partial | No | partial L145 | `toggleInternalCorrectResponse` (L60) ✅ |
| `graphic-order` | inherited (`ChoicesMixin`) | `string \| string[]` | **YES** ✅ | Inherited | Inherited | `toggleCorrectResponse` (L66) ❌ |
| `select-point` | `@state()` L29 | `string[] \| null` | No | No | No | `toggleCorrectResponse` (L116) ❌, `toggleCandidateCorrection` (L99) |
| `portable-custom` | `@state()` L66 | opaque | partial (via `boundTo`) | No | No | None |
| `hottext` | inherited (`ChoicesMixin`) | `string \| string[]` | **YES** ✅ | Inherited | Inherited | None |
| `hotspot` | inherited (`ChoicesMixin`) | `string \| string[]` | **YES** ✅ | Inherited | Inherited | None |

### Storybook coverage

| Interaction | `*.correctresponse.stories.ts` | `AllViewModesOverview`? | Notes |
|---|---|---|---|
| `choice` | exists | ✅ | the template — copy this |
| `text-entry` | exists | ❌ | many stories tagged `[xfail]` |
| `inline-choice` | inline in main stories L698–931 | ❌ | missing `show-candidate-correction` |
| `order`, `match`, `gap-match`, `slider`, `graphic-associate`, `graphic-order`, `select-point`, `portable-custom`, `hottext`, `hotspot` | **none** | ❌ | needs new file + new story |

### The four wrong-name bugs

`gap-match`, `slider`, `select-point`, `graphic-order` override
`toggleCorrectResponse` (the public dispatcher) instead of
`toggleInternalCorrectResponse` (the watcher target). Result: their
correct-response visual NEVER fires when `show-correct-response` is set.
The four overrides as written today are dead code from the watcher's POV.

Renaming `toggleCorrectResponse` → `toggleInternalCorrectResponse` on each
of those four is a one-line fix per file. **Risk:** these renames cause
previously-dead visuals to start firing on `show-correct-response` — likely
a desirable behavior change, but worth visual smoke-testing per interaction.

### Allowed APIs (citations)

Copy these patterns — do not invent new ones.

#### A. The codec (use for identifier / identifier-array / pair / point shapes)

Source: [packages/qti-base/src/lib/correct-response.ts](packages/qti-base/src/lib/correct-response.ts).

```ts
// Parse comma-separated identifier(s) — trims, filters empties,
// collapses single-element arrays to a string.
parseCorrectResponseAttribute(raw: string | null | undefined): string | string[] | null

serializeCorrectResponseAttribute(value: string | string[] | null): string | null

// For directed-pair / point shapes — same comma codec, then per-value parse.
parsePair(value: string): { source: string; target: string }
serializePair(source: string, target: string): DirectedPair
parsePoint(value: string): { x: number; y: number }
serializePoint(x: number, y: number): Point
iterCorrectResponseValues(raw): Generator<string>
```

#### B. The `response` attribute pattern (copy verbatim)

Source: [packages/interactions/core/src/mixins/choices/choices.mixin.ts:64-77](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L64-L77).

```ts
@property({
  attribute: 'response',
  reflect: false,
  converter: {
    fromAttribute: (value: string | null) => parseCorrectResponseAttribute(value) ?? '',
    toAttribute: (value: string | string[] | null) =>
      value === '' ? null : serializeCorrectResponseAttribute(value)
  }
})
response: string | string[] | null = '';
```

**For numeric responses (slider):** use plain `@property({ type: Number, attribute: 'response' })`.
**For point coords (select-point):** use the same comma codec; each entry is `"x y"`.
**For pair shapes (match / gap-match):** use the same comma codec; each entry is `"src tgt"`.

#### C. The `firstUpdated` pattern

Source: [choices.mixin.ts:105-111](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L105-L111).

```ts
protected override firstUpdated(changed?: Map<string, unknown>) {
  super.firstUpdated(changed as Map<string, unknown>);
  this._applyInitialResponse();   // interaction-specific name
}
```

The base `CorrectResponseMixin.firstUpdated` already re-applies the three
view modes if their attributes were set at boot — interactions only need to
add the **response → visual** sync (which is what the line in choices.mixin
does for radios/checkboxes).

#### D. The watcher pattern

Source: [choices.mixin.ts:79](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L79).

```ts
import { watch } from '@qti-components/utilities';

@watch('response', { waitUntilFirstUpdate: true })
protected _handleResponseChange = () => {
  this._applyResponseToVisual();
  if (this.showCandidateCorrection) {
    this.toggleCandidateCorrection(true);
  }
};
```

The candidate-correction re-run on response change is what makes
`<qti-x response="newvalue" show-candidate-correction>` recompute the
candidate-correct/-incorrect states immediately.

#### E. The canonical `AllViewModesOverview` story

Source: [qti-choice-interaction.correctresponse.stories.ts:444](packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts#L444).

Structure to copy:

- CSS grid `.overview-grid` — `repeat(auto-fit, minmax(280px, 1fr))`.
- One `<section>` per view-mode combination, each with `<h3>` title and
  `<code>` line summarizing the attributes set on the interaction.
- 4 minimum panels: candidate-correction-correct, candidate-correction-incorrect,
  `show-correct-response` (inline), `show-full-correct-response` (clone).
- 4+ optional combo panels (each pair of modes, all-three combined,
  multi-response partial case if applicable).
- **No `play` function.** Pure markup.
- **No `qti-assessment-item` wrapper.** Standalone interaction per panel.

#### F. The canonical method names

Source: [packages/qti-base/src/mixins/correct-response.mixin.ts:30-46](packages/qti-base/src/mixins/correct-response.mixin.ts#L30-L46).

| Method | What it does | Override here |
|---|---|---|
| `toggleCorrectResponse(show)` | Public dispatcher — picks internal vs full based on `configContext.correctResponseMode` | **DO NOT override on interactions** |
| `toggleInternalCorrectResponse(show)` | The actual visual handler for the inline mode. **This is what the `show-correct-response` watcher calls.** | Override here ✅ |
| `toggleFullCorrectResponse(show)` | Clone-with-correct-answers handler. The base does the cloning generically; only override if the interaction needs special clone-time prep | Override only if needed |
| `toggleCandidateCorrection(show)` | Adds/removes `:state(candidate-correct)` / `:state(candidate-incorrect)` on the host AND on internal child elements (per-choice for choice interactions, per-pair for match, etc.) | Override here ✅ |

---

## Phase shape

```
Phase 1: Tiny prep — rename the four wrong-name overrides
Phase 2: Per-interaction response-attribute fix + watcher (template, ~12 interactions)
Phase 3: Per-interaction AllViewModesOverview story (~10 new files)
Phase 4: Verification (build, devtools dynamic-toggle smoke, CSS regressions)
```

Phase 2 and Phase 3 are parametric — one PR per interaction, can run in
parallel. Phase 1 should land first (small, high-value bug fix).

---

## Phase 1 — Rename wrong-name overrides

**Targets** (one rename per file):

| File | Current line | Change |
|---|---|---|
| `packages/interactions/slider-interaction/src/qti-slider-interaction.ts:43` | `public override toggleCorrectResponse(show: boolean)` | rename to `toggleInternalCorrectResponse` |
| `packages/interactions/gap-match-interaction/src/qti-gap-match-interaction.ts:28` | `override toggleCorrectResponse(show: boolean)` | rename to `toggleInternalCorrectResponse` |
| `packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts:116` | `override toggleCorrectResponse(show: boolean)` | rename to `toggleInternalCorrectResponse` |
| `packages/interactions/graphic-order-interaction/src/qti-graphic-order-interaction.ts:66` | `override toggleCorrectResponse(show: boolean)` | rename to `toggleInternalCorrectResponse` |

**Verification per file:**

- `grep -n "toggleCorrectResponse\b" packages/interactions/<pkg>/src/qti-*.ts` returns zero hits (the dispatcher should not be overridden anywhere).
- Visual smoke test in Storybook: set `show-correct-response` on the
  interaction → the correct-response visual NOW fires (it didn't before).
  If a previously-passing story now looks different, that's the bug fix —
  update the story, not the code.

**Anti-pattern:** Do NOT introduce a `toggleCorrectResponse` alias that
delegates to `toggleInternalCorrectResponse`. The dispatcher already does
the right thing; we want overrides only on the actual handler.

**Risk note:** any consumer that calls `interaction.toggleCorrectResponse(...)`
directly still works — the dispatcher in the base class is unchanged. Only
the override location moves.

---

## Phase 2 — Per-interaction response-attribute fix + watcher

**One PR per interaction.** Each PR applies the same template to one file.

### Template

For an interaction whose response is a single string OR string array of
identifiers (`inline-choice`, `text-entry`, `match`, `gap-match`,
`graphic-associate`, `graphic-order` — already done — `hottext`,
`hotspot`, `order`, `portable-custom`):

1. **Promote `response` from `@state` (or getter/setter / inherited) to
   `@property` with a `response` attribute.** Use the codec converter from
   Phase 0 §B verbatim.
2. **Add a `@watch('response', { waitUntilFirstUpdate: true })`** that
   re-applies the response to the interaction's visual state AND re-runs
   `toggleCandidateCorrection(true)` if `showCandidateCorrection` is on.
3. **Add a `firstUpdated`** that applies the initial response to visual
   state. (Many interactions already have one — extend it; don't introduce
   a second.)

For interactions whose response is **numeric (slider)** or **point coords
(select-point)** or **opaque (portable-custom)**:

1. Use a different converter shape:
   - slider: `@property({ type: Number, attribute: 'response' })`.
   - select-point: codec from §A, each entry is `"x y"` parsed via `parsePoint`.
   - portable-custom: codec from §A as a fallback string; opaque otherwise.
2. Same watcher pattern (step 2 above).
3. Same firstUpdated pattern (step 3 above).

### Per-interaction notes

| Interaction | What's needed |
|---|---|
| `inline-choice` | Replace getter/setter at L219–227 with the `@property` from §B. Add watcher. Add firstUpdated that applies initial response to the `<select>` / dropdown. |
| `text-entry` | Promote `@state()` at L24–25 to `@property` with the codec converter (single string — no comma case). Existing `@watch` at L29–35 already exists, extend it with the `toggleCandidateCorrection` re-apply. Add firstUpdated to set `<input>.value` from initial response. |
| `order` | Drop in `@property` over the inherited DragDrop response. Verify `firstUpdated` (already at L162) re-applies; if not, add the `_applyInitialResponse` step. Confirm `toggleCandidateCorrection` override at L102 re-runs when response changes. |
| `match` | Promote `@state() _response` at L34 to `@property` (codec converter; each entry is `"src tgt"`). Keep the existing getter/setter at L36–43 as **getters/setters on `response`** rather than `_response`. Add watcher + firstUpdated for the visual tabular/drag state. |
| `gap-match` | Same shape as match. Promote inherited response to attribute; add watcher + firstUpdated for gap-fill visual. Also Phase-1 rename. |
| `slider` | Numeric attribute (`@property({ type: Number, attribute: 'response' })`). Sync `#value` from `response` in `set response` (or in a watcher). Add firstUpdated to position the knob. Also Phase-1 rename. |
| `graphic-associate` | The `private _response` at L26–27 has NO Lit decorator — promote to `@property` with the codec converter (each entry is `"spot1 spot2"`). Existing firstUpdated at L145 needs an extension that applies initial response to the SVG line state. |
| `graphic-order` | Inherits from `ChoicesMixin` — `response` attribute already works (Phase 0). Verify; just do Phase-1 rename. |
| `select-point` | Codec converter; each entry is `"x y"`. Add watcher + firstUpdated to render initial point dots. Also Phase-1 rename. |
| `portable-custom` | The opaque `@state()` at L66 — promote to `@property` with the codec converter as a string fallback (PCI shells already handle string responses). Add watcher. |
| `hottext` | Already inherits from `ChoicesMixin` ⇒ response attribute works. Verify only; no code change expected. |
| `hotspot` | Same as hottext. Verify only. |

### Verification per interaction (Phase 2)

For each interaction:

- `<qti-x response="..." correct-response="..." show-candidate-correction>`
  renders with candidate-correction states applied to the right child
  elements (per-choice / per-pair / per-dot / etc.).
- Dynamic toggle test in browser devtools:
  ```js
  const el = document.querySelector('qti-x-interaction');
  el.setAttribute('show-candidate-correction', '');
  el.removeAttribute('show-candidate-correction');
  el.setAttribute('response', 'NEW_VALUE');
  ```
  Each step is visually reflected immediately, with no `play()` / direct
  method calls.
- Existing stories that DO call `interaction.response = ...` keep working
  (the property setter must still be available — `@property` provides
  both attribute AND property).
- `tsc -b` clean for the touched package.

### Anti-patterns (Phase 2)

- Do NOT add `play()` steps to existing stories to "make them work".
  If the markup doesn't reproduce the state, the wiring is wrong — fix the
  wiring, not the story.
- Do NOT introduce a separate `correct-response` codec in any interaction;
  use the canonical one from §A.
- Do NOT split the response into multiple attributes per type (`response-x`,
  `response-y`, etc.). One `response` attribute, string-shaped per the
  format table in `lib/correct-response.ts`.
- Do NOT replace the existing `@watch('response', ...)` if one is already
  there; extend it.
- Do NOT change the response's runtime data shape — only its declaration.

---

## Phase 3 — Per-interaction `AllViewModesOverview` story

**One new story file per interaction**, at
`packages/interactions/<dir>/src/stories/qti-<dir>.correctresponse.stories.ts`.

(Exception: `inline-choice` already has CR stories in its main file at
L698–931. **Either** move them into a new `*.correctresponse.stories.ts`
**or** add an `AllViewModesOverview` story alongside them. Picking option
A keeps stories grouped by concern.)

### Required content per story file

- Storybook `meta` with `component: 'qti-x-interaction'`, `title:
  '<NN> X Interaction/Correct Response'`, `tags: ['correct-response',
  'standalone']`.
- A single `AllViewModesOverview` story that copies the structure from
  [qti-choice-interaction.correctresponse.stories.ts:444](packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts#L444):
  - The same `.overview-grid` CSS.
  - 4 minimum panels per the §E checklist.
  - Optional combo panels (4+ — match the choice story's 9 if the response
    shape allows partial).
  - **No `play` function.** **No assessment-item wrapper.**

### Per-interaction `response` / `correct-response` examples to use

Pick a representative format the story can showcase:

| Interaction | `correct-response` | `response` (correct) | `response` (incorrect) |
|---|---|---|---|
| `inline-choice` | `Y` | `Y` | `X` |
| `text-entry` | `paris` | `paris` | `london` |
| `order` | `A,B,C` | `A,B,C` | `B,A,C` |
| `match` | `src1 tgt1,src2 tgt2` | (same) | `src1 tgt2,src2 tgt1` |
| `gap-match` | `gtext1 gap1,gtext2 gap2` | (same) | `gtext1 gap2,gtext2 gap1` |
| `slider` | `50` | `50` | `30` |
| `graphic-associate` | `spot1 spot2,spot3 spot4` | (same) | `spot1 spot3` |
| `graphic-order` | `spot1,spot2,spot3` | (same) | `spot2,spot1,spot3` |
| `select-point` | `100 150,200 250` | (same) | `100 150` |
| `portable-custom` | implementation-defined | match `correctResponse` | differ from it |
| `hottext` | `h1` (or `h1,h3`) | (match) | (differ) |
| `hotspot` | `spot1` (or `spot1,spot2`) | (match) | (differ) |

### Story file count

Already exists / needs new `AllViewModesOverview`:
- `text-entry`: file exists, add the overview story.
- `inline-choice`: stories inline in main file, migrate to new file.

Create new file:
- `order`, `match`, `gap-match`, `slider`, `graphic-associate`,
  `graphic-order`, `select-point`, `portable-custom`, `hottext`, `hotspot`.

### Verification per story (Phase 3)

- Story renders in Storybook with no console errors.
- Each panel visually differs as expected.
- Resizing the window flows the grid (auto-fit).
- No `play()` warning.

### Anti-patterns (Phase 3)

- Don't add a play function "just to assert the states are right". The
  panel rendering IS the assertion — if it renders, the wiring works.
- Don't add `data-testid` attributes the story doesn't use.
- Don't import `qti-assessment-item` or any context provider.

---

## Phase 4 — Verification

1. **Type check.** `npx tsc -b`. Only the two pre-existing unrelated
   errors (`qti-content-body.spec.ts` and
   `test-show-correct-response.stories.ts`) may remain. No new errors.
2. **No stray build artifacts.**
   `git ls-files --others --exclude-standard | grep -E '\.(d\.ts|js|js\.map)$' | wc -l` → `0`.
3. **Grep guards.**
   - `grep -rn "override toggleCorrectResponse\b" packages/interactions` → zero hits (after Phase 1).
   - `grep -rn "@state() response\b" packages/interactions` → zero hits in interaction class files (after Phase 2).
4. **Storybook builds.** `pnpm storybook` runs locally; every interaction's
   "Correct Response" section has its `AllViewModesOverview`.
5. **Manual smoke for each interaction.** In a Storybook story panel,
   open devtools:
   ```js
   const el = document.querySelector('qti-x-interaction');
   el.setAttribute('show-candidate-correction', '');
   // visual changes
   el.setAttribute('response', '<a different value>');
   // candidate-correction recomputes against the new response
   el.removeAttribute('show-candidate-correction');
   // visual reverts
   el.setAttribute('show-full-correct-response', '');
   // clone appears
   el.removeAttribute('show-full-correct-response');
   // clone disappears
   ```
   All four toggles work for every interaction.
6. **Regression net.** Existing `.correctresponse.stories.ts` and any
   conformance story that previously passed still passes. If a story
   previously worked because it called methods directly, it should now
   work via the markup-only path too — keep the old call paths (we didn't
   remove the property setters).
7. **CSS sweep.** Visually compare each interaction's `:state(...)` 
   styling against the pre-Phase-1 baseline. CSS changes are allowed — if
   the new states fire visuals that didn't fire before (Phase 1 bug fix
   surface), update the themes to match.

---

## Open questions / decisions to record

- **Slider numeric format.** Decide before Phase 2 whether `response="50"`
  on the slider is parsed as a Number (cleaner) or as a String matching
  `correct-response` (more consistent with the codec). Recommendation:
  Number (matches the slider's `min/max/step` types).
- **PortableCustom opacity.** The `boundTo` mechanism may already cover
  the attribute case. Decide whether to add a duplicate `response`
  attribute or to document `boundTo` as the canonical attribute.
- **Story file numbering.** The choice file uses `02 Choice Interaction/`.
  Use the existing numbering scheme per interaction — Phase 3 author
  should grep the package's existing stories to find the right prefix.
