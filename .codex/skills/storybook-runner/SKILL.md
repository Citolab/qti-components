---
name: storybook-runner
description: Start or build Storybook for this repository with correct root or package-scoped commands and quick troubleshooting steps.
---

# Storybook Runner

## When To Use
- Running Storybook locally for docs and interactive tests.
- Building static Storybook output for validation.

## Commands
- Root dev Storybook + CEM watch: `pnpm storybook`
- Root static build: `pnpm build-storybook`
- Interactions-only dev: `pnpm storybook:interactions`
- Prosemirror-only dev: `pnpm storybook:prosemirror`

## Quick Checks
- Confirm active Storybook config: `.storybook/main.ts`
- Confirm static assets: `public/`
- Confirm CEM generation issues: `pnpm cem`

## Boundaries
- Do not rewrite stories or story config unless explicitly requested.
- Do not assume Storybook failures imply component logic failures without checking stack traces.
