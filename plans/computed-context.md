# One computed context

Roadmap phase T2. Needs phase T1 (done); runs next to phase T3
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
and `data`, the host's `itemData` under its own key.

### The test as a tree; the stamp's flat view

Decided with the user on 2026-11-18. It replaces "two flat lists" (option C), chosen earlier the
same day. The shape ships in 10.0 and later phases build on it (T3–T8, adaptive sections in
roadmap 4): they only add fields.

**Why this split** (the user's reasons):

- **`computedContext` is the test as it is.** It is a realistic representation of all derived
  state in the structure of the `qti-assessment-test`: test parts, sections nested as the test
  nests them, item-refs in document order. Reading it is reading the test, so a plugin or host
  component that subscribes to it through Lit context sees the same tree an author wrote.
- **Flat is a view, so it lives with what needs it.** The stamp templates loop with a
  non-recursive `repeat`, so they need flat lists; that is a presentation need, and it belongs to
  `<test-stamp>`, not in the model everyone reads.
- **The stamp needs the current test part only.** What a stamp shows (numbered navigation,
  progress, the active section and item) is about where the candidate is. Other test parts add
  nothing: with T7 a candidate cannot go back to an earlier part.

```ts
// computedContext: the tree.
interface ComputedTestPart {
  identifier: string;
  navigationMode: 'linear' | 'nonlinear';
  submissionMode: 'individual' | 'simultaneous';
  active: boolean;
  sections: ComputedSection[]; // nested, as in the test
}
interface ComputedSection {
  kind: 'section';
  identifier: string;
  title: string;
  /** QTI `visible`: a section with `visible="false"` groups items the candidate does not see as a group. */
  visible: boolean;
  active: boolean;
  /** Every item in the section and its subsections is completed. */
  completed: boolean;
  /** The item-refs and subsections directly inside, in document order. */
  content: (ComputedSection | ComputedItem)[];
}
interface ComputedItem {
  kind: 'item';
  /** The item instance: the item-ref identifier, plus `#2`, `#3` for a `with-replacement` clone (T4). */
  instance: string;
  /** The `qti-assessment-item-ref` identifier. */
  identifier: string;
  /** The number in document order, counting no info items; null for an info item. */
  index: number | null;
  sessionControl: SessionControl;
  // … item facts, live state and `data` as above
}

// stampContext: <test-stamp>'s flat view of the current test part, derived on every update.
interface StampContext {
  view: View;
  test: { identifier: string; title: string }; // no test parts
  activeTestpart: ComputedTestPart & {
    items: ComputedItem[]; // every item of the part, in document order
    sections: (ComputedSection & { parentId: string | null; depth: number; items: ComputedItem[] })[]; // flat, depth first
  };
  activeSection: ComputedSection & { items: ComputedItem[] }; // its own items
  activeItem: ComputedItem;
}
```

- **Helpers for flat readers.** Host navigation bars (CitoTestUit, Examenkompas, PeilingLezen) and
  five plugins (bookmark, scoring buttons, character sheet, zoom, tts) want every item in order.
  `@qti-components/test` exports small functions over the tree, next to `pluginState` and
  `bookmarkedItems`: `itemsInOrder(part)`, `sectionsInOrder(part)`, and `activeTestPart`,
  `activeSection`, `activeItem` of a `computedContext`.
- **`stampContext` stays** as `<test-stamp>`'s own view, derived from `computedContext` on every
  update, never a copy that has to be kept in step. Its template names stay (`activeTestpart`,
  `activeSection`, `activeItem`, `test`, `view`), so stamp templates do not change.
- **If whole-test progress is wanted** ("question 12 of 40" across parts), `test` gets a summary
  (an item count per part), not the other parts.
- **Rejected:** two flat lists in `computedContext` (option C: serves flat readers directly, but
  puts a presentation shape in the model everyone reads); today's flat `sections` alone (T1a:
  interleaved item-refs and subsections are out of order, no visibility); a tree with no flat view
  (stamp templates would need recursion).
- **Migration:** a reader of `part.sections.flatMap(section => section.items)` calls
  `itemsInOrder(part)`. Host-migration entries for every host that reads `computedContext`
  (CitoTestUit, Examenkompas, PeilingLezen) and the six qti-extended plugins.

## Decided before the steps

With the user on 2026-11-27; each moves to [host-api.md](host-api.md) → Decided.

- **`externalScored` comes from the item.** QTI puts `external-scored` on the `SCORE` outcome
  declaration, and the item facts already read it. Host data never sets it (T2b); both scoring
  plugins read that one field. Examenkompas, which sets it through `initContext` from its own score
  types, sets the attribute in its `postLoadTransformCallback` instead (host-migration entry).
  Rejected: the scoring plugins reading `data.externalScored` (a non-QTI override kept in our
  plugins).
- **`qti-stamp-context-updated` becomes `qc-stamp-context-updated`** (T2a), the old name sent next
  to it for one major. `qti-computed-context-updated` keeps its name here; phase 14 renames it.
- **T2c is a step of its own, first**: one pure function derives `computedContext` from its inputs
  on every update, so T2b can prove that no host value overrides a computed field and T2d reshapes
  one function. `DeliveryState` is not live at runtime yet, so for now the inputs are the test model,
  the item facts, `testContext`, `sessionContext`, `config` and `initContext`, plus the optimality
  of each item's last ended attempt (kept by `test-navigation`); T3 and T8 move the candidate's state
  into `DeliveryState`. Read-only means never written back, not frozen; the context symbol is typed
  `Readonly` (shallow), and the types become `readonly` throughout with T2d's new types.
- **Kennisnet is a host of T2b and T2a too** (found 2026-11-27): `updateItems.ts` passes each item's
  info and a `test` object through `initContext`, and `player.html`'s stamp templates read
  `activeItem.test.*`; both get host-migration entries.
- **Order**: T2c, T2b, T2d, T2a. T2a's flat view is derived from T2d's tree, so it comes last.

## Steps

Each step is one PR into `next`, in this order.

- [x] **T2c** `computedContext` derived anew on every update by one pure function
      (`deriveComputedContext`, internal to `@qti-components/test`), never from the previous
      context; the per-item computation moves out of `test-navigation`.
- [ ] **T2a** The stamp's view: `stampContext` is `<test-stamp>`'s flat view of the current test
      part, derived from `computedContext` on every update (above): `activeTestpart.items` in
      document order across nested sections, `activeTestpart.sections` flat with `parentId`,
      `depth` and `visible`. CitoTestUit (`nav-list.tsx`, `AssessmentPlayerView.tsx`) gets a
      host-migration entry if what its templates read changes.
- [ ] **T2b** Host data under `item.data`; it no longer overrides computed fields. Host-migration
      entries for Examenkompas (`initContext`), CitoTestUit and Peilinglezen.
- [ ] **T2d** The tree: `computedContext.testParts[].sections` nested as in the test, each section's
      `content` in document order, items with `instance` and `index`; the helpers
      (`itemsInOrder`, `sectionsInOrder`, `activeTestPart`, `activeSection`, `activeItem`)
      exported; the six qti-extended plugins use them.

## Done when

- `<test-stamp>` stays; `stampContext` is derived from `computedContext` on every update and
  holds only the current test part, flat.
- No host value overrides a computed field.
- `computedContext` nests sections as the test does, item-refs and subsections in document order;
  `itemsInOrder(part)` lists every item once in document order, interleaved item-refs included.
- Host-migration entries for CitoTestUit, Examenkompas and Peilinglezen, linked from the changesets.
