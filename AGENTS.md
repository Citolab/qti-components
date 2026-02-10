# AGENTS.md

## Scope And Precedence
- This file defines repository-wide defaults for contributors and coding agents.
- A package-level `AGENTS.md` may add stricter rules for that package.
- Package-level rules must not weaken core safety, quality, and verification requirements in this root file.

## Repository Map
- Monorepo package roots: `packages/*`
- Storybook config: `.storybook/`
- Shared tooling: `tools/`
- QTI interaction package: `packages/qti-interactions/`
- Theme package: `packages/qti-theme/`

## Canonical Commands
- Install dependencies: `pnpm install`
- Start root Storybook and CEM watch: `pnpm storybook`
- Start interactions Storybook only: `pnpm storybook:interactions`
- Build all packages: `pnpm build`
- Run test pipeline: `pnpm test`
- Run full checks: `pnpm test-all`
- Type check: `pnpm tsc`
- Lint: `pnpm lint`

## Coding And Testing Defaults
- Prefer small, focused changes with clear file-level intent.
- Keep package boundaries explicit; avoid leaking package-specific assumptions into unrelated packages.
- Reuse existing tooling and helper patterns before introducing new utilities.
- Validate behavior with the narrowest useful command first, then broader checks.
- If a package contains its own `AGENTS.md`, treat it as authoritative for package-local conventions.

## Safety And Review
- Do not use destructive git operations unless explicitly requested.
- Do not revert unrelated working tree changes.
- If unexpected modifications appear during work, stop and ask how to proceed.
- Document known risks and gaps when changes are not fully verifiable.

## Handoff Protocol
- Summarize what changed and why.
- Include exact file references and any added commands.
- Report validation performed and any skipped checks.
- List concrete next steps when follow-up is expected.
