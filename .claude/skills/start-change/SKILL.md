---
name: start-change
description: Start a change in qti-components the house way - pick the roadmap phase or issue, choose the lane (main or next), and make a worktree off that lane under .claude/worktrees. Use when the user says to start, pick up or begin work on a phase, issue, fix or feature.
argument-hint: '<roadmap phase number | issue number | short description>'
disable-model-invocation: true
---

# Start a change

1. **What.** Planned work is a phase in one of the roadmaps `plans/ROADMAP.md` lists, in their
   order: read it, check every **Needs** is `done`, and read the plan it links. A bug or outside request is a GitHub issue
   (`gh issue view <n>`). Do not open an issue for planned work.
2. **Lane.** Would it break an existing user of a published package (removed or renamed member,
   changed behaviour, new required import)? Yes → `next`; no → `main`; unsure → `next`. Roadmap
   phases are on `next`. Say the lane to the user.
3. **Branch name.** Conventional prefix + short slug: `feat/…`, `fix/…`, `chore/…`, `docs/…`,
   `test/…`, `ci/…`. The worktree is the branch with `/` → `-`.
4. **Worktree** (from the repo root, never switching the root checkout's branch):

   ```bash
   git fetch origin
   git worktree add .claude/worktrees/<branch-dashed> -b <branch> origin/<lane>
   git -C .claude/worktrees/<branch-dashed> branch --unset-upstream
   pnpm --dir .claude/worktrees/<branch-dashed> install
   cp -n .claude/settings.local.json .claude/worktrees/<branch-dashed>/.claude/ 2>/dev/null || true
   ```

   `.worktreeinclude` copies `settings.local.json` only into worktrees Claude Code creates itself
   (desktop sessions, `--worktree`); a manual `git worktree add` needs the copy above.

5. **Before code**: read the `.claude/rules/*.md` for every area the change touches, and the
   definition of done in `CLAUDE.md`. For a bug, write the failing spec or story first.
6. Report: branch, worktree path, lane, and the roadmap phase or issue, together.
