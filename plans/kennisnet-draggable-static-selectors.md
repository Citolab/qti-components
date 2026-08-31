# Kennisnet: Drag Chip Styling via Static Selectors

## Problem

`packages/qti-theme/src/kennisnet-override.scss` styles draggable chips (gap-match tokens, match/associate items, order items) via the attribute selector `[qti-draggable='true']`. That attribute is written by the drag-drop mixin at **runtime** — it is absent from static HTML source. Consequences:

- Static HTML previews render chips without the kennisnet purple/handle/state styling.
- SSR / editor previews look wrong until the page hydrates.
- Every consumer of the kennisnet CSS must run the JS runtime to see the intended look — the CSS is not self-contained.

The base theme (`packages/qti-theme/src/styles/qti-theme/`) already avoids this: each interaction's `.css` file uses interaction-specific STATIC selectors and applies a shared `.drag` primitive to them. We want kennisnet to follow the same pattern.

## Constraints

- Do **not** style `qti-match-interaction.qti-match-tabular` as a draggable — that variant renders as a checkbox/radio grid. The base theme excludes it via `:not(.qti-match-tabular)`; kennisnet must too.
- Keep `[data-drag-clone]` in the selector list — that IS a legitimate runtime-only element (the transient clone created during a drag) and its styling still needs to match the source.
- Do not touch draggable styling outside kennisnet (base theme, other overrides — the latter don't exist yet, but reserve the naming).

## Phase 0: Documentation Discovery (facts already gathered)

### 0.1 The shared `.drag` primitive
**File:** [packages/qti-theme/src/styles/qti-theme/qti-base.css:226-243](packages/qti-theme/src/styles/qti-theme/qti-base.css#L226-L243)
**What:** A `.drag` class defines the base drag-chip look (border, cursor: grab, padding, etc.). Interaction `.css` files apply it to their specific selectors via `@apply drag;`.

### 0.2 Static per-interaction selectors used by the base theme
Discovered in `packages/qti-theme/src/styles/qti-theme/interactions/`:

| Interaction | Draggable selector | File & anchor |
|---|---|---|
| Order | `qti-order-interaction qti-simple-choice` | [qti-order-interaction.css:9-20](packages/qti-theme/src/styles/qti-theme/interactions/qti-order-interaction.css#L9-L20) |
| Gap-match | `qti-gap-match-interaction qti-gap-text` | [qti-gap-match-interaction.css:38-55](packages/qti-theme/src/styles/qti-theme/interactions/qti-gap-match-interaction.css#L38-L55) |
| Match (non-tabular) | `qti-match-interaction:not(.qti-match-tabular) qti-simple-associable-choice` | [qti-match-interaction.css:15-39, 91-109](packages/qti-theme/src/styles/qti-theme/interactions/qti-match-interaction.css#L15-L39) |
| Associate | `qti-associate-interaction qti-simple-associable-choice` | [qti-associate-interaction.css:12-24](packages/qti-theme/src/styles/qti-theme/interactions/qti-associate-interaction.css#L12-L24) |

### 0.3 Interactions with NO drag chip styling in kennisnet's scope
- **Choice** — not drag-based (uses `.check` / `.button`)
- **Hottext** — not drag-based
- **Graphic-associate**, **graphic-order**, **graphic-gap-match** — kennisnet does not currently style their chips; leave them out.

### 0.4 Tabular match exclusion
The base theme wraps the drag styling in `qti-match-interaction:not(.qti-match-tabular)` — see [qti-match-interaction.css:15](packages/qti-theme/src/styles/qti-theme/interactions/qti-match-interaction.css#L15). The kennisnet per-interaction override at [packages/qti-theme/src/styles/overrides/kennisnet/qti/match-interaction.scss:35](packages/qti-theme/src/styles/overrides/kennisnet/qti/match-interaction.scss#L35) already uses the same `:not(.qti-match-tabular)` gate. Reuse this exclusion here.

### 0.5 Current kennisnet drag rules to migrate
All in [packages/qti-theme/src/kennisnet-override.scss](packages/qti-theme/src/kennisnet-override.scss):

| Lines | Selector | What it does |
|---|---|---|
| 73-81 | `[qti-draggable='true'], [data-drag-clone]` | Purple chip: white text, primary bg, box-shadow, extra L/R padding |
| 89-99 | `[qti-draggable='true']::before, [data-drag-clone]::before` | 2×3 dotted grip handle (radial-gradient tiled) |
| 112-117 | `[qti-draggable='true']:state(candidate-correct)` | Green outline, green text (post-grading correct) |
| 119-129 | `[qti-draggable='true']:state(candidate-correct)::after` | Check-mark icon (FontAwesome mask) |
| 131-136 | `[qti-draggable='true']:state(candidate-incorrect)` | Red outline, red text |
| 138-148 | `[qti-draggable='true']:state(candidate-incorrect)::after` | Times-mark icon |
| 155-160 | `.full-correct-response [qti-draggable='true'], span.correct-option` | Info-colored chip in correct-response clone / gap-match `.correct-option` |
| 162-173 | `...::after` variant | Check-mark icon on the info-colored chip |

### 0.6 What NOT to touch
- Per-interaction override files under `packages/qti-theme/src/styles/overrides/kennisnet/qti/*.scss` — these currently handle **layout** concerns (slot direction, dropslot borders, etc.), not chip visual styling. The drag chip look is centralized in the top-level `kennisnet-override.scss` and should stay there. Do not distribute the rules across files — the body is identical for every draggable.

---

## Phase 1: Introduce two SCSS mixins for the static draggable set

**File:** [packages/qti-theme/src/kennisnet-override.scss](packages/qti-theme/src/kennisnet-override.scss)

**Where:** Insert immediately above the current line 73 (start of the runtime-attribute rules block, just after the block comment "Wikiwijs production applies .btn-primary + .draggable here...").

**Add:**
```scss
// -----------------------------------------------------------------------------
// Static draggable-chip selectors.
//
// The base theme (see packages/qti-theme/src/styles/qti-theme/qti-base.css and
// the per-interaction .css files) targets draggables through selectors like
// `qti-gap-match-interaction qti-gap-text`, `qti-order-interaction
// qti-simple-choice`, etc. — all present in static HTML source. We match the
// same set here so kennisnet styling applies before JS boots, in editor
// previews, and in SSR. `[data-drag-clone]` catches the runtime clone that
// only exists mid-drag.
//
// $suffix lets each rule append a pseudo/state without duplicating the list.
// Tabular match is excluded — it renders as a checkbox grid, not chips.
// -----------------------------------------------------------------------------
@mixin drag-chip($suffix: '') {
  qti-order-interaction qti-simple-choice#{$suffix},
  qti-gap-match-interaction qti-gap-text#{$suffix},
  qti-match-interaction:not(.qti-match-tabular) qti-simple-associable-choice#{$suffix},
  qti-associate-interaction qti-simple-associable-choice#{$suffix},
  [data-drag-clone]#{$suffix} {
    @content;
  }
}

// Full-correct-response context: the cloned interaction rendered by
// `show-full-correct-response`, and the `<span class="correct-option">` nodes
// that gap-match / choice interactions inject when `show-correct-response` is
// set. Same suffix trick.
@mixin correct-response-chip($suffix: '') {
  .full-correct-response qti-order-interaction qti-simple-choice#{$suffix},
  .full-correct-response qti-gap-match-interaction qti-gap-text#{$suffix},
  .full-correct-response qti-match-interaction:not(.qti-match-tabular) qti-simple-associable-choice#{$suffix},
  .full-correct-response qti-associate-interaction qti-simple-associable-choice#{$suffix},
  span.correct-option#{$suffix} {
    @content;
  }
}
```

**Anti-patterns to avoid:**
- Do NOT invent a `[draggable]` or `[qti-draggable]` fallback — the runtime attribute is what we're moving off. Rely purely on static selectors + `[data-drag-clone]`.
- Do NOT add `qti-hottext-interaction`, `qti-choice-interaction`, or any graphic-* interaction to the mixin selector list — they aren't drag chips in kennisnet's scope (see 0.3).
- Do NOT drop `[data-drag-clone]` — it is the only case where a runtime-only selector is still required.

**Verification for this phase:**
- Sass compiles without errors.
- `grep -c '@mixin' packages/qti-theme/src/kennisnet-override.scss` returns at least 2.

---

## Phase 2: Rewrite the eight rule blocks to call the mixins

**File:** [packages/qti-theme/src/kennisnet-override.scss:73-173](packages/qti-theme/src/kennisnet-override.scss#L73-L173)

Replace each block precisely, preserving property values and comments.

### 2.1 Base chip (was lines 73-81)
```scss
@include drag-chip {
  color: #fff;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 3px color-mix(in srgb, var(--primary-color) 50%, transparent);
  padding-left: 0.8em;
  padding-right: 0.8em;
}
```

### 2.2 Drag handle (was lines 89-99)
```scss
@include drag-chip('::before') {
  content: '';
  display: inline-block;
  vertical-align: middle;
  width: 12px;
  height: 19px;
  margin-right: 0.6em;
  background-image: radial-gradient(circle, currentColor 2px, transparent 2.5px);
  background-size: 6px 6px;
}
```

### 2.3 Candidate-correct state (was lines 112-117)
```scss
@include drag-chip(':state(candidate-correct)') {
  background-color: color-mix(in srgb, var(--qti-correct) 5%, white);
  color: var(--qti-correct);
  border: var(--qti-border-thickness) solid var(--qti-correct);
  box-shadow: none;
}
```

### 2.4 Candidate-correct check icon (was lines 119-129)
```scss
@include drag-chip(':state(candidate-correct)::after') {
  content: '';
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  margin-left: 0.4em;
  background-color: var(--qti-correct);
  mask: var(--fa-check-mask) no-repeat center / contain;
  -webkit-mask: var(--fa-check-mask) no-repeat center / contain;
}
```

### 2.5 Candidate-incorrect state (was lines 131-136)
```scss
@include drag-chip(':state(candidate-incorrect)') {
  background-color: color-mix(in srgb, var(--qti-incorrect) 5%, white);
  color: var(--qti-incorrect);
  border: var(--qti-border-thickness) solid var(--qti-incorrect);
  box-shadow: none;
}
```

### 2.6 Candidate-incorrect times icon (was lines 138-148)
```scss
@include drag-chip(':state(candidate-incorrect)::after') {
  content: '';
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  margin-left: 0.4em;
  background-color: var(--qti-incorrect);
  mask: var(--fa-times-mask) no-repeat center / contain;
  -webkit-mask: var(--fa-times-mask) no-repeat center / contain;
}
```

### 2.7 Full-correct-response chip (was lines 155-160)
```scss
@include correct-response-chip {
  background-color: var(--info-color);
  color: white;
  border: var(--qti-border-thickness) solid var(--info-color);
}
```

### 2.8 Full-correct-response check icon (was lines 162-173)
```scss
@include correct-response-chip('::after') {
  content: '';
  display: inline-block;
  vertical-align: middle;
  width: 1em;
  height: 1em;
  margin-left: 0.4em;
  background-color: white;
  mask: var(--fa-check-mask) no-repeat center / contain;
  -webkit-mask: var(--fa-check-mask) no-repeat center / contain;
}
```

**Preserve** the block comments above 73, 83, 101, and 150 — they describe intent (Wikiwijs `.btn-primary`, the 2×3 grip design, the state-icon origin, the full-correct-response context). Copy them to sit above the respective `@include` call.

**Delete** any residual `[qti-draggable='true']` selectors — none should remain.

---

## Phase 3: Verification

Run in order. Stop and fix at the first failure.

### 3.1 Structural checks (mechanical)
```bash
# No runtime attribute selectors should remain.
grep -n "qti-draggable" packages/qti-theme/src/kennisnet-override.scss
# Expected: no output

# Both mixins present.
grep -n "@mixin drag-chip\|@mixin correct-response-chip" packages/qti-theme/src/kennisnet-override.scss
# Expected: 2 matches

# All eight rule blocks were rewritten to @include.
grep -c "@include drag-chip\|@include correct-response-chip" packages/qti-theme/src/kennisnet-override.scss
# Expected: 8
```

### 3.2 Sass compile check
```bash
# Storybook build compiles the SCSS via ?url import in .storybook/preview.ts.
pnpm --filter '@qti-components/*' build 2>&1 | grep -iE "kennisnet|sass" | head
# Expected: no error/warning mentioning kennisnet-override.scss.
```

### 3.3 Emitted CSS spot-check
```bash
# After Storybook or theme build, find the compiled kennisnet-override output
# and confirm all four interactions + [data-drag-clone] appear for each rule.
find . -name "kennisnet-override*.css" -not -path "*/node_modules/*" | head -1 | xargs grep -o "qti-order-interaction qti-simple-choice\|qti-gap-match-interaction qti-gap-text\|qti-match-interaction:not(.qti-match-tabular) qti-simple-associable-choice\|qti-associate-interaction qti-simple-associable-choice\|\[data-drag-clone\]" | sort | uniq -c
# Expected: each of the five selectors appears at least 8 times (once per rewritten rule).
```

### 3.4 Visual: static HTML preview (before JS)
Load Storybook with the kennisnet toolbar option ON. In DevTools, disable JavaScript, hard-reload:
- Open a **gap-match** story (e.g. `05 Gap Match/...`): `<qti-gap-text>` chips should be purple with a dotted grip.
- Open an **order** story: `<qti-simple-choice>` chips should be purple with a grip.
- Open a **match** (non-tabular) story: `<qti-simple-associable-choice>` chips should be purple with a grip.
- Open an **associate** story: chips should be purple with a grip.
- **Regression control:** open a **match-tabular** story: cells must NOT be purple; the checkbox grid look must be preserved.
- **Regression control:** open a **choice** story: choices must NOT get the drag chip styling.

Before this refactor, the same steps would show unstyled default chips because `[qti-draggable='true']` is absent pre-JS.

### 3.5 Visual: runtime (JS enabled)
Re-enable JS. Load the same six stories. Every chip should look identical to before the refactor (kennisnet purple + grip, tabular unaffected, choice unaffected).

### 3.6 Visual: grading states
Open a `qti-gap-match-interaction` story with `show-candidate-correction` and a partial correct answer:
- Correctly placed chip: green outline, green text, ✓ icon.
- Incorrectly placed chip: red outline, red text, ✗ icon.

Open a `show-full-correct-response` story:
- Cloned chip / `.correct-option` span: info-color background, white text, ✓ icon.

### 3.7 Regression: runtime drag clone
Start dragging a chip (`qti-gap-text` in gap-match). The transient `[data-drag-clone]` chip that follows the cursor must show the same purple + grip look. If missing, `[data-drag-clone]` was dropped from the mixin — re-add.

---

## Rollback

If any visual regression can't be resolved quickly, `git checkout HEAD -- packages/qti-theme/src/kennisnet-override.scss` restores the old runtime-attribute rules. The base theme and per-interaction override files aren't touched by this plan, so a partial rollback is safe.
