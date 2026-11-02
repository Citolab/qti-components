---
name: story-authoring
description: Write or refactor Storybook stories in qti-components so they follow the story rules - one main docs story per component, the closed suffix taxonomy (api, behavior, forms, a11y, config, theming, regression), testing-library queries, real user events, and assertions on form value and accessible state. Use when adding, splitting, renaming or fixing stories or play functions.
paths:
  - '**/*.stories.ts'
---

# Story authoring

The rules are `.claude/rules/stories.md`; read it first. This is the procedure.

## Where the story goes

1. Main story (`<tag>.stories.ts` next to the component): component docs, controls via
   `getStorybookHelpers`, `tags: ['autodocs']`, a Default story. Only this file has those.
2. Anything else: `stories/<tag>[.<scenario>].<suffix>.stories.ts`. Pick the suffix by what the
   play function asserts: public API → `api`; user-visible behaviour or DOM → `behavior`; form
   value, validity, reset → `forms`; roles, names, keyboard, focus → `a11y`; options → `config`;
   parts, states, tokens, vocabulary classes → `theming`; one bug → `regression`.
3. Title: under the component's sidebar entry (`Interactions/Choice/Forms`); a new top group needs
   an entry in `storySort` in `.storybook/preview.ts` first.
4. Fixtures: `<tag>.fixtures.ts` next to the stories; linked files in a `fixtures/` folder
   (`CLAUDE.md`, Fixtures).

## Play function skeleton

```ts
import { expect, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

// Shape only: take the real roles, names and form field name from the element. The choice
// interaction's .a11y story asserts `internals.role` / `internals.ariaChecked` this way; its split
// stories still use getStorybookHelpers and fireEvent, which are listed violations, not a model.
export const SelectsAChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form');
    const choice = canvas.getByRole('<role>', { name: 'Option A' }); // by role and name

    await userEvent.click(choice); // real input

    // the accessible state lives on ElementInternals, not on host attributes
    await expect(choice.internals.ariaChecked).toBe('true');
    // the contract, not only the look: form value (and validity) through ElementInternals
    await expect(new FormData(form).getAll('<response-identifier>')).toEqual(['A']);
  }
};
```

- Drag and drop: `tools/testing/drag.ts`, never synthetic `dragstart` events.
- No `querySelector` unless no accessible query can express it; then
  `// query-exception: <reason>` on the line above.
- Do not set `.response`, do not `fireEvent` where `userEvent` works.
- Assert only the element in the title.

## Tags

`todo`, `xfail` and `a11y-todo` each need a `// <tag>: #<issue> …` or `phase N` comment above the
story. `a11y-todo` is per story, never on `meta`. Never `skip-test`; never `no-tests` on a story with
a play function.

## Before you finish

`pnpm exec vitest run --project stories <file>`; when a story moved or was renamed and is in the VRT
set, move its baseline in the same commit.
