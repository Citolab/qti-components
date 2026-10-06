# PeilingLezen migration

Baseline: pinned to 7.1–7.14. Survey is imports only (2026-10-05): about 17 custom interactions on
`Interaction`, deep `/exports/*` imports, consumption of `testContext` / `computedContext`. Nothing
here was run, and the changes between 7.14 and 9.3.0 are not covered by this file.

## Unreleased after 9.3.0

### Nothing required

Status: none
Members: `testContext`, `computedContext`, `Interaction`
Do: no change from PR #225–#227. The consumed contexts are unchanged, and the session context
label change (`sessionContext`) does not affect components that consume it.

### `state` is available after the upgrade (PR #225)

Status: recommended, once on 9.x
Do: PeilingLezen is a candidate first user of bookmarks and highlights in `state.session`
(`plans/public-api.md`, decisions 3 and 4).

### Restored template values are kept (PR #226)

Status: behaviour change
Do: nothing unless a custom interaction relied on template values being redrawn on revisit.

## Open

- Deep `/exports/*` imports are internal. Documented entry points for `Interaction` and the
  contexts are planned; until then every upgrade may break them.
- Survey the 7.14 → 9.x gap in depth before upgrading.
