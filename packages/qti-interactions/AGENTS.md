# AGENTS.md (qti-interactions)

## Scope

- Applies to `packages/qti-interactions/**`.
- Extends and tightens root `AGENTS.md` rules for interaction components, stories, and theming.

## Story Architecture Rules

- Each interaction component must have exactly one main docs story in the component root:
  - Pattern: `qti-*-interaction.stories.ts`
- Only the main docs story may use:
  - `getStorybookHelpers(...)`
  - `tags: ['autodocs']`
- Scenario and behavior stories must live under the component `stories/` directory.
- Supported split-story taxonomy:
  - `*.a11y.stories.ts`
  - `*.api.stories.ts`
  - `*.behavior.stories.ts`
  - `*.config.stories.ts`
  - `*.correctresponse.stories.ts`
  - `*.dom.stories.ts`
  - `*.forms.stories.ts`
  - `*.theming.stories.ts`
  - `*.validation.stories.ts`
  - `*.vocabulary.stories.ts`

## Story Testing Query Policy

- Prefer testing-library style queries via `within(...)` and shadow-dom testing helpers:
  - `getByRole` / `findByRole`
  - `getByLabelText`
  - `getByPlaceholderText`
  - `getByText`
  - `getByDisplayValue`
  - `getByAltText`
  - `getByTitle`
  - `getByTestId`
- Direct DOM probing is disallowed by default:
  - `querySelector(...)`
  - `shadowRoot?.querySelector(...)`
- Allowlist exception policy:
  - Only allowed when no semantic/testing query can represent the assertion.
  - Must include an inline rationale comment near the exception.
  - Must be added to the legacy exception table below with expiry target.

## Unit Of Test Policy

- A story test must validate only the interaction under test.
- Cross-component integration behavior belongs in dedicated integration stories/tests.
- If another component is required as scaffolding (for example `qti-item`), assertions must still focus on the target interaction contract.

## Interaction Implementation Policy

- Interactions must be form-associated custom elements aligned with WHATWG custom elements/form-associated behavior.
- `response` remains a compatibility API for now and should be treated as transitional.
- Interactions must expose accessibility roles/states through `ElementInternals` where applicable.
- Prefer modern platform APIs when they improve interaction quality and support profile is acceptable:
  - anchor positioning
  - popover
  - dialog
  - invoker commands

## Styling And Theming Policy

- Functional layout styles belong in local `*.styles.ts` next to the interaction component.
- Local component styles should stay minimal and non-semantic.
- Do not use semantic `qti-base` classes inside interaction component styles.
- Visual/semantic interaction theming belongs to:
  - `packages/qti-theme/src/styles/qti-components/qti-interactions.css`
- Interactions must remain functional without loading `qti-interactions.css`.

## Legacy Exception Table (Phase 1)

| Rule                                      | Path                                                                                                                   | Reason                                                  | Expiry     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------- |
| No `autodocs` in split stories            | `packages/qti-interactions/src/components/qti-choice-interaction/stories/qti-choice-interaction.vocabulary.stories.ts` | Existing legacy setup; keep during migration            | 2026-06-30 |
| No direct DOM probing                     | `packages/qti-interactions/src/components/**/stories/*.stories.ts`                                                     | Legacy stories still use direct selectors in assertions | 2026-06-30 |
| No `getStorybookHelpers` in split stories | `packages/qti-interactions/src/components/qti-choice-interaction/stories/*.stories.ts`                                 | Legacy controls wiring in split stories                 | 2026-06-30 |

## Migration Tracker

| Component                       | Main Docs Story | Split Story Taxonomy | Query Policy | Status        |
| ------------------------------- | --------------- | -------------------- | ------------ | ------------- |
| `qti-choice-interaction`        | Present         | Present              | Partial      | In progress   |
| `qti-text-entry-interaction`    | Present         | Present              | Partial      | Next          |
| `qti-inline-choice-interaction` | Present         | Partial              | Partial      | Pending       |
| Other interactions              | Varies          | Varies               | Varies       | Pending audit |
