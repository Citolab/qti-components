# QTI-Components task menu.  Run `just` (no args) to see this list.
# One-time install:  brew install just
#
# Recipes wrap the pnpm scripts so there is a single source of truth and CI
# keeps calling `pnpm run …` directly. You stop reading package.json; you read this.

# Show this menu
default:
    @just --list --unsorted

# Storybook dev server + custom-elements-manifest watch
[group('primary')]
dev:
    pnpm run storybook

# Build workspace, then run the full vitest suite
[group('primary')]
test:
    pnpm run test

# Push all packages to local yalc consumers (no npm)
[group('primary')]
yalc:
    pnpm run yalc:push

# Add a changeset + build the Storybook site (safe: does NOT publish to npm)
[group('primary')]
release:
    pnpm run changeset
    pnpm run build-storybook

# Run the exact checks the git pre-commit hook runs
[group('primary')]
precommit:
    ./.husky/pre-commit

# Build all packages
[group('build')]
build:
    pnpm run build

# Regenerate the custom-elements.json manifests
[group('build')]
cem:
    pnpm run cem

# Build the static Storybook site
[group('build')]
storybook-build:
    pnpm run build-storybook

# Lint with ESLint
[group('checks')]
lint:
    pnpm run lint

# Type-check (tsc --noEmit)
[group('checks')]
tsc:
    pnpm run tsc

# Detect circular imports
[group('checks')]
madge:
    pnpm run madge

# Check published types (are-the-types-wrong)
[group('checks')]
attw:
    pnpm run attw

# Lint package publish config (publint)
[group('checks')]
publint:
    pnpm run publint

# Full CI quality lane: lint → madge → build → test → publint → attw
[group('checks')]
ci:
    pnpm run ci:push-quality

# Check dependency version consistency (syncpack)
[group('deps')]
deps-lint:
    pnpm run deps:lint

# Fix dependency version mismatches (syncpack)
[group('deps')]
deps-fix:
    pnpm run deps:fix

# Monorepo sanity check (sherif)
[group('deps')]
sherif:
    pnpm run pm:check
