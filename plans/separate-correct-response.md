# Separate correct-response handling from base interactions

## Goal

Make every `qti-*-interaction` element usable WITHOUT correct-response /
candidate-correction / show-correct-response behavior. Today this is baked
into the base `Interaction` class and overridden via mixins and per-interaction
subclasses. Consumers (the QTI Editor, the upstream player apps) should be
able to opt **in** to correct-response on a per-interaction basis, by choosing
a registration entrypoint.

For interactions that genuinely have no notion of a correct response
(`extended-text-interaction`, `upload-interaction`, `media-interaction`,
`custom-interaction`, `end-attempt-interaction`), the lean base is the only
shipped behavior — the dead `toggleCorrectResponse` overrides go away.

## Recommended mechanism

**Mixin + dual registration entrypoint**, *not* a Lit ReactiveController and
*not* sibling elements. Rationale:

- The correct-response surface already mutates `@state()`, depends on
  decorator-based watchers, clones the host element, and is layered with
  `super.toggleX(...)` calls from `ChoicesMixin` / per-interaction subclasses.
  Mixins compose with that super-chain naturally. A ReactiveController cannot
  own `@watch`-style class decorators or be inserted into a `super` chain —
  trying to retrofit one means re-implementing the watcher plumbing and
  serializing controller↔mixin lifecycle by hand.
- The user's "extended version registered under the same original name" idea
  works cleanly as a registration-entrypoint choice: each interaction package
  ships `register.ts` (lean class) and `register-with-correct-response.ts`
  (mixed class). Consumers pick one — the same tag name is defined.
- ReactiveController stays available as a future option for *new* opt-in
  features (e.g. analytics, autosave) where there's no existing super-chain
  to integrate with.

## Phase 0 — Discovery (done)

Already mapped during planning. Key findings (source: Explore agent over
`/Users/patrickklein/Projects/Edtech/QTI/QTI-Components`):

### Where correct-response lives today

- **Base class**: [`packages/qti-base/src/abstract/interaction.ts`](packages/qti-base/src/abstract/interaction.ts)
  - `correctResponseAttr` (lines 57–64) — `correct-response` attribute
  - `_correctResponse` (line 122), `correctResponse` getter/setter (128–148)
  - `showCorrectResponse` (line 70), `showFullCorrectResponse` (82),
    `showCandidateCorrection` (94) — three opt-in boolean toggles
  - `correctness` getter (155–197) — derives correctness enum from response
  - `toggleCorrectResponse` (219–227) — dispatcher
  - `toggleFullCorrectResponse` (229–282) — clone-and-disable strategy
  - `toggleInternalCorrectResponse` (284–291) — default impl (CSS state),
    overridden by mixins/subclasses
  - `toggleCandidateCorrection` (293–312) — interaction-level candidate states
  - `firstUpdated` (380–396) — applies initial states when attrs preset
- **Choice mixin**: [`packages/interactions/core/src/mixins/choices/choices.mixin.ts`](packages/interactions/core/src/mixins/choices/choices.mixin.ts)
  - Overrides `toggleInternalCorrectResponse` (84–102) — per-choice correct/incorrect states
  - Overrides `toggleCandidateCorrection` (104–140) — per-choice candidate states

### Per-interaction overrides (correct-response is embedded in the class)

| Interaction | Override location | What it does |
|---|---|---|
| inline-choice | `qti-inline-choice-interaction.ts:229–252` | Renders `<span part="correct-option">` |
| text-entry | `qti-text-entry-interaction.ts:107–135` (and 158) | Renders `<div part="correct">` |
| gap-match | `qti-gap-match-interaction.ts:28–73, 93–124` | Inserts correct-option spans into DOM |
| match | `qti-match-interaction.ts:180–229, 231–261` | Tabular & drag correct-display |
| order | `qti-order-interaction.ts:66–100, 102–132` | Inserts correct-option spans |
| select-point | `qti-select-point-interaction.ts:99–114, 116–151` | Area mapping shapes |
| slider | `qti-slider-interaction.ts:43–61` | Knob-correct visual |
| portable-custom | `qti-portable-custom-interaction.ts:1788+` | Cloned PCI viewer |
| extended-text | `qti-extended-text-interaction.ts:89–91` | **No-op override** — proves the dead-weight case |

### Lean by virtue of inheritance (no override, base impl never used)

- `upload-interaction`, `media-interaction`, `custom-interaction`,
  `associate-interaction` (no choice marking)
- `end-attempt-interaction` — does **not** extend `Interaction`; out of scope.

### Registration pattern (one tag → one class today)

Every interaction package ships `src/register.ts`:

```ts
import { QtiChoiceInteraction } from './qti-choice-interaction';
customElements.define('qti-choice-interaction', QtiChoiceInteraction);
```

### Existing regression net (DO NOT BREAK)

- `packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts` (388 lines)
- `packages/interactions/text-entry-interaction/src/stories/qti-text-entry-interaction.correctresponse.stories.ts` (473 lines)
- `packages/interactions/inline-choice-interaction/src/stories/qti-inline-choice-interaction.stories.ts:705–924`
- `packages/interactions/choice-interaction/src/stories/qti-choice-interaction.config.stories.ts:194–216`
- Conformance stories under `apps/e2e/src/stories/`

These stories must keep passing after the refactor. They'll need to import
the with-correct-response registration entrypoint (Phase 4).

---

## Phase 1 — Extract `CorrectResponseMixin` from the base `Interaction`

**Goal:** the base `Interaction` class no longer mentions correct-response.
All of it moves into a mixin that can be applied on top.

**What to implement**

1. Create [`packages/qti-base/src/mixins/correct-response.mixin.ts`](packages/qti-base/src/mixins/correct-response.mixin.ts).
2. Copy lines 57–64, 70–100, 122, 128–148, 155–197, 219–312, and the
   correct-response branches of `firstUpdated` (380–396) **verbatim** from
   `interaction.ts` into a `CorrectResponseMixin<T extends Constructor<Interaction>>(superClass: T)`
   that returns `class extends superClass { ... }`.
3. Remove those same lines from
   [`packages/qti-base/src/abstract/interaction.ts`](packages/qti-base/src/abstract/interaction.ts).
   Keep response-variable plumbing, scoring-via-responseVariable, lifecycle.
4. Re-export a convenience type: `InteractionWithCorrectResponse = ReturnType<typeof CorrectResponseMixin<typeof Interaction>>`.
5. Add a `correctness` shim on the base that returns `Correctness.unknown`
   if no mixin is present — so existing callers don't crash. (Or remove the
   call sites entirely if there are none outside the mixin.)

**Copy-ready source**: [`packages/qti-base/src/abstract/interaction.ts`](packages/qti-base/src/abstract/interaction.ts)
lines 57–64, 70–100, 122, 128–148, 155–197, 219–312.

**Verification**

- `grep -n "correctResponse\|showCorrectResponse\|showFullCorrectResponse\|showCandidateCorrection\|toggleCorrectResponse\|toggleFullCorrectResponse\|toggleInternalCorrectResponse\|toggleCandidateCorrection\|_correctResponse\|correctness" packages/qti-base/src/abstract/interaction.ts`
  returns **zero hits** (or hits only inside removed-then-confirmed regions).
- `tsc --noEmit -p packages/qti-base` passes.
- A new Storybook story `qti-base/lean-interaction.stories.ts` mounts a
  bare extension of `Interaction` and confirms `correctResponse` is
  `undefined`, no `show-correct-response` attribute is observed.

**Anti-patterns to avoid**

- Do NOT replicate the watcher decorators — copy them; the decorator metadata
  doesn't travel through a `Constructor<T>` extension if you re-derive it.
- Do NOT change call signatures of any toggle method. Stories rely on them.

---

## Phase 2 — Split `ChoicesMixin` into selection vs. correct-response

**Goal:** `ChoicesMixin` keeps the selection / identifier / vocabulary logic.
The correct-response overrides move to `ChoiceCorrectResponseMixin` so a
"choice interaction without correct response" composition is possible.

**What to implement**

1. Create [`packages/interactions/core/src/mixins/choices/choice-correct-response.mixin.ts`](packages/interactions/core/src/mixins/choices/choice-correct-response.mixin.ts).
2. Move lines 84–102 (toggleInternalCorrectResponse override) and 104–140
   (toggleCandidateCorrection override) from
   [`choices.mixin.ts`](packages/interactions/core/src/mixins/choices/choices.mixin.ts)
   into the new mixin. The new mixin's constraint is
   `<T extends Constructor<InteractionWithCorrectResponse & { _choiceElements: HTMLElement[] }>>`
   so TypeScript proves it's only applicable to a host that *has* correct-response.
3. Remove those overrides from `ChoicesMixin`.
4. Export a composed type for convenience:
   `ChoiceInteractionWithCorrectResponse = ChoiceCorrectResponseMixin<ChoicesMixin<InteractionWithCorrectResponse>>`.

**Copy-ready source**: [`packages/interactions/core/src/mixins/choices/choices.mixin.ts`](packages/interactions/core/src/mixins/choices/choices.mixin.ts)
lines 84–102, 104–140.

**Verification**

- `grep -n "correctResponse\|candidateCorrection" packages/interactions/core/src/mixins/choices/choices.mixin.ts`
  returns zero hits.
- A new minimal "no correct-response" choice composition exists in tests
  and renders selectable choices but does NOT add `:state(correct-response)`
  to children when `show-correct-response` is set (because the watcher isn't
  there).

---

## Phase 3 — Extract per-interaction correct-response overrides

**Goal:** for each interaction that subclasses-with-overrides today, the
override moves out of the main class into a small dedicated mixin co-located
with the interaction. Two classes are exported per interaction:
the lean class and the with-correct-response class.

**Targets** (one mixin file per interaction):

| Interaction | Override mixin file | Lines to extract |
|---|---|---|
| inline-choice | `inline-choice-correct-response.mixin.ts` | `qti-inline-choice-interaction.ts:229–252` |
| text-entry | `text-entry-correct-response.mixin.ts` | `qti-text-entry-interaction.ts:107–135` + render branch at 158 |
| gap-match | `gap-match-correct-response.mixin.ts` | `qti-gap-match-interaction.ts:28–73, 93–124` |
| match | `match-correct-response.mixin.ts` | `qti-match-interaction.ts:180–229, 231–261` |
| order | `order-correct-response.mixin.ts` | `qti-order-interaction.ts:66–100, 102–132` |
| select-point | `select-point-correct-response.mixin.ts` | `qti-select-point-interaction.ts:99–114, 116–151` |
| slider | `slider-correct-response.mixin.ts` | `qti-slider-interaction.ts:43–61` |
| portable-custom | `portable-custom-correct-response.mixin.ts` | `qti-portable-custom-interaction.ts:1788+` |

**For each interaction's package:**

1. Create the mixin file alongside the interaction class.
2. Move the override methods verbatim. Render-branch overrides (e.g.
   text-entry's line 158 inside `render()`) need an extension hook: rename
   the lean class's `render()` to call `this.renderCorrectResponseOverlay?.()`
   at the same point; the mixin then implements `renderCorrectResponseOverlay()`.
3. Export two classes from the package's `src/index.ts`:
   - `QtiXyzInteraction` — lean (default export, current name).
   - `QtiXyzInteractionWithCorrectResponse` — mixin applied.

**Copy-ready source**: each interaction file at the line ranges in the table.

**Verification**

- `grep -n "correctResponse\|candidateCorrection" packages/interactions/<pkg>/src/qti-<pkg>.ts`
  returns zero hits for every refactored interaction's class file.
- Both exports compile and pass `tsc --noEmit`.
- Existing `*.correctresponse.stories.ts` files still pass after Phase 4 wires
  the registration.

**Anti-patterns to avoid**

- Do NOT silently change DOM output. The mixin's render-overlay hook must
  emit the same elements at the same positions as today.
- Do NOT introduce a default `renderCorrectResponseOverlay()` on the lean
  class — leave the optional-chain call to no-op via `?.()`.

---

## Phase 4 — Dual registration entrypoints

**Goal:** every interaction package exposes two registration modules.

**What to implement**

For each interaction package under `packages/interactions/<pkg>/`:

1. Rename the existing `src/register.ts` registration to register the **lean**
   class:
   ```ts
   import { QtiChoiceInteraction } from './qti-choice-interaction';
   customElements.define('qti-choice-interaction', QtiChoiceInteraction);
   ```
2. Add `src/register-with-correct-response.ts`:
   ```ts
   import { QtiChoiceInteractionWithCorrectResponse } from './qti-choice-interaction';
   customElements.define('qti-choice-interaction', QtiChoiceInteractionWithCorrectResponse);
   ```
3. Update the package's `package.json` `exports`:
   ```json
   {
     "exports": {
       "./register": "./dist/register.js",
       "./register-with-correct-response": "./dist/register-with-correct-response.js"
     }
   }
   ```

**Anti-pattern**: importing BOTH entrypoints in one runtime throws
"already defined". Document this in the package's `README.md`.

**Copy-ready source**: existing `register.ts` in each interaction package.

**Verification**

- Each interaction package's `dist/` contains both files after build.
- `node -e "import('@citolab/qti-components/choice-interaction/register-with-correct-response')"`
  resolves.
- A storybook story that explicitly imports the with-correct-response
  entrypoint reproduces the current behavior pixel-for-pixel.

---

## Phase 5 — Migrate dead-weight interactions to the lean base

**Goal:** interactions that have no correct-response concept stop extending
the with-correct-response chain.

**Targets**

1. `extended-text-interaction` — delete the no-op `toggleCorrectResponse`
   override at `qti-extended-text-interaction.ts:89–91`. Confirm the class
   extends the lean `Interaction`, not `InteractionWithCorrectResponse`.
2. `upload-interaction` — confirm lean.
3. `media-interaction` — confirm lean.
4. `custom-interaction` — confirm lean.
5. `associate-interaction` — confirm lean (drag-drop only; no choice marking).

For each: only ship `register.ts` (no `register-with-correct-response.ts`).

**Verification**

- `grep -n "correctResponse\|showCorrectResponse" packages/interactions/extended-text-interaction/src/` returns zero hits.
- Existing stories for these five interactions still pass.

---

## Phase 6 — Update existing stories and conformance tests

**Goal:** the regression net keeps proving correct-response works for the
mixed variants.

**What to implement**

1. In each `*.correctresponse.stories.ts` and any conformance story that
   needs correct-response, replace the registration import:
   ```diff
   - import '@citolab/qti-components/choice-interaction/register';
   + import '@citolab/qti-components/choice-interaction/register-with-correct-response';
   ```
2. Add new "lean" stories (one per interaction that has both variants) that
   import the bare `register` and confirm `show-correct-response` has no
   effect.

**Files to touch** (from Phase 0 discovery):

- `packages/interactions/choice-interaction/src/stories/qti-choice-interaction.correctresponse.stories.ts`
- `packages/interactions/text-entry-interaction/src/stories/qti-text-entry-interaction.correctresponse.stories.ts`
- `packages/interactions/inline-choice-interaction/src/stories/qti-inline-choice-interaction.stories.ts` (lines 705–924 block)
- `packages/interactions/choice-interaction/src/stories/qti-choice-interaction.config.stories.ts` (lines 194–216)
- All `apps/e2e/src/stories/` files that exercise correct-response (grep first).

**Verification**

- `pnpm --filter @citolab/qti-components storybook:build` passes.
- `pnpm --filter ./apps/e2e test` passes.

---

## Phase 7 — Final verification

1. `pnpm -r build` — every package compiles.
2. `pnpm -r test` — every test passes.
3. `pnpm --filter @citolab/qti-components storybook:build` — Storybook
   builds without errors.
4. Grep guards (zero hits expected):
   - `grep -rn "correctResponse\|candidateCorrection\|showCorrectResponse" packages/qti-base/src/abstract/`
   - `grep -rn "correctResponse\|candidateCorrection" packages/interactions/core/src/mixins/choices/choices.mixin.ts`
   - `grep -rn "correctResponse\|candidateCorrection" packages/interactions/*/src/qti-*.ts` (excluding correct-response mixin files)
5. Manual smoke: load a representative QTI assessment item in the player,
   toggle `show-correct-response` / `show-full-correct-response` /
   `show-candidate-correction`, verify identical visuals to pre-refactor.
6. Manual smoke (the new path): import a lean choice-interaction registration
   in a fresh page, set `show-correct-response`, confirm NO correct-response
   marks appear.

---

## Out of scope (call out, don't do)

- Switching the default registration to lean. That's a breaking change for
  every consumer of `@citolab/qti-components` and belongs in the dedicated
  breaking-changes branch (`breaking-changes-for-editor-release`). The
  default `register.ts` here registers the **lean** class, but the
  publishable index-style "kitchen sink" entry (if any) should keep importing
  `register-with-correct-response` until that breaking-release moment.
  *Decision point for the orchestrator before Phase 4 starts.*
- ReactiveController experiment for unrelated cross-cutting concerns
  (analytics, autosave). Track separately.
- Touching graphic-* and hottext interactions: not fully read in Phase 0.
  Treat them as Phase 3 follow-ups once the pattern is proven on the eight
  primary targets.

---

## Open questions for the orchestrator before execution

1. **Default class registered by `register.ts`** — lean or with-correct-response?
   Default behavior preserved (with) is safer; opt-in (lean) is the user's
   stated goal. Decide before Phase 4.
2. **Per-package or rolled-up entrypoint** — does `@citolab/qti-components`
   ship a top-level `register-all.ts`? If so, that file also needs a
   `register-all-with-correct-response.ts` sibling.
3. **portable-custom-interaction** — its correct-response logic (1788+) is
   complex enough that Phase 3 might warrant a sub-phase. Consider splitting.
