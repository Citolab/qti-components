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
- **The rule: anything derivable is never stored**: `done`, the `can*` flags, scores, the resolved
  `sessionControl`, item facts.

## The seed

`qtiContext.seed` is the input for a first start. `DeliveryState.seed` persists the seed actually
used, and on resume it wins. [host-api.md](host-api.md) says the same (#328: "the seed is in the
state").

## Target fields

| Field       | What it holds                                                 | Phase  |
| ----------- | ------------------------------------------------------------- | ------ |
| `version`   | the shape's version; another version is refused               | T0     |
| `seed`      | the seed actually used (a branded `Seed` string)              | T0     |
| `startedAt` | when the test started, from the injected clock                | T0     |
| `current`   | the item instance on screen                                   | T0     |
| `order`     | the item instances after selection and ordering, written once | T1, T4 |
| `testParts` | the status of each test part                                  | T7     |
| `outcomes`  | the test outcomes                                             | T8     |
| `timing`    | the time spent per test, part, section and item               | T5     |
| `plugins`   | what plugins keep, by plugin name, stored and restored unread | T1     |
| `items`     | per item instance, below                                      | T0     |

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

## Phase by phase

- **T0**: `SessionState` renamed `DeliveryState`; this file.
- **T1**: `order`, the resolved `sessionControl` (derived, not stored), the `QtiTestState`
  conversions.
- **T2**: `computedContext` as the derivation; `initContext` into `item.data`; `stampContext` into
  `active`.
- **T3**: `lifecycle`, `numAttempts`, `completionStatus`; the `can*` flags derived from them.
- **T4**: `order` written once from the seed.
- **T5**: `timing` and `duration`.
- **T8**: the variables move into `DeliveryState`; `testContext` retires.
- **Roadmap 5**: `sessionContext` and `testContext` deprecated and removed; `view` an input; maybe
  `computedContext` renamed.
