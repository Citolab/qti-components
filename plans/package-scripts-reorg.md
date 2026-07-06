# Plan: Declutter package.json scripts + branch-aware precommit

## Status (updated 2026-07-06)

Revised decisions after the workflow discussion:
- **Precommit is now ONE tier** (same on every branch), not branch-aware. "Simpler." ✅ DONE
  in `.husky/pre-commit`: lint-staged (staged files) + cheap `cem` manifest regen. Full build
  dropped from the commit path; heavy checks are CI's job.
- **Dead `pre-commit` npm script removed** from package.json. ✅ DONE
- **Storybook auto-deploys after a successful release** via `workflow_run` in `deploy-sb.yml`. ✅ DONE
- **`CONTRIBUTING.md` written** — trunk-based flow, release steps, branch-ruleset `gh` command. ✅ DONE
- **Still TODO:** the `Justfile` menu (Phase 1 below), the safe `release` npm script + `dev` alias,
  and actually applying the `main` branch ruleset (command is in CONTRIBUTING.md — needs an admin to run).

The branch-aware precommit in Phase 2 below is SUPERSEDED by the one-tier hook. Keep Phase 1 (Justfile)
and the release/dev script additions; ignore the main-only precommit block.

---


## Goal

Reduce script anxiety. Make **4 primaries** the obvious interface, push the other ~25 into a
grouped **task-runner menu**, and wire a **branch-aware precommit** that always runs
lint + build (+ staged tests), and on `main` also runs madge / attw / syncpack / sherif.

## Decisions (from user, 2026-07-06)

- **Declutter mechanism:** Task runner. Use a **`Justfile`** as the human-facing menu (`just` / `just --list`
  shows a tidy grouped list). Rationale over turbo: goal is *decluttering + a clear menu*, not build-graph
  caching. `just` is a single file, zero-config, groups + doc-comments out of the box.
- **Precommit tests:** staged files only (via existing `lint-staged` → `vitest related`). No interactive prompt,
  no full-suite on commit. Full suite stays manual (`pnpm test`) + CI (`ci:push-quality`).
- **`release` = "build website":** website *is* the Storybook build. `release` = add changeset + build Storybook.
  Actual npm publish stays CI-only (`release.yml`) — the visible `release` recipe is deliberately **safe** (no publish).

## Hard constraints (do NOT break)

CI references these root scripts — they **must remain** callable as `pnpm run <name>`:
`build`, `build-storybook`, `changeset`, `changeset:status`, `changeset:version`, `changeset:publish`,
`ci:push-quality`, `ci:publish:workspace`, `ci:publish:umbrella`, `ci:publish:missing`.
Tooling/hooks require: `prepare` (husky), `preinstall` (sherif), `commit-msg` (commitlint), the `lint-staged` block.
Per-package scripts under `packages/*/package.json` (e.g. `build`, `attw`, `yalc:push`) are **untouched** — the
root scripts already fan out to them via `pnpm -r`.

`just` is **not installed**. Therefore: git hooks must NOT depend on `just`; hooks call a plain shell script.
Justfile is a convenience layer only.

## The 4 primaries (visible) + precommit

| command        | does                                                        |
|----------------|------------------------------------------------------------|
| `just dev`     | `pnpm run storybook` (storybook dev + cem watch)           |
| `just test`    | `pnpm run test` (build + `vitest run`)                     |
| `just release` | `pnpm run changeset` + `pnpm run build-storybook` (safe)   |
| `just yalc`    | `pnpm run yalc:push` (publish to local consumers)          |
| `just precommit` | run the same checks the git hook runs                    |

Everything else stays runnable but lives in grouped Justfile sections (Build / Checks / Deps / CI) and in
package.json — humans stop reading package.json and use `just`.

---

## Phase 0 — Reference facts (allowed commands, verified)

Existing root scripts and their real meaning (from package.json):
- `storybook` = `run-p storybook:dev cem:storybook:watch`
- `test` = `pnpm run build && vitest run`
- `yalc:push` = `pnpm -r run yalc:push`
- `build` = `pnpm -r run build`
- `lint` = `eslint`; `tsc` = `tsc --noEmit`; `madge` = `madge packages/**/src ... --circular`
- `attw` = `env NPM_CONFIG_CACHE=/tmp/... pnpm -r run attw`; `publint` = `pnpm -r run publint`
- `deps:lint` = `syncpack lint`; `pm:check` = `sherif`
- `changeset` = `pnpm dlx @changesets/cli` (+ `:status/:version/:publish`)
- `build-storybook` = `pnpm run cem && storybook build`

Current git hooks:
- `.husky/pre-commit` → `npx lint-staged --allow-empty --quiet` + `pnpm run build` + `git add custom-elements.json packages/qti-components/custom-elements.json`
- `.husky/commit-msg` → `npm run commit-msg`
- **Dead script:** root `pre-commit` (`run-s tsc lint madge`) is NOT referenced by any hook — safe to delete.

`lint-staged` block already runs `prettier --write`, `eslint --fix`, `vitest related --run --passWithNoTests`
on staged JS/TS — this IS the "test staged files" behavior; do not duplicate it.

Anti-patterns to avoid:
- Do NOT remove any CI-referenced script (see Hard constraints).
- Do NOT make git hooks call `just` (not guaranteed installed).
- Do NOT put `changeset:publish` / any npm publish behind the casual `release` recipe.
- Do NOT add a new full `vitest run` to the commit path.

---

## Phase 1 — Add the Justfile (the menu)

**Create `/Justfile`** at repo root. Default recipe lists everything; recipes delegate to `pnpm run …`
(keeps one source of truth and stays CI-safe).

```make
# Show this menu when `just` is run with no args
default:
    @just --list --unsorted

# ── Primary ─────────────────────────────────────────────
[group('primary')]
dev:            # Storybook dev server + CEM watch
    pnpm run storybook

[group('primary')]
test:           # Build then run the full vitest suite
    pnpm run test

[group('primary')]
release:        # Add a changeset + build the Storybook site (no publish; publish is CI)
    pnpm run changeset
    pnpm run build-storybook

[group('primary')]
yalc:           # Push all packages to local yalc consumers
    pnpm run yalc:push

[group('primary')]
precommit:      # Run the same checks as the git pre-commit hook
    ./scripts/precommit.sh

# ── Build ───────────────────────────────────────────────
[group('build')]
build:  ; pnpm run build
[group('build')]
cem:    ; pnpm run cem
[group('build')]
storybook-build: ; pnpm run build-storybook

# ── Checks ──────────────────────────────────────────────
[group('checks')]
lint:   ; pnpm run lint
[group('checks')]
tsc:    ; pnpm run tsc
[group('checks')]
madge:  ; pnpm run madge
[group('checks')]
attw:   ; pnpm run attw
[group('checks')]
publint:; pnpm run publint

# ── Deps ────────────────────────────────────────────────
[group('deps')]
deps-lint:  ; pnpm run deps:lint
[group('deps')]
deps-fix:   ; pnpm run deps:fix
[group('deps')]
sherif:     ; pnpm run pm:check
```

**Verification (Phase 1):**
- `brew install just` (document as one-time prereq in README/CONTRIBUTING).
- `just` with no args prints a grouped list with `primary` on top.
- `just dev`, `just test` behave exactly as `pnpm run storybook` / `pnpm run test`.
- No package.json changes yet → CI unaffected.

---

## Phase 2 — Branch-aware precommit script + rewire husky

**Create `/scripts/precommit.sh`** (plain bash, no `just` dependency):

```bash
#!/usr/bin/env bash
set -e

branch="$(git branch --show-current)"

# Always: format + eslint --fix + related tests on STAGED files, then build + refresh CEM
npx lint-staged --allow-empty --quiet
pnpm run build
git add custom-elements.json packages/qti-components/custom-elements.json

# main only: heavier gates before code lands on main
if [ "$branch" = "main" ]; then
  echo "→ on main: running tsc, madge, attw, syncpack, sherif"
  pnpm run tsc
  pnpm run madge
  pnpm run attw
  pnpm run deps:lint
  pnpm run pm:check
fi
```
`chmod +x scripts/precommit.sh`.

**Replace `.husky/pre-commit` body** with:
```bash
#!/bin/bash
./scripts/precommit.sh
```

**Delete** the dead root `pre-commit` script from package.json (`"pre-commit": "run-s tsc lint madge"`).

**Add** to package.json scripts (thin, so hook/Just/muscle-memory all agree):
- `"precommit": "./scripts/precommit.sh"`
- `"release": "pnpm run changeset && pnpm run build-storybook"`
- optional alias `"dev": "pnpm run storybook"` (keeps `pnpm run dev` working alongside `just dev`)

**Verification (Phase 2):**
- On a feature branch: `git commit` runs lint-staged + build only (fast). Confirm madge/attw NOT run.
- On `main` (test with a throwaway commit or `git branch --show-current` echo): the extra block runs.
- `just precommit` and `pnpm run precommit` both execute `scripts/precommit.sh`.
- `grep -n '"pre-commit"' package.json` → no match (dead script gone).

---

## Phase 3 — Optional cleanup of root scripts

Only after Phases 1–2 verified. Low-risk removals / regroupings (each independently optional):
- `storybook:stackblitz` (alias of `storybook:dev`) — confirm no `.stackblitz`/CI reference (`grep -rn storybook:stackblitz .`) before removing.
- Reorder package.json `scripts` so the primaries + `precommit` sit at the top, CI/`ci:*` and `deps:*` grouped below,
  with a `"//": "── see Justfile for the human menu ──"` separator key as a signpost.

**Do NOT touch** any script in the Hard-constraints list. This phase is cosmetic ordering + removing provably-unused
aliases only.

**Verification (Phase 3):**
- `grep -rhoE "pnpm run [a-z0-9:_-]+" .github/workflows/` — every name still present in package.json.
- `pnpm run build && pnpm run build-storybook` succeed.

---

## Phase 4 — Final verification

1. `just --list` shows: primary (dev/test/release/yalc/precommit) grouped first, then build/checks/deps.
2. CI script parity: every `pnpm run X` in `.github/workflows/*.yml` resolves to an existing package.json script.
3. Hooks: feature-branch commit = fast path; main commit = full gates. `commit-msg` (commitlint) still fires.
4. `release` recipe does NOT publish to npm (grep the recipe: no `changeset:publish`, no `ci:publish`).
5. Update README/CONTRIBUTING: "Run `just` to see available commands. Install once: `brew install just`."

## Rollback

All changes are additive except the dead-`pre-commit`-script deletion and the `.husky/pre-commit` rewrite.
Revert `.husky/pre-commit` to the previous 3-line body and restore the `pre-commit` script to undo.
