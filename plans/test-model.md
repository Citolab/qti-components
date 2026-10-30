# The test model from the XML

Roadmap phase T1, the first of three in the T track: this phase builds the model, phase T2
([computed-context.md](computed-context.md)) combines it into one context, phase T3
([item-lifecycle.md](item-lifecycle.md)) puts the rules in one state machine. Decisions go into
[host-api.md](host-api.md); this file is deleted when the phase ships. Found by reading source on
2026-10-30, checked against the QTI 3 XSD and spec text.

## The problem

`test-navigation` builds the structure and rules part of `computedContext`, and:

- **It reads the live DOM.** It runs `querySelectorAll` over the rendered test on `qc-test-loaded`
  and reads upgraded properties such as `maxAttempts`, and fills in item facts on
  `qti-assessment-item-connected`. That depends on registration, shadow roots and render timing.
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

Out of scope, recorded as gaps: `qti-selection` (only ordering is applied) and `qti-time-limits`.

## Where it is built from

| Source                                                                                               | For                                          |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| The test XML: the document `test-container` holds after `shuffleOrdering` and the transform callback | the test model: structure and resolved rules |
| Each item's XML: the document `_loadSingleItem` fetches                                              | the item facts                               |
| Events the elements already send (`qti-item-context-updated`, variable registration)                 | live state only (phase T2)                   |

Not the live DOM. Connected events are not used for structure: they need ordering and a "done"
signal, fire again on reconnect, and repeat what the XML already says. Pre-conditions and branch
rules keep their XML in the model; evaluating them stays a function of the test variables.

## Target shape

Two layers, each built by a pure function:

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

## Decide before the steps

- **Inheritance per attribute or per element?** When an item-ref declares
  `<qti-item-session-control show-feedback="true"/>`, do its other attributes come from the parent
  section, or from the element's defaults? Check the spec text with `/qti-spec-check`; the model
  follows it, with a fixture for each reading.
- **The old flat fields** (`maxAttempts`, `showFeedback`, `showSolution`, `allowSkipping` on the
  item): deprecated aliases for one major (recommended), or gone in this major.

## Steps

Each step is one PR into `next`.

- [ ] **T1a** `buildTestModel(doc)`: a pure function in `@qti-components/delivery` (T0), specs in node over
      fixtures with nested sections and session control at every level. `test-navigation` builds
      the structure of `computedContext` from it instead of querying the DOM. Fixes the nested
      sections.
- [ ] **T1b** Session control as JSON: `item.sessionControl` with all seven attributes, resolved;
      the old flat fields as decided above.
- [ ] **T1c** `readItemFacts(doc)` from the item XML in `_loadSingleItem`; the
      `qti-assessment-item-connected` listener goes.
- [ ] **T1d** Navigation and submission mode from the test part only: the section attributes and
      properties go, `test-next` and `_isLinearNavigationRestricted` read the part, and the
      "section-level linear mode" test in `navigation-mode.spec.ts` changes to assert QTI.

Order: T1a first; T1b, T1c and T1d after it, side by side.

## Done when

- The model is built from the XML with no element registered, and its specs cover nested sections
  and inheritance.
- Item facts come from the item XML, not from a connected event.
- No component reads `navigation-mode` or `submission-mode` off a section.
- The attempts-used and end-attempt specs and the linear, sequencing and adaptive stories pass.
