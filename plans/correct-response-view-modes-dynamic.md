# Dynamic view-mode attributes across every interaction that supports `correct-response`

## Goal

Every QTI interaction that supports a `correct-response` attribute must also
**fully** support the three correction view-mode attributes — driven entirely
by attribute changes, including dynamic toggling at runtime:

- `show-correct-response`
- `show-full-correct-response`
- `show-candidate-correction`

Plus the `response` attribute (already shipped for `ChoicesMixin`-backed
interactions) must work the same way everywhere a response is meaningful, so
overview stories can render every state from pure markup with no `play` step.

Separately: decide what to do about `qti-extended-text-interaction`, which
inherits `correct-response` from the base but spec-wise should not have one.

Related prior plan: see `plans/separate-correct-response.md` — that plan
splits correct-response into an opt-in mixin/registration entrypoint. This
plan is **complementary**: it fixes the dynamic-attribute behavior for the
mixin/base path that already exists today, and pushes the same wiring
through every interaction. The two plans can land in either order; this one
does not require the registration split to land first.

---

## Phase 0 — Discovery (DONE)

Sources consulted (Explore agents over the repo):

- `packages/qti-base/src/abstract/interaction.ts` — base `Interaction` class.
- `packages/interactions/core/src/mixins/choices/choices.mixin.ts` — choice/order/match shared logic.
- `packages/interactions/*/src/qti-*.ts` — every interaction implementation.
- Existing `*.correctresponse.stories.ts` files under `packages/interactions/*/src/stories/`.

### Base wiring (interaction.ts)

| Attribute | Property | Watch hook → method | firstUpdated init |
|---|---|---|---|
| `correct-response` | `correctResponse` (lines 57–148) | n/a (parsed via setter) | n/a |
| `show-correct-response` | `showCorrectResponse` (70–71) | `@watch` (73–76) → `toggleInternalCorrectResponse(show)` | 387–389 |
| `show-full-correct-response` | `showFullCorrectResponse` (82–83) | `@watch` (85–88) → `toggleFullCorrectResponse(show)` | 390–392 |
| `show-candidate-correction` | `showCandidateCorrection` (94–95) | `@watch` (97–100) → `toggleCandidateCorrection(show)` | 393–395 |

The base method stubs:
- `toggleInternalCorrectResponse` (284–291) — internal-state only no-op.
- `toggleFullCorrectResponse` (229–282) — clones the host, strips the three
  show-attrs from the clone, sets `disabled` on the clone, fills `response`.
  This is generic and works for every subclass as long as `response` and
  `correctResponse` are real (settable) properties.
- `toggleCandidateCorrection` (293–312) — interaction-level states only.

### Per-interaction implementations

13 interactions touch `correct-response`. Status as of discovery:

| Interaction | Response source | `toggleInternalCorrectResponse` | `toggleCandidateCorrection` | Has correctresponse story |
|---|---|---|---|---|
| `qti-choice-interaction` | `ChoicesMixin` `response` attr (string\|string[]) | mixin override | mixin override + base super | ✓ (with AllViewModesOverview) |
| `qti-inline-choice-interaction` | `ChoicesMixin` | own override (line 229) | inherited | ✗ |
| `qti-order-interaction` | `ChoicesMixin` | own override (line 66) | own override | ✗ |
| `qti-match-interaction` | `@state() _response` (line 34) | own override (line 180) | own override | ✗ |
| `qti-gap-match-interaction` | (drag-drop mixin) | `toggleCorrectResponse` (line 28) | own override | ✗ |
| `qti-text-entry-interaction` | `@state() response` (line 25) | own override (line 107) | — | ✓ (no overview yet) |
| `qti-slider-interaction` | string | `toggleCorrectResponse` (line 43) | — | ✗ |
| `qti-graphic-associate-interaction` | `private _response` (line 27, no decorator!) | own override (line 60) | — | ✗ |
| `qti-graphic-order-interaction` | `ChoicesMixin` | `toggleCorrectResponse` (line 68) | — | ✗ |
| `qti-select-point-interaction` | `@state() response` (line 29) | `toggleCorrectResponse` | — | ✗ |
| `qti-portable-custom-interaction` | `@state() response` (line 66) | own override | — | ✗ |
| `qti-hottext-interaction` | TBD — confirm in Phase 1 | TBD | TBD | ✗ |
| `qti-hotspot-interaction` | TBD — confirm in Phase 1 | TBD | TBD | ✗ |

Explicitly **no** correct-response logic but inherits the attribute:
- `qti-extended-text-interaction` — `toggleCorrectResponse` is a no-op with
  comment "No correct response possible" (line 89).
- `qti-associate-interaction` — no override; semantically has no correct
  response without a separate mapping.
- `qti-upload-interaction`, `qti-media-interaction`, `qti-custom-interaction`,
  `qti-end-attempt-interaction`, `qti-position-object-interaction` —
  inherit attribute but should not support correctness display.

### Key inconsistencies found

1. **Method name drift.** Some interactions override `toggleInternalCorrectResponse`,
   others override `toggleCorrectResponse`. Only one of those names is the
   actual watcher hook (`toggleInternalCorrectResponse` per the base watcher).
   Overrides on the wrong name are dead code — they're never invoked by the
   `show-correct-response` watcher. **This is a bug.** Affected at least:
   `gap-match`, `slider`, `graphic-order`, `select-point`.

2. **`response` is `@state()` (no attribute) on most non-choice interactions.**
   The ChoicesMixin fix added a `response` attribute + a `firstUpdated` that
   re-applies `toggleCandidateCorrection(true)`. None of the non-choice
   interactions have this — so on those interactions:
   - `response="…"` is not parsable from markup.
   - `show-candidate-correction` set at boot computes against an empty
     response and stays empty even when the response is later set.

3. **`graphic-associate-interaction` uses a plain `private _response`** with
   no Lit decorator at all — it won't even reactively re-render on assignment.

4. **`show-candidate-correction` re-evaluation on `response` change** is not
   wired anywhere. Only `firstUpdated` and the watcher on the attribute itself
   call `toggleCandidateCorrection`. A response change after boot leaves the
   stale candidate-correct/candidate-incorrect states until something else
   toggles the attribute.

5. **`show-full-correct-response` clone lifecycle on dynamic toggle.**
   `toggleFullCorrectResponse(false)` must remove the previously-appended
   clone DOM. Confirm in Phase 1 — the base method exists but the removal
   path needs testing under attribute remove (`removeAttribute`) and false-set.

6. **Stories.** Only 2 of 13 interactions have a `.correctresponse.stories.ts`
   file. Only `choice-interaction` has an `AllViewModesOverview` panel layout.

### Confidence + gaps

- High confidence on the base wiring and the choice mixin (read in full
  during the recent fix).
- Medium confidence on which method name each non-choice interaction
  actually overrides — names drift. **Phase 1 verifies per file**, do not
  trust the table above without re-grepping.
- Did not yet read `hottext`, `hotspot`, `graphic-gap-match` for response/
  correct-response wiring — verify in Phase 1.

---

## Plan shape

The work splits into **base/mixin fixes** (do once, reused everywhere) and
**per-interaction audits** (do once per interaction, parametric).

```
Phase 1: Establish per-interaction baseline (read-only audit)
Phase 2: Base/shared fixes (response change → candidate-correction;
         dynamic toggle of all three view modes; clone removal on false)
Phase 3: Per-interaction fixes (one PR per interaction, parametric template)
Phase 4: Stories — one AllViewModesOverview per interaction
Phase 5: extended-text decision + cleanup of dead toggleCorrectResponse names
Phase 6: Verification (lint, build, story snapshots)
```

Each implementation phase is framed to **copy** an existing working pattern
(`qti-choice-interaction` + `ChoicesMixin` + the new
`correctresponse.stories.ts` AllViewModesOverview), not invent new APIs.

---

## Phase 1 — Per-interaction baseline audit

**What to do:** For every interaction file under
`packages/interactions/*/src/qti-*-interaction.ts`, fill in this matrix —
one row per interaction. Save as `plans/correct-response-view-modes-audit.md`.

For each interaction, record:

| Column | What to grep / read |
|---|---|
| Tag name | `class Qti…Interaction extends …` |
| Inherits `correct-response`? | Always yes (base) — but does it ALSO override the property? |
| `response` declared as | `@property` / `@state` / plain field / inherited from mixin |
| `response` attribute supported? | yes/no (look for `attribute: 'response'`) |
| Override of `toggleInternalCorrectResponse` | line number or "none" |
| Override of `toggleFullCorrectResponse` | line number or "none" — usually "none" (base handles it) |
| Override of `toggleCandidateCorrection` | line number or "none" |
| Override of `toggleCorrectResponse` (WRONG name) | line number — these are bugs |
| Has `firstUpdated` that re-applies view modes? | yes/no |
| Has watcher on `response` that re-runs candidate-correction? | yes/no |
| Existing stories file `*.correctresponse.stories.ts` | path or "missing" |

**How:** Use one `Explore` agent per ~3 interactions in parallel; each agent
reports the matrix rows for its assigned interactions with file:line cites.

**Verification:** Matrix has one row per interaction, every cell has a
file:line citation or an explicit "none".

**Anti-patterns:**
- Do not edit any code in this phase.
- Do not assume — every claim must cite a line.

---

## Phase 2 — Base / shared fixes

These are the cross-cutting fixes that, once landed, eliminate a class of
bugs for every interaction at once. **Copy patterns from**
`packages/interactions/core/src/mixins/choices/choices.mixin.ts` (the
recent ChoicesMixin fix) and from
`packages/qti-base/src/abstract/interaction.ts` (the base wiring).

### 2.1 Re-run `toggleCandidateCorrection` on response change (base class)

**Location:** `packages/qti-base/src/abstract/interaction.ts`.

**Problem:** When `response` changes (any subclass, any mechanism), the
candidate-correct/-incorrect states go stale.

**Fix shape:** The base class doesn't own `response` — each subclass does.
Instead of pushing a watcher into the base, document a contract:

> Subclasses MUST call `if (this.showCandidateCorrection) this.toggleCandidateCorrection(true)`
> whenever `response` changes after first update.

Then implement it in the two places where `response` actually lives today:

1. **ChoicesMixin** — already done by the recent fix; verify the watcher
   `_handleValueChange` (line 58–62 in choices.mixin.ts) calls
   `toggleCandidateCorrection(true)` when `showCandidateCorrection` is on.
   **Action:** Extend `_handleValueChange` to add that call.

2. **Per-interaction `response` watchers** — Phase 3 work, since each
   interaction owns its own `response` field. Phase 2 only adds the contract.

**Copy reference:** the ChoicesMixin `firstUpdated` pattern just added:

```ts
protected override firstUpdated(changed) {
  super.firstUpdated(changed);
  this._updateChoiceSelection();
  if (this.showCandidateCorrection) {
    this.toggleCandidateCorrection(true);
  }
}
```

**Verification:** Add a unit test (or extend an existing one) under
`packages/interactions/core/src/mixins/choices/choices.spec.ts` that:
- creates an interaction with `correct-response="A"` and `show-candidate-correction`
- sets `response = 'B'`
- asserts the choice for `B` gets `:state(candidate-incorrect)`.

### 2.2 Verify `show-full-correct-response` removal lifecycle

**Location:** `packages/qti-base/src/abstract/interaction.ts` lines 229–282.

**What to verify:** When `showFullCorrectResponse` flips false (or attribute
is removed), the appended `.full-correct-response` sibling div is removed.

**Action:** Read the existing `toggleFullCorrectResponse(false)` branch.
If removal isn't symmetric, add it. **Do not invent new structure** — the
clone is appended with class `full-correct-response`; remove by selector
match.

**Verification:** Add a play-function story that toggles
`show-full-correct-response` off and asserts the sibling div is gone.

### 2.3 Confirm method-name canon

**Decision needed:** Which is the canonical name?
- `toggleInternalCorrectResponse` — the base watcher target (current truth).
- `toggleCorrectResponse` — what `gap-match`, `slider`, `graphic-order`,
  `select-point` override.

**Recommendation:** Keep `toggleInternalCorrectResponse` (the watcher) and
treat all `toggleCorrectResponse` overrides as bugs to be renamed in Phase 3.
Alternative — add `toggleCorrectResponse` as a thin alias that delegates —
**reject this**: it perpetuates the drift.

**Document the canonical name** in a one-paragraph comment block at the top
of `interaction.ts` next to the watcher.

### 2.4 No `response` attribute helper on the base

**Do not** add a `response` attribute on the base `Interaction` class — the
shape varies (string, string[], point coords, association tuples, files).
Each subclass owns its own. The base only defines the contract: "if you have
a `response`, declare it as `@property` with an attribute and add a watcher
that calls `toggleCandidateCorrection(true)` on change when the show-attr
is on."

**Anti-pattern guard:** Do not add a generic `response` getter/setter to
`Interaction`. Do not move the ChoicesMixin response attribute up.

---

## Phase 3 — Per-interaction fixes (parametric template)

For each interaction in the matrix from Phase 1 (excluding the choice family
which is done, and excluding interactions that should NOT support
correct-response — see Phase 5), apply this template.

**Copy reference:** ChoicesMixin `response` attribute (choices.mixin.ts
lines 56–70) and `firstUpdated` (lines 156–166).

### Template per interaction

1. **Promote `response` from `@state` to `@property` with attribute.**
   Pick the converter shape based on response type:
   - Single string: `@property({ type: String, attribute: 'response' })`.
   - String array (comma-separated): copy the ChoicesMixin converter verbatim.
   - Numeric: `@property({ type: Number, attribute: 'response' })`.
   - Structured (match pairs, gap pairs, point coords): use a custom
     converter that round-trips through a documented string form (e.g.
     `"A B,C D"` for match pairs). Document the form in a JSDoc above the
     property.

2. **Rename any `toggleCorrectResponse` override → `toggleInternalCorrectResponse`.**
   Confirm via grep that no caller depends on the old name. Delete the old name.

3. **Add a `firstUpdated` hook that:**
   - Applies the initial `response` to the visual state of the interaction.
   - Re-calls `toggleCandidateCorrection(true)` if `showCandidateCorrection`
     is set (response is now known).
   - Re-calls `toggleInternalCorrectResponse(true)` if `showCorrectResponse`
     is set (only if the override depends on data not available at base
     `firstUpdated` time — usually unnecessary since base already does it).

4. **Add a watcher on `response`** that, when set after first update, re-runs
   `toggleCandidateCorrection(true)` if `showCandidateCorrection` is on.

5. **Sanity check the dynamic-toggle path:**
   - Set the attribute → expect the visual state to appear.
   - Remove the attribute → expect the visual state to disappear (especially
     for the full-clone case).
   - Change `correct-response` → expect everything to re-evaluate.

### Per-interaction list (one PR per row, can run in parallel)

| Interaction | Notes |
|---|---|
| `inline-choice-interaction` | Already on ChoicesMixin — likely only needs the watcher addition (verify). |
| `order-interaction` | Already on ChoicesMixin — same. |
| `match-interaction` | `_response` is `@state()`; needs attribute + converter for the pair form. Largest scope. |
| `gap-match-interaction` | Same shape as match; pair form. Also rename `toggleCorrectResponse` → `toggleInternalCorrectResponse`. |
| `text-entry-interaction` | Single string. `response` is already `@state` — promote. |
| `slider-interaction` | Number. Promote. Rename `toggleCorrectResponse`. |
| `graphic-associate-interaction` | **First** convert the plain `private _response` to a `@property` (currently no decorator at all). |
| `graphic-order-interaction` | Same family as choice; verify ChoicesMixin coverage. Rename `toggleCorrectResponse`. |
| `select-point-interaction` | Point coords; document the string form. Rename `toggleCorrectResponse`. |
| `portable-custom-interaction` | Opaque response — document the contract; keep generic. |
| `hottext-interaction` | Confirm in Phase 1 first. |
| `hotspot-interaction` | Confirm in Phase 1 first. |

**Verification per interaction:** Phase 4 story is the proof — if the
AllViewModesOverview renders correctly from pure markup, the wiring is good.
Plus a unit test mirroring 2.1 in the interaction's own spec file if one
exists.

**Anti-patterns:**
- Don't change the response data model — only its declaration shape.
- Don't add `play()` steps that assign `response` programmatically to "make
  the story work" — the story is the verification; if pure markup doesn't
  work, the wiring is wrong, fix it.
- Don't introduce new method names — stick to the three canonical
  `toggleInternal*` / `toggleCandidate*` / `toggleFull*`.

---

## Phase 4 — Storybook overview stories

**One `*.correctresponse.stories.ts` per interaction**, each with an
`AllViewModesOverview` story that copies the layout from:

`packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts`
(the `AllViewModesOverview` story, ~425–end).

### Required panels per story

Minimum 4 panels (single-select-shaped interactions); 6+ for multi-response:

1. `show-candidate-correction` with a correct response.
2. `show-candidate-correction` with an incorrect response.
3. `show-correct-response` inline (with an incorrect response set so the
   contrast is visible).
4. `show-full-correct-response` (clone).
5. (Optional, for completeness) all three combined.
6. (Multi-response interactions) one panel with a partial response.

### Markup rules

- **Attribute-only.** No `play` function that mutates properties. If markup
  alone doesn't reproduce the state, the wiring under Phase 3 is incomplete.
- **No `qti-assessment-item` wrapper.** Each panel is a standalone
  interaction with `correct-response`, `response`, and the show-attrs.
- **Same prompt and choices across panels** — only the view-mode attrs differ,
  so the user reads the panels as a comparison.

### Per-interaction story stubs to create

(Already exists, skip): `choice-interaction`.

(Exists, add `AllViewModesOverview`): `text-entry-interaction`.

(Create new): `inline-choice-interaction`, `order-interaction`,
`match-interaction`, `gap-match-interaction`, `slider-interaction`,
`graphic-associate-interaction`, `graphic-order-interaction`,
`select-point-interaction`, `portable-custom-interaction`,
`hottext-interaction`, `hotspot-interaction`.

(Do not create): `extended-text-interaction`, `associate-interaction`,
`upload-interaction`, `media-interaction`, `custom-interaction`,
`end-attempt-interaction`, `position-object-interaction` — see Phase 5.

**Verification:** Run Storybook locally; visit each interaction's
`Correct Response` section; confirm `AllViewModesOverview` renders without
console errors and the four+ panels visually differ as expected.

**Anti-patterns:**
- Don't copy `play` functions from the existing choice story — the new
  ones must work from markup alone.
- Don't add `data-testid` flag noise that the story doesn't use; only add
  testids if the story actually asserts on them.

---

## Phase 5 — `extended-text-interaction` decision + dead-code cleanup

### 5.1 `extended-text-interaction`

**Facts (from discovery):**
- The base `Interaction` class declares `correct-response` for every
  subclass. There is no way to "remove" an attribute from a subclass
  cleanly in Lit.
- The current file overrides `toggleCorrectResponse` as a no-op with a
  comment "No correct response possible".

**Decision recommendation:** Keep the inheritance (can't realistically
strip an attribute from a base property in Lit), but:

1. Override `correctResponse` getter/setter on `qti-extended-text-interaction`
   to **throw or warn** when set: `console.warn('correct-response is not
   supported on qti-extended-text-interaction per the QTI spec')`.
2. Override all three view-mode attribute setters to either throw or be
   no-ops — match the existing pattern.
3. Delete the dead `toggleCorrectResponse` override (wrong name anyway).
4. Document in JSDoc on the class that these attributes are inherited but
   intentionally inert.

**Open question for the user:** Throw, warn, or silent no-op?
Recommendation: **warn** — keeps the editor's existing markup loadable
without crashing, surfaces the misuse in the console.

If the cross-cutting plan in `plans/separate-correct-response.md` lands
first, this question goes away — extended-text would simply not use the
correct-response mixin/registration entrypoint.

### 5.2 Other "no correct response" interactions

Apply the same recommendation (warn on set, no-op the view modes) to:
- `qti-upload-interaction`
- `qti-media-interaction`
- `qti-custom-interaction`
- `qti-end-attempt-interaction`
- `qti-position-object-interaction`
- `qti-associate-interaction` (verify with user — `associate` does have a
  notion of correctness via response declaration; the in-repo
  implementation doesn't expose it, but the spec does).

### 5.3 Dead code removal

Grep and remove every `toggleCorrectResponse(` override (the wrong-name
one) once Phase 3 renames have landed:

```
grep -rn "toggleCorrectResponse\b" packages/interactions
```

Result should be zero hits after Phase 3 + 5.3.

---

## Phase 6 — Verification

1. **Type check + build:** `pnpm -w build`. No new TS errors.
2. **Lint:** `pnpm -w lint`. Clean.
3. **Unit tests:** Run any `*.spec.ts` under the touched packages. Specifically:
   - `choices.spec.ts` — the new candidate-correction-on-response-change test.
   - Per-interaction specs where they exist.
4. **Storybook:** `pnpm storybook` and visit each interaction's
   `Correct Response` section. Confirm `AllViewModesOverview` renders.
5. **Storybook play tests:** Run `pnpm test-storybook` (or the local
   equivalent) — every story's `play` function (where present) must pass.
6. **Manual dynamic-toggle smoke test:** In Storybook, open browser
   devtools, pick any interaction with the new attrs, and run:
   ```js
   const el = document.querySelector('qti-choice-interaction');
   el.setAttribute('show-candidate-correction', '');
   // visually changes
   el.removeAttribute('show-candidate-correction');
   // visually reverts
   el.setAttribute('response', 'B');
   el.setAttribute('show-candidate-correction', '');
   // recomputes against new response
   ```
   Repeat for two non-choice interactions.
7. **Grep guard:** No remaining `toggleCorrectResponse(` overrides.
8. **Grep guard:** No `@state() response` in any interaction that supports
   correct-response (they should all be `@property` with attribute now).

---

## Out of scope

- The opt-in registration split from `plans/separate-correct-response.md` —
  that's a separate decision and a separate PR series.
- Visual styling of the new states — themes layer on `:state(...)` already
  and don't need to change.
- New interactions or response-declaration mechanics — strictly attribute
  wiring + stories.

---

## Allowed APIs / patterns (copy these, don't invent)

- `@property({ attribute: '...', converter: { fromAttribute, toAttribute } })`
  — pattern in [choices.mixin.ts:56-70](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L56).
- `@watch('field', { waitUntilFirstUpdate: true })` — pattern throughout
  `interaction.ts` (lines 73, 85, 97).
- `protected override firstUpdated(changed) { super.firstUpdated(changed); … }`
  — pattern in [choices.mixin.ts:156-166](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L156).
- Storybook overview layout — copy from
  [qti-choice-interaction.correctresponse.stories.ts:425](packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts#L425)
  (the `AllViewModesOverview` story).

**Anti-patterns (do NOT do):**
- Do not invent a `correctResponse` "renderer" abstraction.
- Do not move per-interaction `response` types into the base.
- Do not add `toggleCorrectResponse` as an alias for
  `toggleInternalCorrectResponse`.
- Do not write stories that depend on a `play` function to set `response`.
- Do not silently swallow `correct-response` set on interactions that
  shouldn't support it — warn so the editor team notices.
