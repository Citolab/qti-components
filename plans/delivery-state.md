# The delivery state

Where the state of a test delivery lives, and what every context becomes. Agreed 2026-11-02; built
phase by phase in [roadmap 1](roadmap-qti-navigation.md), with no refactor up front.

## The model

- **One source of truth: `DeliveryState`** (`@qti-components/delivery`). It is private to
  `qti-test`, or to a server, and written only through commands. It is versioned JSON, so a stored
  state is read back or refused, never guessed at.
- **Contexts are inputs or derived views, never state.**
  - Inputs, from the host: `configContext`, `qtiContext`, `initContext` (`itemData`) and `view`.
  - Derived: `computedContext = derive(DeliveryState, inputs)`, read-only.
- **No separate `deliveryContext`**: nothing to keep in sync.
- **`initContext` augments `computedContext`**: host data sits under `item.data` (and maybe a
  test-level `data`); it never overrides a computed field (T2b).
- **`testContext` and `sessionContext` stop holding state.** Both are deprecated and removed in
  [roadmap 5](roadmap-host-api.md); `view` becomes an input.
- **`QtiTestState` stays the host's persistence format**, converted to and from `DeliveryState`
  (from T1). Whether the two formats merge later is open, for roadmap 2.
- **The XML is the only source; JSON is not a copy of it** (decided 2026-11-27, roadmap 1 T1). The
  content stays XML: the elements are the XML, and the fetched documents are kept
  (`itemRef.xmlDoc`). Persisted JSON (`QtiTestState`) holds only the candidate's state.
  `computedContext` holds only what the XML does not say directly (values resolved across levels,
  such as session control and item numbers) and the summary hosts and plugins read without knowing
  QTI XML; never mirrored content. It is rebuilt from the XML by pure functions (`buildTestModel`,
  `readItemFacts`), never edited, and not from the live DOM or connected events.
- **The rule: anything derivable is never stored**: `done`, the `can*` flags, scores, the resolved
  `sessionControl`, item facts.

## The seed

`qtiContext.seed` is the input for a first start. `DeliveryState.seed` persists the seed actually
used, and on resume it wins. [host-api.md](host-api.md) says the same (#328: "the seed is in the
state").

## Target fields

| Field       | What it holds                                                 | Phase   |
| ----------- | ------------------------------------------------------------- | ------- |
| `version`   | the shape's version; another version is refused               | T0      |
| `seed`      | the seed actually used (a branded `Seed` string)              | T0      |
| `startedAt` | when the test started, from the injected clock                | T0      |
| `current`   | the item instance on screen                                   | T0      |
| `order`     | the item instances after selection and ordering, written once | T1e, T4 |
| `testParts` | the status of each test part                                  | T7      |
| `outcomes`  | the test outcomes                                             | T8      |
| `timing`    | the time spent per test, part, section and item               | T5      |
| `plugins`   | what plugins keep, by plugin name, stored and restored unread | T1e     |
| `items`     | per item instance, below                                      | T0      |

Per item instance (`ItemInstanceId` → item):

| Field               | What it holds                                                               | Phase |
| ------------------- | --------------------------------------------------------------------------- | ----- |
| `itemRefIdentifier` | the item-ref it was selected from                                           | T0    |
| `occurrence`        | 1 for the first selection, 2 for its first clone (`with-replacement`)       | T0    |
| `lifecycle`         | `initial`, `interacting`, `suspended`, `closed`, `review` or `solution`     | T3    |
| `numAttempts`       | attempts so far                                                             | T3    |
| `duration`          | time spent `interacting`                                                    | T5    |
| `completionStatus`  | QTI's `completionStatus`                                                    | T3    |
| `responses`         | response variable values                                                    | T8    |
| `outcomes`          | outcome variable values                                                     | T8    |
| `templates`         | template variable values                                                    | T8    |
| `interactionState`  | opaque per-interaction state (a PCI's `getState()`), by response identifier | T8    |

T0 ships `version`, `seed`, `startedAt`, `current` and `items` with `itemRefIdentifier` and
`occurrence`; each phase adds its fields.

## Old states

9.x hosts store either `QtiTestState` (version 1) or the `testContext` and `sessionContext` it is
made from: `state` keeps each item's variables (identifier, type, value) and interaction state, the
test outcomes and the position, and leaves out what the XML gives on every load. Both keep
restoring on `next` (decided 2026-11-18):

- Version 1 is read for as long as hosts may hold it; a later version reads it too.
- A field version 1 lacks is derived or defaulted, and the phase that adds it says how: `order`
  from the seed the host passes (T1e), `lifecycle` from `numAttempts` and the session control
  (T3), `timing` from the stored `duration` (T5). Stored answers for items a selection leaves out
  are dropped, with a console warning (T4, decided 2026-11-27).
- Stored contexts convert to `QtiTestState` with a public function, `stateFromContexts` (T1e), so a
  host can convert what it stored before `testContext` and `sessionContext` are removed (roadmap 5).
- A state that cannot be read is not dropped silently: `qtiTest.state` reports it with
  `qc-test-state-refused` (T1e, decided 2026-11-27).
- `QtiTestState` converts to and from `DeliveryState` (T1e) with internal functions that nothing
  calls at runtime yet: `qti-test` keeps its state in its contexts until T2 and T3 derive from a
  `DeliveryState`. A version 1 state has no seed, order or start time, so the conversion takes them
  as inputs (the order from the rendered test, shuffled with the host's seed). The variables come
  back from the live contexts until T8. A position of only a section or a part (`navigate="section"`)
  does not survive the conversion, since `current` is an item instance (decided 2026-11-27).
- A spec restores real saved states from each host, anonymised, and runs in every phase:
  `apps/e2e/src/tests/stored-states.spec.ts`, over CitoTestUit's, the only host that stores state
  today (2026-11-27). It restores them the 9.x way (assign `testContext`, then `navigateTo`) and
  through `stateFromContexts`.

## Phase by phase

- **T0**: `SessionState` renamed `DeliveryState`; this file.
- **T1**: `order`, the resolved `sessionControl` (derived, not stored), the `QtiTestState`
  conversions.
- **T2**: `computedContext` as the derivation; `initContext` into `item.data`; `stampContext` the stamp's
  flat view of the current part.
- **T3**: `lifecycle`, `numAttempts`, `completionStatus`; the `can*` flags derived from them.
- **T4**: `order` written once from the seed: the rendered test's instance ids, a
  `with-replacement` clone as `item-3#2` wherever ordering puts it.
- **T5**: `timing` and `duration`.
- **T8**: the variables move into `DeliveryState`; `testContext` retires.
- **Roadmap 5**: `sessionContext` and `testContext` deprecated and removed; `view` an input; maybe
  `computedContext` renamed.
