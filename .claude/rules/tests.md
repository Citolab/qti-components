---
paths:
  - '**/*.spec.ts'
  - '**/*.test.ts'
  - 'apps/e2e/**'
  - 'vitest.config.ts'
---

# Tests

## Which kind of test

| The change is about                                                      | Write                                                    |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| logic with no rendering (processing, loader, transformers, state, tools) | a spec (`*.spec.ts`) next to the file                    |
| what one element does                                                    | a story play function (`.claude/rules/stories.md`)       |
| a member in `plans/host-api.md`                                          | an `.api` story whose play fails when the member breaks  |
| a QTI conformance criterion                                              | a conformance story (below)                              |
| a whole test or item used as a host does                                 | an e2e test in `apps/e2e` (below)                        |
| a reported bug                                                           | first a spec or story that fails without the fix         |
| a visual invariant                                                       | the kennisnet VRT set, only when nothing else can see it |

## Specs

- Pure logic only; anything rendered is a story. Colocated next to the file under test, never a
  `tests/` folder in a package.
- A spec with no DOM belongs in a node project; only a spec that needs a browser runs in Chromium.
- Specs, stories and tools get type-checked by `tsc` in CI (planned, roadmap G4; not enforced yet); run
  `pnpm run tsc` yourself meanwhile.

## End-to-end (`apps/e2e`)

- e2e means a whole `<qti-test>` or `<qti-item>` used the way a host uses it, through the public
  API in `plans/host-api.md` only (no internal imports, no shadow-root queries). Each test names the
  host it models.
- Vitest browser, Chromium only. Legacy Chrome is a manual `LEGACY=1` run. Brand presets and full
  product flows are tested in qti-player against `@next` / pkg.pr.new builds, not here.
- Regression stories in `apps/e2e/stories` are named `itemNNN-*.regression.stories.ts` after their
  item or issue.

## Conformance (`apps/e2e/src/stories/conformance`)

- One story per 1EdTech criterion, its ID in the story name (`Q2-L1-D51`), so the conformance
  matrix maps one to one.
- It loads the suite fixture from `public/assets/qti-conformance/` unmodified, and asserts the
  response and outcome variables after processing, not only what renders.
- The fixture validates against the QTI 3 XSD (planned, roadmap G3; not enforced yet). An Invalid Example passes when the item
  is rejected, by the XSD or by the runtime, and the story asserts the rejection. Never `xfail`.
- A criterion we do not pass yet: the story exists, tagged `todo` with `// todo: #n` or `phase N`.
  Never deleted.
- When the suite and the spec disagree, follow `.claude/rules/qti-spec.md`.

## VRT

- Only `apps/e2e/src/stories/kennisnet/kennisnet.stories.ts`, compared by
  `.storybook/vitest.vrt.setup.ts`, run in the pre-commit hook. Re-blessing
  (`pnpm run test:vrt:update`) is a claim: open every changed PNG and say what changed and why.
