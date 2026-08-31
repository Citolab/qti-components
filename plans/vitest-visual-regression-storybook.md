# Plan: Native Vitest 4 screenshot testing + in-canvas onion-skin review for Storybook

## Goal

Add **local, Chromatic-free visual-regression testing** to the QTI-Components Storybook, driven by the browser-mode screenshot matcher already available in the installed toolchain, and make visual changes **reviewable as an onion-skin overlay inside the Storybook canvas itself** (baseline PNG laid over the live story with an opacity slider).

Concretely, the finished feature delivers:

1. Every story tagged `vrt` gets a committed reference screenshot, captured by **Vitest 4 `toMatchScreenshot`** running through the **existing `@storybook/addon-vitest` + Playwright/Chromium** pipeline. No new test runner, no cloud account, no Chromatic.
2. Capture is wired so it runs **from Storybook** — clicking "Run tests" in the Storybook Vitest panel (or `pnpm test:vrt`) captures/compares. There are **no per-story `.spec` files**; the screenshot assertion lives in a shared setup file gated by the `vrt` tag.
3. `apps/e2e/src/stories/kennisnet-all-items.stories.ts` (the file the user opened) is the first opt-in set: its meta gets `tags: ['vrt']` — its existing `no-tests` tag keeps it out of the functional test project, so it participates **only** in VRT.
4. A custom **Storybook toolbar toggle + decorator** overlays the matching baseline PNG over the live story with an opacity slider (onion-skinning), reading the PNGs off disk via `staticDirs`. This is the "eyeball the changes in Storybook itself" experience.
5. `@vitest/ui` (already a dependency) provides the secondary, richer **A/B-slider diff view** for formal pass/fail review.

This lands on `breaking-changes-for-editor-release` (the standing home for this work).

---

## Relationship to existing plans

- **Supersedes Phase 6** of [plans/kennisnet-overlay-and-screenshot-baseline.md](kennisnet-overlay-and-screenshot-baseline.md), which chose `@storybook/test-runner` + `jest-image-snapshot`. That plan itself noted (its decision **A4**) that Vitest browser screenshots were "newer / less mature." The user has now explicitly chosen the Vitest-native path, and the repo already runs stories through `@storybook/addon-vitest`, so Vitest is now the path of least resistance. **Do not** install `@storybook/test-runner`, `@playwright/test`, or `jest-image-snapshot`.
- **Terminology guard:** the word "overlay" in the older plan means a *CSS vendor-override toggle* (Kennisnet styling on/off) — already shipped as the `override` `globalType` in [.storybook/preview.ts](.storybook/preview.ts):152. In THIS plan, "overlay" means the *screenshot onion-skin* (baseline image over live story). To avoid collision, the new toolbar controls are named `baseline` / `baselineOpacity`, never `override`.
- The broader [plans/qti-design-system-refactor.md](qti-design-system-refactor.md) is the consumer of this contract: VRT baselines become the "visuals must not regress" gate for that refactor.

---

## Architectural decisions (locked-in)

### A1. Engine = Vitest 4 `toMatchScreenshot`, reusing the existing browser project

Installed and confirmed: `vitest@4.1.1`, `@vitest/browser@4.1.1`, `@vitest/browser-playwright@4.1.1`, `@vitest/ui@4.1.1`, `playwright@1.60.0`, `@storybook/addon-vitest@10.4.6`, Storybook `10.4.6`. Zero new runtime dependencies are required. The matcher is native browser-mode API.

### A2. Capture wiring = a dedicated `vrt` Vitest project + a tag-gated `afterEach`

The current [vitest.config.ts](vitest.config.ts) defines two projects: `stories` (storybookTest, excludes `skip-test`/`no-tests`/`xfail`) and `tests` (plain specs). We **add a third project `vrt`** that:
- uses `storybookTest({ tags: { include: ['vrt'] } })` so only `vrt`-tagged stories run there,
- has its own setup file that registers an `afterEach` calling `toMatchScreenshot`.

This keeps VRT isolated: the functional `stories` project is untouched and does **not** take screenshots. Because the screenshot logic lives in the setup file's project annotations (not in `.spec` files), capture runs whenever the story runs — including via the **"Run tests" button in the Storybook Vitest addon panel**, satisfying "not only in unit tests or spec files."

**Why `afterEach` and not portable-stories specs:** the addon-vitest pipeline already renders each story in the browser and runs its play function; an `afterEach` at the project-annotation level fires after render+play with the story's DOM live (`context.canvasElement`). Portable stories (`composeStories`) would mean authoring `.spec` files — which the user explicitly does not want.

### A3. Tag gate = `vrt`; kennisnet keeps `no-tests`

`kennisnet-all-items.stories.ts` currently has `tags: ['autodocs', 'no-tests']`. We change it to `tags: ['autodocs', 'no-tests', 'vrt']`. `no-tests` keeps it out of the functional `stories` project; `vrt` opts it into the new `vrt` project. Any future story opts in the same way — add `'vrt'` to its tags.

### A4. Review UX = custom in-canvas onion-skin overlay (primary) + `@vitest/ui` slider (secondary)

Research confirmed **no maintained Storybook-manager addon** overlays a baseline over the live canvas in SB 10 (the two that did — `pixel-perfect-storybook-addon`, `storybook-addon-perfect-design` — are abandoned, last touched 2022/2020; `@storybook/addon-designs` only embeds images in a side panel, not over the canvas; the `@storybook/addon-vitest` panel shows pass/fail, not diff images). So we **build a small custom decorator + toolbar** (~1 file), mirroring the exact pattern already used for the `override` toolbar in `preview.ts`. `@vitest/ui` provides the tabbed A/B-slider diff view as the formal secondary review path (confirmed in the Vitest visual-regression guide).

### A5. Baseline platform consistency

Vitest names references `<name>-<browser>-<platform>.png` (e.g. `-chromium-darwin` on this Mac, `-chromium-linux` in CI). Baselines are **not** portable across OS font rendering. **Decision for v1:** generate and commit baselines on the developer machine (`darwin`), and make the platform suffix a single constant in the overlay decorator (`BASELINE_PLATFORM`). Cross-platform hardening (run VRT in a pinned Linux container so CI and local agree, per the Vitest guide's own font-consistency recommendation) is called out as a **Phase 5 follow-up**, not a v1 blocker.

---

## Phase 0 — Documentation Discovery (DONE — captured here)

All facts below are from official docs (WebFetch, cited) cross-checked against the installed versions. Gaps are flagged, not invented.

### Allowed APIs — Vitest `toMatchScreenshot`
Source: https://vitest.dev/api/browser/assertions and https://vitest.dev/guide/browser/visual-regression-testing

- **Signature (two overloads):**
  ```ts
  await expect(element).toMatchScreenshot(options?: ScreenshotMatcherOptions): Promise<void>
  await expect(element).toMatchScreenshot(name?: string, options?: ScreenshotMatcherOptions): Promise<void>
  ```
  `element` is a Vitest locator or the `page` object. `name` (when given) comes first.
- **`ScreenshotMatcherOptions`:** `comparatorName` (`"pixelmatch"`, the only comparator), `comparatorOptions`, `screenshotOptions` (the `locator.screenshot()` options **minus** `base64`/`path`/`save`/`type`), `timeout` (default `5000`).
- **`comparatorOptions` (pixelmatch) defaults:** `threshold: 0.1`, `allowedMismatchedPixelRatio: undefined`, `allowedMismatchedPixels: undefined`, `includeAA: false`, `alpha: 0.1`, `aaColor: [255,255,0]`, `diffColor: [255,0,0]`, `diffMask: false`. When both `allowedMismatchedPixelRatio` and `allowedMismatchedPixels` are set, the **stricter** limit wins.
- **Storage:** references in `__screenshots__/` **next to the test file**, named `<test-file>/<test-name>-<browser>-<platform>.png`. On failure, actual + diff go to `.vitest-attachments/` as `…-actual.png` / `…-diff.png`. First run with no baseline **creates the reference and fails** ("No existing reference screenshot found").
- **Update baselines:** run Vitest with **`--update`**.
- **Global config** (verbatim shape):
  ```ts
  test: { browser: { expect: { toMatchScreenshot: {
    comparatorName: 'pixelmatch',
    comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.01 },
  } } } }
  ```
- **Masking dynamic regions:** `screenshotOptions: { mask: [page.getByTestId('…')] }`.
- **Stability guidance:** set viewport (`await page.viewport(1280, 720)`); inject CSS to zero out animations/transitions; `await document.fonts.ready`; prefer screenshotting a specific element over full page; commit references to VCS.

**Gaps (verify against installed types, do not assume):** `resolveScreenshotPath` / `resolveDiffPath` config is **not** in public docs — do not rely on custom path resolution; instead make filenames deterministic via the `name` argument. The exact full field list of `screenshotOptions` beyond `mask`/`timeout`/`animations` is not enumerated in docs.

### Allowed APIs — Storybook hooks & portable stories (fallback)
Source: https://storybook.js.org/docs/writing-tests/interaction-testing and https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest

- **`afterEach`** is supported at **preview / meta / story** level, runs after render + play, receives a context including `canvas` / `canvasElement`. This is the hook for capture (A2).
- Fallback only (not used per A2): `composeStories`/`composeStory` from `@storybook/web-components-vite`; a composed story's `run(context)` **mounts + runs play**, `play(context)` runs play only. **Gap:** docs don't spell out the web-components mount target of `run()` — confirm empirically if ever needed.

### Allowed APIs — Storybook overlay (toolbar + decorator + staticDirs)
Source: https://storybook.js.org/docs/essentials/toolbars-and-globals, https://storybook.js.org/docs/writing-stories/decorators, https://storybook.js.org/docs/api/main-config/main-config-static-dirs

- **`globalTypes` + `toolbar`** define toolbar controls; a **global decorator** reads `context.globals.*` and mutates the iframe DOM. The repo already does exactly this for `override` — copy that pattern ([.storybook/preview.ts](.storybook/preview.ts):85-113, :152-166).
- **`staticDirs`** accepts `{ from, to }` mappings to serve an arbitrary local folder into the iframe (e.g. `{ from: '../apps/e2e/src/stories/__screenshots__', to: '/baselines' }`).
- **`context.id`** is the stable, globally-unique story id available on the decorator context — used to build the baseline URL.

### Local facts
- Platform is `darwin` (baselines will be `-chromium-darwin` locally).
- [.storybook/main.ts](.storybook/main.ts):75 already has `staticDirs: ['../public']` — we append, not replace.
- [.storybook/preview.ts](.storybook/preview.ts) already exports `globalTypes.override` + a DOM-mutating decorator — the overlay mirrors this shape.
- E2E stories get `titlePrefix: 'E2E'` ([.storybook/main.ts](.storybook/main.ts)), so `title: 'Kennisnet All Items'` → story ids like `e2e-kennisnet-all-items--meerkeuzevraag-een-antwoord`.
- Kennisnet stories load images from local `public/assets/...` and (via the Kennisnet override) remote CDN glyphs — **image load waiting is mandatory** before screenshot (Phase 2).

### Anti-patterns to avoid
- ❌ Do not add `@storybook/test-runner`, `@playwright/test`, or `jest-image-snapshot` (superseded — A1).
- ❌ Do not author per-story `.spec` files for capture (violates "not only in spec files" — A2).
- ❌ Do not rely on undocumented `resolveScreenshotPath`; make filenames deterministic with the `name` arg.
- ❌ Do not name the new toolbar `override` (collides with the existing CSS-override toggle — A4 terminology guard).
- ❌ Do not enable screenshots in the functional `stories` project (VRT is isolated to the `vrt` project — A2).
- ❌ Do not adopt the abandoned `pixel-perfect-storybook-addon` / `storybook-addon-perfect-design` (unmaintained, pre-SB9).

---

## Phase 1 — VRT capture engine (Vitest project + tag-gated screenshot)

**Output:** a `vrt` Vitest project that screenshots every `vrt`-tagged story; kennisnet opts in; baselines generated and committed.

### What to implement

1. **Tag the kennisnet stories.** In [apps/e2e/src/stories/kennisnet-all-items.stories.ts](apps/e2e/src/stories/kennisnet-all-items.stories.ts):12, change:
   ```ts
   tags: ['autodocs', 'no-tests'],
   ```
   to:
   ```ts
   tags: ['autodocs', 'no-tests', 'vrt'],
   ```

2. **Create the VRT setup file** `.storybook/vitest.vrt.setup.ts` — composes the existing preview annotations and registers the screenshot `afterEach`, keyed to `context.id` for a deterministic filename:
   ```ts
   import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
   import { afterEach, beforeAll, expect } from 'vitest';
   import { page } from 'vitest/browser';
   import { setProjectAnnotations } from '@storybook/web-components-vite';

   import * as previewAnnotations from './preview';

   const annotations = setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);
   beforeAll(annotations.beforeAll);

   // Screenshot every story that runs in THIS project (the config gates it to tag 'vrt').
   // Named by the Storybook story id so the overlay decorator can address the PNG.
   afterEach(async () => {
     const storyId = expect.getState().currentTestName ?? 'unknown';
     // The story root rendered by addon-vitest. #storybook-root is the canvas mount.
     await expect(page.getByTestId?.('storybook-root') ?? page).toMatchScreenshot(storyId);
   });
   ```
   > **Implementer note (resolve during build):** confirm how to obtain the story id + root element inside the addon-vitest `afterEach`. Two known-good options, pick whichever the installed types expose:
   > - Storybook project-annotation `afterEach(context)` gives `context.id` and `context.canvasElement` directly — prefer this if the addon forwards a Storybook context.
   > - Otherwise use the Vitest `page` locator for `#storybook-root` and derive the id from the test name. Verify `page` import path (`vitest/browser` in v4; older `@vitest/browser/context`).
   >
   > The **must-haves**: (a) the screenshot targets the story root element, not the whole iframe; (b) the reference filename is derived from `context.id` so Phase 3's overlay can find it.

3. **Add the `vrt` project** to [vitest.config.ts](vitest.config.ts) `projects: [...]`, alongside `stories` and `tests`:
   ```ts
   {
     plugins: [
       storybookTest({
         tags: { include: ['vrt'] },
         configDir: path.join(dirname, '.storybook'),
         storybookScript: 'pnpm run storybook -- --ci',
       }),
       tsconfigPaths(),
     ],
     test: {
       name: 'vrt',
       setupFiles: ['./.storybook/vitest.vrt.setup.ts'],
       globals: true,
       browser: {
         enabled: true,
         // @ts-ignore
         provider: playwright(),
         headless: true,
         viewport: { width: 1280, height: 720 },
         screenshotFailures: false,
         instances: [{ browser: 'chromium' }],
         // Phase 2 fills in expect.toMatchScreenshot defaults here.
       },
     },
   }
   ```

4. **Add package.json scripts** (root [package.json](package.json) `scripts`):
   ```json
   "test:vrt": "vitest run --project vrt",
   "test:vrt:update": "vitest run --project vrt --update",
   "test:vrt:ui": "vitest --project vrt --ui"
   ```

5. **Generate + commit baselines:** `pnpm run test:vrt:update`, review the PNGs in `apps/e2e/src/stories/__screenshots__/…` by eye, then commit them. Add `.vitest-attachments/` to [.gitignore](.gitignore).

### Verification checklist
- [ ] `pnpm run test:vrt:update` creates `apps/e2e/src/stories/__screenshots__/kennisnet-all-items.stories/<id>-chromium-darwin.png` — one per exported story (16 stories).
- [ ] `pnpm run test:vrt` (no `--update`) **passes** on the committed baselines.
- [ ] The functional suite is unaffected: `pnpm test` (the `stories` + `tests` projects) still passes and produces **no** screenshots.
- [ ] Deliberately tweak one kennisnet color inline, re-run `pnpm run test:vrt` → it **fails** and writes an `…-diff.png` to `.vitest-attachments/`. Revert.
- [ ] `.vitest-attachments/` is git-ignored; `__screenshots__/` PNGs are committed.

### Anti-pattern guards
- ❌ Do not put the screenshot `afterEach` in `.storybook/preview.ts` (it would run in the functional `stories` project too). It belongs in the `vrt`-only setup file.
- ❌ Do not screenshot `page` (full iframe) if a story-root locator is available — element screenshots are far more stable (Phase 0 guidance).
- ❌ Do not commit `.vitest-attachments/`.

---

## Phase 2 — Stabilization (deterministic captures)

**Output:** captures are stable across runs — animations off, fonts + images loaded, sensible tolerance. QTI items render web components and load images (local `public/assets` + Kennisnet CDN glyphs), so waiting is mandatory.

### What to implement

1. **Set the matcher tolerance globally** in the `vrt` project's `browser` block ([vitest.config.ts](vitest.config.ts)):
   ```ts
   expect: {
     toMatchScreenshot: {
       comparatorName: 'pixelmatch',
       comparatorOptions: { threshold: 0.2, allowedMismatchedPixelRatio: 0.01 },
     },
   },
   ```
   (Start at 1% mismatch ratio; raise only if font/AA noise proves flaky. Do not exceed ~5% without investigating.)

2. **Zero out animations/transitions** — inject once in the VRT setup file's `beforeAll` (Phase 0 CSS), so no story animates during capture:
   ```css
   *, *::before, *::after {
     animation-duration: 0s !important; animation-delay: 0s !important;
     transition-duration: 0s !important; transition-delay: 0s !important;
   }
   ```

3. **Wait for readiness before the screenshot** in the `afterEach`, before `toMatchScreenshot`:
   ```ts
   await document.fonts.ready;
   // Wait for all <img> inside the story root to finish loading (or error out).
   const imgs = Array.from(document.querySelectorAll('#storybook-root img'));
   await Promise.all(imgs.map(img =>
     img.complete ? Promise.resolve()
       : new Promise(res => { img.addEventListener('load', res, { once: true });
                              img.addEventListener('error', res, { once: true }); })));
   ```
   > Web components: also `await customElements.whenDefined('qti-item-body')` (and any other custom element the story root uses) so upgraded rendering is complete before capture.

4. **Mask genuinely nondeterministic regions** (only if any surface flakiness) via `screenshotOptions.mask` (Phase 0). The kennisnet items are static content — likely none needed; revisit only if a story flaps.

### Verification checklist
- [ ] `pnpm run test:vrt` run **3 times consecutively** with no source change → passes all three (no flaky diffs).
- [ ] Stories with images (e.g. `MeerkeuzevraagEenAntwoord`, `Matrixvraag`) capture with the images present, not blank/placeholder.
- [ ] No `…-diff.png` appears in `.vitest-attachments/` across the three stable runs.

### Anti-pattern guards
- ❌ Do not raise `threshold`/`allowedMismatchedPixelRatio` to paper over a *real* rendering race — fix the wait instead.
- ❌ Do not screenshot before `document.fonts.ready` and image load resolve — text/image reflow is the #1 flake source.
- ❌ Do not mask large areas to hide legitimate content; masking is for truly dynamic pixels only.

---

## Phase 3 — In-canvas onion-skin overlay review

**Output:** a Storybook toolbar control ("Baseline" on/off + opacity slider) that lays the story's committed baseline PNG over the live canvas, so the developer eyeballs drift directly in Storybook. Fully local; ~1 file of code mirroring the existing `override` decorator.

### What to implement

1. **Serve the baselines** — append to `staticDirs` in [.storybook/main.ts](.storybook/main.ts):75:
   ```ts
   staticDirs: [
     '../public',
     { from: '../apps/e2e/src/stories/__screenshots__', to: '/baselines' },
   ],
   ```
   Baseline for a story is then fetchable at `/baselines/kennisnet-all-items.stories/<context.id>-chromium-darwin.png`.

2. **Add toolbar controls** to `globalTypes` in [.storybook/preview.ts](.storybook/preview.ts):152 (sibling of the existing `override`):
   ```ts
   baseline: {
     name: 'Baseline',
     description: 'Overlay the committed VRT baseline screenshot over the live story',
     defaultValue: 'off',
     toolbar: {
       icon: 'photo',
       items: [
         { value: 'off', title: 'Baseline off' },
         { value: 'overlay', title: 'Overlay baseline' },
         { value: 'diff', title: 'Difference blend' },
       ],
       dynamicTitle: true,
     },
   },
   baselineOpacity: {
     name: 'Overlay opacity',
     defaultValue: '50',
     toolbar: {
       icon: 'contrast',
       items: ['25', '50', '75', '100'].map(v => ({ value: v, title: `${v}%` })),
       dynamicTitle: true,
     },
   },
   ```

3. **Add the overlay decorator** to the `decorators` array in [.storybook/preview.ts](.storybook/preview.ts):85 (after the existing ones), mirroring the `override` decorator's DOM approach:
   ```ts
   const BASELINE_DIR = '/baselines';
   const BASELINE_SUBFOLDER = 'kennisnet-all-items.stories'; // v1: kennisnet-scoped
   const BASELINE_PLATFORM = 'chromium-darwin';              // A5: local platform suffix
   const BASELINE_IMG_ID = 'vrt-baseline-overlay';

   (story, context) => {
     // Remove any prior overlay first.
     document.getElementById(BASELINE_IMG_ID)?.remove();
     const mode = context.globals.baseline as string | undefined;
     if (mode && mode !== 'off') {
       const opacity = Number(context.globals.baselineOpacity ?? 50) / 100;
       const img = document.createElement('img');
       img.id = BASELINE_IMG_ID;
       img.src = `${BASELINE_DIR}/${BASELINE_SUBFOLDER}/${context.id}-${BASELINE_PLATFORM}.png`;
       img.onerror = () => img.remove(); // no baseline for this story → hide gracefully
       Object.assign(img.style, {
         position: 'fixed', top: '0', left: '0', zIndex: '2147483647',
         pointerEvents: 'none', opacity: String(opacity),
         mixBlendMode: mode === 'diff' ? 'difference' : 'normal',
       });
       // Append after render so it sits on top of the story.
       queueMicrotask(() => document.body.appendChild(img));
     }
     return story();
   }
   ```
   > **Baseline-path mapping (the one real integration risk, medium confidence):**
   > - The **subfolder** (`kennisnet-all-items.stories`) is Vitest's test-file folder name. v1 hardcodes it because VRT is kennisnet-scoped. **Generalization path** when more files opt in: have the Phase 1 `afterEach` also emit a tiny `context.id → relativePath` manifest JSON that the decorator fetches, or serve the whole `__screenshots__` tree and search. Do not over-build this in v1.
   > - The **platform suffix** is `-chromium-darwin` locally. Keep it a single constant; the A5 follow-up (pinned Linux container) flips it to `-chromium-linux` once baselines are generated in CI.

4. **Manual eyeball workflow doc** — add a short `docs/visual-regression.md` (or a section in the existing storybook docs) explaining: run `pnpm storybook`, open a kennisnet story, toolbar → "Overlay baseline" + opacity, and (if drift) toolbar → "Difference blend" to highlight changed pixels; then `pnpm run test:vrt` for the pass/fail gate and `pnpm run test:vrt:ui` for the A/B slider.

### Verification checklist
- [ ] `pnpm storybook`, open a kennisnet story, toolbar shows **Baseline** + **Overlay opacity** controls.
- [ ] "Overlay baseline" lays the committed PNG over the live story; the opacity items visibly change blend; "Baseline off" removes it.
- [ ] Overlaid baseline on an **unchanged** story lines up pixel-for-pixel (ghosting only at sub-pixel AA).
- [ ] "Difference blend" on a story after a deliberate CSS tweak highlights exactly the changed region; revert.
- [ ] A story with **no** baseline (e.g. a non-`vrt` story) shows no broken image (the `onerror` hides it).
- [ ] The existing `override` (Citolab/Kennisnet) toolbar still works and is independent of the new controls.

### Anti-pattern guards
- ❌ Do not fetch baselines over the network or from a cloud bucket — they are served locally via `staticDirs`.
- ❌ Do not leave a stale overlay `<img>` when switching stories — remove-before-add (the decorator does this).
- ❌ Do not reuse the `override` global or its icon — separate controls, separate names (A4).
- ❌ Do not hardcode a single story's dimensions; the fixed-position full-size PNG aligns because capture and canvas share the `1280×720` viewport (Phase 1/2).

---

## Phase 4 — Scripts, secondary review, docs, Chromatic wind-down

**Output:** the workflow is discoverable and Chromatic is no longer the visual-testing story.

### What to implement
1. Confirm the Phase 1 scripts (`test:vrt`, `test:vrt:update`, `test:vrt:ui`) are present and documented in the repo's script reference / README.
2. Document the **secondary review path**: `pnpm run test:vrt:ui` opens `@vitest/ui`, whose visual-regression view shows a **tabbed reference/actual/diff with an A/B slider** (confirmed in the Vitest guide) — the formal diff review to complement the in-canvas overlay.
3. **Chromatic wind-down (optional, confirm with maintainer):** the repo still carries `@chromatic-com/storybook`, `chromatic`, and `chromatic-runner.cjs` plus a `chromatic` script. This plan does not require removing them, but they are now redundant for visual testing. Recommend: drop `@chromatic-com/storybook` from [.storybook/main.ts](.storybook/main.ts) `addons`, and remove the `chromatic` script + `chromatic-runner.cjs` + the two deps — **only after** the user confirms no external Chromatic workflow depends on them. Leave in place if unsure.
4. **CI note (optional):** a `test:vrt` CI job must generate baselines on the **same platform** it asserts on (A5). Defer real CI wiring to the A5 follow-up.

### Verification checklist
- [ ] `pnpm run test:vrt:ui` opens Vitest UI and shows the diff/slider view for a failing capture.
- [ ] Script reference / README documents capture, update, UI, and the in-canvas overlay.
- [ ] If Chromatic removal is done: `pnpm run build-storybook` still builds; `grep -r chromatic` shows only intentional leftovers (or none).

### Anti-pattern guards
- ❌ Do not remove Chromatic deps/scripts without explicit confirmation — an external CI or Netlify/Chromatic project may still call them.
- ❌ Do not wire a naive CI job that captures on Linux and asserts against committed `darwin` baselines — resolve A5 first.

---

## Phase 5 — Verification & follow-ups

### Final verification
1. `pnpm run test:vrt` — green on committed baselines.
2. `pnpm test` — functional `stories` + `tests` projects green, **no** screenshots produced (VRT isolation intact).
3. In Storybook, the **Baseline overlay** toggles and blends correctly across several kennisnet stories.
4. `pnpm run test:vrt:ui` — Vitest UI diff/slider view works.
5. Grep guards:
   - `grep -rn "toMatchScreenshot" .storybook vitest.config.ts` → only in the `vrt` setup file / config.
   - `grep -rn "jest-image-snapshot\|@storybook/test-runner\|@playwright/test" package.json` → **no matches** (superseded stack not introduced).
   - `grep -rn "vrt" apps/e2e/src/stories/kennisnet-all-items.stories.ts` → tag present.

### Follow-ups (out of scope for v1, tracked)
- **A5 cross-platform hardening:** run VRT inside a pinned Linux container (matching CI) so `-linux` baselines are the committed source of truth; flip `BASELINE_PLATFORM` and regenerate. This is also the Vitest guide's recommended fix for font-rendering consistency.
- **Generalize the overlay subfolder mapping** (Phase 3 note) once VRT expands beyond kennisnet: emit a `context.id → baseline path` manifest from the capture `afterEach`, or serve the full `__screenshots__` tree and resolve by id.
- **Expand `vrt` coverage:** add `tags: ['vrt']` to interaction / theme stories as the design-system refactor ([plans/qti-design-system-refactor.md](qti-design-system-refactor.md)) needs a regression gate.

---

## Out of scope
- Any Chromatic/cloud visual service (explicitly rejected).
- The CSS design-system refactor itself (this only builds the regression gate for it).
- Editor (`QTI-Editor`) integration.
- Full CI wiring beyond the A5 platform-consistency prerequisite.
