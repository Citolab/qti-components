---
name: feature-branch-workflow
description: Interactive workflow for creating feature branches, committing changes, creating GitHub issues, and opening pull requests with user confirmation at each step.
---

# Feature Branch Workflow

## When To Use

- You have uncommitted changes on main that need to go into a feature branch.
- You want to create a GitHub issue and PR for small changes.
- You need guided, step-by-step commit workflow with confirmations.

## Typical Triggers

- "commit my changes to a feature branch"
- "create a PR for these changes"
- "feature branch workflow"
- "help me commit and create a PR"

## Prerequisites

- GitHub CLI (`gh`) authenticated: `gh auth status`
- Git configured with push access to remote
- Changes present in working tree

## Workflow Steps

### Step 1: Run Tests

```bash
pnpm test-all
```

- If tests fail, stop and report failures.
- User decides whether to proceed despite failures.

### Step 2: Analyze Changes

```bash
git status --short
git diff --stat
```

- Summarize what files changed and the nature of changes.
- Generate a short branch name suggestion (e.g., `fix/inline-choice-width`, `feat/dutch-newspaper-story`).

### Step 3: Create Branch (with confirmation)

**Display command, wait for user confirmation or edits:**

```bash
git checkout -b <suggested-branch-name>
```

- User can modify the branch name before execution.

### Step 4: Stage Changes

```bash
git add .
```

- Or stage specific files if user requests selective staging.

### Step 5: Commit (with confirmation)

**Generate conventional commit message, display command, wait for confirmation:**

```bash
git commit -m "<type>(<scope>): <description>"
```

- Follow conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- User can edit message before execution.

### Step 6: Push Branch

```bash
git push -u origin <branch-name>
```

### Step 7: Create GitHub Issue (with confirmation)

**Generate issue title and body, display command, wait for confirmation:**

```bash
gh issue create --title "<AI-generated-title>" --body "<description>" --assignee @me
```

- Note: GitHub Issues don't have draft mode; issue is created immediately.
- Capture the issue number from output for linking.

### Step 8: Open Issue in Browser

```bash
gh issue view <issue-number> --web
```

- User reviews and edits issue if needed.
- Ask user to confirm when ready to proceed.

### Step 9: Create Pull Request (with confirmation)

**Generate PR title and body linking to issue, display command, wait for confirmation:**

```bash
gh pr create --title "<title>" --body "Closes #<issue-number>\n\n<description>" --assignee @me
```

- Links PR to issue with "Closes #N" syntax.

### Step 10: Open PR in Browser

```bash
gh pr view --web
```

- User can review, approve, and squash-merge from the GitHub UI.

## Confirmation Points

The workflow pauses and asks for user confirmation at:

1. After test results (proceed or abort)
2. Before creating branch (can edit name)
3. Before committing (can edit message)
4. Before creating issue (can edit title/body)
5. After issue review (confirm ready for PR)
6. Before creating PR (can edit title/body)

## Boundaries

- Do not force-push or rewrite history.
- Do not merge PRs automatically—user must merge via GitHub UI.
- Do not delete branches without explicit request.
- Stop immediately if any git operation fails unexpectedly.

## Example Session

```
User: "commit my changes to a feature branch"

AI: Running tests...
    ✓ All tests passed.

    Changed files:
    - packages/qti-interactions/.../qti-inline-choice-interaction.stories.ts

    Suggested branch name: feat/dutch-newspaper-story

    Ready to create branch?
    > git checkout -b feat/dutch-newspaper-story

User: [confirms]

AI: Branch created. Staging changes...

    Suggested commit:
    > git commit -m "feat(qti-interactions): add Dutch newspaper article story"

User: [confirms]

AI: Committed. Pushing branch...

    Creating GitHub issue:
    > gh issue create --title "Add Dutch newspaper article story" --body "..." --assignee @me

User: [confirms]

AI: Issue #42 created. Opening in browser...
    [browser opens]

    Ready to create PR?

User: [confirms]

AI: Creating PR:
    > gh pr create --title "Add Dutch newspaper article story" --body "Closes #42\n\n..."

    PR created. Opening in browser for merge...
```

## Rollback

If workflow is aborted mid-way:

- Branch can be deleted: `git branch -D <branch-name>`
- Remote branch: `git push origin --delete <branch-name>`
- Issue can be closed manually via GitHub UI
