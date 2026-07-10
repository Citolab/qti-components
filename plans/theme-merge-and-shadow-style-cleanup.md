# Theme merge, and getting paint out of the shadow styles

Companion to `plans/css-contract-audit.md` and `plans/parts-states-contract-design.md`.

Four goals, stated in the order they were raised:

1. A `.styles.ts` file carries **QTI-mandated layout and sizing only**. No `:state()`, no `[active]`,
   no colours, no theme variables.
2. The cito theme (`styles/qti-theme/**`) and the kennisnet override merge into **one theme**, with
   kennisnet leading.
3. `@apply` — a good abstraction — becomes **real Sass mixins**, and the theme is authored in `.scss`.
4. Kennisnet stops re-declaring things `qti-native` already defines.

**Layering is explicitly out of scope.** The user has a clearer picture of how `@layer` should work
and will direct it separately. Nothing here may add, remove or reorder a `@layer`.

---

## Phase 0 — What is actually there (facts, gathered 2026-07-10)

Everything below was read, not assumed. Sources are cited so a later session need not re-derive them.

### 0.1 The `@apply` mechanism

- Configured in `postcss.config.mjs:2,9` — `postcss-class-apply`, running after `postcss-import`.
- **31 utility classes** are defined in `packages/qti-theme/src/styles/qti-theme/qti-base.css`
  (`.bordered:102`, `.drag:231`, `.dragging:250`, `.drop:259`, `.dropping:270`, `.order:275`,
  `.button:119`, `.form:108`, `.select:128`, `.dropdown-*:139-196`, `.text:197`, `.spot:206`,
  `.point:219`, `.chevron:74`, `.handle:79`, `.check-mask:92`, …).
- **Kennisnet uses `@apply` zero times.** It is compiled by the `sass` CLI directly
  (`qti-theme/package.json:22`) and never passes through PostCSS. So this migration touches
  `styles/qti-theme/**` only — the vendor layer is already Sass, and already has the answer:
  `kennisnet/qti/_icon-mask.scss:7` is a real `@mixin status-icon($mask, $color)`, and
  `kennisnet/qti/buttons.scss` uses `sass:map`, `$maps`, `@each` and interpolation. **Copy that file's
  style; do not invent a new one.**
- Three findings that shrink the work before it starts:
  - **`.hov` is an empty rule** (`qti-base.css:343-345` — its only declaration is commented out) and it
    is `@apply`-ed **24 times**. Delete the utility and all 24 call sites. It emits nothing today.
  - **`@apply rubric-block`** (`elements/qti-rubric-block.css:12`) names a class that exists only
    inside a comment block. Dead directive, dead file.
  - **`.drop`'s own `@apply bordered` is commented out** (`qti-base.css:260`), so `.drop` composes
    nothing. Worth knowing before turning it into a mixin that "obviously" includes `bordered`.
- **~180 `@apply` sites across 17 files** under `styles/qti-theme/`. Frequency:

  | utility | uses | | utility | uses |
  |---|---|---|---|---|
  | `foc` | 27 | | `dragging` | 5 |
  | `hov` | 24 | | `drop` | 4 |
  | `act` | 15 | | `spot` | 3 |
  | `dis` | 13 | | `check-*` | 3 each |
  | `drag` | 12 | | `button` | 3 |
  | `dropping` | 11 | | `act-bg` / `act-bor` | 2 each |
  | `bordered` | 10 | | `text`, `form`, `check` | 2 each |
  | `rdo` | 9 | | 8 more | 1 each |
  | `validation-message` | 7 | | | |

  These are `@mixin` in everything but name. `foc`, `hov`, `act`, `dis` are interaction states —
  they are exactly what must *stay* in the theme when paint leaves `.styles.ts`.

### 0.2 What `.styles.ts` contains that it should not

Audited all 33 interaction `*.styles.ts` plus the two shared fragments.

Ten worst, by amount of state-selector + theme-var + paint:

| file | state selectors | theme vars | paint |
|---|---|---|---|
| `order-interaction/qti-order-interaction.styles.ts` | 7 | 13 | 10 |
| `slider-interaction/qti-slider-interaction.styles.ts` | 0 | 13 | ~25 |
| `associate-interaction/qti-associate-interaction.styles.ts` | 2 | 5 | 6 |
| `text-entry-interaction/…` | 0 | 20 | 4 |
| `choice-interaction/…` | 0 | 8 | 1 |
| `graphic-gap-match-interaction/…` | 0 | 0 | 5 |
| `gap-match-interaction/…` | 0 | 0 | 3 |
| `core/…/qti-simple-associable-choice.styles.ts` | 3 | 3 | 1 |
| `inline-choice-interaction/…` | 0 | 0 | 4 |
| `graphic-associate-interaction/…` | 0 | 0 | 3 |

**`qti-order-interaction.styles.ts`, line by line** — the file the user singled out:

- **Keep (layout):** L14–19 `[part='drags']` flex; L21–27 `[part='drops']` grid; L29–40 the four
  `:host([orientation=…])` rules; L44–48 `[part~='drop']` display + `min-height`; L93–108
  `[part='container']` and the four `:host(.qti-choices-…)` direction rules.
- **Move to theme (paint + state):** **L50–91, in its entirety.** `[part~='drop'][active]`,
  `[enabled]`, `[data-cross-slot-target]`, `:has([part='drag'])`, and both
  `:state(candidate-correct|incorrect)` background rules.
- **Dead:** L4–9 (commented-out import + `:host` block).
- **Bug found while auditing:** L85 reads `var(--qti-correct-response, --qti-correct)` — the fallback
  is a bare token, not `var(--qti-correct)`, so it resolves to an invalid colour. Fix on the way past.

Also found: `choice-interaction` has a dead 48-line commented block (L80–127);
`graphic-associate-interaction:9` contains a `//` comment inside a `css` template, which is not CSS
and is emitted into the stylesheet.

**Judgement calls this audit made, which the implementer may overrule:**
`:host([orientation])`, `:host(.qti-choices-*)`, `:host(.qti-input-width-N)` are *presentation
classes from the QTI spec*, not interaction state — they were classified **keep**. `user-select`,
`pointer-events`, `cursor`, `line-height: 0`, and `border: …px solid transparent` are paint by
property but load-bearing for layout or behaviour; each is flagged in the audit rather than moved
blindly.

**Layout-ish custom properties that must stay readable from `.styles.ts`** (they are reservations,
not paint): `--qti-dropzone-min-height`, `--qti-dropzone-min-width`, `--qti-drop-min-height`,
`--qti-drop-min-width`, `--qti-drop-gap`, `--qti-input-width`, `--qti-match-rows`,
`--qti-match-cols`, `--stacking-count`, `--item-count`, `--value-percentage`, `--min/--max/--step`.

### 0.3 Kennisnet re-declares the native QTI vocabulary

**13** QTI 3.0 presentation selectors are declared in both `styles/qti-native/qti3p0.css` and
`styles/overrides/kennisnet/qti-styles.scss`. Of those:

**11 are pure redundancy** — identical or a strict subset. Deleting them from kennisnet changes
nothing, because `qti3p0.css` already supplies them and both files are unlayered, so kennisnet is
winning only on source order:

| selector | kennisnet | qti-native |
|---|---|---|
| `.qti-align-left/center/right` | `text-align:…` (:53,57,61) | same (:554,558,562) |
| `.qti-valign-top/middle/baseline/bottom` | `vertical-align:…` (:65-77) | same (:570-582) |
| `.qti-hidden` | `display:none` (:85) | same (:73) |
| `.qti-visually-hidden` | 7 decls (:89) | same 7, different order (:80) |
| `.qti-fullwidth` | `width:100%` (:81) | same (:1051) |
| `.qti-underline` | `text-decoration:underline` (:49) | **superset** — also sets `text-decoration-color` (:1363) |

Note `.qti-underline`: kennisnet's copy *loses* the decoration colour. Deleting it is a fix, not a
regression — and it will move a VRT baseline for the better.

**2 are genuine overrides** and must survive the merge:

```css
/* qti-native/qti3p0.css:1359 */     /* kennisnet/qti-styles.scss:99 */
.qti-bordered {                      .qti-bordered {
  border: 1px solid                    padding: 2px;
    var(--table-border-color);         border: var(--qti-border-thickness)
}                                        solid var(--qti-border-color);
                                     }
```

plus `.qti-well`, which kennisnet restyles completely (`:104` vs native `:1372`).

And *that* is the finding: kennisnet re-declares the **rule** in order to change the **token**. It
should set `--table-border-color` and let the spec rule stand. Only the genuine geometry difference
(`padding: 2px`) belongs in the merged theme.

Kennisnet-only rules in the same file, which are **not** redundant and must be kept:
`qti-item-body img`, `div.full-correct-response*`, `progress` + its four vendor pseudo-elements,
`.progress-text`, `.item-correct` / `.item-incorrect` / `.item-partially-correct`.

### 0.4 Blast radius — what a naive rename would break

This is the constraint that shapes the whole plan. **`.css?inline` is load-bearing.**

- `tools/build/inline-css-plugin.js:8,14` filters on `/\.css\?inline$/`. `qti-item` and `qti-test`
  bake `item.css` into their JS bundles through it (`item-container.ts:11`,
  `test-container.ts:11`). Rename `item.css` → `.scss` and **both packages ship unthemed**, silently.
- `.storybook/extensions/style-substrate.ts:1-3` imports `item/native/minimal.css?inline`; line 4
  imports `kennisnet-override.scss?url`. The two paths run *different compilers* — PostCSS for the
  first, Sass for the second.
- `packages/interactions/core/…/drag-drop.invariance.spec.ts:6-7` imports `item.css?inline` **and**
  `kennisnet-override.scss?inline`. The spec is our layout contract; it must keep working.
- `packages/qti-components/package.json:91` copies `../qti-theme/src/item.css` into its own `dist/`
  and publishes it as `@citolab/qti-components/item.css`. **That is a published entry point.**
- `packages/qti-theme/package.json:6-11` exports four `.css` subpaths. Three of them
  (`native.css`, `minimal.css`, `kennisnet-override.css`) have **zero in-repo importers** — external
  consumers are invisible from here. Treat them as public API.
- `tools/storybook/vite-env.d.ts` declares `*.css?inline` but **not** `*.scss?inline`. The spec above
  works untyped, by luck.
- **kennisnet's base *is* citolab.** `style-substrate.ts:37` — `kennisnet: { baseCss: itemCss }`.
  Citolab is also the hardcoded fallback (`:64`, `:65`) and the VRT default. You cannot delete
  citolab before kennisnet stops standing on `item.css`.

### 0.45 Two traps found while checking VRT, both worth knowing before Phase 1

**A bare `::part(drag)` is not the end state after all.**
It reads well — one selector, a chip's three homes — and it fixes order's and associate's box
mismatch by giving them kennisnet's chip block. It also **deletes order's correction badges.** Order
draws them as a positioned `::before` circle plus an `::after` glyph on `::part(drag)`; kennisnet's
generic block declares an *inline* `::after` glyph on the same pseudo-element. The generic rule wins
often enough to leave a card with no badge. Verified on the `ITEM013` baseline: badges gone, cards
washed out.

So the chip block stays scoped to `qti-gap`, `qti-associable-hotspot` and
`qti-simple-associable-choice` — the three whose placed chips used to live in *light* DOM and so
wore that block. Order and associate keep styling their own. The price is that their bank chip and
placed chip are styled by different blocks and must agree on the box by hand; that is the
`border: 1px solid transparent` in `kennisnet/qti/order-interaction.scss`, and it is exactly what
Phase 1 removes the need for. **Do not re-introduce the bare selector before Phase 1 unifies the
badge into the `correction` part** (see `plans/parts-states-contract-design.md`).

**A `:not(:state(drag))` selector is not the same as "is a drop target".**
`qti-simple-associable-choice` gave every element that was *not* a chip a `4rem` minimum — which
swept up match-tabular's row and column headers, where drag-drop is off entirely. `ITEM010
Matrixvraag` reflowed. The fix is to key on `[qti-droppable]`, the attribute the interaction stamps
on the elements it actually tracks as droppables, and to stop stamping it when
`isDragDropEnabled()` is false. **Absence of one role does not imply presence of the other**; this
element has three (chip, drop target, tabular header).

**And the DOM is now derived, so do not query it for state.**
`toggleCandidateCorrection` in `qti-order-interaction` read its placed chips with
`shadowRoot.querySelectorAll(…)`. Since the drop targets render from the placement map, Lit renders
on a microtask, and the query ran before the chip existed — so no `:state(candidate-*)` was ever set
and the badges silently stopped appearing. It reads `chipsIn(drop)` now. **Every remaining
`querySelectorAll` that looks for a placed chip is a latent instance of this bug.**

---

### 0.5 Layering (for the deferred pass, recorded so it is not re-derived)

Not in scope — the user will direct this. Recorded because it explains why kennisnet wins today.

- The order is declared once, `item.css:1`:
  `@layer qti-base, qti-components, qti-utilities, qti-variants, qti-extended;`
- `qti-utilities`, `qti-variants` and `qti-extended` are declared and **never used by any rule**.
- Only `qti3p0-override-layout.css` is in `qti-base`. The 18 interaction files and `qti-states.css`
  are in `qti-components`.
- `qti3p0.css` (all 1430 lines), `qti-base.css` (tokens + utilities), `item.css`'s own rules, and
  **the entirety of kennisnet** are **unlayered** — so they beat every layered rule regardless of
  specificity. That, not specificity, is why kennisnet's overrides work without `!important`.
- Corollary for Phase 4: folding kennisnet into `@layer qti-components` **will change the cascade**.
  Do not do it in the merge. Merge first, keep everything unlayered, layer later.

**Consequence:** the source format may change; **the built artifact names may not.** Every phase
below preserves `dist/item.css` and the four `exports` subpaths.

---

## Phase 1 — Strip `.styles.ts` to layout (no theme changes yet)

Do this first. It is the user's actual complaint, it needs no build changes, and the invariance
spec already guards the geometry.

**What to implement**

1. For each of the ten files in §0.2, delete every rule whose selector matches
   `:state(…)`, `[active]`, `[enabled]`, `[disabled]`, `[dragging]`, `[data-*]`, `:hover`, `:focus`,
   `:has([part='drag'])`, and every declaration of colour / background / box-shadow / outline.
2. **Move each deleted rule verbatim into the theme**, into the file that already styles that
   interaction — e.g. order's L50–91 go to
   `styles/qti-theme/interactions/qti-order-interaction.css`, translating `[part~='drop']` into
   `qti-order-interaction::part(drop)`. The selectors are already `::part()`-addressable; that was the
   point of the parts contract.
3. Delete the dead blocks: `qti-order-interaction.styles.ts:4-9`,
   `qti-choice-interaction.styles.ts:80-127`, `qti-graphic-associate-interaction.styles.ts:9`.
4. Fix `qti-order-interaction.styles.ts:85` — `var(--qti-correct-response, --qti-correct)` →
   `var(--qti-correct-response, var(--qti-correct))` — before moving the rule out.
5. Leave the layout-ish custom properties from §0.2 exactly where they are. They size; they do not paint.

**Do NOT**

- Do not touch `:host([orientation])`, `:host(.qti-choices-*)`, `:host(.qti-input-width-N)`. These are
  QTI presentation classes and they are layout.
- Do not remove `border: …px solid transparent` or `line-height: 0` without checking the invariance
  spec first — they reserve space. `drag-drop.invariance.spec.ts` will tell you.
- Do not add a `@layer`.

**Verification**

- `drag-drop.invariance.spec.ts` currently reports **12 passed, 3 expected fail**. The three
  `test.fails` cases are order's chip box, order's dropzone, and associate's chip box — the exact
  defect Phase 1 exists to fix. **When they start passing, the suite goes red.** That is the signal
  that Phase 1 has landed: delete them from `CHIP_BOX_KNOWN_BAD` / `DROPZONE_KNOWN_BAD`.
- `npx vitest run --project=vrt` — expect **zero** baseline movement. A rule moved from shadow to
  theme should render identically; if a baseline moves, the selector translation is wrong.
- `grep -nE ":state\(|\[active\]|\[enabled\]|\[data-|box-shadow|background-color" packages/interactions/**/*.styles.ts` → only the flagged load-bearing exceptions remain.
- Then, and only then, the bare `::part(drag)` from §0.45 becomes safe, because the badge will live
  in the `correction` part instead of on `::before`/`::after`.

---

## Phase 2 — Delete kennisnet's copies of the native vocabulary

Small, isolated, and it shrinks the merge surface before the merge.

**What to implement**

1. Delete the **11 redundant** selectors in §0.3 from `styles/overrides/kennisnet/qti-styles.scss`
   outright. `qti3p0.css` already declares them, identically.
2. For `.qti-bordered`, delete the rule and instead set `--table-border-color` (and, if the widths
   really differ, `--qti-border-thickness`) in `styles/overrides/kennisnet/qti/qti-vars.scss`. Keep
   only the one declaration that is a genuine geometry difference: `padding: 2px`.
3. `.qti-well` is a complete restyle. Leave it, but move it next to the other kennisnet-only rules
   so the file stops looking like an override of the spec.

**Verification**

- VRT: **one baseline is expected to move** — anything using `.qti-underline` gains
  `text-decoration-color` from the native rule. Look at it; it should look better. Everything else
  must be pixel-identical.
- `grep -cE '\.qti-(align|valign|hidden|visually-hidden|fullwidth|underline)' styles/overrides/kennisnet/qti-styles.scss` → 0.
- If `.qti-bordered` moves a baseline, the token you set does not carry the value the rule did.
  Reconcile it; do not `--update`.

---

## Phase 3 — `@apply` becomes Sass mixins, in place

Do **not** rename the entry points. Change how the theme is authored, not what it emits.

Sass is already here: `qti-theme/package.json:38` has `sass ^1.101.0`, the build already shells out
to `sass` for `kennisnet-override.scss`, and Vite compiles `.scss` on the fly for Storybook and the
specs. **Nothing needs to be introduced — only extended.**

**What to implement**

0. **Delete before migrating.** Remove `.hov` and its 24 call sites (it emits nothing).
   Remove `@apply rubric-block` and `elements/qti-rubric-block.css` (dead). That is 25 of the ~180
   sites gone for free, and one fewer mixin.
1. Move `styles/qti-theme/**/*.css` → `**/*.scss`. These are internal; only the `index.css` names
   appear in `@import url()` chains, which move with them.
2. Turn each remaining utility in `qti-base.css` into a `@mixin` in `styles/qti-theme/_mixins.scss`.
   **Copy the pattern from `kennisnet/qti/_icon-mask.scss:7` and `kennisnet/qti/buttons.scss`** —
   this repo already writes Sass mixins well; match that file, don't invent a house style.
   `.drag { … }` → `@mixin drag { … }`; `@apply drag` → `@include mixins.drag;`.
   Watch `.drop` (`qti-base.css:260`): its `@apply bordered` is commented out, so the mixin must
   **not** include `bordered`, however much it looks like it should.
3. Keep the entry points `src/item.css`, `src/native.css`, `src/minimal.css` **as `.css`** initially.
   Add `src/item.scss` and make the build emit `dist/item.css` from it. The **published artifact name
   never changes.**
4. Extend `tools/build/inline-css-plugin.js:8,14` to match `/\.(css|scss)\?inline$/` and to run Sass
   before PostCSS. Add `*.scss?inline` to `tools/storybook/vite-env.d.ts` — note
   `drag-drop.invariance.spec.ts:7` already imports `.scss?inline` and works **untyped, by luck**.
5. Only once every `@apply` is gone: drop `postcss-class-apply` from `postcss.config.mjs:2,9` and
   `package.json:146`.

**Do NOT**

- Do not change `packages/qti-theme/package.json` `exports`. Four `.css` subpaths, same names.
- Do not change `packages/qti-components/package.json:91`. It copies `item.css`; keep producing one.
- Do not convert `.css` → `.scss` for the *entry points* until step 4 is proven, or `qti-item` and
  `qti-test` ship unthemed and nothing fails loudly.

**Verification**

- `pnpm --filter @qti-components/theme build` → `dist/` contains the same four `.css` files.
- `grep -rn '@apply' packages/qti-theme/src` → 0.
- `grep -rn 'postcss-class-apply' .` → only a changelog entry.
- Build `qti-item` and assert its bundle still contains theme CSS:
  `grep -c 'qti-simple-choice' packages/qti-item/dist/*.js` → non-zero.
- VRT green, unchanged baselines. A mixin expands to the same declarations in the same order as
  `@apply`; if a baseline moves, the expansion order changed.

---

## Phase 4 — Merge kennisnet into the theme, kennisnet leading

**What to implement**

1. `styles/overrides/kennisnet/**` moves to `styles/qti-theme/**`, folding each vendor file into the
   interaction file it overrides. Where kennisnet and cito disagree, **kennisnet wins and cito's
   declaration is deleted**, not commented out.
2. `kennisnet-override.scss` becomes empty, then is removed. `dist/kennisnet-override.css` is kept as
   an **empty file with a deprecation comment** for one release, because it is a published export
   with no visible in-repo consumers (§0.4).
3. `style-substrate.ts`: `kennisnet` and `citolab` now resolve to the same `baseCss`. Keep both names
   for one release so VRT can diff them, then delete `citolab` and make `kennisnet` the fallback at
   `:64`, `:65`, and the toolbar default.

**Do NOT**

- Do not delete the citolab substrate before kennisnet stops using `itemCss` as its base
  (`style-substrate.ts:37`). That is a hard ordering constraint.
- Do not touch layering.

**Verification**

- VRT under `kennisnet` — identical to the pre-merge kennisnet baselines. This is the whole test:
  a merge that changes kennisnet's rendering is a merge that lost a rule.
- Every conformance suite, both substrates, until citolab is deleted.
- `drag-drop.invariance.spec.ts` — its `CONTRACT_SUBSTRATES` already names kennisnet only.

---

## Phase 5 — Hold the line

**What to implement**

Teach stylelint to read `css` tagged templates (`postcss-lit`) and add a rule alongside the existing
`qti/no-layout-in-transient-state`:

- `qti/no-paint-in-shadow-styles` — inside a `*.styles.ts`, forbid `color`, `background*`,
  `box-shadow`, `outline`, `border-color`, and any selector containing `:state(`, `[active]`,
  `[enabled]`, `[data-`, `:hover`, `:focus`.

Then shrink the existing `ignoreStates` debt list in `.stylelintrc.mjs` (`checked`,
`candidate-correct`, `candidate-incorrect`, `correct-response`), which becomes tractable once the
`correction` part lands — see `plans/parts-states-contract-design.md`.

**Verification**

- `pnpm run lint:css` covers `*.styles.ts` and passes.
- Re-introduce `background-color` into a `.styles.ts` and watch it fail.

---

## Anti-patterns for every phase

- **Do not rename a published artifact.** `dist/item.css` and the four `exports` subpaths are API.
- **Do not assume `?inline` handles `.scss`.** It does not, today: `inline-css-plugin.js` filters on
  `.css?inline`. Two published packages depend on that plugin.
- **Do not `--update` VRT baselines to make a phase pass.** Phases 1–4 are refactors; a moved
  baseline means a lost or changed rule. `--update` rewrites *every* near-miss baseline, not the one
  that failed — verified twice on this branch.
- **Do not add, remove, or reorder `@layer`.** Out of scope by explicit instruction.
- **Do not invent a utility.** The 31 mixins are exactly the 31 classes in `qti-base.css`; if a rule
  needs something else, write the declarations.
- **Do not delete `citolab` early.** kennisnet stands on `item.css`.

## Sequencing rationale

Phase 1 is independent of everything and fixes the stated complaint. Phase 2 shrinks Phase 4's
surface. Phase 3 must precede Phase 4 or the merge is performed twice — once in CSS, once in Sass.
Phase 5 only makes sense once 1 has landed, or it fails on day one.
