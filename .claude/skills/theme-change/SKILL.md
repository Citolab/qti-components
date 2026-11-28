---
name: theme-change
description: Make a theme or styling change in qti-components safely - check it against CONTRACT.md (layers, parts and states, tokens, no layout in the theme, the host override contract), decide whether it is a major or minor for hosts, and verify it in the browser and with VRT, including how to re-bless baselines honestly. Use for any change to packages/qti-theme, a component's *.styles.ts, a part, a state or a --qc- token.
paths:
  - 'packages/qti-theme/**'
  - '**/*.styles.ts'
---

# Theme change

Read `.claude/rules/theme.md` and the CONTRACT.md sections the change touches.

## 1. Place it

- Layout (size, flex, grid, position, `flex-shrink` too) → the component's `*.styles.ts`.
- Paint → `qti-theme`, in the right layer (CONTRACT §1–2): resting look in `interactions.base`,
  live state in `interactions.states`, answer key and verdicts in `interactions.corrections`.
- A new knob for hosts → a tier-1 `--qc-*` input (CONTRACT §8), on the Theming page; never a public
  `--qti-*`.
- A new part or state → a name from the vocabulary (CONTRACT §3), `@csspart`/`@cssstate` on the
  element that exposes it.

## 2. Classify for hosts

- Rename or removal of a `--qc-*` input, part, state or the brand layer → major (`next`), old name
  aliased for one major, host-migration entries.
- New input, part or state → minor. Changed default look → minor, under "Look" in the changeset.

## 3. Verify

- `pnpm run lint` (stylelint: `qti/no-layout-in-theme`, `qti/no-layout-in-transient-state`,
  `qti/no-declared-measured-token`).
- In the browser (Storybook, theme editor): the CONTRACT §10 silent failures; hover, focus, checked,
  disabled; the component with no theme loaded.
- `pnpm run test:vrt`. If it fails on an intended change: `pnpm run test:vrt:update`, then open
  every changed PNG, say what changed and why it is intended, and stage only those. A re-blessed PNG
  is a claim, not evidence.
