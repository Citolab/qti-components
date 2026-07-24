# QTI Theme Styling Contract

Status: active
Scope: packages/qti-theme/src/styles/qti-theme/\*\*

This document defines the required cascade, ownership, and verification rules for interaction styling.
Treat this as normative. If implementation and this document disagree, update one of them in the same change.

## 1. Layer contract

The theme must declare the layer stack in this exact order in
packages/qti-theme/src/styles/qti-theme/index.css:

1. qti-components.global
2. qti-components.interactions.base
3. qti-components.interactions.states
4. qti-components.interactions.corrections
5. qti-components.overrides

Precedence rule: later layer wins at equal specificity.

## 2. Ownership by layer

qti-variables.css groups its tokens into these same layers. The declaring layer records which kind
of rule owns a token; it does not scope readability — custom properties are inherited computed
values, so any layer can read a token declared in any other.

### qti-components.global

- Cross-interaction semantics only.
- Shared chip, placeholder, drag-highlight, return-anchor, and correction-badge rules.
- Must not contain interaction-specific geometry.
- Tokens: brand palette, rhythm/timing, surfaces and border, icon masks.

### qti-components.interactions.base

- Interaction-local baseline paint and structure.
- Neutral appearance only (no candidate-correction judgement colors).
- May define stable geometry needed for rendering.
- Tokens: form/dropzone/inline geometry, field and textarea radii.

### qti-components.interactions.states

- Interaction-local state paint for :state(...).
- Must express dynamic UI states (checked, dragging, placeholder, candidate-\*, etc.).
- Must not change layout metrics when toggling state.
- Tokens: selection, chip placeholder, drop-target highlight vocabulary.

### qti-components.interactions.corrections

- Answer-key and correction-view paint, including full-correct-response.
- Owns answer-blue treatment and answer check glyphs.
- Can override base/states paint where answer-key semantics require it.
- Tokens: correct / incorrect / partially-correct (plus -light variants), answer key.

### qti-components.overrides

- Optional downstream overrides (vendor or host-specific).
- Never used for fixing base contract violations.
- Declares no tokens; it exists for downstream consumers.

## 3. Selector contract

### States

- Use :state(...) for interaction semantics.
- State rules belong in interactions.states unless the state is explicitly cross-interaction, then in global.
- State styles should paint, not reflow.

### Parts

- Use ::part(...) for shadow-resident affordances and correction badges.
- Use stable part tokens (for example drag, drag-control, correction-\*).
- Do not rely on chained ::part() across multiple shadow boundaries.

### Drag/drop channels

- Light-DOM drags and floating clones are styled via state/attribute channels in global.
- Shadow-resident dropped drags are styled via ::part(drag).
- Both channels must remain visually equivalent for shared semantics.

## 4. Visual precedence contract

1. Base paint defines neutral interaction appearance.
2. State paint overrides base for live interaction semantics.
3. Corrections paint overrides base/state when showing the answer key.

Required outcomes:

- Candidate-correct dropped drags are green.
- Candidate-incorrect dropped drags are red.
- Placeholder/dragging sources render as placeholders, preserving footprint.
- Full-correct-response answers render blue.

## 5. Change rules

- Any new interaction stylesheet must use explicit qti-components.interactions.\* layers.
- Do not add new interaction-specific rules to qti-states.css unless they are truly cross-interaction.
- If a rule moves layers, include a short note in the PR describing why its ownership changed.

## 6. Verification contract

Run at minimum:

1. pnpm run build
2. VRT=1 pnpm vitest run --project vrt --reporter=dot

Regression gate:

- .storybook/vitest.vrt.setup.ts contains a story-specific assertion for
  qti-corrections-qti-corrections-kennisnet-all-items--sleepvraag-opties-boven.
- That assertion must continue to detect both green and red dropped-drag candidate tints.

If this contract changes, update this file and the VRT guard in the same PR.
