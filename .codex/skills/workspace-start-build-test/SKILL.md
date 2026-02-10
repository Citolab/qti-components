---
name: workspace-start-build-test
description: Run canonical workspace start/build/test/lint/type-check flows for this pnpm monorepo with optional package scope and fast-to-full escalation.
---

# Workspace Start Build Test

## When To Use
- Starting local development.
- Verifying changes with minimal to full checks.
- Running package-scoped checks before repo-wide checks.

## Commands
- Install: `pnpm install`
- Root Storybook: `pnpm storybook`
- Build all: `pnpm build`
- Tests: `pnpm test`
- Full verification: `pnpm test-all`
- Lint: `pnpm lint`
- Type check: `pnpm tsc`

## Package-Scoped Patterns
- Interactions Storybook: `pnpm storybook:interactions`
- Package build example: `pnpm --filter @qti-components/interactions run build`

## Execution Order
1. Run smallest relevant command first.
2. Escalate to broader checks only after local signal is clean.
3. Report first failing command with a concise remediation hint.

## Boundaries
- Do not modify source files as part of running checks.
- Do not run publish/release commands unless explicitly requested.
