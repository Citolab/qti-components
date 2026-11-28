---
paths:
  - 'packages/qti-theme/**'
  - '**/*.styles.ts'
  - '**/*.css'
  - '.storybook/themes.css'
---

# Theme and design system

`packages/qti-theme/CONTRACT.md` is the reference and is normative; read the section before
changing what it covers. There is no Figma: code, CONTRACT.md and the Storybook theme editor are
the whole design system.

## What a host may rely on (frozen, CONTRACT §11)

- The tier-1 `--qc-*` inputs; parts and states (`::part()`, `:state()`); QTI element names
  (`qti-assessment-item-ref`, `qti-item-body`, `qti-feedback-block`, an interaction's own box) and
  the QTI shared vocabulary classes an item carries; `@layer qti-components.interactions.brand`, the
  one layer a host may name.
- Internal: `--qti-*`, the other layers, the mixins, the shadow-DOM structure. A knob a host needs
  becomes a new `--qc-*` input, never a public `--qti-*`.
- Renaming or removing a `--qc-*` input, part, state or the brand layer is a major (old name
  aliased for that major); a new one is a minor; a changed default look is a minor, named under
  "Look" in its changeset. The `--button-*` slots are undecided until phase 10.

## Always true

- States never change layout (§7); layout properties are rejected in the theme
  (`qti/no-layout-in-theme`, `qti/no-layout-in-transient-state`).
- Components work without the theme loaded.
- An unlayered host rule beats the theme.
- The parts/states vocabulary (§3) applies to every element in every package, `test-*` controls and
  qti-extended plugins included: one name one meaning, parts are nouns, states are `:state()`, every
  part and state documented with `@csspart` / `@cssstate`.

## Proof

- Generic checks over the CEM (planned, roadmap G5; not enforced yet): no-theme rendering, states
  never reflow, every `part=` and `:state()` documented, every `--qc-*` the theme reads is a tier-1
  input on the Theming page.
- VRT is the kennisnet set. The CONTRACT §6 guard for the §4 green, red and blue outcomes is
  missing today; G5 restores it. Contrast is axe `color-contrast` once the accessibility gate is on
  (G4). Forced colours are deferred.
- Brand presets and full flows are tested in qti-player, not here.
- Check the silent failures in CONTRACT §10 in a browser; they pass lint and tests.
