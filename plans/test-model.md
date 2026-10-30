# The test model and one computed context

Roadmap phase 17. Decisions go into [host-api.md](host-api.md); this file is deleted when the phase
ships. Found by reading source on 2026-10-30, checked against the QTI 3 XSD and spec text.

## The problem

`computedContext` (built by `test-navigation`) and `stampContext` (built by `test-stamp`) together
describe the test, but:

- **They mix four kinds of data in one object** that is rebuilt on every change: the test's
  structure, its resolved session-control rules, facts about each item, and the candidate's live
  state. The stamp's `activeTestpart`, `activeSection` and `activeItem` are a fifth: views of the
  other four, stored as copies (`activeTestpart.items` is the part's items flattened again).
- **They are read from the live DOM.** `test-navigation` runs `querySelectorAll` over the rendered
  test on `qc-test-loaded` and reads upgraded properties such as `maxAttempts`, and fills in item
  facts on `qti-assessment-item-connected`. That depends on registration, shadow roots and render
  timing.
- **Nested sections are wrong.** The deep query puts an item of a nested section in the outer
  section too, and session control falls back to the test part only, so a nested section does not
  inherit from its parent section.
- **Only four of the seven session-control attributes are carried** (`max-attempts`,
  `show-feedback`, `show-solution`, `allow-skipping`), flattened onto the item, so a reader cannot
  tell a declared value from an inherited one. `allow-review`, `allow-comment` and
  `validate-responses` are missing, and nothing says that `allow-skipping` and
  `validate-responses` apply only in a part with individual submission.
- **Sections carry `navigation-mode` and `submission-mode`.** The XSD defines them only on
  `qti-test-part`. `qti-assessment-section` declares the attributes, `test-next` and
  `_isLinearNavigationRestricted` read them, and `apps/e2e/src/tests/navigation-mode.spec.ts`
  ("section-level linear mode") asserts the non-QTI behaviour.
- **Host data overrides our fields.** `initContext` / `itemData` is spread last over each computed
  item, so a host can replace `maxAttempts` or `externalScored`. Examenkompas relies on that for
  `externalScored`.
- **The rules are re-derived by five actors**: `test-navigation` (done, lock, auto-score),
  `test-next`, `test-prev`, `test-end-attempt` and `qti-feedback` each work out attempts left,
  skipping, linear restrictions or feedback on their own.

Out of scope, recorded as gaps: `qti-selection` (only ordering is applied), `qti-time-limits`, and
response processing deferred to the end of a simultaneous part (phase 7).

## Where it is built from

| Source                                                                                               | For                                          |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| The test XML: the document `test-container` holds after `shuffleOrdering` and the transform callback | the test model: structure and resolved rules |
| Each item's XML: the document `_loadSingleItem` fetches                                              | the item facts                               |
| Events the elements already send (`qti-item-context-updated`, variable registration)                 | live state only                              |

Not the live DOM. Connected events are not used for structure: they need ordering and a "done"
signal, fire again on reconnect, and repeat what the XML already says. Pre-conditions and branch
rules keep their XML in the model; evaluating them stays a function of the test variables.

## Target shape

Three layers, each built by a pure function:

```ts
// 1. From the test XML, once per load.
interface TestModel {
  identifier: string;
  title: string;
  testParts: TestPartModel[];
}
interface TestPartModel {
  identifier: string;
  navigationMode: 'linear' | 'nonlinear';
  submissionMode: 'individual' | 'simultaneous';
  sessionControl: SessionControl; // resolved
  sections: SectionModel[];
}
interface SectionModel {
  identifier: string;
  title: string;
  visible: boolean;
  sessionControl: SessionControl; // resolved
  sections: SectionModel[]; // nested, in order
  itemRefs: ItemRefModel[];
}
interface ItemRefModel {
  identifier: string;
  href: string;
  categories: string[];
  sessionControl: SessionControl; // resolved
  declaredSessionControl: Partial<SessionControl>; // what this ref says itself
}
interface SessionControl {
  maxAttempts: number; // 0 = unlimited; ignored for adaptive items
  showFeedback: boolean;
  allowReview: boolean;
  showSolution: boolean;
  allowComment: boolean;
  allowSkipping: boolean; // applies in individual submission only
  validateResponses: boolean; // applies in individual submission only
}

// 2. From each item's XML, when it is fetched.
interface ItemFacts {
  adaptive: boolean;
  timeDependent: boolean;
  hasCorrectResponse: boolean;
  hasResponseProcessing: boolean;
  externalScored: string | null;
  label: string;
  title: string;
}
```

3. `computedContext` combines the model, the facts, `testContext` and `sessionContext`. Per item:
   `sessionControl`, its state (`numAttempts`, `completionStatus`, score, `valid`), the answers of
   the rules module (`done`, `attemptsUsed`, `mayEndAttempt`, `maySkip`, `mayShowFeedback`,
   `mayShowSolution`, `mayReview`) and `data`, the host's `itemData` under its own key. At the top:
   `active: { testPart, section, item }`, the views the stamp renders.

The rules module is a pure function `(model, facts, state) → answers`, plus the navigation answers
(`mayGoNext`, `mayGoPrevious`). It is a function the session-rules mixin of phase 1 calls, not a
controller (`.claude/rules/lit.md`).

## Decide before the steps

- **Inheritance per attribute or per element?** When an item-ref declares
  `<qti-item-session-control show-feedback="true"/>`, do its other attributes come from the parent
  section, or from the element's defaults? Check the spec text with `/qti-spec-check`; the model
  follows it, with a spec for both readings' fixture.
- **Examenkompas and `externalScored`.** QTI puts `external-scored` on the outcome declaration.
  Either the items carry it, or `data.externalScored` is read where scoring decides. Ask, then write
  its host-migration entry.
- **The old flat fields and `stampContext`**: deprecated aliases for one major (recommended), or
  gone in this major.

## Steps

Each step is one PR into `next`.

- [ ] **17a** `buildTestModel(doc)`: a pure function in `qti-test/internal`, specs in node over
      fixtures with nested sections and session control at every level. `test-navigation` builds
      the structure of `computedContext` from it instead of querying the DOM. Fixes the nested
      sections.
- [ ] **17b** Session control as JSON: `item.sessionControl` with all seven attributes, resolved;
      `maxAttempts`, `showFeedback`, `showSolution`, `allowSkipping` on the item stay as deprecated
      aliases.
- [ ] **17c** The stamp merge: `computedContext.active` holds the views; `test-stamp` renders from
      them; `stampContext` and `qti-stamp-context-updated` are deprecated aliases. CitoTestUit
      (`nav-list.tsx`, `AssessmentPlayerView.tsx`) gets a host-migration entry.
- [ ] **17d** `readItemFacts(doc)` from the item XML in `_loadSingleItem`; the
      `qti-assessment-item-connected` listener goes.
- [ ] **17e** Host data under `item.data`; it no longer overrides computed fields. Host-migration
      entries for Examenkompas (`initContext`) and CitoTestUit.
- [ ] **17f** Navigation and submission mode from the test part only: the section attributes and
      properties go, `test-next` and `_isLinearNavigationRestricted` read the part, and the
      "section-level linear mode" test in `navigation-mode.spec.ts` changes to assert QTI.
- [ ] **17g** The rules module: `test-next`, `test-prev`, `test-end-attempt`, `qti-feedback` and the
      item lock read its answers instead of deriving their own.

Order: 17a first; 17b, 17d, 17e and 17f after it, side by side; 17c after 17b; 17g last.

## Done when

- The model is built from the XML with no element registered, and its specs cover nested sections
  and inheritance.
- No component reads `navigation-mode` or `submission-mode` off a section.
- Every reader of attempts, skipping, feedback or linear navigation reads the rules module.
- The attempts-used and end-attempt specs and the linear, sequencing and adaptive stories pass.
- Host-migration entries for CitoTestUit, Examenkompas and Peilinglezen, linked from the changesets.
