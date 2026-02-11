---
name: qti-interactions-story-authoring
description: Author and refactor Storybook stories for qti-interactions using the required docs/split structure, query policy, and interaction-focused testing boundaries.
---

# QTI Interactions Story Authoring

## When To Use
- Adding or refactoring stories in `packages/qti-interactions/src/components/**`.
- Enforcing taxonomy split and query policy.

## Required Structure
- One main docs story per component at root:
  - `qti-*-interaction.stories.ts`
- Split stories under `stories/` using taxonomy:
  - `.a11y`, `.api`, `.behavior`, `.config`, `.correctresponse`, `.dom`, `.forms`, `.theming`, `.validation`, `.vocabulary`

## Main Docs Story Rules
- Main docs story is the only place allowed to use:
  - `getStorybookHelpers(...)`
  - `tags: ['autodocs']`

## Query Rules
- Prefer testing-library and shadow-dom testing queries:
  - `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`, `getByAltText`, `getByTitle`, `getByTestId`
- Avoid `querySelector(...)` and `shadowRoot?.querySelector(...)` unless no semantic alternative exists.

## Test Scope
- Validate only the target interaction behavior in a story.
- Move cross-component integration behavior to dedicated integration stories/tests.

## Styling/Theming Guardrails
- Functional layout in local `*.styles.ts`.
- No semantic `qti-base` classes in interaction component styles.
- Visual theming in `packages/qti-theme/src/styles/qti-components/qti-interactions.css`.

## Implementation Checklist
1. Create/update root docs story.
2. Add or update split stories under `stories/`.
3. Convert selector-based assertions to query-based assertions.
4. Verify no extra `autodocs` or `getStorybookHelpers` usage in split stories.
