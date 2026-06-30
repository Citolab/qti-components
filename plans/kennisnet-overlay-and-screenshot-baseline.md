# Plan: Kennisnet overrides as a togglable Storybook overlay + visual baseline

## Goal

Pin the **current visual truth** before any CSS refactor. Concretely:

1. The Kennisnet SCSS (currently untracked at `packages/qti-theme/src/styles/kennisnet/`) is moved into the existing `qti-theme` source tree under a self-documenting `overrides/` subdirectory, committed **unmodified**.
2. The `qti-theme` package gains a third export, `./kennisnet-override.css`, compiled from the SCSS source by a Sass build step that runs alongside the existing `postcss` build. The two pre-existing exports (`./item.css`, `./native.css`) and their dist artifacts are **untouched** — this is purely additive, no breaking change.
3. Storybook in QTI-Components gets a bottom-panel checkbox (via `@storybook/addon-cssresources`) that loads/unloads the override stylesheet at runtime by URL. **This is not a different theme** — the qti-components theme remains *the* theme. Kennisnet rides on top as an additive override layer.
4. The Kennisnet QTI items currently sitting in the editor's `public/qti/kennisnet/` are copied to QTI-Components' `public/assets/` so Storybook can serve them.
5. A new story renders all of those items, with the overlay toggle controlling whether they show plain or Kennisnet-styled.
6. Storybook test-runner (Playwright) captures screenshots of every Kennisnet story in both overlay states; the resulting baseline images are committed and become the **regression gate for any future CSS refactor**.

The intent: when the broader design-system refactor (see [plans/qti-design-system-refactor.md](plans/qti-design-system-refactor.md)) begins later, the Kennisnet-overlay screenshots are the contract for "visuals must not regress."

This work lands on the `breaking-changes-for-editor-release` branch in QTI-Components (already the home for breaking refactor work, per the standing memory). The `qti-theme` changes themselves are non-breaking and could ship to `main` independently if desired.

## Preparation already done

The following has been completed as setup for this plan and is **not** part of any phase below:

- **Storybook upgraded to 10.4.6** (from 10.3.3) on the `breaking-changes-for-editor-release` branch in QTI-Components via the official `pnpm dlx storybook@latest upgrade --yes` CLI. The upgrade also bumped `@chromatic-com/storybook` (5.1.1→5.2.1), `eslint-plugin-storybook` (10.3.3→10.4.6), `msw-storybook-addon` (2.0.6→2.0.7), and Storybook addon packages. `@wc-toolkit/storybook-helpers` was held at `^10.2.1` to keep the existing `patches/@wc-toolkit__storybook-helpers@10.2.1.patch` valid (the CLI had bumped it to ^10.5.1, which broke the patch — reverted that one line).
- **`pnpm run build-storybook` in QTI-Components verified to build cleanly** after the upgrade. Output at `storybook-static/`, no errors, normal Vite chunk-size warning only.
- **No automigrations were required** by the CLI (storybook reported "No automigrations detected").

---

## Architectural decisions

These are opinionated, locked-in choices.

### A1. Kennisnet SCSS source stays unmodified — relocated to `overrides/kennisnet/`

The 17 `.scss` files currently untracked at `packages/qti-theme/src/styles/kennisnet/` are moved (`git mv`-equivalent — but no git history yet, since they're untracked) to `packages/qti-theme/src/styles/overrides/kennisnet/`. No content edits — no selector rewrites, no nesting reorganization, no rename of individual files.

The new `overrides/` container is the third sibling of `qti-native/` (mandatory QTI3 spec layout) and `qti-theme/` (visual default theme). It exists to hold third-party visual overrides, one subdirectory per vendor. The folder structure itself documents the architectural split: **native = mandatory, theme = visual default, overrides = visual additions per vendor**.

Reasons:
- The user explicitly asked the Kennisnet source to stay "without modification".
- Audit confirmed Kennisnet content is fundamentally visual overrides — `::part()` color/border tweaks, `:state()` correctness recoloring, info-color usage, `color-mix()` shading. A small handful of utility-class redefinitions inside `qti-styles.scss` re-state rules that already live in `qti-native/qti3p0.css` (`.qti-align-*`, `.qti-hidden`, `.qti-visually-hidden`, `.qti-bordered`); we keep these as Kennisnet authored them — they're harmless duplication.
- Locking the source unchanged means the screenshots taken in Phase 6 are a faithful baseline of the Kennisnet stylesheet *as the third party wrote it*.

### A2. Distribution model — new package export `./kennisnet-override.css`

The Kennisnet bundle ships as a **first-class export** from the `qti-theme` package, on equal footing with `./item.css` and `./native.css`. Consumers load it via:

```ts
// consumer code (e.g. QTI-Components Storybook)
import overrideHref from '@qti-components/theme/kennisnet-override.css?url';
// then add/remove a <link href={overrideHref}> at runtime
```

This is purely additive — `package.json` gains one new entry under `"exports"`, and the build pipeline gains one new step. `./item.css` and `./native.css` are byte-identical to the pre-change build artifacts.

Why a `?url` import and `<link>` element instead of a direct `import`:

- The Kennisnet stylesheet sets rules at `:root, test-container` (verified in the SCSS audit). Scoping all of that under a class via `postcss-prefix-selector` would mangle the `:root` selector and force selector rewrites — exactly what A1 forbids.
- A static `import` would always-on the overrides and defeat the toggle.
- A `<link>` element is toggled by add/remove, which the browser handles natively.

| State | DOM | Effect |
|---|---|---|
| Toggle OFF (default) | no `<link>` | qti-theme baseline alone |
| Toggle ON | `<link>` injected | qti-theme + Kennisnet overrides |

A flicker on first toggle is acceptable for a dev/QA tool.

### A3. Sass via the standalone `sass` CLI alongside the existing `postcss` build

The `qti-theme` build today is:

```
postcss ./src/item.css -d dist -m && postcss ./src/native.css -d dist -m
```

We **append** a Sass compilation step that emits the third artifact:

```
postcss ./src/item.css -d dist -m \
 && postcss ./src/native.css -d dist -m \
 && sass --no-source-map ./src/kennisnet-override.scss ./dist/kennisnet-override.css
```

The Sass output is clean CSS — we do not pipe it through the existing `postcss.config.mjs`. The PostCSS config wires `postcss-class-apply`, which would error on the Kennisnet CSS (which doesn't use `@apply`). Routing Sass output around PostCSS keeps both pipelines self-contained and means no `postcss.config.mjs` changes — broader PostCSS-pipeline work is reserved for Phase 6 of [plans/qti-design-system-refactor.md](plans/qti-design-system-refactor.md).

(Autoprefixer is not applied to the Kennisnet bundle. The stylesheet uses modern features — `color-mix()`, `::part()`, `:state()` — that already require modern browsers. Adding autoprefixer later, if needed, is a one-line change.)

For the in-iframe story rendering, Vite (Storybook's bundler) handles `?url` imports automatically when `sass` is installed. No Storybook config change beyond the toggle decorator.

### A4. Visual regression tool: Storybook test-runner with Playwright `toHaveScreenshot`

The repo already has `@storybook/addon-vitest`, `@chromatic-com/storybook`, and `chromatic-runner.cjs`. We deliberately do NOT use Chromatic for this baseline:

- Chromatic is cloud-based; the user said "screenshots which we can compare" — local, file-based screenshots in the repo are easier to diff in PR review.
- Chromatic charges per snapshot; the Kennisnet item set may grow to dozens of stories.
- The baseline screenshots are *artifacts of this branch* — committing them couples the baseline to the same Git history as the source.

Tool choice: `@storybook/test-runner` with Playwright's built-in `toHaveScreenshot` assertion. Screenshots are saved per story name + viewport into a tracked directory (`tests/visual-baseline/`) and re-asserted on every test run. Diff failures produce side-by-side images in `test-results/`.

(Vitest browser mode does have `expect(page).toMatchScreenshot()` since v3, but it's newer and the integration with Storybook stories is less mature than the test-runner path. Vitest works for non-story unit-screenshot tests; for "render this story and screenshot it", test-runner is the path of least resistance.)

---

## Phase 0 — Discovery (DONE — captured here)

### Native-vs-theme audit (qti-theme package)

The current source tree already cleanly separates mandatory QTI3 spec rules from visual theme:

| Directory | Role | Confirmed contents |
|---|---|---|
| [packages/qti-theme/src/styles/qti-native/](packages/qti-theme/src/styles/qti-native/) | Mandatory QTI3 spec layout | `qti3p0.css` (display utilities `.qti-display-*`, `.qti-hidden`, `.qti-visually-hidden`, alignment `.qti-align-*`, margin/padding utilities), `qti3p0-override-layout.css`. Pure structural; no visual design. |
| [packages/qti-theme/src/styles/qti-theme/](packages/qti-theme/src/styles/qti-theme/) | Visual default theme | `qti-base.css` (~60 CSS custom properties + utility classes `.bordered`/`.form`/`.button`/`.spot`/`.drag` referenced via `@apply` from per-interaction CSS), `qti-interactions.css` (imports 18 per-interaction visual CSS), `qti-elements.css`. Pure visual; no spec-layout rules. |

Nothing in `qti-theme/` is actually a misplaced native rule. The architectural split exists and is correct; this plan does not move anything between these two directories.

### Kennisnet audit — confirmed visual overrides

Spot-read of [packages/qti-theme/src/styles/kennisnet/qti-styles.scss](packages/qti-theme/src/styles/kennisnet/qti-styles.scss) and two interaction files (`choice-interaction.scss`, `order-interaction.scss`):

- ✅ Predominantly visual: `::part(ch)` checkbox/radio recolor, `:state(candidate-correct/incorrect)` recolor, info-color overrides, SVG-mask status badges via `@include status-icon(...)`, `color-mix()` shading. All read via `var(--qti-*)` and `var(--bs-*)` custom properties.
- ⚠️ Caveat: `qti-styles.scss` lines 49–112 redefine utility classes that already exist in `qti3p0.css` (`.qti-align-left/center/right`, `.qti-valign-*`, `.qti-fullwidth`, `.qti-hidden`, `.qti-visually-hidden`, `.qti-bordered`, `.qti-well`). These are harmless near-duplications. Kennisnet's version simply re-asserts the same rules. We commit verbatim per A1.
- ⚠️ Caveat: `qti-styles.scss` defines a top-level `qti-item-body img { max-width: 100% }`, `progress {}` styling, `.item-correct/incorrect/partially-correct` rules. These are generic visual additions, not overrides of qti-theme defaults. They ship as part of the Kennisnet bundle because that's where the third party put them.
- 📌 Result: **Kennisnet is genuinely visual-only** and safe to ship as `kennisnet-override.css` without modifying the base theme.

### Files in scope

**Kennisnet SCSS source** (currently untracked; will live under `overrides/kennisnet/` per A1):
- `packages/qti-theme/src/styles/kennisnet/qti-styles.scss` — bundle entry (verified present, 172 lines)
- `packages/qti-theme/src/styles/kennisnet/_variables_wikiwijs.scss` — root color/spacing tokens
- `packages/qti-theme/src/styles/kennisnet/qti/qti-vars.scss` — QTI-specific custom properties
- `packages/qti-theme/src/styles/kennisnet/qti/_icon-mask.scss` — SVG mask helper mixin
- 13 more `packages/qti-theme/src/styles/kennisnet/qti/*-interaction.scss` files (choice, gap-match, match, text-entry, extended-text, hottext, inline-choice, order, select-point, feedback, modal-feedback, rubric-block, buttons)

Total: 17 SCSS files, ~935 lines. Confirmed via `git status` on `breaking-changes-for-editor-release`.

**qti-theme build & exports** (the file the user has open in the IDE):
- [packages/qti-theme/package.json](packages/qti-theme/package.json) — version 1.4.0; exports `./item.css` and `./native.css`; build is `postcss ./src/item.css -d dist -m && postcss ./src/native.css -d dist -m`.
- [packages/qti-theme/src/item.css](packages/qti-theme/src/item.css) — bundle entry (43 lines): layer declaration + `@import qti-native/index.css` + `@import qti-theme/index.css` + inline rules for hiding non-rendered QTI elements + `.full-correct-response` styling.
- [packages/qti-theme/src/native.css](packages/qti-theme/src/native.css) — single-line entry: `@import './styles/qti-native/index.css';`.

**Kennisnet QTI items source** (read-only):
- `/Users/patrickklein/Projects/Editor/QTI-Editor/public/qti/kennisnet/`
- Contents: `AssessmentTest.xml`, `ITEM001.xml` … `ITEM017.xml`, `METADATA001.xml`, `imsmanifest.xml`, `resources/` directory

**Storybook config**:
- [.storybook/main.ts](.storybook/main.ts) line 75: `staticDirs: ['../public']`
- [.storybook/preview.ts](.storybook/preview.ts) lines 22–24: imports `../packages/qti-theme/src/item.css` (the baseline theme)
- Already wired: `@storybook/addon-themes` (used as `withThemeByClassName` for `light`/`dark`)

**Build / scripts**:
- [package.json](package.json) — root `storybook` script is `run-p storybook:dev cem:storybook:watch`. New Sass watch script will join the `run-p` set.

**Target public folder**:
- `public/assets/` is the existing convention for QTI item fixtures (verified: `public/assets/qti-item/example-match.xml`, `public/assets/qti-assessment-stimulus-ref/*.xml`, `public/assets/qti-test-package-stimulus/*.xml`).
- Kennisnet items land at `public/assets/qti-kennisnet/`.

### Reference implementation (read-only — for copy/adapt)

- Any existing story that loads a QTI item from `public/assets/` via `<qti-item>` or `<qti-test>` — the Kennisnet story uses the same loader pattern. Likely candidates: `packages/qti-item/src/qti-item.stories.ts` or whichever story renders `public/assets/qti-item/example-match.xml`. The Phase 5 implementation reads one of these in full and mirrors the rendering pattern.
- [.storybook/preview.ts](.storybook/preview.ts) — `withThemeByClassName` usage shows the existing toolbar-decorator pattern; the new toolbar item uses the same `globalTypes` shape.
- Storybook test-runner Playwright recipe: https://storybook.js.org/docs/writing-tests/test-runner — `postVisit` hook + `page.screenshot()` + `toHaveScreenshot()`.

### Allowed APIs (verified to exist)

- **Sass / `sass` CLI** — install via `pnpm add -D sass`. The Sass CLI (`sass <in> <out>` and `sass --watch`) is the build mechanism for the standalone `kennisnet.css`.
- **Vite native Sass support** — when `sass` is installed, Vite (and therefore Storybook with Vite framework) compiles `.scss` imports automatically. Used for any in-iframe SCSS imports if needed.
- **Storybook `globalTypes` + decorator** — for adding the toolbar toggle. Documented in Storybook v10 docs.
- **Storybook test-runner** — `@storybook/test-runner` (Playwright-based). Provides `postVisit` hook in `.storybook/test-runner.ts`.
- **Playwright `toHaveScreenshot`** — built into Playwright; produces `*.png` baselines in a sibling directory.
- **`fs.readFileSync` for XML file lists** — Node script can enumerate `public/assets/qti-kennisnet/ITEM*.xml` at build time to auto-generate per-item story exports.

### Anti-patterns to avoid

- ❌ Do not modify any `.scss` file under `packages/qti-theme/src/styles/kennisnet/`. (A1.)
- ❌ Do not introduce `postcss-prefix-selector` to scope the Kennisnet rules. (A2 — the `:root` selectors don't survive prefix rewriting.)
- ❌ Do not import the Kennisnet SCSS from `preview.ts`. That would always-on the overrides and defeat the toggle. (A2.)
- ❌ Do not use Chromatic for this baseline. The screenshots live in the repo, not in the cloud. (A4.)
- ❌ Do not couple this work to the broader design-system refactor. Phase 6 of `plans/qti-design-system-refactor.md` removes `postcss-class-apply` and rewrites the layer order — this plan only ADDS infrastructure (Sass + overlay + screenshots) without disturbing the existing pipeline.
- ❌ Do not touch the editor (`/Users/patrickklein/Projects/Editor/QTI-Editor`). Item files are copied OUT of it but the editor itself is read-only for this plan.
- ❌ Do not commit the Kennisnet QTI items as "the canonical fixture set" — they're a Kennisnet-specific subset. Existing `public/assets/qti-*/` fixtures stay as the canonical generic fixtures.

---

## Phase 1 — Relocate and commit Kennisnet SCSS

**Output**: the 17 SCSS files move from their untracked location at `src/styles/kennisnet/` to a tracked location at `src/styles/overrides/kennisnet/`, with **no content changes**.

### What to implement

1. Verify the bundle entry exists. Confirmed: `qti-styles.scss` is present (172 lines, uses `@use` for namespace imports).

2. **Relocate** the directory:
   ```
   mkdir -p packages/qti-theme/src/styles/overrides
   mv packages/qti-theme/src/styles/kennisnet packages/qti-theme/src/styles/overrides/kennisnet
   ```
   Since the directory was untracked, this is a filesystem move with no git history rewrite — git sees the new location as fresh additions.

3. **Verify the SCSS `@use` paths still resolve.** The entry file `qti-styles.scss` references siblings via `@use '_variables_wikiwijs' as *;`, `@use './qti/buttons';`, etc. These are all relative to the entry's directory, so the move preserves them. (Spot-check by running Phase 2's `pnpm kennisnet:build` once Phase 2 is implemented — Sass will surface any unresolved `@use`.)

4. **Stage and commit**:
   ```
   git add packages/qti-theme/src/styles/overrides/
   git status   # confirm: only overrides/kennisnet/* is staged
   git commit -m 'chore(theme): commit kennisnet visual overrides at overrides/kennisnet/'
   ```

5. Add a `.gitattributes` rule if CI flags line-ending mismatches — likely unnecessary; add only if a hook complains.

### Verification checklist

- [ ] `git ls-files packages/qti-theme/src/styles/overrides/kennisnet/ | wc -l` returns ≥17.
- [ ] `ls packages/qti-theme/src/styles/kennisnet/ 2>/dev/null` returns nothing (directory is gone from old location).
- [ ] `diff <(cat backup-of-untracked-kennisnet/qti-styles.scss) packages/qti-theme/src/styles/overrides/kennisnet/qti-styles.scss` reveals zero differences. (Take a backup of the original untracked content before the move.)
- [ ] `grep -rn '@use' packages/qti-theme/src/styles/overrides/kennisnet/qti-styles.scss` shows all imports use relative paths — none have absolute or `kennisnet/`-prefixed paths that would break after the move. (Confirmed in audit; double-check.)
- [ ] No `.scss` file outside `packages/qti-theme/src/styles/overrides/kennisnet/` was changed.

### Anti-pattern guards

- ❌ Do not "tidy" the SCSS during this commit (no formatter, no Sass-lint pass, no file rename, no `@use` path rewrite).
- ❌ Do not leave the directory at `src/styles/kennisnet/`. The new `overrides/` container is the architectural anchor for "third-party visual overrides go here." (A1.)
- ❌ Do not commit any other untracked files in the same change. `git status` should show only `overrides/kennisnet/*` as added.

---

## Phase 2 — Add `kennisnet-override.css` as a `qti-theme` package export

**Output**: `packages/qti-theme/dist/kennisnet-override.css` is built from the SCSS source by the package's existing `build` script. The `qti-theme` `package.json` exposes a new export `./kennisnet-override.css`. Existing `./item.css` and `./native.css` exports build byte-identical artifacts to before — non-breaking.

### What to implement

1. **Install Sass** in the `qti-theme` package:
   ```
   pnpm add -D --filter @qti-components/theme sass
   ```
   (Workspace-root install is also fine if the repo convention prefers; check [package.json](package.json) for the convention before deciding.)

2. **Add the bundle entry file** [packages/qti-theme/src/kennisnet-override.scss](packages/qti-theme/src/kennisnet-override.scss). Thin and explicit — does nothing but re-`@use` the relocated Kennisnet entry:
   ```scss
   @use 'styles/overrides/kennisnet/qti-styles' as *;
   ```
   This file IS tracked in the repo (it's a build artifact concern, authored by us, not the third party — so A1's "don't modify Kennisnet source" rule doesn't apply to it).

3. **Extend the build script** in [packages/qti-theme/package.json](packages/qti-theme/package.json) from:
   ```
   "build": "postcss ./src/item.css -d dist -m && postcss ./src/native.css -d dist -m"
   ```
   to:
   ```
   "build": "postcss ./src/item.css -d dist -m && postcss ./src/native.css -d dist -m && sass --no-source-map ./src/kennisnet-override.scss ./dist/kennisnet-override.css"
   ```

4. **Add the export** to [packages/qti-theme/package.json](packages/qti-theme/package.json):
   ```json
   "exports": {
     "./item.css": "./dist/item.css",
     "./native.css": "./dist/native.css",
     "./kennisnet-override.css": "./dist/kennisnet-override.css"
   }
   ```
   The `files: ["dist"]` field already includes the new artifact — nothing else to add for publishing.

5. **Smoke-check the build**:
   ```
   pnpm --filter @qti-components/theme build
   ```
   Verify:
   - `dist/item.css` is byte-identical to its pre-change version (use a backup).
   - `dist/native.css` is byte-identical to its pre-change version.
   - `dist/kennisnet-override.css` is new, non-empty, and contains the compiled Kennisnet rules.

6. **Republish via yalc** so the QTI-Components workspace (and the editor) sees the new export:
   ```
   pnpm --filter @qti-components/theme yalc:push
   ```
   The existing yalc plumbing handles the rest (per the standing memory: yalc links between QTI-Components and QTI-Editor are wired).

### Verification checklist

- [ ] `pnpm --filter @qti-components/theme build` exits 0.
- [ ] `dist/kennisnet-override.css` is non-empty (likely > 10 KB; ~935 SCSS lines compile to comparable CSS).
- [ ] `grep '::part(' packages/qti-theme/dist/kennisnet-override.css` returns hits — confirms shadow-DOM-targeting selectors survived compilation.
- [ ] `grep ':state(' packages/qti-theme/dist/kennisnet-override.css` returns hits — confirms `:state()` selectors survived compilation.
- [ ] `diff dist/item.css.before dist/item.css` shows zero differences (non-breaking guarantee).
- [ ] `diff dist/native.css.before dist/native.css` shows zero differences.
- [ ] `node -e "console.log(require('./packages/qti-theme/package.json').exports['./kennisnet-override.css'])"` prints `./dist/kennisnet-override.css`.
- [ ] After `yalc:push`, the consumer workspace can resolve `@qti-components/theme/kennisnet-override.css` (try `node -e "console.log(require.resolve('@qti-components/theme/kennisnet-override.css'))"` from the QTI-Components root).

### Anti-pattern guards

- ❌ Do not pipe the Sass output through the existing `postcss.config.mjs`. That config wires `postcss-class-apply`, which errors on the Kennisnet output. (A3.)
- ❌ Do not import the SCSS directly from `.storybook/preview.ts`. The overlay is loaded via a runtime `<link>`, not via JS bundling. The whole point is toggle-ability. (A2.)
- ❌ Do not modify `src/item.css`, `src/native.css`, or anything under `src/styles/qti-native/` or `src/styles/qti-theme/`. This phase is purely additive.
- ❌ Do not move `dist/kennisnet-override.css` to `public/`. The artifact lives in the package's `dist/` — the Storybook decorator obtains a URL via a `?url` Vite import, not via static asset serving.

---

## Phase 3 — Storybook overlay toggle via `@storybook/addon-cssresources`

**Output**: Storybook's bottom addon panel gains a "CSS resources" tab with a single checkbox "Kennisnet overrides". Checked = the override stylesheet is injected as a `<link>` into the preview iframe; unchecked = removed. Every story renders correctly in both states. No custom decorator code — the addon does the load/unload.

### Decision: use `@storybook/addon-cssresources`, not a custom decorator

We evaluated the alternatives:

| Option | Verdict |
|---|---|
| `@storybook/addon-themes` (the native theme switcher) | Source-verified against the `next` branch (v10.5.0-alpha.9) — exports exactly `withThemeByClassName`, `withThemeByDataAttribute`, `withThemeFromJSXProvider`, and `DecoratorHelpers`. None injects or removes a `<link>` tag. The class/attribute decorators only flip a marker on an ancestor (default `<html>`); the JSX-provider decorator's `GlobalStyles` is a JSX component, not a `<link>`. With our Kennisnet SCSS at `:root, test-container` scope, no parent class can make those rules conditional without rewriting the source (forbidden by A1). The official `addon-styling`-era blog post documents loading both stylesheets via static `import` and selecting via class — doesn't fit toggling a single overlay on/off. **Doesn't fit.** |
| Storybook native "theming" (`storybook/theming`'s `create()`) | Themes the Storybook *manager UI / Docs chrome only*, not the preview iframe where stories render. **Out of scope.** |
| Custom `globalTypes` + decorator that injects/removes a `<link>` | Works but is ~15 lines of bespoke code that does what an existing addon already does. |
| **`@storybook/addon-cssresources` v7** | **Official storybookjs addon (published Nov 2025), Storybook 10 + CSF Next compatible, configures via `parameters.cssresources` — supply raw `<link>` HTML and a `picked` flag, addon handles inject/remove.** |
| `@etchteam/storybook-addon-css-variables-theme` | Archived June 2025; deprecated. |
| `storybook-stylesheet-toggle`, `storybook-theme-switch-addon` | Unverified Storybook 10 compatibility, community-maintained. |

`@storybook/addon-cssresources` UI is a **bottom-panel checkbox list**, not a top-toolbar dropdown. For a single on/off toggle this is arguably better UX than a 2-item dropdown. The user said "do not write something yourself if it is not necessary" — this addon makes a custom decorator unnecessary.

### What to implement

1. **Install the addon** in the workspace root:
   ```
   pnpm add -D -w @storybook/addon-cssresources
   ```

2. **Register the addon** in [.storybook/main.ts](.storybook/main.ts):
   ```ts
   const config: StorybookConfig = {
     // ...
     addons: [
       // ...existing addons...
       '@storybook/addon-cssresources',
     ],
   };
   ```

3. **Import the override CSS as a URL** at the top of [.storybook/preview.ts](.storybook/preview.ts):
   ```ts
   import kennisnetOverrideHref from '@qti-components/theme/kennisnet-override.css?url';
   ```
   Vite resolves the package export (via the yalc-linked dist artifact) and produces a URL string. No CSS bundling — the file is fetched only when the addon enables it.

4. **Declare the resource** under `parameters.cssresources`:
   ```ts
   const preview: Preview = {
     parameters: {
       // ...existing parameters...
       cssresources: [
         {
           id: 'Kennisnet overrides',
           code: `<link rel="stylesheet" href="${kennisnetOverrideHref}">`,
           picked: false,
           hideCode: true,
         },
       ],
     },
   };
   export default preview;
   ```

5. **Confirm the existing `withThemeByClassName` decorator** for light/dark stays intact. The Kennisnet checkbox is orthogonal — the user can have `light-theme` × Kennisnet-checked, etc.

6. **Smoke-test the addon in `@storybook/web-components-vite`**: the addon's README example targets `@storybook/react-vite`, so confirm framework compatibility first. Open Storybook, pick any story, look for the "CSS resources" tab in the bottom panel. Toggle the "Kennisnet overrides" checkbox and confirm the `<link>` appears/disappears in the iframe's `<head>` (via devtools). If the addon doesn't render the panel under web-components-vite, fall back to the custom-decorator approach documented in the "Decision" table — but the addon should work because its injection logic is framework-agnostic DOM manipulation.

7. **Full visual smoke-test**:
   - Pick [packages/qti-theme/src/stories/qti-theme.stories.ts](packages/qti-theme/src/stories/qti-theme.stories.ts).
   - Check the Kennisnet box → borders shift to purple `#9b77a9`, info color to Wikiwijs blue `#007ac3`, correct color to `#2b830e`. No console errors.
   - Uncheck → reverts to baseline.
   - Toggle persists across story navigation.

### Verification checklist

- [ ] `pnpm add -D -w @storybook/addon-cssresources` succeeds; package appears in root `devDependencies`.
- [ ] Storybook starts: `pnpm storybook`.
- [ ] Bottom addon panel shows a **CSS resources** tab with a single checkbox row "Kennisnet overrides", unchecked by default.
- [ ] Checking the box injects a `<link rel="stylesheet" href="...kennisnet-override.css">` into the iframe `<head>` (verify via the Storybook iframe devtools — the href is a Vite-resolved URL pointing at the yalc-linked dist artifact).
- [ ] Unchecking removes the `<link>`.
- [ ] The existing **Theme** story re-skins to Kennisnet colors when checked, reverts to baseline when unchecked.
- [ ] A representative interaction story (e.g. `02 Choice Interaction > Default`) also re-skins on toggle.
- [ ] `light` / `dark` theme picker still works orthogonally — Kennisnet × dark-theme is a valid combination.

### Anti-pattern guards

- ❌ Do not roll a custom `globalTypes` toolbar item for this. The addon already provides the UI; the user explicitly asked us not to write bespoke code where an addon exists.
- ❌ Do not try to use `@storybook/addon-themes` for this. Source-verified that it cannot load/unload `<link>` tags — see the Decision table above.
- ❌ Do not store the Kennisnet toggle state outside what the addon manages. `addon-cssresources` handles persistence; don't second-guess it.
- ❌ Do not refactor the existing `withThemeByClassName` decorator (light/dark) while you're in `preview.ts`. (Resist scope creep.)
- ❌ Do not declare `cssresources` with multiple `picked: true` entries unless you specifically want multiple stylesheets loaded by default. For "overlay on/off", a single entry with `picked: false` is correct.

---

## Phase 4 — Copy Kennisnet QTI items to QTI-Components public folder

**Output**: every Kennisnet item file from the editor's `public/qti/kennisnet/` is mirrored under `qti-components/public/assets/qti-kennisnet/`. Storybook serves them at `/assets/qti-kennisnet/ITEM001.xml`, etc.

### What to implement

1. **Copy** the entire directory:
   ```
   cp -R /Users/patrickklein/Projects/Editor/QTI-Editor/public/qti/kennisnet/ \
         /Users/patrickklein/Projects/Edtech/QTI/QTI-Components/public/assets/qti-kennisnet/
   ```

   Source contents (verified in discovery):
   - `AssessmentTest.xml`
   - `ITEM001.xml` … `ITEM017.xml`
   - `METADATA001.xml`
   - `imsmanifest.xml`
   - `resources/` (referenced media — full directory)

2. **Verify no absolute paths in the XMLs reference the editor**. Grep:
   ```
   grep -r 'QTI-Editor\|/qti/kennisnet' public/assets/qti-kennisnet/
   ```
   If any item references `/qti/kennisnet/resources/...` (likely — they probably use relative or `/qti/kennisnet/`-rooted hrefs), normalize to `./resources/...` or `/assets/qti-kennisnet/resources/...`. The exact form depends on how the existing `qti-item` loader resolves asset paths — model on the pattern used by `public/assets/qti-assessment-stimulus-ref/*.xml`.

3. **Add to `.gitattributes`** if any binary assets need explicit LFS or `-text` handling. Likely unnecessary — most are PNG/JPG which Git handles natively.

4. **Commit** with message `chore(public): copy kennisnet item set from editor as fixture`.

### Verification checklist

- [ ] `ls public/assets/qti-kennisnet/ | wc -l` returns ≥21 (17 ITEM files + 4 metadata/test files).
- [ ] `ls public/assets/qti-kennisnet/resources/ | wc -l` matches the editor's `resources/` directory (14 entries based on discovery).
- [ ] `pnpm storybook` then `curl http://localhost:6006/assets/qti-kennisnet/ITEM001.xml` returns the XML body (HTTP 200).
- [ ] No XML file references `/qti/kennisnet/` after any path normalization.
- [ ] Editor repo at `/Users/patrickklein/Projects/Editor/QTI-Editor` is untouched (`git status` clean in that repo).

### Anti-pattern guards

- ❌ Do not symlink the files. Storybook's static serving must work in CI / `build-storybook`, and symlinks across repos break that.
- ❌ Do not move the files (the editor still needs them at the source path for its own stories/tests).
- ❌ Do not edit the XML to "clean up" obscure namespaces or whitespace. They're fixtures — bit-identical to the editor's set keeps both repos comparable.

---

## Phase 5 — Author the Kennisnet items story

**Output**: a single Storybook file under `packages/qti-theme/src/stories/` (next to the existing `qti-theme.stories.ts`) that renders every Kennisnet item, one story per item. Each story uses the same item-loading pattern used elsewhere in the repo.

### What to implement

1. **Locate the existing item-render pattern**. Open a story that already loads an item from `public/assets/`. Likely candidates:
   - A story that uses `<qti-item>` to render `public/assets/qti-item/example-match.xml`
   - A story that uses `<qti-test>` to render `public/assets/qti-test-package-stimulus/assessment.xml`

   Read it in full. Note: the import path of the loader element, the property API for setting `xml-url` or `src`, and any required ancestor (`<test-container>`?). Copy that exact pattern.

2. **Create `packages/qti-theme/src/stories/qti-theme-kennisnet-items.stories.ts`**:

   ```ts
   import type { Meta, StoryObj } from '@storybook/web-components-vite';
   import { html } from 'lit';

   const meta: Meta = {
     title: 'Kennisnet/Items',
     parameters: {
       layout: 'fullscreen',
       backgrounds: { default: 'light' },
     },
   };
   export default meta;

   const ITEMS = [
     'ITEM001.xml','ITEM002.xml','ITEM003.xml','ITEM004.xml','ITEM005.xml',
     'ITEM006.xml','ITEM007.xml','ITEM008.xml','ITEM009.xml','ITEM010.xml',
     'ITEM011.xml','ITEM012.xml','ITEM013.xml','ITEM014.xml','ITEM015.xml',
     'ITEM016.xml','ITEM017.xml',
   ];

   const itemStory = (xml: string): StoryObj => ({
     name: xml.replace(/\.xml$/, ''),
     render: () => html`
       <!-- replace with the actual item-loader element verified in step 1 -->
       <qti-item xml-url="./assets/qti-kennisnet/${xml}"></qti-item>
     `,
   });

   export const Item001 = itemStory('ITEM001.xml');
   export const Item002 = itemStory('ITEM002.xml');
   // ... one export per ITEM file
   ```

   Generate the per-item exports programmatically if Storybook's static analysis tolerates it; otherwise hand-write 17 exports. (Storybook generally prefers named exports it can statically discover — hand-writing is safer.)

3. **Add a "Test" story** that renders the AssessmentTest.xml using `<qti-test>` (or whatever the test-level loader is). Same pattern as `public/assets/qti-test-package-stimulus/assessment.xml`'s story.

4. **Confirm both toggle states render correctly**:
   - With Kennisnet OFF, each item renders with baseline qti-theme styling.
   - With Kennisnet ON, each item picks up the Kennisnet overrides (purple borders, Wikiwijs blue info color, etc.).
   - No console errors. No layout overflow. Resources (images) under `resources/` load (network panel shows 200s for each asset).

### Verification checklist

- [ ] `packages/qti-theme/src/stories/qti-theme-kennisnet-items.stories.ts` exists.
- [ ] Storybook sidebar shows **Kennisnet > Items** with one story per ITEM XML (17 items) plus the AssessmentTest story.
- [ ] Each item story renders the item without console errors in both toggle states.
- [ ] Resource assets under `resources/` load (200 responses for any `<img>` or media).
- [ ] Toggling the Kennisnet overlay re-skins all 17 items in place (no story reload needed).

### Anti-pattern guards

- ❌ Do not invent a new item-loader element. Use whichever component the repo's existing stories use.
- ❌ Do not bundle the items into the story file via `import xml from '...xml?raw'`. Storybook serves them via `staticDirs`; fetching from `./assets/...` is the existing pattern.
- ❌ Do not author "variant" stories (one with overlay forced on, one off). The toggle handles state; one story per item is enough.
- ❌ Do not add a separate decorator to this story file to force the toggle. Toggle state belongs to the global toolbar; respecting it everywhere is the design.

---

## Phase 6 — Screenshot baseline via Storybook test-runner

**Output**: every Kennisnet item story has a committed PNG baseline. `pnpm test:visual` runs the test-runner and fails on any pixel diff above a small tolerance. This is the contract the CSS refactor must satisfy.

### What to implement

1. **Install dependencies**:
   ```
   pnpm add -D -w @storybook/test-runner @playwright/test
   pnpm exec playwright install --with-deps chromium
   ```
   (Verify whether these are already present — `@storybook/test-runner` may not be; `@playwright/test` may be a transitive dep already.)

2. **Configure the test-runner**. Create `.storybook/test-runner.ts`:
   ```ts
   import type { TestRunnerConfig } from '@storybook/test-runner';
   import { toMatchImageSnapshot } from 'jest-image-snapshot';

   const config: TestRunnerConfig = {
     setup() {
       expect.extend({ toMatchImageSnapshot });
     },
     async postVisit(page, context) {
       // Only screenshot Kennisnet story group
       if (!context.id.startsWith('kennisnet-')) return;

       for (const overlay of ['off', 'on'] as const) {
         // Manipulate the global directly via Storybook's args/globals URL params
         await page.goto(
           `http://localhost:6006/iframe.html?id=${context.id}&globals=kennisnet:${overlay}`,
         );
         await page.waitForSelector('[id="storybook-root"] *');
         await page.waitForTimeout(200); // settle for any fonts/web components

         const image = await page.screenshot({ fullPage: true });
         expect(image).toMatchImageSnapshot({
           customSnapshotIdentifier: `${context.id}__overlay-${overlay}`,
           customSnapshotsDir: 'tests/visual-baseline',
           failureThreshold: 0.01,
           failureThresholdType: 'percent',
         });
       }
     },
   };

   export default config;
   ```

3. **Add scripts to root [package.json](package.json)**:
   ```json
   "test:visual": "test-storybook --url http://localhost:6006",
   "test:visual:update": "test-storybook --url http://localhost:6006 -u"
   ```

4. **Commit baseline images** to `tests/visual-baseline/`. Add a `.gitattributes` entry if PNG storage should be LFS (the QTI-Components team's call — for ~34 PNGs at ~50–200 KB each, plain Git is fine).

5. **Write `tests/visual-baseline/README.md`** explaining:
   - How to regenerate baselines (`pnpm storybook` in one terminal, `pnpm test:visual:update` in another).
   - When to regenerate (only when an intentional visual change is approved).
   - That **any unintentional diff is a regression** and the PR author must justify or revert.

6. **Wire CI** (optional in-scope; can defer to a follow-up): add `test:visual` to GitHub Actions. The job spins up Storybook, runs the test-runner, and on failure uploads the diff PNGs from `test-results/` as artifacts.

### Verification checklist

- [ ] `pnpm test:visual:update` generates `tests/visual-baseline/kennisnet-items--item001__overlay-off.png` and `…__overlay-on.png` (and 16 more pairs + the AssessmentTest pair) — 36 PNGs total for 17 items + 1 test, both toggle states.
- [ ] `pnpm test:visual` (without `-u`) passes when baselines match.
- [ ] Manually mutating one Kennisnet SCSS value (e.g. change `--bs-primary` to red), recompiling, and re-running `pnpm test:visual` produces a failure with a useful diff image. Revert after verifying.
- [ ] Baseline PNGs are committed; `git status` is clean.
- [ ] `tests/visual-baseline/README.md` exists and documents the workflow.

### Anti-pattern guards

- ❌ Do not snapshot every story in the repo. Only the `kennisnet-` story group is in-scope for this baseline. Other stories' baselines are a separate decision.
- ❌ Do not commit `test-results/` (Playwright's diff output directory). Add to `.gitignore`.
- ❌ Do not chase pixel-perfect equality. `failureThreshold: 0.01` (1%) tolerates anti-aliasing and font-rendering noise. If tests prove flaky, raise to 0.02; do not raise above 0.05 without investigation.
- ❌ Do not run `test:visual` against a production-built Storybook (`build-storybook`). The dev server is fine and faster. CI can build-then-serve if isolation is needed.
- ❌ Do not block the broader refactor on screenshot perfection. If certain interactions are inherently animated (e.g. a slider's thumb position varies), exclude those story IDs in the test-runner config rather than fighting the noise.

---

## Open questions to resolve before Phase 5 (item story)

These don't block Phases 1–4 but the implementer answers them during Phase 5:

1. **Item-loader element**: is it `<qti-item>` with `xml-url=`, or another component? Verified by reading an existing story (Phase 5 step 1).
2. **Asset-path resolution**: do XML items reference `/qti/kennisnet/resources/...` (absolute) or `./resources/...` (relative)? Phase 4 step 2 inspects and normalizes.
3. **AssessmentTest vs individual items**: does the AssessmentTest.xml depend on the imsmanifest.xml manifest resolution, and does the repo's existing `<qti-test>` loader handle that? If not, the AssessmentTest story can be deferred.

---

## Out of scope for this plan

These are deliberately excluded; they belong to the broader [plans/qti-design-system-refactor.md](plans/qti-design-system-refactor.md):

- Refactoring `.styles.ts` files to functional-only
- Cascade-layer reordering (`@layer qti.tokens, qti.theme, ...`)
- Removing `postcss-class-apply`
- Removing `!important` from utility classes
- Adopting DTCG token JSON
- Switching mixin authoring to `postcss-mixins` with `--dashed-ident` names
- Editor (QTI-Editor) integration

The screenshot baseline produced by Phase 6 is the **regression contract** the refactor plan above must respect.
