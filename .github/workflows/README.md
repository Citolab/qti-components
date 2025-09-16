# GitHub Workflow Documentation

This repository uses GitHub Flow with protected main branch, pull requests, and squashed commits. This guide shows you exactly how to contribute from issue to merged PR.

## � GitHub Flow Overview

```
Issue → Branch → Code → PR → CI → Review → Merge → Cleanup
```

---

## 🚀 Step-by-Step Workflow

### 1. **Start from GitHub Issue**

Create or find an issue on GitHub, note the issue number (e.g., `#42`)

### 2. **Create Feature Branch**

```bash
# Clone repo (first time only)
git clone https://github.com/Citolab/qti-components.git
cd qti-components

# Always start from main
git checkout main
git pull origin main

# Create feature branch (use issue number)
git checkout -b feature/issue-42-description
# or
git checkout -b fix/issue-42-bug-description
```

### 3. **Make Your Changes**

```bash
# Make your changes
# ... edit files ...

# Test locally
npm ci
npm run lint
npm run test
npm run build

# Commit with conventional commits
git add .
git commit -m "feat: add new component for issue #42"
# or
git commit -m "fix: resolve layout bug in component #42"
```

### 4. **Push and Create Pull Request**

```bash
# Push branch
git push origin feature/issue-42-description

# GitHub will show a link to create PR, or go to GitHub and:
# 1. Click "Compare & pull request"
# 2. Add description linking to issue: "Closes #42" 
# 3. Click "Create pull request"
```

### 5. **CI Runs Automatically**

When you create the PR, GitHub Actions automatically runs:

✅ **CI Workflow** (`.github/workflows/ci.yml`):
- Linting (ESLint + Stylelint)
- Circular dependency check
- Build TypeScript
- Run tests
- Package validation
- Creates preview package with `pkg-pr-new`

### 6. **Review Process**

- **Reviewers get notified**
- **CI must pass** (green checkmarks)
- **Make changes if needed:**
  ```bash
  # Make more changes
  git add .
  git commit -m "fix: address review feedback"
  git push origin feature/issue-42-description
  # CI runs again automatically
  ```

### 7. **Merge Pull Request**

Once approved and CI passes:

```bash
# On GitHub:
# 1. Click "Squash and merge" 
# 2. Edit commit message if needed
# 3. Click "Confirm squash and merge"
# 4. Click "Delete branch" when prompted
```

### 8. **Local Cleanup**

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Delete local feature branch
git branch -d feature/issue-42-description

# Verify the issue is closed (should auto-close from "Closes #42")
```

---

## 🤖 GitHub Actions Workflows

| Workflow | When | What |
|----------|------|------|
| **CI** | Every PR + push to main | Full testing suite + preview package |
| **Manual Release** | Manual trigger on main | Official release to npm + docs |
| **Release Next** | Manual trigger any branch | Preview release with `next` tag |

### Creating Releases

#### For Official Releases (main branch only):
```bash
# Go to: Actions → "Manual Release" → "Run workflow"
# Choose: auto/patch/minor/major or custom version
```

#### For Preview Releases (any branch):
```bash
# Go to: Actions → "Release Next" → "Run workflow"  
# Choose: your feature branch
# Install with: npm install @citolab/qti-components@next
```

---

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new component        # New feature
fix: resolve layout bug        # Bug fix
docs: update README           # Documentation
style: format code            # Code style
refactor: restructure component # Code refactoring
test: add component tests     # Tests
chore: update dependencies    # Maintenance
```

For breaking changes:
```bash
feat!: redesign component API
# or
feat: redesign API

BREAKING CHANGE: component API has changed
```

---

## 🛡️ Branch Protection Rules

**Main branch is protected:**
- ❌ Direct pushes blocked
- ✅ Pull requests required
- ✅ CI must pass
- ✅ Squash merging only
- ✅ Branch auto-deleted after merge

---

## 🚨 Troubleshooting

### ❌ CI Failing?
```bash
# Run the same checks locally:
npm ci
npm run lint      # Fix linting errors
npm run stylelint # Fix style errors  
npm run madge     # Check circular dependencies
npm run build     # Fix build errors
npm run test      # Fix failing tests
```

### ❌ Can't push to main?
```bash
# Main is protected - use PRs:
git checkout -b fix/my-changes
git push origin fix/my-changes
# Then create PR on GitHub
```

### ❌ Merge conflicts?
```bash
# Update your branch with main:
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
# Resolve conflicts, then:
git add .
git commit -m "merge: resolve conflicts with main"
git push origin your-feature-branch
```

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Start new feature
git checkout main && git pull && git checkout -b feature/issue-X

# Test before pushing  
npm ci && npm run lint && npm run test && npm run build

# Push and create PR
git push origin feature/issue-X

# Clean up after merge
git checkout main && git pull && git branch -d feature/issue-X
```

---

## 📚 Links

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Creating Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)