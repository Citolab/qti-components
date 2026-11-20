---
name: finish-change
description: Finish a change in qti-components - check the definition of done (tests, changeset, host-migration entries, docs, roadmap tick, VRT baselines), then commit, push and open a PR into the lane branch, watch CI and merge, asking the user before each of those steps. Use when the user wants to wrap up, ship, open a PR for, or merge the current branch.
disable-model-invocation: true
---

# Finish a change

Run from the change's worktree. Ask the user before every commit, push, PR, merge and branch
deletion; one approval covers one action.

## 1. Definition of done

Check each and report what is missing:

- **Lane**: `git merge-base --is-ancestor origin/next HEAD` → the PR goes into `next`, else `main`.
- **Tests**: a spec or story that fails without the change; `pnpm run lint` and the affected tests
  pass (`pnpm exec vitest run --project tests <path>`, `--project stories <path>`).
- **Changeset** when a published package changes (`pnpm run changeset`); on `next`, `major` when it
  breaks. A changed default look is named under "Look".
- **Host API**: a touched member in `plans/host-api.md` → entries in every affected
  `plans/host-migration/*.md`, linked from the changeset; JSDoc and site page updated.
- **Roadmap**: a phase's status and steps ticked in this commit; anything that changed a decision
  goes into `host-api.md` → Decided and a line under Found.
- **VRT**: moved or renamed stories move their baselines; every re-blessed PNG opened and its
  change explained.
- **Rules**: if the change had to break a rule in `CLAUDE.md` or `.claude/rules/`, the rule changes
  in the same commit.

## 2. Commit and PR (ask first)

```bash
git add <files>                       # never -A without looking at git status
git commit -m "<type>(<scope>): <summary>"
git push -u origin HEAD
gh pr create --base <lane> --title "<type>(<scope>): <summary>" --body "<what, why, test evidence>"
```

The PR title is the squash commit. Link the roadmap phase or the issue (`Closes #n` for issues only).

## 3. CI and merge (ask first)

- `gh pr checks <n> --watch --fail-fast`. `next` has no required checks: `--auto` would merge at
  once, so wait for green yourself.
- `main` needs a review. Merge with `gh pr merge <n> --squash`; never `--admin`, never `--merge`
  (only main → next sync PRs use a merge commit).

## 4. Clean up (ask before deleting)

```bash
git worktree remove .claude/worktrees/<branch-dashed>
git branch -d <branch>
git push origin --delete <branch>
```

Report the branch, the worktree and the PR number together.
