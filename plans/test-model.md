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

**The XML is the only source; JSON is not a copy of it.** The content stays XML: the elements are
the XML, and the fetched documents are kept (`itemRef.xmlDoc`). Persisted JSON (`QtiTestState`)
holds only the candidate's state. `computedContext` holds only what the XML does not say directly
(values resolved across levels, such as session control and item numbers) and the summary hosts
and plugins read without knowing QTI XML; never mirrored content. It is rebuilt from the XML by
pure functions (`buildTestModel`, `readItemFacts`), never edited, and a value that can be derived
when read is derived, not stored (T1e). Decided 2026-11-27.

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
  kind: 'section';
  identifier: string;
  title: string;
  visible: boolean;
  sessionControl: SessionControl; // resolved
  content: (SectionModel | ItemRefModel)[]; // item-refs and subsections, in document order
}
interface ItemRefModel {
  kind: 'itemRef';
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
  identifier: string; // the item's own; computedContext carries it as `assessmentItemIdentifier`
  adaptive: boolean;
  timeDependent: boolean;
  hasCorrectResponse: boolean;
  hasResponseProcessing: boolean;
  externalScored: 'human' | 'externalMachine' | null; // on the SCORE outcome declaration
  label: string | null;
  title: string;
}
```

## Decided before the steps

Decided with the user on 2026-11-02.

- **Inheritance is per attribute.** Each attribute comes from the closest level that declares it
  (item-ref, the enclosing sections, the test part), its default only when none does. The spec
  text: a test-part setting applies "unless the setting is overridden", and the defaults "are used
  only in the absence of any applicable constraint" (info model §7.19, implementation guide
  §4.4.2). The XSD puts `default=` on six of the seven attributes (not `max-attempts`), which a
  schema-aware reader would fill in per element; behaviour is the spec text's, and a browser's
  parser never applies XSD defaults. `max-attempts` resolves to 1 when no level declares it.
- **The old flat fields go in this major** (`maxAttempts`, `showFeedback`, `showSolution`,
  `allowSkipping` on the item), replaced by `item.sessionControl` in T1b, with host-migration
  entries.
- **Document order is kept in the model**: a section has one `content` list of item-refs and
  subsections, in document order, as the XML has them (not separate `sections` and `itemRefs`).
- **Nested sections in `computedContext`** are a flat list until T2d, which makes it the tree of
  the test (decided 2026-11-18, [computed-context.md](computed-context.md)): every section once,
  depth first, each with only its own item-refs; a section that only holds subsections has
  `items: []` and is completed when theirs are. Item `index` follows document order, so it matches
  `test-next` where item-refs and subsections interleave.

## Steps

Each step is one PR into `next`.

- [x] **T1a** `buildTestModel(doc)`: a pure function in `@qti-components/delivery` (T0), specs in node over
      fixtures with nested sections and session control at every level. `test-navigation` builds
      the structure of `computedContext` from it instead of querying the DOM. Fixes the nested
      sections.
- [x] **T1b** Session control as JSON: `item.sessionControl` with all seven attributes, resolved;
      the old flat fields as decided above.
- [x] **T1c** `readItemFacts(doc)` from the item XML in `_loadSingleItem`; the
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
