# Correct-response: dynamic attributes, visual unification, story coverage

Supersedes and replaces three plans, deleted 2026-09-01:
`correct-response-attributes-and-stories.md`, `correct-response-view-modes-dynamic.md`,
`correct-response-unification.md`. They overlapped on the same deliverable (a per-interaction
overview story) and their Phase 0 sections described a tree that no longer exists.

`separate-correct-response.md` is kept separately: its Phases 1-3 landed, 4-6 are explicitly
deferred, and it is the record of that decision.

## Goal

Every interaction that supports a correct response is fully controllable from markup —
`response`, `correct-response`, `show-correct-response`, `show-full-correct-response`,
`show-candidate-correction` — with every attribute taking effect **when changed at runtime**,
not only at boot. A Storybook story then demonstrates every view mode of every interaction as
pure markup: no `play()`, no `qti-assessment-item` wrapper, no `configContext` provider.

**Allowed breaking surface: CSS only.** Behaviour and TypeScript surface stay back-compat.

---

## Phase 0 — State of the tree (re-derived 2026-09-01, supersedes all three old Phase 0s)

The architecture moved since the old plans were written. What they call
`packages/qti-base/src/mixins/correct-response.mixin.ts`, `LeanInteraction`, and
`ChoiceCorrectResponseMixin` **do not exist**. Current layout:

| Thing | Where it lives now |
|---|---|
| `CorrectResponseMixin`, `Correctness`, `CorrectResponseInterface` | `packages/qti-corrections/src/mixins/correct-response.mixin.ts` |
| Candidate-correction, choice, drag-drop, active-element correction mixins | `packages/qti-corrections/src/mixins/*.mixin.ts` |
| 16 correction interactions | `packages/qti-corrections/src/interactions/` |
| Response attribute codec | `packages/qti-base/src/lib/response.ts` (`responseAttributeConverter`) |
| Scoped-registry wiring | `packages/qti-corrections/src/elements.ts`, exercised by `item-container.registry.spec.ts` |

### Already fixed — do NOT redo

- **The four wrong-name overrides are gone.** No interaction overrides the public dispatcher
  `toggleCorrectResponse` any more; every override targets `toggleInternalCorrectResponse` or
  `toggleCandidateCorrection`. (Was Phase 1 of `attributes-and-stories`.)
- **The three `show-*` attributes are reflected properties with watchers** —
  `correct-response.mixin.ts:57-82`. Toggling them at runtime already re-runs the toggle methods.
- **`response` is a real attribute on ~10 interactions**, using the shared converter: choices
  mixin, drag-drop-slotted, text-entry, extended-text, slider, select-point, graphic-associate,
  inline-choice, PCI.
- **`answer` token + badge landed** — `@define-mixin answer` / `answer-check` and the
  `--qti-answer-*` variables in `qti-theme`. (Was unification Phases 1-2.)
- **`.correct-option` is dead** — one historical comment in `correction.styles.ts`, no producer.
  (Was unification Phase 5.)

### The three real gaps

1. **`response` changes do not propagate on most interactions.** `@watch('response')` exists in
   exactly three places — `choices.mixin.ts:59`, `extended-text:167`, `text-entry:53`. Everywhere
   else, setting `response="…"` after first render updates the property but re-runs neither the
   visual sync nor `toggleCandidateCorrection`. So `<qti-x response="new" show-candidate-correction>`
   keeps showing the correction computed from the old response.
2. **`qti-corrections` ships zero stories.** All correction stories (5 files) live in
   `apps/e2e/src/stories/`, and only 2 of them are per-interaction correct-response stories
   (inline-choice, PCI). 14 of 16 correction interactions have no view-mode story at all.
3. **`extended-text` is undecided.** Spec-wise it has no correct response; a
   `QtiExtendedTextInteractionCorrection` exists anyway. Decide, then either document the
   deviation or delete the class.

---

## Phase 1 — Response propagation audit + fix

For each interaction with a `response` attribute but no watcher, add the watcher pattern:

```ts
@watch('response', { waitUntilFirstUpdate: true })
protected _handleResponseChange = () => {
  this._applyResponseToVisual();
  if (this.showCandidateCorrection) this.toggleCandidateCorrection(true);
};
```

Order: drag-drop-backed (order, match, gap-match, associate) first — they share
`drag-drop-slotted.mixin.ts:356`, so one fix may cover four. Then slider, select-point,
graphic-associate, inline-choice, PCI individually.

Exit: for every interaction, mutating `response` in devtools with `show-candidate-correction`
set visibly recomputes the correction.

## Phase 2 — Decide where correction stories live

A decision, not code, and it blocks Phase 3. `qti-corrections` is now its own package with its own
scoped registry, but has no Storybook presence; `apps/e2e` has the stories but composes them by
hand. Options: (a) stories move into `qti-corrections/src`, registered against
`correctionRegistry`; (b) stories stay in `apps/e2e` as an integration surface. Record the choice
in this file before writing 14 story files against it.

## Phase 3 — The view-mode overview story, per interaction

One story per correction interaction, pure markup, one panel per view-mode combination:
candidate-correction-correct, candidate-correction-incorrect, `show-correct-response`,
`show-full-correct-response`, plus the pairwise and all-three combos, plus a partial-credit panel
where the interaction supports multiple responses. No `play`, no item wrapper.

Build one first (choice or inline-choice), agree it, then fan out. Tag them `vrt` so the existing
screenshot baseline covers them.

## Phase 4 — Unification tail

Unification Phases 1, 2 and 5 landed. Verify — and only fix what is actually still divergent —
its Phase 3 (the grip and the drag bank) and Phase 4 (inline-choice). Do this **after** Phase 3
above, because the overview stories are what make the divergence visible.

## Phase 5 — `extended-text` decision + cleanup

Decide, act, and record the reasoning here.

---

## Anti-patterns

- Do not reintroduce `play()` steps that call methods on the component — the point is that markup
  alone drives every mode.
- Do not wrap panels in `qti-assessment-item`; interactions must work standalone.
- Do not invent a new attribute codec — use `responseAttributeConverter` from
  `packages/qti-base/src/lib/response.ts`.
- Do not trust file paths quoted in older plan text; this Phase 0 is the current map.
