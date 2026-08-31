# Plan: QTI design-system refactor — layered, token-driven, multi-theme

## Goal

Refactor the QTI-Components CSS into a unified design system that satisfies five contracts simultaneously:

1. **Authoring surface**: all theme-level CSS is written against **element names**, `::part()`, `:state()`, and `:host()` — never against class hooks or descendant chains. Third parties extend us by writing the same kind of CSS, never by overriding our internals.
2. **`.styles.ts` is functional-only**: per-interaction Lit `css` blocks contain only the styles the element needs *to work* (display, layout primitives, positioning). Visual design is **not** in `.styles.ts`.
3. **Cascade layers** (`@layer`) carry override priority. Third-party CSS lands in a layer that always wins, without `!important`.
4. **Design tokens** are the single source of truth for visual values. Tokens are authored in the DTCG JSON format, compiled to CSS custom properties, and consumed via `var(--x, var(--default-x))` fallback chains so consumers can rebrand at any level.
5. **Two themes through one pipeline**: the existing Citolab theme and the third-party Kennisnet theme are both expressed as token sets that flow through the same architecture. Storybook lets you flip between them at runtime.

The first shippable milestone is **Storybook theme-switcher** between Citolab and Kennisnet — proves the architecture before the per-interaction migration starts.

This refactor is breaking. It belongs on the existing `breaking-changes-for-editor-release` branch in QTI-Components (the editor-release breaking branch already in play; see `feedback_qti_components_breaking_branch.md`).

---

## Architectural decisions

These are opinionated, locked-in choices for the refactor. Each phase below assumes them.

### A1. Cascade-layer order

The QTI-Components theme stylesheet declares this order, lowest-priority first:

```css
@layer qti.reset, qti.tokens, qti.structure, qti.theme, qti.utilities, qti.consumer;
```

Contracts per layer:

| Layer | Owner | Contents | Switches per theme? |
|---|---|---|---|
| `qti.reset` | QTI-Components | Box-sizing, scoped element resets (e.g. `qti-rubric-block { display: block }`) | No |
| `qti.tokens` | QTI-Components + theme | `--qti-*` custom-property declarations on `:root`/`:host`. **The theme file is the only file that writes into this layer.** | **Yes** |
| `qti.structure` | QTI-Components | Non-themable structure for light-DOM siblings (e.g. grid template for tabular `qti-match-interaction`). | No |
| `qti.theme` | QTI-Components | Visual design (colors, borders, typography, spacing) — written exclusively against element selectors, `::part()`, `:state()`. Reads only `var(--x)`. Never writes literal hex/px. | No |
| `qti.utilities` | QTI-Components | Light-DOM utility classes (`.m-0`, `.qti-input-width-1`, etc.). Currently `!important`-heavy; we will remove most of that — see Phase 6. | No |
| `qti.consumer` | Third parties | Empty by default. Third-party CSS goes here. Wins over everything below it without `!important`. | n/a |

**Why this order**: switching themes is a token-value swap, nothing else. The `qti.theme` layer never knows which theme is active — it only knows which `var(--x)` to read.

**Why a separate `qti.consumer` layer**: per MDN/CSSWG, later-declared layers win for normal declarations. By declaring `qti.consumer` last we guarantee third-party CSS authored against our public selectors (element names, parts, states) always wins, with normal specificity, no `!important` needed.

**Shadow-DOM caveat**: cascade layers only apply within a single tree scope. Each shadow root has its own cascade. Therefore:

- The minimal `.styles.ts` styles in shadow DOM do **not** need `@layer` and stay the absolute floor for any styling that reaches into shadow via `::part()` (per the cascade rules — host-page `::part()` rules participate in the host-page cascade and override shadow-internal rules at equal specificity).
- All visual-design CSS lives in light DOM where layers do work.

### A2. `!important` policy

- **Allowed only inside `.styles.ts`** — and only for rules that are genuinely mandatory for the element to function (e.g. `display: block !important` when an element MUST be block, or `cursor: text !important` when ignoring an inline override would break interaction). The user's rule.
- **Forbidden in `qti.tokens`, `qti.structure`, `qti.theme`, `qti.utilities`**. Layers replace the need.
- The existing 561 `!important` count in dist comes mostly from the generated utility classes (`.m-0 { margin: 0 !important }`, etc.). Phase 6 sweeps these — utilities move into `qti.utilities`, which always beats `qti.theme` by layer order without `!important`.

### A3. Selector vocabulary

Allowed in `qti.theme`:

- `qti-foo` — element name selectors
- `qti-foo::part(bar)` — declared parts (we already have 561 occurrences of `[part=...]`; that public surface is preserved)
- `qti-foo:state(baz)` — custom states (Kennisnet already uses this pattern in its SCSS; modern spec, supported in Chrome 90+, Safari 16.4+, Firefox 126+ — Baseline as of 2026)
- `:host()`, `::slotted()` — for shadow-internal rules inside `.styles.ts`
- Class selectors that **come from QTI attributes** (e.g. `qti-foo.qti-choices-top`) — these are part of the QTI3 spec, not internal hooks

Forbidden in `qti.theme`:

- Descendant chains that reach inside internal markup the user can't see (`qti-foo .some-wrapper > .inner`)
- Editor-only or interaction-internal class names
- Anything that requires knowledge of the shadow-DOM template structure beyond the declared `::part()` surface

This is the contract third parties also write to. Same vocabulary, same constraints.

### A4. Token authoring: DTCG JSON, compiled with Style Dictionary

Tokens are authored in the [DTCG Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) JSON shape, compiled to CSS via [Style Dictionary](https://styledictionary.com/).

**Caveat (from spec research)**: DTCG 2025.10 is a "Draft Community Group Report" that explicitly says "do not implement anything in this document". Cross-file references are undefined and the `dimension` value shape changed recently. We adopt it anyway because:

1. Style Dictionary already consumes the shape pragmatically across the ecosystem.
2. The cost of switching later is a codemod on token JSON; the token *names* are not affected.
3. The alternative is inventing our own JSON shape, which is strictly worse.

Mitigations:
- Pin Style Dictionary version in `package.json`.
- Avoid `$extends` (most volatile feature).
- Avoid cross-file references (spec is silent — we keep all tokens for a theme in one JSON tree).
- Use plain string values for `$value` where the spec is internally inconsistent (the spec has a `string` enum drift; we don't depend on `$type: "string"`).

**Token grouping** (for both Citolab and Kennisnet):

```
tokens/
  citolab.tokens.json
  kennisnet.tokens.json
```

Each file is a complete token tree shaped like:

```json
{
  "color": {
    "correct":   { "$type": "color", "$value": "#2e7d32" },
    "incorrect": { "$type": "color", "$value": "#ef5350" },
    "border":    { "$type": "color", "$value": "#c6cad0" }
  },
  "size": {
    "border":   { "$type": "dimension", "$value": "2px" },
    "radius":   { "$type": "dimension", "$value": "0.3rem" },
    "padding-x": { "$type": "dimension", "$value": "0.5rem" },
    "padding-y": { "$type": "dimension", "$value": "0.5rem" }
  }
}
```

Style Dictionary outputs:

```css
.theme-citolab {
  --qti-color-correct: #2e7d32;
  --qti-color-incorrect: #ef5350;
  --qti-size-border: 2px;
  --qti-size-radius: 0.3rem;
  /* ... */
}
```

### A5. Token surface — lean it down, layer two tiers

Today: ~60+ `--qti-*` variables, mixed semantic (`--qti-correct`) and structural (`--qti-padding-vertical`).

Refactor surface:

- **Tier 1 — primitives** (theme-owned): color ramps, base sizes, typography. Limited number — aim for under 20.
- **Tier 2 — semantic aliases** (QTI-owned, theme can override): `--qti-color-correct`, `--qti-border-width`, `--qti-button-padding-x`. These reference primitives. This is the surface `qti.theme` consumes.
- **Tier 3 — component-scoped knobs** (QTI-owned, theme can override): `--qti-choice-border-color`, `--qti-gap-drop-bg`. Use cascading fallbacks so the consumer can override at any tier:

```css
qti-choice-interaction::part(choice) {
  border-color: var(--qti-choice-border-color, var(--qti-color-border, currentColor));
}
```

A consumer setting `--qti-color-border` re-skins everything; setting `--qti-choice-border-color` re-skins only the choice border. This is the "high level of customizability" the user asked for.

### A6. Mixin syntax — `postcss-mixins` with forward-compatible `--dashed-ident` names

Per the spec research:

- The native CSS `@mixin` proposal (CSS Functions & Mixins Module Level 1) ships **in zero browsers** as of 2026-06-30. Chrome 146 has been *announced* but not shipped. The parameter model is mid-redesign (csswg #12927, Jan 2026 agenda).
- `postcss-class-apply` (currently wired in `postcss.config.mjs`) implements the **deprecated** 2016 `@apply` for custom-property sets. That spec is dead. Replace it.
- `postcss-mixins` v12+ (Andrey Sitnik, Jul 2025) is the realistic bridge — but its `@define-mixin` / `@mixin` syntax does not match the native spec either.

**Decision**: use `postcss-mixins`, but author with `--dashed-ident` mixin names so the *identifiers* are spec-compatible:

```css
/* Author today (via postcss-mixins) */
@define-mixin --button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--qti-size-border) solid var(--qti-color-border);
  border-radius: var(--qti-size-radius);
  padding: var(--qti-size-padding-y) var(--qti-size-padding-x);
}

qti-end-attempt-interaction button {
  @mixin --button-base;
}
```

When native lands, a codemod transforms:
- `@define-mixin --x { … }` → `@mixin --x() { @result { … } }`
- `@mixin --x` → `@apply --x`

The dashed identifiers are stable; only the at-rule keywords move.

We do **not** adopt native `@function` via PostCSS. There's no faithful polyfill (postcss-preset-env doesn't list it). For value-level reuse keep using `var()` + `calc()`. When `@function` reaches Baseline we revisit.

### A7. Theme switching mechanism

Two complete theme files (`theme-citolab.css`, `theme-kennisnet.css`) each declare a class-scoped block in `qti.tokens`:

```css
@layer qti.tokens {
  .theme-citolab {
    --qti-color-correct: #2e7d32;
    /* full Citolab token set */
  }
}
```

The host page (or Storybook's `withThemeByClassName` decorator, already installed) sets `class="theme-citolab"` or `class="theme-kennisnet"` on `<html>` or a wrapper. **No JS toggling, no file swap, no rebuild.**

The Citolab theme is dropped as a hand-authored CSS bundle and re-generated from `tokens/citolab.tokens.json` (the user said "you may ditch the original theme"). Kennisnet, which is better-designed in its current SCSS form, becomes the architectural reference for what tokens we need.

### A8. Single component CSS, theme-independent

`packages/qti-theme/src/styles/qti-theme/interactions/qti-choice-interaction.css` is the **only** stylesheet that styles `qti-choice-interaction` visually. Both themes share it. The theme files only set tokens.

Today the Kennisnet directory has its own per-interaction SCSS files (`qti/choice-interaction.scss`, etc.). These get *folded into* the canonical files and replaced by token overrides — not kept as a parallel set.

---

## Phase 0 — Discovery (DONE — captured here)

### Files in scope

**Theme package (primary)**:
- [packages/qti-theme/src/item.css](packages/qti-theme/src/item.css) — bundle entry, declares `@layer qti-base, qti-components, qti-utilities, qti-variants, qti-extended;` (will be rewritten to the new layer order)
- [packages/qti-theme/src/styles/qti-theme/qti-base.css](packages/qti-theme/src/styles/qti-theme/qti-base.css) — current 377-line root-variable + utility-class file (~60 `--qti-*` definitions)
- [packages/qti-theme/src/styles/qti-theme/index.css](packages/qti-theme/src/styles/qti-theme/index.css) — imports qti-base + interactions + elements
- [packages/qti-theme/src/styles/qti-theme/qti-interactions.css](packages/qti-theme/src/styles/qti-theme/qti-interactions.css) — imports all 18 per-interaction CSS files
- [packages/qti-theme/src/styles/qti-theme/interactions/](packages/qti-theme/src/styles/qti-theme/interactions/) — 18 per-interaction CSS files (currently the visual-design layer)
- [packages/qti-theme/src/styles/kennisnet/](packages/qti-theme/src/styles/kennisnet/) — **untracked** Kennisnet SCSS (17 files, ~935 lines). Will be ported into the new structure and the SCSS directory removed.
- [packages/qti-theme/src/stories/qti-theme.stories.ts](packages/qti-theme/src/stories/qti-theme.stories.ts) — the existing "designed theme story" grid. This is the demo target.

**PostCSS / build**:
- [postcss.config.mjs](postcss.config.mjs) — currently wires `postcss-import`, `postcss-class-apply`, `autoprefixer`. Will be rewritten.
- [package.json](package.json) — `storybook` and `build-storybook` scripts; deps to update.

**Storybook**:
- [.storybook/main.ts](.storybook/main.ts) — `@storybook/addon-themes` already installed.
- [.storybook/preview.ts](.storybook/preview.ts) — imports `../packages/qti-theme/src/item.css` and currently configures `withThemeByClassName({ light: 'light-theme', dark: 'dark-theme' })`. The decorator config changes; the addon doesn't.

**Interactions (style files)**:
- 32 `.styles.ts` files across `packages/interactions/*/src/*.styles.ts` and `packages/interactions/core/src/elements/*/*.styles.ts`. Every one will be reviewed and trimmed to functional-only in Phase 5.

### Reference implementation (read-only — for copy/adapt)

- **Kennisnet SCSS** (untracked at `packages/qti-theme/src/styles/kennisnet/`) — the design reference. Specifically:
  - `_variables_wikiwijs.scss` and `qti-vars.scss` — the token surface we'll formalize into `tokens/kennisnet.tokens.json`.
  - `qti/buttons.scss` — uses `color-mix()` for state derivation; this pattern carries forward (no hardcoded hover colors).
  - `qti/order-interaction.scss` — uses `:state(candidate-correct)` and `::part(qti-simple-choice)` — exactly the selector vocabulary A3 mandates.
  - `qti/_icon-mask.scss` — `status-icon` mixin pattern; replace with PostCSS `--status-icon` mixin.

- **Existing layered example** in compiled `dist/item.css` — shows `@layer qti-base, qti-components, qti-utilities, qti-variants, qti-extended;` already wraps the output. The new layer order replaces this; the layered-output approach itself is unchanged.

- **Existing theme story** at [packages/qti-theme/src/stories/qti-theme.stories.ts](packages/qti-theme/src/stories/qti-theme.stories.ts) — 7-column grid covering button × {default, hover, focus, active, active+focus, disabled, dragging} across choice/checkbox/spot/order/drag/drop/input/select/dropdown. This story is the **visual regression target** for the Phase 3 milestone.

### Allowed APIs (verified to exist)

- **`@layer`** (CSS): Baseline Widely Available since March 2022. Chrome 99+, Firefox 97+, Safari 15.4+. caniuse 93.7%. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer))
- **`::part()`** (CSS): widely supported. Already used 561× in the codebase.
- **`:state()`** (CSS): Chrome 90+, Safari 16.4+, Firefox 126+ — Baseline Newly Available. Already used in Kennisnet SCSS. Safe.
- **`color-mix(in srgb, …)`** (CSS): Baseline since 2023. Already used in Kennisnet SCSS.
- **`postcss-mixins`** v12.1.2 — Sitnik, postcss org. Active maintenance. Use `@define-mixin --name { … }` + `@mixin --name` (with the `--`-prefixed identifier convention from A6).
- **`postcss-import`** — keep; resolves `@import` before mixin expansion.
- **`autoprefixer`** — keep; benign.
- **`style-dictionary`** v4+ — token compiler. Outputs CSS custom-property files. Mature, widely deployed.
- **`@storybook/addon-themes`** v10.3.3 — already in `package.json`. `withThemeByClassName` decorator is the supported API.

### Anti-patterns to avoid

- ❌ Do not write descendant chains in `qti.theme`. (Selector vocab in A3.)
- ❌ Do not put `!important` outside `.styles.ts`. (A2.)
- ❌ Do not use `postcss-class-apply` going forward — it polyfills a dead spec. (A6.)
- ❌ Do not adopt native `@function` via PostCSS. There's no faithful bridge. (A6.)
- ❌ Do not duplicate per-interaction CSS per theme. Both themes share one component stylesheet; tokens carry the difference. (A8.)
- ❌ Do not use DTCG `$extends` (most volatile spec area) or cross-file references (undefined in spec). (A4.)
- ❌ Do not change the `[part=…]` surface of existing interactions — these are public API. Add new parts, don't remove. (Same constraint as the prior `match-interaction-tabular-slotting` plan.)
- ❌ Do not switch themes via JS file swap or rebuild — only via root class toggle. (A7.)
- ❌ Do not modify any `.styles.ts` to add visual design; the migration goes the other direction (functional-only floor in `.styles.ts`, design in light-DOM theme CSS). (A1, contract 2.)

---

## Phase 1 — PostCSS pipeline + token compiler scaffolding

**Output**: build infrastructure works; no behavior change yet. Existing themes still ship from existing files. New pipeline produces a parallel artifact.

### What to implement

1. **Replace `postcss-class-apply` with `postcss-mixins`** in [postcss.config.mjs](postcss.config.mjs).
   - Add `postcss-mixins` to `devDependencies` in [package.json](package.json).
   - Remove `postcss-class-apply` from `devDependencies`.
   - Rewrite the config:
     ```js
     import autoprefixer from 'autoprefixer';
     import postcssImport from 'postcss-import';
     import postcssMixins from 'postcss-mixins';

     export default {
       plugins: [
         postcssImport(),
         postcssMixins(),
         autoprefixer(),
       ],
     };
     ```
   - This will break any existing `@apply <classname>;` usage. Phase 6 cleans those up. **For Phase 1 only**, grep `@apply` and inline the affected rules manually (low count, see Phase 0 — only a handful of files in `qti-theme/src/styles/qti-theme/interactions/*.css`).

2. **Add Style Dictionary** as a dev dep and create `tools/build-tokens.mjs` at repo root:
   ```js
   import StyleDictionary from 'style-dictionary';
   // Build citolab + kennisnet token files into packages/qti-theme/src/styles/themes/*.css
   ```
   Token output files go into `packages/qti-theme/src/styles/themes/theme-citolab.css` and `theme-kennisnet.css`. Each wraps its declarations in `@layer qti.tokens { … }`.

3. **Author the canonical mixin set** at `packages/qti-theme/src/styles/qti-theme/mixins/index.css`:
   - `--button-base` (port of Kennisnet `@mixin button-base`)
   - `--button-variant(...)` — postcss-mixins supports arguments
   - `--focus-ring` (port of the `:focus { box-shadow }` block from Kennisnet)
   - `--status-icon(--mask, --color)` (port of Kennisnet `_icon-mask.scss`)
   - Aim for 6–10 mixins total. Document each with a one-line comment explaining its functional contract.

4. **Pin versions**: in `package.json`, pin `postcss-mixins`, `style-dictionary` to exact versions (no `^`). The token format is unstable; we want determinism.

5. **Update build scripts**:
   - Add `"build:tokens": "node tools/build-tokens.mjs"` to root `package.json`.
   - Chain it: `"build": "pnpm build:tokens && <existing build>"`.
   - Add to `prebuild` / Vite plugin so it runs automatically.

### Verification checklist

- [ ] `pnpm install` succeeds with the new deps.
- [ ] `pnpm build:tokens` produces `packages/qti-theme/src/styles/themes/theme-citolab.css` and `theme-kennisnet.css` (these will be near-empty stubs — Phase 2 populates them).
- [ ] `pnpm build-storybook` still completes (no behavior change yet — the new artifacts aren't imported anywhere).
- [ ] `grep -r '@apply ' packages/qti-theme/src` returns zero matches.
- [ ] `cat packages/qti-theme/src/styles/qti-theme/mixins/index.css` shows the documented mixin definitions.

### Anti-pattern guards

- ❌ Do not delete `packages/qti-theme/src/styles/kennisnet/` yet. That untracked SCSS is the design reference for Phases 2–5.
- ❌ Do not change `.storybook/preview.ts` in Phase 1. The new themes aren't ready.
- ❌ Do not start migrating interactions in Phase 1.

---

## Phase 2 — Author both themes as DTCG token files

**Output**: `tokens/citolab.tokens.json` and `tokens/kennisnet.tokens.json` define the complete token surface for each theme. Style Dictionary compiles each to a class-scoped CSS file inside `@layer qti.tokens`.

### What to implement

1. **Create `tokens/kennisnet.tokens.json`** by porting:
   - `packages/qti-theme/src/styles/kennisnet/_variables_wikiwijs.scss` (root colors, Bootstrap bridge — keep only the QTI-relevant entries; the Bootstrap bridge is for the consumer's app shell and stays out of our package)
   - `packages/qti-theme/src/styles/kennisnet/qti/qti-vars.scss` (QTI-specific tokens)

2. **Create `tokens/citolab.tokens.json`** by porting [packages/qti-theme/src/styles/qti-theme/qti-base.css](packages/qti-theme/src/styles/qti-theme/qti-base.css) lines 1–60 (the `:root, :host` block). **Re-key** to the Kennisnet naming where they overlap so both themes expose the **same token surface** with different values.

3. **Token surface contract** (must be identical between themes — Style Dictionary won't enforce, so the reviewer checks):

   Tier-1 primitives (~15 tokens):
   ```
   color.brand.primary
   color.brand.accent
   color.neutral.0 … color.neutral.900   (scale)
   color.semantic.success
   color.semantic.warning
   color.semantic.danger
   color.semantic.info
   ```

   Tier-2 semantic (~20 tokens):
   ```
   color.fg.default
   color.fg.muted
   color.bg.default
   color.bg.muted
   color.border.default
   color.border.active
   color.state.correct           → references color.semantic.success
   color.state.incorrect         → references color.semantic.danger
   color.state.partially-correct → references color.semantic.warning
   color.state.correct-bg        (light tint)
   color.state.incorrect-bg
   color.focus-ring
   size.border.width
   size.border.radius
   size.padding.x
   size.padding.y
   size.gap
   size.form
   size.order-button
   font.body
   ```

   Tier-3 component knobs are NOT in the token files. They live as fallbacks in component CSS: `var(--qti-choice-border-color, var(--qti-color-border-default))`. This keeps the token files lean (A5).

4. **Configure Style Dictionary** to output to `packages/qti-theme/src/styles/themes/`:
   - `theme-citolab.css` containing `@layer qti.tokens { .theme-citolab { --qti-...: ...; } }`
   - `theme-kennisnet.css` containing `@layer qti.tokens { .theme-kennisnet { --qti-...: ...; } }`

5. **Rewrite [packages/qti-theme/src/item.css](packages/qti-theme/src/item.css)** layer declaration to the new order (A1):
   ```css
   @layer qti.reset, qti.tokens, qti.structure, qti.theme, qti.utilities, qti.consumer;

   @import url('./styles/themes/theme-citolab.css');
   @import url('./styles/themes/theme-kennisnet.css');
   @import url('./styles/qti-theme/index.css');
   ```

   At this point both theme files load, but neither class is applied — the system uses fallback values in `qti.theme` until a theme class is set on root. (Phase 3 wires Storybook to set the class.)

### Verification checklist

- [ ] `tokens/citolab.tokens.json` and `tokens/kennisnet.tokens.json` exist; both validate against `https://www.designtokens.org/schemas/2025.10/format.json` (Style Dictionary validates on build).
- [ ] Both files declare an **identical set of token paths** (different `$value`s). Use a small Node script to assert: `diff <(jq -r 'paths|join(".")' tokens/citolab.tokens.json | sort) <(jq -r 'paths|join(".")' tokens/kennisnet.tokens.json | sort)` returns empty.
- [ ] `pnpm build:tokens` regenerates both CSS files.
- [ ] Output CSS files are correctly wrapped in `@layer qti.tokens { .theme-X { … } }`.
- [ ] `pnpm storybook` still loads without errors (no visible change yet — neither theme class is applied; existing `light-theme`/`dark-theme` classes still work because the old CSS is still imported via `qti-base.css`).

### Anti-pattern guards

- ❌ Do not enumerate every component knob in the token files. Tier-3 component fallbacks live in the component CSS, not in tokens. (A5.)
- ❌ Do not skip the "identical surface" check. If Citolab has `color.state.correct` but Kennisnet has `color.correct`, theme-switching will leave gaps. The two files must mirror each other path-for-path.
- ❌ Do not use DTCG `$extends` or cross-file aliases. Both are spec gaps. (A4.)
- ❌ Do not migrate any interaction CSS yet. Phase 4 starts that.

---

## Phase 3 — Storybook theme switcher (FIRST SHIPPABLE MILESTONE)

**Output**: in Storybook's toolbar, the user toggles between **Citolab** and **Kennisnet** and the existing theme story (and every interaction story) re-skins live. The dark/light light-theme/dark-theme toggle is replaced; if dark mode is needed, it's a third theme in the same picker.

### What to implement

1. **Update [.storybook/preview.ts](.storybook/preview.ts)** to use `withThemeByClassName` with the two new themes:
   ```ts
   import { withThemeByClassName } from '@storybook/addon-themes';
   import '../packages/qti-theme/src/item.css';

   export const decorators = [
     withThemeByClassName({
       themes: {
         Citolab: 'theme-citolab',
         Kennisnet: 'theme-kennisnet',
       },
       defaultTheme: 'Citolab',
     }),
   ];
   ```

2. **Bridge the old story story decorations**: the existing [packages/qti-theme/src/stories/qti-theme.stories.ts](packages/qti-theme/src/stories/qti-theme.stories.ts) renders a flat grid. Add a backwards-compatible export `ThemeShowcase` that wraps the grid in a div with no extra class (the theme class is applied by the decorator at the Storybook iframe `<html>` level).

3. **Strip `light-theme`/`dark-theme` from `qti-base.css`** if those rules were tied to those classes. Anything legitimately dark-mode needs to become a third theme (Phase 9 follow-up; not required for the milestone).

4. **Add per-theme acceptance criteria** to the story file as comments at the top:
   - Citolab: original `--qti-correct: #2e7d32` (green), `--qti-border-color: #c6cad0` (light gray), `--qti-border-radius: 0.3rem`.
   - Kennisnet: `--qti-correct: #2b830e`, border purple `#9b77a9`, dark purple text `#3e144e`, info Wikiwijs blue `#007ac3`.

5. **Visual regression baseline**: run Chromatic with both themes selected to capture baseline screenshots. The repo has `chromatic-runner.cjs`; pass `--storybookBaseDir` etc. as needed.

### Verification checklist

- [ ] Storybook starts on port 6006: `pnpm storybook`.
- [ ] Toolbar shows a "Themes" picker with **Citolab** and **Kennisnet**.
- [ ] Visiting **Theme** story with **Citolab** selected: borders are light gray, correct color is the Citolab green, radius is 0.3rem. Matches what was on `main` before the refactor.
- [ ] Switching to **Kennisnet**: borders shift to purple `#9b77a9`, correct shifts slightly, info elements take Wikiwijs blue `#007ac3`. No layout shift. No JS errors in console.
- [ ] Existing per-interaction stories (e.g. `02 Choice Interaction > Default`) also re-skin on theme switch — even though we haven't migrated their CSS yet. This works because Phase 2 only changed token *values*; the existing `qti-base.css` reads from `var(--qti-...)` already, so swapping the source of those values is enough to reskin. **If a particular interaction's story does NOT reskin, that interaction's CSS contains hardcoded color/size values — add it to the Phase 5 migration backlog.**
- [ ] Chromatic build for the `breaking-changes-for-editor-release` branch shows the theme switch as the only category of visual diff vs. `main`. Approve as the new baseline.

### Anti-pattern guards

- ❌ Do not change any interaction `.styles.ts` or any `qti-theme/interactions/*.css` file in Phase 3. Theme switching must work using only token swaps. If it doesn't, that's discovery for Phase 5, not a fix in Phase 3.
- ❌ Do not delete the old hand-authored `light-theme`/`dark-theme` selectors unless you've audited that nothing depends on them. (`grep -r 'light-theme\|dark-theme' packages/`)
- ❌ Do not declare the milestone done until both themes pass the per-theme acceptance criteria above visually in the existing Theme story.

---

## Phase 4 — Pilot interaction migration (choice-interaction)

**Output**: `qti-choice-interaction` is the reference implementation of the full pattern. Functional `.styles.ts`, design in `qti.theme`, no hardcoded values, no class-hook selectors.

### What to implement

1. **Trim [packages/interactions/choice-interaction/src/qti-choice-interaction.styles.ts](packages/interactions/choice-interaction/src/qti-choice-interaction.styles.ts)** to functional-only. Allowed:
   - `:host { display: ... }`
   - Layout primitives the element MUST have to function (grid template, flex direction)
   - `::slotted()` rules that affect slot mechanics, not visual design
   - `!important` only where mandatory (and documented inline why)

   Move everything else (colors, borders, focus rings, hover states) to step 2.

2. **Rewrite [packages/qti-theme/src/styles/qti-theme/interactions/qti-choice-interaction.css](packages/qti-theme/src/styles/qti-theme/interactions/qti-choice-interaction.css)** wrapped in `@layer qti.theme`:
   ```css
   @layer qti.theme {
     qti-choice-interaction::part(prompt) { /* … using only var(--qti-...) */ }
     qti-choice-interaction::part(slot) { /* … */ }
     qti-simple-choice::part(ch) { /* checkbox */ }
     qti-simple-choice::part(cha) { /* checkmark */ }
     qti-simple-choice:state(candidate-correct)::part(ch) { /* … */ }
     qti-simple-choice:state(candidate-incorrect)::part(ch) { /* … */ }
     /* etc. */
   }
   ```
   Each property uses two-tier fallbacks:
   ```css
   border-color: var(--qti-choice-border-color, var(--qti-color-border-default));
   ```

3. **Port any Kennisnet-specific styling** from `packages/qti-theme/src/styles/kennisnet/qti/choice-interaction.scss` (108 lines). Most of it should collapse into token-value differences once the tier-2 semantic tokens are in place. Anything that DOESN'T collapse (e.g. a layout difference) is a sign that the token surface is incomplete — extend the token surface and update both `tokens/*.tokens.json` files.

4. **Verify in both themes** in Storybook. The Theme story plus the choice-interaction stories must render correctly in both Citolab and Kennisnet with no Kennisnet-specific code anywhere outside `tokens/kennisnet.tokens.json`.

5. **Write `docs/interactions/qti-choice-interaction.md`** as the pattern documentation:
   - What lives in `.styles.ts` vs in `qti-theme/interactions/`
   - What `::part()` names are public
   - What `:state()` selectors apply
   - Which tier-3 component knobs (if any) exist and what they fall back to

### Verification checklist

- [ ] `qti-choice-interaction.styles.ts` contains no color literals, no border declarations except for layout-structural ones, no focus ring rules.
- [ ] `qti-theme/interactions/qti-choice-interaction.css` contains no color/size literals — every value is a `var()` lookup.
- [ ] All [02 Choice Interaction] stories pass in both themes in Chromatic.
- [ ] No `!important` was added outside `.styles.ts`. (`grep '!important' packages/qti-theme/src/styles/qti-theme/interactions/qti-choice-interaction.css`)
- [ ] Pattern doc `docs/interactions/qti-choice-interaction.md` is written and references the line ranges of the canonical implementation.

### Anti-pattern guards

- ❌ Do not start migrating other interactions in this phase. The point of Phase 4 is to lock the pattern.
- ❌ Do not invent new `::part()` names. Use what's already exposed; if a needed surface is missing, add it deliberately and document it.
- ❌ Do not bridge "this looks slightly different in Kennisnet" by writing Kennisnet-specific selectors. Add the missing token (extend Tier 2 surface in both token files) and use it as a `var()`.
- ❌ Do not skip the per-theme Chromatic check. It's the gate.

---

## Phase 5 — Migrate remaining 31 interactions in batches

**Output**: every interaction follows the Phase 4 pattern. The Kennisnet SCSS directory is deleted at the end.

### What to implement

Group interactions by complexity. Migrate within a group as one batch (single PR) to amortize review overhead.

**Batch 5A — text-form interactions** (small, low risk):
- `qti-text-entry-interaction`
- `qti-extended-text-interaction`
- `qti-inline-choice-interaction`
- `qti-end-attempt-interaction`

**Batch 5B — choice/order/match family** (composite, share patterns):
- `qti-order-interaction`
- `qti-match-interaction` and `qti-match-interaction-tabular`
- `qti-associate-interaction`
- `qti-hottext-interaction`

**Batch 5C — drag/drop family** (largest visual surface; Kennisnet has the most CSS here):
- `qti-gap-match-interaction`
- `qti-graphic-gap-match-interaction`
- `qti-graphic-order-interaction`
- `qti-graphic-associate-interaction`

**Batch 5D — graphical/media**:
- `qti-hotspot-interaction`
- `qti-select-point-interaction`
- `qti-position-object-interaction` (+ `qti-position-object-stage`)
- `qti-slider-interaction`
- `qti-media-interaction`
- `qti-upload-interaction`

**Batch 5E — custom**:
- `qti-portable-custom-interaction`
- `qti-custom-interaction`

**Batch 5F — core elements**:
- 10 `core/src/elements/*.styles.ts` files (qti-simple-choice, qti-gap, qti-gap-text, qti-gap-img, qti-hotspot-choice, qti-hottext, qti-simple-associable-choice, qti-inline-choice, qti-prompt, qti-associable-hotspot)

For **each** interaction in each batch:

1. Apply the Phase 4 procedure: trim `.styles.ts`, rewrite `qti-theme/interactions/<name>.css`.
2. Diff against the corresponding `kennisnet/qti/<name>.scss` and either:
   - Confirm the difference is covered by token-value swaps, OR
   - Extend Tier 2/3 tokens to cover the difference.
3. Run that interaction's stories in both themes (Chromatic).
4. Update the per-interaction pattern doc.

After all batches complete:

5. **Delete `packages/qti-theme/src/styles/kennisnet/`** (the SCSS directory). Its content now lives in `tokens/kennisnet.tokens.json` + the shared component CSS.
6. **Remove SCSS toolchain** if no other consumer relies on it (`grep -r 'sass\|scss' package.json` to verify before removing).

### Verification checklist

- [ ] After each batch: `grep -l 'background\|border\|color' packages/interactions/*/src/*.styles.ts` should show only files where those properties are functionally required (e.g. layout borders for table structure). Each remaining hit gets a one-line code comment justifying it.
- [ ] After each batch: no new `!important` outside `.styles.ts`. `git diff main -- '*.styles.ts' '*.css' | grep -c '!important'` — diff to baseline.
- [ ] After all batches: `packages/qti-theme/src/styles/kennisnet/` is gone. `git status` confirms no .scss files remain.
- [ ] After all batches: Chromatic baseline includes both themes for every story.

### Anti-pattern guards

- ❌ Do not migrate batches in parallel without first locking the Phase 4 pattern. Pattern drift is the main risk.
- ❌ Do not delete the Kennisnet SCSS directory mid-Phase. It's the design reference until all interactions are migrated.
- ❌ Do not add component-scoped tokens (Tier 3) speculatively. Add them when a real difference between themes requires the knob; otherwise the component CSS reads the Tier 2 semantic token directly.

---

## Phase 6 — Remove `postcss-class-apply` artifacts; sweep `!important`

**Output**: no `@apply <classname>` patterns left; utility classes work via `@layer qti.utilities` without `!important`.

### What to implement

1. **Audit `@apply` usage**: `grep -r '@apply ' packages/ apps/`. List every hit. For each:
   - If it applied a utility class (`@apply bordered`), inline the class's rules using the new mixin syntax (`@mixin --bordered;`) or by direct property assignment.
   - If the utility class no longer has callers, delete the class.

2. **Convert utility classes to layered, non-`!important`**:
   - Move `.m-0`, `.m-1`, `.p-0`, etc. from `packages/qti-theme/src/styles/qti-theme/qti-base.css` into a new file `packages/qti-theme/src/styles/qti-theme/utilities.css` wrapped in `@layer qti.utilities { … }`.
   - Drop the `!important` on each. Because `qti.utilities` is declared after `qti.theme`, utilities win normally without `!important`.
   - Update [packages/qti-theme/src/styles/qti-theme/index.css](packages/qti-theme/src/styles/qti-theme/index.css) to import `utilities.css` after the interactions CSS.

3. **Audit remaining `!important`**:
   - `grep -rn '!important' packages/ --include='*.css' --include='*.ts'`
   - For each hit outside `.styles.ts`: remove if the layer order makes it redundant. Keep only if there's a *cross-shadow-DOM* ordering reason that layers don't solve (rare).
   - For each hit inside `.styles.ts`: add a comment explaining why it's mandatory.

4. **Final acceptance**: the count of `!important` in source (excluding `dist/`) drops from ~30 hand-authored occurrences (Phase 0 found ~30 in source out of 561 total once dist-generated utility classes are excluded) to under 10, all inside `.styles.ts`.

### Verification checklist

- [ ] `grep -r '@apply ' packages/qti-theme/src/` returns zero hits.
- [ ] `grep -r '!important' packages/qti-theme/src/` returns zero hits.
- [ ] `grep -rn '!important' packages/interactions/` returns only `.styles.ts` files, and each has an adjacent justification comment.
- [ ] `pnpm storybook` and all stories still render correctly with both themes.
- [ ] `dist/item.css` no longer contains `!important` on utility classes (because they're now in the `qti.utilities` layer).

### Anti-pattern guards

- ❌ Do not remove utility classes that have external consumers (search the editor repo too via `grep` across `/Users/patrickklein/Projects/Editor/QTI-Editor`).
- ❌ Do not remove `!important` from `.styles.ts` blanket-style. Each existing `!important` was added for a reason. Audit per-occurrence.
- ❌ Do not move utility classes into `qti.theme`. Their job is to override `qti.theme`; that's what `qti.utilities` is for.

---

## Phase 7 — Editor (QTI-Editor) integration

**Output**: the downstream editor at `/Users/patrickklein/Projects/Editor/QTI-Editor` consumes the new theme package via yalc (already wired) and renders correctly with theme switching.

### What to implement

1. **Yalc refresh** in QTI-Editor: `yalc update @qti-components/theme` to pull the new theme bundle.
2. **Update [packages/prose-qti/src/core-css/core-css.css](/Users/patrickklein/Projects/Editor/QTI-Editor/packages/prose-qti/src/core-css/core-css.css)** if it contains rules that:
   - Reach across shadow DOM via descendant chains (replace with `::part()`),
   - Add `!important` to work around the old cascade (verify layer order now makes the `!important` unnecessary).
3. **Add theme switching to QTI-Editor Storybook** ([.storybook/preview.ts](/Users/patrickklein/Projects/Editor/QTI-Editor/.storybook/preview.ts)): add `@storybook/addon-themes` and the same `withThemeByClassName` decorator.
4. **Visual check**: run editor Storybook with both themes; the existing editor stories must render correctly under both.

### Verification checklist

- [ ] `pnpm dev` in QTI-Editor with yalc-linked QTI-Components still starts cleanly.
- [ ] Editor Storybook (port 6006 in editor; check for collision with QTI-Components) shows the theme picker.
- [ ] All editor stories render in both Citolab and Kennisnet without layout regressions.
- [ ] No new `!important` was added in the editor as a workaround.

### Anti-pattern guards

- ❌ Do not commit the editor changes to `main` until the QTI-Components `breaking-changes-for-editor-release` branch is ready to release. The yalc paths are local-dev only; the editor's package.json should not depend on the new theme version yet (see the existing `feedback_qti_components_breaking_branch.md` memory).
- ❌ Do not duplicate the theme picker logic in the editor. Both Storybooks use `@storybook/addon-themes` the same way.

---

## Phase 8 — Verification + documentation

**Output**: the design system has a written contract; third-party authors have a documented extension surface; visual regression baseline is locked.

### What to implement

1. **Author `docs/design-system.md`** in QTI-Components:
   - The cascade-layer order (A1) and the contract for each layer.
   - The selector vocabulary (A3) — element names, `::part()`, `:state()` only.
   - How to add a new third-party theme: copy `tokens/template.tokens.json`, fill values, run `pnpm build:tokens`, set `class="theme-<name>"` on root.
   - How to add a new component knob (Tier 3 token).
   - The `!important` policy (A2).
   - The migration path when native CSS `@mixin` ships (A6).

2. **Author `docs/extending.md`** specifically for third-party CSS authors:
   - "Write CSS against `qti-foo`, `qti-foo::part(bar)`, `qti-foo:state(baz)`."
   - "Put your stylesheet inside `@layer qti.consumer { … }`. It will win over our defaults."
   - "Do not use `!important`. The layer makes it unnecessary."
   - "Do not target internal class names. We won't preserve them."

3. **Add a Storybook docs page** rendering the design-system overview and embedding the theme story under both themes side-by-side.

4. **Chromatic acceptance**: full baseline regenerated for `breaking-changes-for-editor-release` with both themes. The branch's draft PR description (the branch is intentionally draft until release; per `feedback_qti_components_breaking_branch.md`) gets a "Design system refactor" section linking this plan and the Chromatic baseline.

### Verification checklist

- [ ] `docs/design-system.md` and `docs/extending.md` exist and are linked from the Storybook docs sidebar.
- [ ] Chromatic baseline for the breaking branch covers Citolab + Kennisnet for every story.
- [ ] Token surface check (Phase 2 step) still passes — both token files declare identical paths.
- [ ] No `@apply <classname>` patterns remain anywhere.
- [ ] No `!important` outside `.styles.ts`.
- [ ] The breaking-changes-branch PR (still draft) is updated with a refactor section.

### Anti-pattern guards

- ❌ Do not merge the breaking branch in Phase 8. It stays draft until the editor release is cut (per the standing memory).
- ❌ Do not add usage examples to `docs/extending.md` that reach into internal class names. The doc is the contract; examples must be selector-vocabulary-clean.

---

## Out of scope for this plan

These are mentioned in the brief but explicitly NOT covered here. Each is its own follow-up plan:

- **Native CSS `@function`** adoption — Chromium-only as of 2026; revisit when Baseline. (A6.)
- **Dark mode as a third theme** — easy to add once Phase 3 lands, but not required for the milestone.
- **Chip styling for "drags in drops"** — the standing memory (`feedback_styling_source_of_truth.md`) notes this gap in the theme. Add the missing Tier-3 tokens during Phase 5B; the chip-design itself is a separate visual-design task.
- **Editor's drag-and-drop interaction refactor** (from earlier sessions S80/S13) — touches different files and can land independently.
- **Portable custom interaction correct-response review implementation** — separate plan, already covered by `plans/separate-correct-response.md` decision discussion.

---

## Open questions to resolve before Phase 3

These don't block Phase 1/2 but must be settled before Phase 3 ships:

1. **Theme picker label**: "Citolab" / "Kennisnet" — or branded names ("Default" / "Wikiwijs")?
2. **Default theme** at boot: Citolab or Kennisnet? Phase 3 draft assumes Citolab.
3. **Dark variant strategy**: a separate theme per variant (`theme-citolab-dark`) or `color-scheme: dark` inside each theme? Defer if not needed now.
4. **Do we keep the existing `light-theme` / `dark-theme` class names** as aliases for one release to ease the editor's transition?

These four are decisions for the user — not research questions.
