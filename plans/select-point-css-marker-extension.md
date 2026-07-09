# Plan — CSS-only marker extension point for `qti-select-point-interaction`

## Goal

Let a third-party vendor **replace the select-point marker and color it by correctness using CSS only** — no
JS patching, no DOM injection (today they do this via `adjustSelectPointInteractions` + a `MutationObserver`
that rewrites each marker's `innerHTML`).

A vendor should be able to, from the light DOM, write CSS like:

```css
qti-select-point-interaction {
  --qti-select-point-icon:           url("data:image/svg+xml,…neutral pin…");     /* unanswered */
  --qti-select-point-icon-correct:   url("data:image/svg+xml,…green pin + ✓…");    /* after correction, correct */
  --qti-select-point-icon-incorrect: url("data:image/svg+xml,…red pin + ✗…");      /* after correction, incorrect */
  --qti-select-point-marker-size:    2rem;
  --qti-select-point-marker-anchor:  -100%;   /* pin: tip sits on the click point (dot default is -50%, centred) */
}
```

…and see their pin instead of the red dot, which swaps to the green-pin-with-check or red-pin-with-✗ SVG
after "Nakijken" — **with no change to the interaction's rendered HTML**.

## Chosen approach: three full-colour SVGs swapped by state (background-image)

Per the request, keep the marker's rendered HTML exactly as it is today (`<button part="point …">`, no child
nodes) and drive the whole appearance from CSS:

- Each state (unanswered / correct / incorrect) is **one complete, full-colour SVG** carrying its own pin
  colour **and** its baked-in ✓/✗ correction badge. No second layer, no child element, no pseudo-element
  needed — the badge is part of the correct/incorrect SVG.
- The SVGs are applied as `background-image` on the button and **swapped by the `part` attribute**
  (`point` → default, `correct` → correct SVG, `incorrect` → incorrect SVG).
- They are exposed as three CSS custom properties (`--qti-select-point-icon[-correct|-incorrect]`) with
  built-in defaults, so a vendor overrides them with their own SVGs and nothing else.

**Trade-off (call out to the user):** because each SVG is full-colour, the pin/badge colours live **inside the
SVG**, not in `--qti-correct`/`--qti-incorrect`. If the colours must be driven by the theme variables instead
of baked into the artwork, use the *mask variant* in the Alternative section below (a `mask` reveals a
`background-color`, so one monochrome SVG can be tinted per state — but then a two-tone "coloured pin + white
badge" needs two layers, which means a pseudo-element). For "3 SVGs swapped by state, HTML unchanged", the
background-image approach is the direct fit and is what the phases below implement.

## Root cause of why CSS-only is impossible today

The marker `<button part="point …">` is rendered in
[qti-select-point-interaction.ts:290-314](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L290-L314)
with **hard-coded visual properties in the inline `styleMap`**:

```js
borderRadius: '50%',
background: 'red'   // "Example styling, adjust as needed"
```

Inline `style` attribute declarations win the cascade over any outside `::part()` rule, so:
- the theme's `::part(correct){ background-color: var(--qti-correct) }`
  ([qti-select-point-interaction.css:12-17](packages/qti-theme/src/styles/qti-theme/interactions/qti-select-point-interaction.css#L12-L17))
  is silently overridden by inline `background:red`, and
- the kennisnet override had to resort to `background-color: transparent !important`
  ([overrides/kennisnet/qti/select-point-interaction.scss](packages/qti-theme/src/styles/overrides/kennisnet/qti/select-point-interaction.scss)),
  which is exactly the JS-patch workaround we want to delete.

The same problem exists on the correct-response overlay `<div>`
([qti-select-point-interaction.ts:321-331](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L321-L331)),
which has **no `part`** and inline `backgroundColor`/`opacity`.

**Fix strategy:** move every *appearance* property out of inline `styleMap` and into the component's shadow
stylesheet, driven by CSS custom properties with sensible defaults. Keep in the inline `styleMap` only the
*runtime-positional* properties (`position`, `left`, `top`, `transform`, `pointerEvents`) that depend on
computed percentages. Then `::part()` rules and custom properties from the light DOM take effect normally.

---

## Phase 0 — Documentation Discovery (established during research; verify before coding)

**Allowed / confirmed APIs & conventions (with sources):**

1. **Custom-property naming** is `--qti-<component>-<prop>` — e.g. `--qti-dropzone-min-height`,
   `--qti-drag-container-min-height`, `--qti-choice-background`. Use `--qti-select-point-marker-*`.
   State colors `--qti-correct` / `--qti-incorrect` already exist (8 and 1 usages).
2. **Inline-SVG-in-CSS encoding already exists in the repo** —
   [qti-base.css:88-89](packages/qti-theme/src/styles/qti-theme/qti-base.css#L88-L89) `.check-mask` uses
   `url("data:image/svg+xml,%3Csvg … %3E")`. Reuse this exact URL-encoding style for the three state SVGs.
   Difference: these go in `background-image` (not `mask`), so bake real `fill` colours into the SVG instead
   of `fill='currentColor'`. The `.check-mask` path is a ready ✓ to composite into the correct SVG.
3. **Marker part surface today:** `part="point"`, with ` correct` / ` incorrect` appended
   ([qti-select-point-interaction.ts:283-292](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L283-L292)).
   `@csspart point` is already documented in the class JSDoc
   ([qti-select-point-interaction.ts:15-22](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L15-L22)).
4. **Component shadow stylesheet** is plain `lit css`
   ([qti-select-point-interaction.styles.ts](packages/interactions/select-point-interaction/src/qti-select-point-interaction.styles.ts)) —
   `@apply` (Tailwind/theme layer) is NOT available here; write literal CSS. `@apply point`/`hov`/`foc`
   stay in the **theme** file only.
5. **Correct-area positioning** is done in JS via `positionShapes` targeting `shadowRoot.querySelectorAll('div')`
   ([qti-select-point-interaction.ts:241-259](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L241-L259)).
   ⚠️ **Anti-pattern guard:** that selector matches *all* `div`s in the shadow root by `data-coord`/`data-shape`.
   Adding a `part` to the div is safe, but do **not** add other bare `<div>`s to the render, and keep
   `data-coord`/`data-shape` intact.

**Anti-patterns to avoid:**
- Don't keep any color/shape in the inline `styleMap` — that's the root cause. Move it to the stylesheet.
- Don't add child nodes or pseudo-elements for the chosen approach — the whole point of this request is that
  the rendered HTML stays as-is; a single `background-image` swap per `part` state is enough.
- Don't use `!important` anywhere in the component defaults (it would re-block vendor overrides).
- ⚠️ Note for the *Alternative* (mask) variant only: `mask` clips the masked element's children too, so a
  two-tone "coloured pin + white badge" cannot be one masked box — it needs two layers (two pseudo-elements).
  The chosen background-image approach avoids this entirely by baking both tones into each SVG.

---

## Phase 1 — Swap three state SVGs via `background-image` (HTML unchanged)

The rendered marker HTML stays exactly as today — `<button part="point[ correct| incorrect]">` with **no
children**. Only the inline `styleMap` loses its appearance props, and the shadow stylesheet gains the
background-image rules.

**File:** [qti-select-point-interaction.ts](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts)

1. In the marker render (lines ~290-314): **strip** `borderRadius`, `background`, the
   `width`/`height`/`minWidth`/`minHeight` entries, **and `transform`** from the button's `styleMap`. Keep only
   the two genuinely runtime values: `left` and `top` (the computed percentages), plus `pointerEvents` and
   `position: 'absolute'`. `transform` is static, so it moves to the stylesheet where it can read the anchor
   var. The `baseSize`/`widthPercentage`/`heightPercentage` math can be deleted (size becomes a CSS var). **The
   `<button>` template body and its `part="point${correctionPart}"` attribute are unchanged** — the
   ` correct`/` incorrect` suffix is the CSS swap key.

**File:** [qti-select-point-interaction.styles.ts](packages/interactions/select-point-interaction/src/qti-select-point-interaction.styles.ts)

2. Add three state SVGs as custom properties with built-in defaults, and swap them by `part`. Encode each SVG
   as a URL-encoded `data:image/svg+xml,…` inline SVG (same encoding style as
   [qti-base.css:88](packages/qti-theme/src/styles/qti-theme/qti-base.css#L88) `.check-mask`, but here with
   real `fill` colours baked in instead of `currentColor`, since these are `background-image` not `mask`):

   ```css
   button[part~='point'] {
     position: absolute;                     /* left/top come from inline styleMap */
     /* Anchor: which point of the marker box sits on the click coordinate.
        -50% = vertical centre (round dot); -100% = bottom (a pin's tip). Vendor overridable. */
     transform: translate(-50%, var(--qti-select-point-marker-anchor, -50%));
     width: var(--qti-select-point-marker-size, 1rem);
     height: var(--qti-select-point-marker-size, 1rem);
     padding: 0;
     border: none;
     cursor: pointer;
     background-color: transparent;
     background-repeat: no-repeat;
     background-position: center;
     background-size: contain;
     /* SVG #1 — unanswered. Default keeps today's look: a small round dot. */
     background-image: var(--qti-select-point-icon,
       url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='7' fill='red'/%3E%3C/svg%3E"));
   }
   /* SVG #2 — correct: green pin with a baked-in white ✓. Not !important → vendor var still wins. */
   button[part~='correct'] {
     background-image: var(--qti-select-point-icon-correct,
       url("data:image/svg+xml,…green pin + white check…"));
   }
   /* SVG #3 — incorrect: red pin with a baked-in white ✗. */
   button[part~='incorrect'] {
     background-image: var(--qti-select-point-icon-incorrect,
       url("data:image/svg+xml,…red pin + white cross…"));
   }
   ```

   Notes for the implementer authoring the three default SVGs:
   - Build the correct/incorrect SVGs as a single artwork = pin body (fill green/red) + a white ✓/✗ on top, so
     one `background-image` carries both tones — no second layer needed.
   - Use theme-ish colours in the defaults (e.g. green `#2e7d32`, red `#c62828`, or hardcode to match
     `--qti-correct`/`--qti-incorrect`'s resolved values); exact colour is a vendor concern via the vars.
   - A pin's tip should sit on the click point, whereas a round dot is centred. This is the
     `--qti-select-point-marker-anchor` var in the button's `transform` above: default `-50%` (centre) suits
     the built-in dot; a vendor shipping a pin sets it to `-100%` (bottom-centre) so the tip lands on the
     coordinate. Horizontal is always `-50%` (centre).

3. Add a `part` to the correct-response overlay div and move its colour/opacity to CSS. In the render
   (lines ~321-331) add `part="correct-area"` and drop the inline `backgroundColor`/`opacity` from `styleMap`
   (keep `position`/`pointerEvents`; keep `data-coord`/`data-shape` — `positionShapes` depends on them). Then:

   ```css
   [part~='correct-area'] {
     background-color: var(--qti-select-point-correct-area-color, var(--qti-correct));
     opacity: var(--qti-select-point-correct-area-opacity, 0.5);
   }
   ```

4. Update the class JSDoc block ([lines 15-22](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L15-L22)):
   - `@csspart correct-area` — the correct-response overlay shape (new)
   - `@cssprop --qti-select-point-icon` — full-colour SVG for the unanswered marker (default round dot)
   - `@cssprop --qti-select-point-icon-correct` — full-colour SVG shown on the `correct` part (pin + ✓)
   - `@cssprop --qti-select-point-icon-incorrect` — full-colour SVG shown on the `incorrect` part (pin + ✗)
   - `@cssprop --qti-select-point-marker-size` — marker box size (default 1rem)
   - `@cssprop --qti-select-point-marker-anchor` — vertical translate anchoring the box on the click point;
     `-50%` centre (default, for a dot), `-100%` bottom (for a pin's tip)
   - `@cssprop --qti-select-point-correct-area-color` / `--qti-select-point-correct-area-opacity`

**Verification checklist (Phase 1):**
- `grep -n "background: 'red'\|borderRadius" …/qti-select-point-interaction.ts` → no visual props in `styleMap`.
- `git diff` on the render shows the `<button>`'s children/structure **unchanged** — only `styleMap` entries removed.
- `grep -n "qti-select-point-icon" …/qti-select-point-interaction.styles.ts` → three state rules present.
- Storybook default `select-point` story shows a visible dot at the placed point.
- With `show-candidate-correction`, a correct point shows the green-pin-with-✓ SVG and incorrect the red-pin-with-✗ — **with no external CSS**.
- `positionShapes` still runs — the overlay div keeps `data-coord`/`data-shape` and now also `part="correct-area"`.

### Alternative variant (only if colours must come from `--qti-correct`/`--qti-incorrect`)

If the pin colour must be theme-variable-driven rather than baked into the SVG, use a **monochrome `mask`**
instead of `background-image`: `button[part~='point'] { -webkit-mask: var(--…-icon) center/contain no-repeat;
mask: …; background-color: var(--…-marker-color); }` with `button[part~='correct']{ --…-marker-color:
var(--qti-correct) }`. This keeps HTML unchanged too, but a mask is single-tone, so a contrasting white ✓/✗
badge would then require a second layer (a `::after` pseudo-element in the component's own stylesheet — allowed
because it's internal CSS, not external `::part()::after`). Prefer the background-image approach unless the
theme-variable tinting is a hard requirement.

---

## Phase 2 — Reconcile the theme CSS with the new surface

**File:** [qti-select-point-interaction.css](packages/qti-theme/src/styles/qti-theme/interactions/qti-select-point-interaction.css)

1. `::part(point)` should keep the hover/focus utilities (`@apply hov`/`@apply foc`) — those still belong on
   the button hit-target. But `@apply point` (the black/white dot fill) previously painted the **button**;
   the glyph now lives on `::part(point-marker)`. Two options:
   - **(recommended)** drop `@apply point` from `::part(point)` and rely on the component's built-in
     `point-marker` dot default; use the theme only to set `--qti-select-point-marker-color`/state colors, or
   - move `@apply point` to `::part(point-marker)` if you want the theme's exact black/white dot styling.
2. The old `::part(correct)/(incorrect){ background-color }` rules
   ([qti-select-point-interaction.css:12-17](packages/qti-theme/src/styles/qti-theme/interactions/qti-select-point-interaction.css#L12-L17))
   painted the button background, which is now transparent — change them to set the marker color instead:
   `::part(correct){ --qti-select-point-marker-color: var(--qti-correct); }` (and incorrect). Since the
   component already provides these as internal defaults, the theme rules become optional/redundant but
   harmless — keep them explicit for clarity.

**Verification:** run the theme build (`packages/qti-theme` build script) and confirm no PostCSS `@apply`
errors; visually confirm correct = green, incorrect = red in the themed storybook.

---

## Phase 3 — Vendor-facing example (proves the JS patch is no longer needed)

1. **Replace the commented-out JS-patch workaround** in
   [overrides/kennisnet/qti/select-point-interaction.scss](packages/qti-theme/src/styles/overrides/kennisnet/qti/select-point-interaction.scss)
   with a **CSS-only** demonstration: set `--qti-select-point-marker-image` to a URL-encoded FontAwesome
   `map-marker` pin (encode like the `.check-mask` SVG in
   [qti-base.css:88](packages/qti-theme/src/styles/qti-theme/qti-base.css#L88)), a larger
   `--qti-select-point-marker-size`, a neutral `--qti-select-point-marker-color`, and
   `::part(correct)/(incorrect)` overrides for green/red. Keep the `.select-point-info` block as-is.

2. The correct/incorrect badge is baked into the built-in `--qti-select-point-icon-correct`/`-incorrect` SVGs,
   so the vendor gets ✓/✗ for free. In the kennisnet override, only supply the three
   `--qti-select-point-icon*` variables with their own FontAwesome-derived pin+check/times artwork if the
   exact glyphs are required — otherwise the defaults already work.

3. **Showcase story:** update the `PuntSelecteren` story
   ([kennisnet-all-items.stories.ts:768-798](apps/e2e/src/stories/kennisnet-all-items.stories.ts#L768-L798))
   is already wired with `show-candidate-correction` + `area-mappings`. Add a scoped `<style>` (or rely on the
   kennisnet override) so the story renders the pin. This is the visual proof.

**Verification:** in Storybook, the kennisnet select-point item shows a pin (not a red dot); after correction
it is green (correct) / red (incorrect) — with **no** `adjustSelectPointInteractions` JS running.

---

## Phase 4 — Final verification & baselines

1. **Grep guards:**
   - No inline color/shape left: `grep -rn "background: 'red'\|'50%'" packages/interactions/select-point-interaction/src` → empty.
   - No `!important` in component defaults.
2. **Build:** `qti-theme` build + `select-point-interaction` build pass; regenerate `custom-elements.json`
   (manifest) so the new `@csspart`/`@cssprop` are documented — this is a tracked file (already `M` in git).
3. **Visual regression:** the marker appearance changes, so the e2e baseline
   [e2e-kennisnet-all-items-punt-selecteren-chromium-darwin.png](apps/e2e/src/stories/__screenshots__/kennisnet-all-items.stories.ts/e2e-kennisnet-all-items-punt-selecteren-chromium-darwin.png)
   (and the select-point correctresponse stories) will need updated snapshots. Run the vitest/playwright
   snapshot update and review the diff.
4. **Manual acceptance:** confirm a consumer can restyle the marker with *only* the CSS in this plan's Goal
   section — no `MutationObserver`, no `innerHTML` rewriting.

---

## Files touched (summary)

| File | Change |
|---|---|
| `…/select-point-interaction/src/qti-select-point-interaction.ts` | strip visual inline styles from `styleMap` (render structure unchanged); add `part="correct-area"`; update JSDoc |
| `…/select-point-interaction/src/qti-select-point-interaction.styles.ts` | three state SVGs (`--qti-select-point-icon[-correct|-incorrect]`) swapped by `part` via `background-image`; correct-area defaults |
| `…/qti-theme/…/interactions/qti-select-point-interaction.css` | reconcile `::part(correct/incorrect)` now that inline is gone (set icon var or leave to component default) |
| `…/qti-theme/…/overrides/kennisnet/qti/select-point-interaction.scss` | replace commented JS-patch with CSS-only three-SVG example |
| `apps/e2e/src/stories/kennisnet-all-items.stories.ts` | showcase pin in `PuntSelecteren` |
| `custom-elements.json` | regenerated manifest |
| e2e/correctresponse `__screenshots__` | updated baselines |

## Notes
- **HTML unchanged:** the marker `<button>` render structure is untouched; the only `.ts` change is removing
  appearance props from the inline `styleMap`. Everything visual is a `background-image` swap in the stylesheet.
- **Three SVGs, swapped by state:** `--qti-select-point-icon` (unanswered), `--qti-select-point-icon-correct`,
  `--qti-select-point-icon-incorrect`. Each correct/incorrect SVG bakes in its own ✓/✗ badge, so no extra
  layer/element is needed and the badge comes for free.
- **Colour trade-off:** because the SVGs are full-colour, pin/badge colours live in the artwork, not in
  `--qti-correct`/`--qti-incorrect`. If theme-variable tinting is mandatory, switch to the monochrome-`mask`
  Alternative in Phase 1 (single-tone; a contrasting badge then needs a `::after` layer).
