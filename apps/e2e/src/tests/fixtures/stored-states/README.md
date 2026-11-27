# Stored 9.x states

Saved states as 9.x hosts stored them, for the stored-states spec (roadmap 1, T1e): every later
phase keeps them restoring.

## CitoTestUit / Checkmate (`checkmate-*.json`)

- Source: `https://checkmate.citolab.nl/demo/demo-fixture.json` (fixture version 1, exported from
  Checkmate production's demo delivery), `studentResults[].items`, read 2026-11-27. The demo data
  is synthetic.
- Each file is `{ "testContext": { "id", "navItemId", "items": [...] } }`, the shape CitoTestUit
  stores (its `ExtendedTestContext`): `testContext.items` as is, next to its own `id` and the item it
  was on (`navItemId`), with no `sessionContext`, so there is no plugin state. 9.x restores it by
  assigning `testContext` and then `navigateTo('item', navItemId)`.
- Kept as stored: the variables (`identifier`, `cardinality`, `baseType`, `value`, `defaultValue`,
  no `type`; numbers as JSON numbers) and the per-item `outcomes` the host added.
- Changed: `href` points into `demo-package/` instead of the production backend; the student's
  name, session and user ids are left out.
- Added: `id` (`checkmate-demo-<n>`, not the stored id) and `navItemId` (a different position in
  each file: the last item, a middle one, the first), since the export carries neither.
- Picked: the first result (score 3), the lowest score (1), and one with a `null` value (score 4).
- The test (`demo-package/`) is nonlinear and simultaneous; `numAttempts` up to 154 on the
  extended-text items comes from scoring every change (`auto-score-items`).
