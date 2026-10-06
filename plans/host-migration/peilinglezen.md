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

### Interactions follow the item context (PR #228)

Status: behaviour change; the highest impact of the three for this host
Members: subclass `Interaction` (~17 custom interactions), `qti-register-feedback`
Do: check every custom interaction's `response` setter. The base class now calls it again when the
item's value changes to something the interaction did not publish itself, so a setter must be safe
to call with the same value (no re-render loops, no event dispatch that echoes back). Also:

- A `readonly` attribute set from the start now applies to them.
- The `qti-register-feedback` event is no longer sent; the surveyed imports do not use it.
  Evidence: imports surveyed only, not run

### Item validity is published by the item (PR #TBD)

Status: behaviour change; nothing required for the surveyed code
Members: `computedContext` (`ComputedItem.valid`)
Do: nothing if no component reads `valid`. One that does now gets a value that stays right after a
restore or after coming back to an answered item; before, it stayed `false` until the next update.
The navigation computed context no longer asks each loaded item to validate on every update.
Evidence: imports surveyed only, not run. `qti-navigation-bar.ts` consumes `computedContext` and does
not read `valid`.

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
