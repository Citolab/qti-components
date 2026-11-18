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

### Items and sections: two flat lists (option C)

Decided with the user on 2026-11-18. The shape ships in 10.0 and is the one later phases build on
(T3–T8, adaptive sections in roadmap 4), so they only add fields.

```ts
interface ComputedTestPart {
  identifier: string;
  navigationMode: 'linear' | 'nonlinear';
  submissionMode: 'individual' | 'simultaneous';
  active: boolean;
  /** Every item of the part, in document order, nested sections included. */
  items: ComputedItem[];
  /** Every section of the part once, depth first (a section before its subsections). */
  sections: ComputedSection[];
}
interface ComputedSection {
  identifier: string;
  title: string;
  /** QTI `visible`: a section with `visible="false"` groups items the candidate does not see as a group. */
  visible: boolean;
  /** The enclosing section, or null for a section directly in the part. */
  parentId: string | null;
  /** 0 for a section directly in the part. */
  depth: number;
  active: boolean;
  /** Every item in the section and its subsections is completed. */
  completed: boolean;
  /** A view of `items`: this section's own items, in document order. */
  items: ComputedItem[];
}
interface ComputedItem {
  /** The item instance: the item-ref identifier, plus `#2`, `#3` for a `with-replacement` clone (T4). */
  instance: string;
  /** The `qti-assessment-item-ref` identifier. */
  identifier: string;
  /** The innermost section the item-ref is in. */
  sectionId: string;
  /** The number in document order, counting no info items; null for an info item. */
  index: number | null;
  sessionControl: SessionControl;
  // … item facts, live state and `data` as above
}
```

- **Why two flat lists.** What most readers want is every item in test order (navigation bars,
  `test-stamp`, bookmark, scoring buttons, tts): `part.items`. What section navigation wants is the
  sections with their titles and state: `part.sections`. Nesting and `visible` are there for the
  few tests that use them, through `parentId` and `depth`, without recursive templates; a tree can
  be built from them.
- **Rejected:** today's flat `sections` alone (T1a: interleaved item-refs and subsections are out of
  order, no parent or visibility), and a tree of `content` entries (breaks every reader, needs
  recursive stamp templates, "all items" needs a walk).
- **Migration:** a reader of `part.sections.flatMap(section => section.items)` reads `part.items`;
  `section.items` stays, as a view. Host-migration entries for every host that reads
  `computedContext` (CitoTestUit, Examenkompas, PeilingLezen) and the six qti-extended plugins.

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
- [ ] **T2d** The two flat lists (option C above): `part.items` in document order with `instance`,
      `sectionId` and `index`; `part.sections` with `parentId`, `depth` and `visible`;
      `section.items` a view. The six qti-extended plugins and the stamp templates in stories read
      `part.items`.

Order: side by side.

## Done when

- `<test-stamp>` stays, keeps no context of its own, and its templates read `computedContext`.
- No host value overrides a computed field.
- `part.items` lists every item once in document order, nested sections and interleaved item-refs
  included, and `part.sections` carries `parentId`, `depth` and `visible`.
- Host-migration entries for CitoTestUit, Examenkompas and Peilinglezen, linked from the changesets.
