# @qti-components/delivery

## 0.1.0-next.2

### Minor Changes

- [#371](https://github.com/Citolab/qti-components/pull/371) [`7bd2a63`](https://github.com/Citolab/qti-components/commit/7bd2a63bf8961431aaba82a3aeaf3b787a7d2e1d) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTest.state` reports a value it cannot read with `qc-test-state-refused` (`{ message, state }`), sent once the test has loaded, instead of only a console warning; the test goes on without it (host migration: [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md)).

  `DeliveryState` (experimental) gets `order`, the item instances after selection and ordering, and `plugins`. `createDeliveryState` takes an `order`, and `parseDeliveryState` checks every field and refuses a state with a missing or mistyped one.

## 0.1.0-next.1

### Minor Changes

- [#367](https://github.com/Citolab/qti-components/pull/367) [`a21ff80`](https://github.com/Citolab/qti-components/commit/a21ff8027f0169abad74ef4dd4bc346f18035211) Thanks [@herrKlein](https://github.com/herrKlein)! - `readItemFacts(item)` in `@qti-components/delivery` reads what a `qti-assessment-item` says about itself from its XML (`adaptive`, `timeDependent`, `hasCorrectResponse`, `hasResponseProcessing`, `externalScored`, `label`, `title`, `identifier`), with no browser and no element registered. `qti-test` reads them when it fetches an item, and `computedContext` items carry them from there instead of from the rendered item on `qti-assessment-item-connected` (roadmap 1, T1c).

  Fix: a computed item's `externalScored` now has the `external-scored` value of the item's `SCORE` outcome declaration (`human` or `externalMachine`). It was always null, because the attribute was read as `externalScored`; `test-scoring-feedback` now shows the external-scoring texts for such items. A host's `itemData` still overrides it.

## 0.1.0-next.0

### Minor Changes

- [#358](https://github.com/Citolab/qti-components/pull/358) [`8df1bea`](https://github.com/Citolab/qti-components/commit/8df1beaa8b9833661cb91f5daa067101eb5c8f99) Thanks [@herrKlein](https://github.com/herrKlein)! - New, experimental package: `@qti-components/delivery`, the QTI 3 delivery engine with no browser globals, so the same code runs in the browser and on a Node server. This first release holds the seeded random and the fixed-aware shuffle (moved from `@qti-components/transformers`, with identical output), the versioned delivery state (`DeliveryState`), the command and effect types, an injected clock and the interface to response and outcome processing. Its API may change in any 0.x release.

- [#360](https://github.com/Citolab/qti-components/pull/360) [`f1718a8`](https://github.com/Citolab/qti-components/commit/f1718a843fafef1e339daa4ddac38d3338f1f34e) Thanks [@herrKlein](https://github.com/herrKlein)! - `@qti-components/delivery` builds the test model from a `qti-assessment-test`'s markup: `buildTestModel` returns the test parts and, in document order, the nested sections and item-refs, with `qti-item-session-control` resolved per attribute, under Node (xmldom) and in the browser alike.

  `test-navigation` now builds `computedContext` from that model instead of querying the rendered test. Two behaviour changes for tests that nest sections or declare part of a `qti-item-session-control` below another one (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)):

  - A nested section is listed once in `computedContext.testParts[].sections`, with only its own item-refs, so every item appears once; item `index` follows the test's document order.
  - Session control inherits per attribute, as QTI 3 says: an item-ref that declares only `show-feedback` keeps its section's `max-attempts`, and a nested section inherits from its parent section.
