---
paths:
  - '**/*.stories.ts'
  - '**/*.stories.tsx'
  - '.storybook/**'
---

# Stories

Storybook is the lab: live examples and behaviour tests. Prose docs live on the Astro site
(`.claude/rules/docs.md`).

## Files

Applies to every package (`packages/**`); `apps/e2e` has its own layout (`.claude/rules/tests.md`).

- **One main story per component**: `<tag>.stories.ts` next to the component. Only this file uses
  `tags: ['autodocs']` and `getStorybookHelpers(...)`.
- **Other stories** live in the component's `stories/` folder as
  `<tag>[.<scenario>].<suffix>.stories.ts`, scenario before suffix
  (`qti-test.linear.behavior.stories.ts`). The suffix list is closed:

  | Suffix       | Holds                                              |
  | ------------ | -------------------------------------------------- |
  | `api`        | public properties, methods, events, host requests  |
  | `behavior`   | what a user does and sees, DOM structure           |
  | `forms`      | form value, validity, reset, constraint validation |
  | `a11y`       | roles, names, keyboard, focus                      |
  | `config`     | delivery options and config context                |
  | `theming`    | parts, states, tokens, shared vocabulary classes   |
  | `regression` | one reported bug each, named after the issue       |

  Old suffixes fold in: `host.api`/`requests` → `api`, `dom` → `behavior`, `validation` → `forms`,
  `configcontext` → `config`, `vocabulary` → `theming`; `correctresponse` moves to
  `qti-corrections` (phase 3). There is no `.todo` suffix.

- **Required**: every interaction has `.forms` and `.a11y`; every element in `plans/host-api.md`
  has `.api`.
- Existing files are renamed when a roadmap phase touches their package, with their VRT baseline in
  the same commit. `story-policy.spec.ts` (planned, roadmap G2; not enforced yet) holds a shrink-only list of today's
  violations; never add to it.

## Titles and the sidebar

- The `storySort` order in `.storybook/preview.ts` is the table of contents, by audience:
  Get started → Implementation → Elements and Interactions (one entry per component) → Theming →
  Testing (conformance, regression, e2e) last. A new top group goes into that list first.
- A docs page is one sidebar entry: its stories file shares its title and is tagged `!dev`.
- A demo that only shows an example uses the Getting started test (`GETTING_STARTED_TEST`,
  `packages/qti-test/src/components/qti-test/getting-started.fixtures.ts`) in the `Getting started`
  story's markup, plus only what the page is about.

## Play functions

- **Queries**: testing-library only (`getByRole`, `getByLabelText`, `getByText`, …, through
  `within` and the shadow-DOM helpers). A `querySelector` needs `// query-exception: <reason>` on
  the line above, and only when no accessible query can express the assertion.
- **One element under test**: assert only the element in the title, even when `qti-item` or
  `qti-test` scaffolds it. Integration belongs in `apps/e2e`.
- **Real user input**: `userEvent` and the drag helper (`tools/testing/drag.ts`). Never set
  `.response` or dispatch synthetic events to drive a story.
- **Assert the contract, not only the look**: every behaviour story also checks the
  `ElementInternals` form value and validity and the accessible state.

## Tags

| Tag         | Meaning                                                                           |
| ----------- | --------------------------------------------------------------------------------- |
| `autodocs`  | the main story only                                                               |
| `!dev`      | hidden from the sidebar (the stories behind a docs page)                          |
| `vrt`       | in the VRT set (kennisnet only)                                                   |
| `todo`      | a placeholder vitest skips; needs `// todo: #n` or `phase N` above it             |
| `xfail`     | never for conformance; elsewhere only with `// xfail: #n` above it                |
| `no-tests`  | a story without a play function that must not run                                 |
| `a11y-todo` | a known axe violation; `// a11y-todo: #n …` or `phase N` above it; per story only |

`skip-test` does not exist; a play function never carries `no-tests` (`story-tags.spec.ts`).
Accessibility: axe will fail every story locally and in CI, with `a11y-todo` as the only opt-out
(never on `meta`, never by switching off an axe rule): ROADMAP.md, "the accessibility gate". Planned,
roadmap G4; until then axe reports only and the `a11y-todo` tag does nothing yet. Write new stories
as if the gate were on.

## Addons

Each addon has one job; a new one needs a stated job and a row here.

| Addon                        | Job                                                        |
| ---------------------------- | ---------------------------------------------------------- |
| `@storybook/addon-docs`      | autodocs and MDX (with GitHub-flavoured Markdown)          |
| `@storybook/addon-vitest`    | runs every story's play function as a test                 |
| `@storybook/addon-a11y`      | axe on every story (the accessibility gate)                |
| `@storybook/addon-themes`    | the preset switcher (`data-qti-theme`)                     |
| `storybook-addon-tag-badges` | sidebar badges for `todo`, `xfail`, `a11y-todo`            |
| `@chromatic-com/storybook`   | none: Chromatic runs in no workflow; removed in roadmap G4 |
