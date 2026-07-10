# Theme merge, and getting paint out of the shadow styles

Companion to `plans/css-contract-audit.md` and `plans/parts-states-contract-design.md`.

Four goals, stated in the order they were raised:

1. A `.styles.ts` file carries **QTI-mandated layout and sizing only**. No `:state()`, no `[active]`,
   no colours, no theme variables.
2. The cito theme (`styles/qti-theme/**`) and the kennisnet override merge into **one theme**, with
   kennisnet leading.
3. `@apply` — a good abstraction — becomes **real Sass mixins**, and the theme is authored in `.scss`.
4. Kennisnet stops re-declaring things `qti-native` already defines.

5. A layer stack that makes precedence a property of *what a rule does*, not of where it happens to
   sit in a file: `@layer reset, layout, paint, state, cursor, correction, editor` (§0.5).
6. **Every cursor in one file**, so a host that wants none — the editor — simply does not load it (§0.6).

**Execution order** (revised 2026-07-10 — the user's ordering, plus two decisions taken then):

1. **Tighten the VRT guard** — before anything, or the refactors have no working safety net (§0.46).
2. **Clean up kennisnet** — delete redundant native vocabulary *and* the classes we already replaced.
3. **`@apply` → Sass mixins, `.css` → `.scss`.**
4. **Merge kennisnet into the per-interaction theme files**, kennisnet leading.
5. **Strip `.styles.ts` to layout**, folding its paint into the files Phase 4 just made.
6. **Hold the line** with stylelint.

Steps 2–4 are the user's own three-step framing; 1 and 5 are the two decisions added on top — guard
first, shadow-strip last.

**Layering lands with the merge, not before.** The stack is decided (§0.5) but Phases 1–3 may not add,
remove or reorder a `@layer`. Kennisnet is entirely unlayered today, and unlayered beats every layer —
so a layer stack introduced before the merge changes nothing except the amount of ceremony.

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
**Phase 5** removes the need for. (The badge half of this is already done — the `correction` part
landed earlier on this branch — so the bare selector is safe now; the box-agreement chore is what
Phase 5 clears.) See `plans/parts-states-contract-design.md`.

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

### 0.46 Four more, found while writing `kennisnet/qti/hotspot-interaction.scss`

**`!important` inside `@layer` cannot be beaten by an unlayered normal declaration.**
`.spot` in `qti-base.css` sets `border: 0 !important` inside `@layer qti-components`. The whole
premise that "kennisnet is unlayered and therefore wins" holds only for *normal* declarations —
layers reorder normal declarations, and reverse themselves for important ones, but an important
declaration always beats a normal one whatever the layer. So `hotspot-interaction.scss` has to write
`border: … !important` to draw a hotspot outline at all.

This is the single strongest argument for Phase 3/4. Every `!important` in `qti-base.css` forces an
`!important` in kennisnet, and each one is invisible until someone tries to override it. **Grep
`qti-base.css` for `!important` before Phase 4 and treat each as a layering decision, not a
formatting detail.** Verified in Chromium against the compiled `dist/item.css` +
`dist/kennisnet-override.css`, in that order.

**Not every choice element has parts.**
`qti-hotspot-choice` has no `render()` and no shadow content — it is an empty element that
`positionShapes()` gives `left/top/width/height` and, for a circle, an inline `border-radius: 50%`.
There is nothing to reach with `::part()`. It carries the full state vocabulary all the same
(`checked`, `candidate-correct`, `candidate-incorrect`, `correct-response`, `incorrect-response`,
`disabled`, `readonly`) because those come from `ChoicesMixin` and `ActiveElementMixin`. **States are
the portable contract; parts are not universal.** A `correction` part here would mean giving the
element a shadow root and a badge box, on top of an image — not obviously wanted.

**Kennisnet paints no `:state(correct-response)` anywhere.**
Grep confirms it: the answer key in kennisnet is *always* the cloned interaction inside
`.full-correct-response`, never a state on the live one. Only the base theme paints
`:state(correct-response)`. Any interaction styled during the merge needs **both** paths, and they
must agree:

- a state rule for `show-correct-response` (the live interaction), and
- a `.full-correct-response …:state(checked)` rule for the clone, where the correct answer arrives
  as the candidate's *selection*, not as `correct-response`.

**Ordering rule, now that both exist.** Within one element, at equal specificity, declare
`:state(correct-response)` **first** and the candidate's own states (`checked`, then
`candidate-*`) after it. Written the other way round, a shape the candidate got *right* paints
answer-key blue and hides the green. The answer key should only ever speak for the correct answer
the candidate **missed**. Verified by computed style across all eight state combinations.

**VRT tolerates ~60,000 changed pixels, so it cannot see small elements.**
The `vrt` project sets `allowedMismatchedPixelRatio: 0.01` (`vitest.config.ts`). One percent of a
retina capture of a 906px item is on the order of 60k pixels. A hotspot circle, a radio button, a
checkmark, a drag handle or a correction badge is far below that. **Painting every hotspot in
`ITEM018` 6px solid magenta leaves VRT at 22/22** — confirmed by regenerating the baseline and
looking at it.

This is the explanation for the earlier "the tabular answer key changed in Storybook but VRT never
noticed" episode: the radios were simply too small to trip the ratio. Consequences for the merge:

- VRT guards **layout**, not small-element paint. Do not read a green run as "the states still
  paint correctly".
- Phases 2–5 move paint between files. Verify state colours with a computed-style probe against the
  compiled `dist/item.css` + `dist/kennisnet-override.css`, not with screenshots alone.
- Dropping the ratio is now **Phase 1** — done up front, not deferred, so the later phases inherit a
  guard that actually bites (see the two decisions recorded 2026-07-10).

**A preset `response` does work in a story, but not when mounted via `innerHTML`.**
Worth knowing because it makes specs lie. `ITEM018` renders its hotspot `checked` and
`candidate-incorrect` exactly as authored. The same markup assigned to `document.body.innerHTML` in
a spec leaves every choice unchecked and the interaction's `response` reading back `''`:
`@watch('response', { waitUntilFirstUpdate: true })` never fires for the initial value, and by the
time `ChoicesMixin.firstUpdated()` compensates, `_syncChoicesFromDOM` has filtered the response to
`''` because `validIdentifiers` was empty before the choices upgraded. Applies to
`qti-choice-interaction` too. **Do not conclude "the state is never set" from an `innerHTML`
fixture** — mount through Lit, or assign `el.response` after the first update.

### 0.5 Layering — agreed stack, to be applied during the merge (Phase 4)

Deferred by instruction, but decided. Recorded here so Phase 4 does not re-derive it.

```css
@layer reset, layout, paint, state, cursor, correction, editor;
```

Low to high. One departure from the first sketch:

- **`correction` above `state`.** A correct/incorrect verdict must outrank `:hover` and
  `:state(checked)`. A candidate should not lose the red border by hovering the answer they got wrong.

`cursor` stays its own layer, and — more importantly — its own **file**. It was briefly folded into
`state` on the reasoning that a cursor is only ever set by a state, and that a layer earns its keep
by resolving conflicts. That reasoning was about precedence, and precedence is not the point. The
point is **composability**: an editor loading these styles wants no `grab`, no `pointer`, no `text`
cursor — only the default. A layer does not let you decline a rule; not importing a file does.
`cursor` sits above `state` so a disabled cursor still beats a hover cursor within the file.

`editor` stays on top: it is decoration over a finished document.

#### What this fixes

Both ordering bugs hit while moving paint out of the shadow styles were *source-order* bugs between
rules of equal specificity:

- `::part(active)` painted over by `::part(drop)`, because `::part(drop)` came later in the file.
  Under the stack, `active` is in `state` and `drop` is in `paint`. Layer beats source order, and
  beats specificity. The bug cannot recur.
- kennisnet's rules silently beating cito's `@layer qti-components`, because **kennisnet is entirely
  unlayered and unlayered always wins**.

#### The hard rule: nothing may be unlayered

Unlayered styles beat every layer, regardless of specificity. Today the unlayered set is:

| what | where | lines |
|---|---|---|
| the QTI 3.0 vocabulary | `styles/qti-native/qti3p0.css` | 1430 |
| tokens + every `@apply` utility | `styles/qti-theme/qti-base.css` | 381 |
| `item.css`'s own rules | `src/item.css` | ~30 |
| **all of kennisnet** | `kennisnet-override.scss` + 17 partials | ~1200 |

That last row is the entire reason kennisnet's overrides work without `!important`. Introduce these
layers while kennisnet stays unlayered and you get identical behaviour with more ceremony. **The
layer stack and the merge are one change, not two.**

#### The `reset` layer, and a finding

Members: `modern-normalize`, and kennisnet's `_reboot.scss` (153 lines, unlayered today).

But `modern-normalize` is imported in exactly one place — `.storybook/preview.ts:25`. It is a **dev
harness**. `item.css` ships no reset (`grep normalize src/item.css` → nothing), so every published
consumer of `@qti-components/theme/item.css` or `@citolab/qti-components/item.css` gets the theme
with whatever reset their app happens to have, or none. Phase 4 should decide whether `item.css`
takes `@import url('…') layer(reset)` itself. That is a behaviour change for downstream consumers
and belongs in a major.

#### What layers cannot do

**Layers do not cross tree scopes.** A document `::part()` rule beats a component's own shadow styles
whatever layer either is in — verified twice this week, once when `::part(correction) { display: grid }`
overrode the shadow's `display: none` and painted an empty ring on every uncorrected element.

So `box-sizing.styles.ts`, `drop-region.styles.ts` and `correction.styles.ts` sit outside this system
entirely. They are the component's floor, always beaten by the theme. That is why the paint must
leave the shadow at all (Phase 5): layering fixes theme-versus-theme, never shadow-versus-theme.

### 0.6 The cursor file, and the inline style that defeats it

A single `styles/qti-theme/cursors.scss`, wrapped in `@layer cursor`. A host that wants default
cursors everywhere omits that one import. That is the whole feature — and it does not work today,
for three reasons, all of which must be fixed for the file to mean anything.

**1. One cursor is an inline style.** `drag-drop-core.mixin.ts:250`:

```ts
draggable.style.cursor = 'grab';
```

An inline style beats every layer, every file, and every `!important` except another `!important`.
This is not a theory: three theme rules already carry `cursor: default !important`, and
`qti-match-interaction-tabular.css:71` says why — *"Drag is disabled in tabular mode; override the
mixin's inline cursor:grab."* Delete the assignment; `[qti-draggable='true'] { cursor: grab }` belongs
in the cursor file, and the three `!important`s go with it.

**2. Five cursors are trapped in shadow styles**, where a host cannot omit them:
`qti-slider-interaction.styles.ts:45,59,71,81` (`pointer`) and
`qti-position-object-interaction.styles.ts:13` (`move`). They move to the theme with the rest of
Phase 5's paint. This is the concrete reason `cursor` is not "layout" — it is not that it paints,
it is that a consumer must be able to refuse it.

**3. Seventeen theme cursors are scattered across eleven files.** Inventory:

| cursor | count | notable |
|---|---|---|
| `pointer` | 7 | `qti-base.css:172,301,368`, buttons, choice, hottext |
| `not-allowed` | 3 | `.dis:376`, kennisnet gap-match + match |
| `default !important` | 3 | all three fight the inline `grab` above |
| `grab` | 2 | `.drag:239`, graphic-gap-match |
| `text` | 1 | `.text:200` |

Gathering them is mechanical once (1) and (2) are done. Doing it before (1) produces a file that
looks like it controls the cursors and does not.

#### Mechanism

`@import url('x.css') layer(paint);` for the PostCSS chain. Sass's `@use` has no `layer()` form, so
the kennisnet partials must be wrapped — `@layer paint { @use '…'; }` is invalid too; the partial's
own contents get wrapped instead. Budget for touching all 17.

---

## Phase 1 — Tighten the VRT guard (do this first) — DONE 2026-07-10

Every phase below is a refactor whose one safety net is "VRT does not move". That net had a hole,
and a second one hid behind the first:

1. **The tolerance was too loose.** ~1% of a 1450px capture (~14k px) hid any small element — a
   radio, checkmark, badge, hotspot, drag handle. Painting every hotspot 6px magenta left VRT green.
2. **The knob was not where it looked.** The `vrt` stories do **not** use `toMatchScreenshot`, so the
   `comparatorOptions` in `vitest.config.ts` are inert. The real comparison is hand-rolled in
   `.storybook/vitest.vrt.setup.ts` (`countMismatchedPixels` + `ALLOWED_MISMATCHED_PIXEL_RATIO`).
   Editing the config number changed nothing — the first attempt did exactly that and magenta still
   passed. **The effective knob is `ALLOWED_MISMATCHED_PIXEL_RATIO`, line 23 of the setup file.**

**What was done**

1. `ALLOWED_MISMATCHED_PIXEL_RATIO`: `0.01` → `0.0005` in `.storybook/vitest.vrt.setup.ts`. The
   companion `PIXEL_CHANNEL_THRESHOLD = 51` is what actually discards antialiasing — only pixels
   whose max channel delta exceeds 51 are counted — so the ratio can be low without flaking on AA.
2. Left the `vitest.config.ts` `comparatorOptions` at `0.01` with a comment marking them inert, for
   any future test that does call `toMatchScreenshot`.
3. **No baselines regenerated.** The existing captures already pass at `0.0005` with margin (clean
   run: 22/22, two runs identical), so they were pixel-accurate all along — only the tolerance was
   loose. Regenerating would have been churn for nothing.

**What it catches, and what it does not**

- Magenta hotspots (6 rings, 3,337 px, 0.223%) now **fail** — was 22/22, now 1 fail. Verified.
- A **systematic** repaint — a broken mixin recolouring every radio/checkmark/hotspot at once — is
  caught easily; that is the actual failure mode of a bad merge.
- A **single isolated** small element (~0.03%) can still slip under 0.05%. Acceptable: the merge
  moves paint wholesale, not one element. If per-element fidelity is ever needed, the channel
  threshold means the ratio could likely go to ~0.0001 — but prove CI cross-machine stability first.

**Do NOT**

- Do not tune `vitest.config.ts:145` expecting an effect on the kennisnet VRT suite. It is inert.
- Do not `--update` baselines after this until a phase legitimately changes rendering.

---

## Phase 2 — Clean up kennisnet: delete what we already replaced

This is the user's "remove everything kennisnet overrides which we already implemented". Two kinds
of dead weight, both isolated, and both shrink Phase 4's surface before the merge.

**2a — Redundant copies of the native QTI vocabulary (§0.3)**

1. Delete the **11 redundant** selectors from `styles/overrides/kennisnet/qti-styles.scss` outright.
   `qti3p0.css` already declares them, identically (all 11 confirmed still present, 2026-07-10).
2. For `.qti-bordered`, delete the rule and instead set `--table-border-color` (and, if the widths
   really differ, `--qti-border-thickness`) in `styles/overrides/kennisnet/qti/qti-vars.scss`. Keep
   only the one genuine geometry difference: `padding: 2px`.
3. `.qti-well` is a complete restyle. Leave it, but move it next to the other kennisnet-only rules
   so the file stops looking like an override of the spec.

**2b — Dead class blocks whose feature moved to a part or state**

Work done earlier on this branch replaced three legacy class hooks with parts/states, but left
kennisnet still styling the old class names. **No component emits any of them any more** (grep,
2026-07-10):

| dead class | replaced by | kennisnet files still styling it |
|---|---|---|
| `.status-icon` | the `correction` part (`correction.styles.ts`) | `kennisnet-override.scss`, `qti/text-entry-interaction.scss`, `qti/hottext-interaction.scss` |
| `.drag-handle` | the `drag-control` part (grip glyph) | `kennisnet-override.scss` |
| `.draggable` | `:state(drag)` / `::part(drag)` | `qti/gap-match-interaction.scss`, `qti/match-interaction.scss` |

1. Verify dead before deleting each: `grep -rn "class=\"[^\"]*status-icon\|'status-icon'"
   packages/interactions --include=*.ts | grep -v spec | grep -v dist` → 0. Same for `drag-handle`,
   `draggable`. (If a stories file still uses one for a fixture, that is fine — stories are not the
   shipped component; note it and proceed.)
2. Delete the matching rule blocks from the kennisnet files above.
3. `.correct-option` is **not** dead — gap-match, match and `correction.styles.ts` still emit it.
   Leave it; it is killed in `plans/correct-response-unification.md`, not here.

**Verification**

- `grep -cE '\.qti-(align|valign|hidden|visually-hidden|fullwidth|underline)' styles/overrides/kennisnet/qti-styles.scss` → 0.
- `grep -rn 'status-icon\|drag-handle\|\.draggable' packages/qti-theme/src` → 0.
- VRT (now tightened): **only `.qti-underline` is expected to move** — it gains
  `text-decoration-color` from the native rule, a fix. Look at it. Deleting dead classes moves
  nothing, because nothing emitted them; if a baseline moves, the class was not dead — find the
  emitter. Do not `--update` to paper over it.

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

## Phase 5 — Strip `.styles.ts` to layout, into the merged files

This is the original complaint — paint living in shadow styles — and it now runs **last**, so the
paint moves straight into its permanent home: the per-interaction `.scss` files that Phase 4 just
created. One move, not two. Independent of the theme work in every other respect, and it is what
turns the three `test.fails` green.

Down to five files with ~15 paint lines total (was ten files; the rest went earlier on this branch):
`order`, `associate`, `slider`, `text-entry`, and `qti-simple-associable-choice` (§0.2, re-counted
2026-07-10).

**What to implement**

1. In each of the five files, delete every rule whose selector matches `:state(…)`, `[active]`,
   `[enabled]`, `[dragging]`, `[data-*]`, `:hover`, `:focus`, and every declaration of colour /
   background / box-shadow / outline / border-color.
2. **Move each deleted rule into the merged theme file for that interaction**
   (`styles/qti-theme/interactions/qti-<name>.scss`), translating `[part~='drop']` into
   `qti-<name>::part(drop)`. `kennisnet/qti/hotspot-interaction.scss` is the shape to match — a
   per-interaction file keyed on parts and states.
3. Fix `qti-order-interaction.styles.ts:85` before moving it —
   `var(--qti-correct-response, --qti-correct)` → `var(--qti-correct-response, var(--qti-correct))`.
4. Leave the layout custom properties where they are. They size; they do not paint.

**Do NOT**

- Do not touch `:host([orientation])`, `:host(.qti-choices-*)`, `:host(.qti-input-width-N)` — QTI
  presentation classes, and they are layout.
- Do not remove `border: …px solid transparent` or `line-height: 0` without checking
  `drag-drop.invariance.spec.ts` first — they reserve space.

**Verification**

- `drag-drop.invariance.spec.ts` is **12 passed, 3 expected fail** today. The three `test.fails` are
  order's chip box, order's dropzone, associate's chip box — the exact defect this phase fixes.
  **When they pass, the suite goes red**; that is the signal it landed. Delete them from
  `CHIP_BOX_KNOWN_BAD` / `DROPZONE_KNOWN_BAD`.
- `grep -nE ":state\(|\[active\]|\[enabled\]|\[data-|box-shadow|background-color|border-color" packages/interactions/**/*.styles.ts` → only the flagged load-bearing exceptions remain.
- VRT (tightened in Phase 1) green. A rule moved shadow→theme renders identically; a moved baseline
  means the selector translation is wrong. Because the guard is now tight, this check finally means
  what it says.

---

## Phase 6 — Hold the line

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

Order reflects the two decisions taken 2026-07-10: **tighten VRT first**, and **strip `.styles.ts`
last** so its paint lands directly in the merged files.

- **Phase 1 (VRT)** must be first. Phases 2–5 are refactors whose only proof of correctness is "VRT
  didn't move", and at the current 0.01 ratio that proof is worthless for small elements (§0.46,
  proven with magenta hotspots). Tighten the instrument before trusting its readings.
- **Phase 2 (clean kennisnet)** shrinks Phase 4's surface: fewer rules to fold, and none of them
  dead. Independent of 3.
- **Phase 3 (`.scss` + mixins)** must precede **Phase 4 (merge)**, or the merge is performed twice —
  once in CSS, once in Sass.
- **Phase 5 (strip `.styles.ts`)** runs after the merge so the shadow paint moves once, into the
  per-interaction `.scss` file that now exists — rather than into a cito `.css` that Phase 4 would
  then relocate again. It is otherwise independent, and it is what turns the three invariance
  `test.fails` green.
- **Phase 6 (stylelint)** must come after 5, or the new `no-paint-in-shadow-styles` rule fails on
  day one against paint that is still there.

Only Phase 5→6 and 3→4 are hard orderings; 2 may run any time before 4. 1 gates all of them.
