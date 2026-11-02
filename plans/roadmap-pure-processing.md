# Roadmap 3: response processing as pure functions

The third sub-roadmap (see [ROADMAP.md](ROADMAP.md)): response, outcome and template processing as
pure functions that run in the browser and under Node, from the same code. It starts when
[roadmap 1](roadmap-qti-navigation.md) is done and runs next to roadmap 2 (the CitoTestUit pilot,
which scores with the .NET [qti-scoring-engine](https://github.com/Citolab/qti-scoring-engine)), in
`qti-processing` only. The rules in [ROADMAP.md](ROADMAP.md) → "In every phase" apply. Plans are
written before each phase starts.

## The design

- **Value rules per operator**: `and(values)`, `equal(a, b, attrs)` and so on, with QTI's NULL and
  cardinality rules, no element involved. Much of this is already in the operators' mixins.
- **One evaluator that walks the XML**: it reads only `localName`, attributes and children, and
  calls the operator for each node. A custom element in the browser and an `@xmldom/xmldom` node in
  Node are both an `Element`, so the same evaluator walks both.
- **A custom element's `calculate()` calls the evaluator** and behaves as it does now.
- **The rule that makes it work**: the evaluator reads attributes, never properties of an upgraded
  element, and gets variables from a `ctx` passed in, never from Lit context or `closest`.
- It plugs into roadmap 1's processing seam (T0), so `delivery` does not change.

What has to move, read from source on 2026-10-30: 76 operators and about 4,600 lines; 46 files
read variables through Lit context, `closest` or the item; 20 use `@property`; rules such as
`qti-set-outcome-value` write into the item; `qti-response-processing` substitutes its template in
the DOM; `qti-assessment-item` resets outcomes and keeps `numAttempts` and `completionStatus`.

## Status

| #   | Phase                                     | Needs | Status |
| --- | ----------------------------------------- | ----- | ------ |
| P1  | A vertical slice: `match_correct`         | none  | todo   |
| P2  | Every operator                            | P1    | todo   |
| P3  | Templates and the steps around processing | P2    | todo   |

"none" means nothing beyond roadmap 1.

## Phases

### P1. A vertical slice: `match_correct`

- [ ] The evaluator, `ctx`, and the operators the `match_correct` template needs (about ten), as
      pure functions; their elements call them.
- [ ] The slice runs under Node on `@xmldom/xmldom` and in the browser, on the same cases.
- [ ] The .NET engine's test resources (`Scoring.Tests/Resources`) as the check: the JS evaluator
      scores them as the .NET engine does.

Done when: a `match_correct` item scores the same in the browser, under Node and in .NET.

### P2. Every operator

- [ ] The remaining operators and rules, each checked against the .NET cases that cover it; the
      ones .NET does not cover keep their own specs.
- [ ] No operator reads a property of an upgraded element or a Lit context.

Done when: the evaluator scores every .NET case the browser scores, under Node.

### P3. Templates and the steps around processing

- [ ] Template substitution on the XML, before evaluation, not in the DOM.
- [ ] Resetting outcomes, `numAttempts` and `completionStatus` in the evaluator, so
      `qti-assessment-item` only calls it; outcome processing of the test the same way.
- [ ] An export from `@qti-components/processing`, experimental until a server uses it.

Done when: `qti-assessment-item` and the test call only the evaluator, and a Node script scores an
item and a test with no browser.
