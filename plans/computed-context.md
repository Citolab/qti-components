# One computed context

Roadmap phase T2. Needs phase T1 ([test-model.md](test-model.md)); runs next to phase T3
([item-lifecycle.md](item-lifecycle.md)). Decisions go into [host-api.md](host-api.md); this file is
deleted when the phase ships. Found by reading source on 2026-10-30.

## The problem

`computedContext` (built by `test-navigation`) and `stampContext` (built by `test-stamp`) together
describe the test, but:

- **They mix four kinds of data in one object** that is rebuilt on every change: the test's
  structure, its resolved session-control rules, facts about each item, and the candidate's live
  state. The stamp's `activeTestpart`, `activeSection` and `activeItem` are a fifth: views of the
  other four, stored as copies (`activeTestpart.items` is the part's items flattened again).
- **Host data overrides our fields.** `initContext` / `itemData` is spread last over each computed
  item, so a host can replace `maxAttempts` or `externalScored`. Examenkompas relies on that for
  `externalScored`.

## Target shape

`computedContext` is a pure combination of the test model and item facts (phase T1),
`testContext` and `sessionContext`. Per item: `sessionControl`, its state (`numAttempts`,
`completionStatus`, score, `valid`), its lifecycle state and the rule answers once phase T3 lands,
and `data`, the host's `itemData` under its own key. At the top: `active: { testPart, section,
item }`, the views the stamp renders, derived on read, not stored copies.

## Decide before the steps

- **Examenkompas and `externalScored`.** QTI puts `external-scored` on the outcome declaration.
  Either the items carry it, or `data.externalScored` is read where scoring decides. Ask, then write
  its host-migration entry.
- **`stampContext` and `qti-stamp-context-updated`**: deprecated aliases for one major
  (recommended), or gone in this major.

## Steps

Each step is one PR into `next`.

- [ ] **T2a** The stamp merge: `computedContext.active` holds the views; `<test-stamp>` stays and
      renders from them; `stampContext` as decided above. CitoTestUit (`nav-list.tsx`,
      `AssessmentPlayerView.tsx`) gets a host-migration entry.
- [ ] **T2b** Host data under `item.data`; it no longer overrides computed fields. Host-migration
      entries for Examenkompas (`initContext`), CitoTestUit and Peilinglezen.

Order: side by side.

## Done when

- `<test-stamp>` stays, keeps no context of its own, and its templates read `computedContext`.
- No host value overrides a computed field.
- Host-migration entries for CitoTestUit, Examenkompas and Peilinglezen, linked from the changesets.
