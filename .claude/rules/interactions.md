---
paths:
  - 'packages/interactions/**'
---

# Interactions

- **Form-associated custom elements**, aligned with WHATWG form association: value, validity and
  the accessible role and state go through `ElementInternals`. `response` is a compatibility API
  only; new behaviour never depends on it.
- **Work without the theme.** An interaction is usable and laid out with `qti-theme` unloaded. Its
  `*.styles.ts` holds functional layout only, never semantic classes or brand paint; paint lives in
  `packages/qti-theme/src/styles/qti-theme/qti-interactions.css`.
- **States paint, never lay out.** A drop is a constant box; a chip never resizes when it lands
  (CONTRACT §7, `drag-drop.invariance.spec.ts`).
- **Prefer platform features** where the support profile allows: popover, dialog, anchor
  positioning, invoker commands.
- **Stories**: every interaction has a main docs story plus at least `.forms` and `.a11y` stories
  (see `.claude/rules/stories.md`). Correct-response stories belong to `qti-corrections`.
