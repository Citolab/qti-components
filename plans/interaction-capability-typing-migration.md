# Interaction Capability Typing Migration

## Goal

Move from one broad interaction contract to capability-oriented typing while preserving:

- form-associated behavior for all interactions
- backward compatibility for existing interactions and consumers
- predictable mixin composition

## Current Baseline

Implemented in code:

- `IInteraction` is now a deprecated compatibility alias to capability interfaces.
- `Interaction` implements capability interfaces directly.
- `QtiAssessmentItem` now uses a narrower registry contract (`RegisteredInteraction`).
- interactions-core drag/drop mixins that do not require correction behavior are now bound to `LeanInteraction`.

## Type Decision Rules

### 1) Use `LeanInteraction` as the generic/runtime base when

- you need form-associated and base interaction lifecycle behavior
- you do **not** require correct-response/candidate-correction guarantees

Typical examples:

- low-level drag/drop infrastructure mixins
- utility mixins that only rely on base internals/context/events

### 2) Use `Interaction` as the generic/runtime base when

- the mixin/class depends on correction capabilities (`correctResponse`, correction toggles, full-correct-response clone)
- methods such as `toggleFullCorrectResponse` / `toggleCandidateCorrection` are required at runtime

Typical examples:

- choice/correction-aware mixins
- drag/drop layers that intentionally bridge into correction behavior

### 3) Use capability interfaces for type-only surfaces

Prefer these in type-only consumers:

- `FormAssociatedInteraction`
- `ResponseInteractionElement`
- `ValidatableInteraction`
- `CorrectableInteraction`
- `RegisteredInteraction`

Use the narrowest contract the consumer actually needs.

## Why This Shape

- avoids forcing correction/validation-heavy contracts onto minimal interactions
- keeps shared form-associated behavior centralized
- allows upload/drawing-like interactions to stay lean while remaining first-class interactions
- reduces accidental coupling in consumers and mixins

## Backward Compatibility

`IInteraction` remains exported as a deprecated alias:

- safe for existing imports
- new code should use capability interfaces directly

## Follow-up Checklist

- migrate remaining type-only `Interaction` usages to the narrowest capability interface when encountered
- avoid introducing new `IInteraction` references in new code
- keep runtime inheritance on `Interaction` only where correction behavior is truly required
