# Unifying the "correct answer" presentation

Six interactions show the correct answer six different ways. This is the design and the plan to
collapse them into one.

Companion to `plans/parts-states-contract-design.md` (the `correction` part) and
`plans/theme-merge-and-shadow-style-cleanup.md` (layers, and Phase 1's move of paint out of the
shadow). It depends on the first and should land before the second.

---

## Phase 0 — What is actually there

Read, not remembered. Every line number is against the current tree.

### 0.1 There are TWO modes, and the CSS conflates them

This is the single most important fact, and it is not visible from the stylesheet.

**Mode A — the full-correct-response clone.** `Interaction.toggleFullCorrectResponse`
(`qti-base/src/abstract/interaction.ts:242-295`) deep-clones the interaction, wraps it in
`<div class="full-correct-response full-correct-response-{inline,block}">`, strips
`show-correct-response` / `show-candidate-correction` from the clone, marks it `disabled` + `inert`,
and then simply **sets `clone.response` to the correct response** (`:294`). Everything the clone
displays follows from the ordinary rendering of that response.

**Mode B — the inline correct-response indicator.** `toggleInternalCorrectResponse`, overridden per
interaction, injects a `span.correct-option` **next to** the candidate's own answer, or marks
`:state(correct-response)` on a choice. It is stripped from the clone (`interaction.ts:276`).

The two are independent. But `kennisnet-override.scss:197` puts them in one selector list:

```scss
.full-correct-response :state(drag),
.full-correct-response qti-gap::part(drag),
span.correct-option { … }
```

So Mode B's spans wear Mode A's clothes. Any change to one silently changes the other.

### 0.2 The clone re-runs drag-drop

Because `DragDropSlottedMixin` provides `dragDropContext` per instance
(`drag-drop-slotted.mixin.ts:109`), **the clone is its own provider**. Setting `clone.response`
re-runs `placeResponse` → the normal drop path → `cloneNode` of each chip, `part="drag"`,
`exportparts`, into the clone's own placement map. The drop targets render them.

Two consequences the CSS never accounted for:

- A placed chip in the clone is an **ordinary chip**. It is painted by the generic chip block
  (`kennisnet-override.scss:84`), which is `--primary-color` — **purple**, with a grip handle. That
  is what the user sees in match and gap-match, and it is why no `.correct-option` rule explains it:
  the `.correct-option` span belongs to Mode B and never runs on the clone.
- The clone still shows its **drag bank**. Only order hides it (`order-interaction.scss:117`).

### 0.3 The token is re-pointed inside the clone

`qti-styles.scss:29` — `div.full-correct-response { --qti-correct: var(--info-color); }`

So `--qti-correct` means green (`#2b830e`) everywhere, and blue (`#007ac3`) inside the clone. Every
JS-injected inline `border: 1px solid var(--qti-correct)` silently changes colour depending on where
the span landed. Clever, and impossible to reason about.

### 0.4 The six treatments, resolved to literals

| interaction | background | text | ✓ | grip | drag bank | winning rule |
|---|---|---|---|---|---|---|
| text-entry | **#007ac3** dark | white | `::before` | — | — | `text-entry-interaction.scss:47` |
| inline-choice | **#007ac3** dark | white | none | — | — | `inline-choice-interaction.scss:30` |
| hottext | **#007ac3** dark | white | `::before` | — | — | `hottext-interaction.scss:55` |
| match | **#581d70** purple | white | none | **yes** | shown | generic chip block, `kennisnet-override.scss:84` |
| gap-match | **#007ac3** dark | white | `::after` | yes (bank) | shown | `kennisnet-override.scss:198` on `qti-gap::part(drag)` |
| order | **#F2F8FC** light | dark | none | none | hidden | `order-interaction.scss:121` |

Colour definitions: `--info-color: #007ac3` (`_variables_wikiwijs.scss:8`);
`--bs-info-bg-subtle: color-mix(in srgb, var(--info-color) 5%, white)` ≈ `#F2F8FC` (`:34`);
`--primary-color: #581d70` (`kennisnet-override.scss:42`); `--qti-selected-color: #fff`.

Order is the only light one — and by accident. Its own comment (`order-interaction.scss:111`) says
it wanted "the **filled** info-coloured background" and the declaration uses the *subtle* tint. The
one interaction the user calls correct is the one whose code disagrees with its comment.

### 0.5 The ✓ is drawn three ways, and the grip cannot reach two interactions

- `::after` on the chip / span — `kennisnet-override.scss:205`
- `::before` via `@include status-icon` — text-entry `:51`, hottext `:58`
- not at all — inline-choice (deliberate, per its comment), order, choice

The grip glyph (`kennisnet-override.scss:139`) is scoped to `:state(drag)::part(control)::before` and
to `qti-gap` / `qti-associable-hotspot` / `qti-simple-associable-choice`'s `::part(drag-control)`. A
chip placed inside **order's** or **associate's** shadow is not in that list, so it gets no grip —
which is exactly the missing handle the user reports on order.

### 0.6 Verified in Chromium, because the code says otherwise

`order-interaction.scss:115` claims a shadow `[part='drags'] { display: flex }` rule beats a document
`::part(drags)` rule, and adds `!important` to compensate. **It does not.**

```
document ::part(drags) { display: none }   vs   shadow [part='drags'] { display: flex }
  → computed display: none        (no !important needed)
```

A document `::part()` rule always beats the element's own shadow styles. The `!important` is
unnecessary, and so is the comment.

There are **ten** `!important`s in this feature:

| where | count | fighting what |
|---|---|---|
| `qti-styles.scss:33-36` | 4 | the `-inline` wrapper's background/border/padding/margin |
| `qti-styles.scss:40-45` | 4 | the `-block` wrapper, and `h2.my-2` margins |
| `order-interaction.scss:117` | 1 | a shadow rule that does not win — **proved above** |
| `gap-match-interaction.scss:33` | 1 | its own JS-written inline `style.border` |

The eight wrapper ones reset a plain `<div>` that no rule styles. They date from the Bootstrap era
(`.full-correct-response` was a Bootstrap card) and Bootstrap was removed two weeks ago. The last one
exists only because the same element's border is *also* written from JavaScript (§0.7). Deleting the
JS assignment deletes the `!important`.

### 0.7 `.correct-option` — four spellings of one thing

| interaction | mechanism | file:line | styled by |
|---|---|---|---|
| gap-match | `span.correct-option` | `qti-gap-match-interaction.ts:61-71` | inline `style.*` + 2 CSS rules |
| match | `span.correct-option` | `qti-match-interaction.ts:242-250` | inline `style.*` + 2 CSS rules |
| order | `span.correct-option` (in the **shadow root**) | `qti-order-interaction.ts:110-117` | inline `style.*` |
| inline-choice | `<span part="correct-option">` | `qti-inline-choice-interaction.ts:282-286` | **inline `style` only** — no CSS rule targets it |

Three of the four set `border`, `border-radius`, `padding` and `display` from JavaScript, using
`var(--qti-correct)` — which resolves differently depending on whether the span landed inside the
clone (§0.3). gap-match then overrides its own inline border with `!important`
(`gap-match-interaction.scss:33`).

---

## The user's audit, checked

Correct:

- text-entry, inline-choice: dark blue background, white text. ✔
- inline-choice is not rounded, and has no glyph. ✔
- match's clone shows chips styled as ordinary purple drags with a grip handle. ✔ — and the reason is
  §0.2, not any `.correct-option` rule.
- gap-match's clone contains chips with a dark-blue background. ✔ And it still renders the drag bank,
  which order hides. ✔
- order has the colours right and is missing both the ✓ and the grip. ✔ (§0.5)
- hottext's correct answers are dark blue. ✔

Two corrections:

1. **A white ✓ on a light-blue background is invisible.** The request asks for a light background,
   dark text, *and* a white checkmark in front of text-entry's clone. The glyph must take the
   foreground colour, not white. Proposed: the ✓ is `--qti-answer-fg`.
2. **"It should not clone the `qti-gap-text`"** — it doesn't, exactly. The clone re-runs placement and
   makes *new* chips (§0.2); what is unwanted is the visible **drag bank**, which order already hides.
   The fix is one rule for all six, not a change to cloning.

---

## The design

### One vocabulary

```scss
--qti-answer-bg:     color-mix(in srgb, var(--info-color) 5%, white);  // #F2F8FC
--qti-answer-fg:     var(--info-color);                                // #007ac3
--qti-answer-border: var(--info-color);
```

`answer`, not `correct`. `--qti-correct` already means "the candidate got this right"; this is "here
is the right answer", and conflating them is what made §0.3 necessary. When these land,
`div.full-correct-response { --qti-correct: var(--info-color) }` is **deleted**.

### One badge

The ✓ is the `correction` part, which already exists on every element that can be judged, is already
forwarded through `exportparts`, and is already reachable as a bare `::part(correction-*)` in all
three of a chip's homes.

Add a third token beside `correction-correct` / `correction-incorrect`:

```
part="correction correction-answer"
```

`answer`, not `correct`, for the reason above: the clone is not a judgement about the candidate. The
`Interaction.isFullCorrectResponse` setter marks the clone's chips and checked choices with it, and
one theme rule paints it. Every `::after`, every `::before`, every `status-icon` in §0.5 is deleted.

### One rule per concern

```scss
.full-correct-response {
  ::part(drags)          { display: none; }          /* no !important — §0.6 */
  ::part(drag),
  :state(drag),
  :state(checked),
  qti-text-entry-interaction,
  qti-inline-choice-interaction { background-color: var(--qti-answer-bg); color: var(--qti-answer-fg); }
  ::part(correction-answer)     { background-color: var(--qti-answer-fg); }
}
```

The grip becomes a bare `::part(drag-control)::before`, which is **now safe**: it was scoped to three
targets only because order drew its correction badge on `::before`/`::after` of `::part(drag)` and the
two collided. That badge is gone.

---

## Phases

### Phase 1 — the `answer` token and one background

Introduce the three tokens. Replace all six background/colour treatments with one rule keyed on
`.full-correct-response`. Delete `div.full-correct-response { --qti-correct: … }`.

*Verify:* all six interactions render `#F2F8FC` / `#007ac3`. A computed-style probe per interaction —
VRT alone cannot see inline-choice's open dropdown or a text-entry that is not on screen.
Six baselines move; look at each.

### Phase 2 — the `correction-answer` badge

Add the token to `correctionPart`. Mark the clone's chips and checked choices from
`isFullCorrectResponse`. Delete the ✓ from `kennisnet-override.scss:205`, `text-entry-interaction.scss:51`,
`hottext-interaction.scss:58`. Give order and inline-choice a ✓ for the first time.

*Verify:* every one of the six shows exactly one ✓, in `--qti-answer-fg`. `grep -c status-icon` drops
by 2.

*Anti-pattern:* do **not** reuse `candidate-correct`. The clone is not the candidate's answer, and a
screen reader announcing "correct" over the answer key is a lie.

### Phase 3 — the grip, and the drag bank

Bare `::part(drag-control)::before`. One `::part(drags) { display: none }` for all six; drop the
`!important` and its comment.

*Verify:* order and associate show a grip on their placed chips. Nothing else moves.

### Phase 4 — inline-choice

Style the host, not the inner button: rounding, background, border. That brings candidate correction
inside the same box — light red background, dark red text, consistent with the rest. Colour the
dropdown arrow (`::part(dropdown-icon)`).

*Verify:* the dropdown's closed state, open state, and correction state. VRT sees only the closed one.

### Phase 5 — kill `.correct-option`

Four spellings, three of them building inline styles from JavaScript (§0.7). Replace with
`part="correct-option"` — the spelling inline-choice already uses — styled once in the theme. The
inline `style.border` / `style.padding` assignments go, and with them the `!important` in
`gap-match-interaction.scss:33` and gap-match's `nextElementSibling` lookup.

*Verify:* `grep -rn "style.border" packages/interactions` → 0. Mode B renders identically.

---

## Anti-patterns

- **Do not touch `.correct-option` while changing `.full-correct-response`.** They share a selector
  list (§0.1) and they are different features. Split the selector *first*, in Phase 1, or every later
  phase changes two things at once.
- **Do not add `!important`.** Ten exist and none is load-bearing (§0.6): eight reset a `<div>`
  nothing styles, one fights a cascade rule that does not hold, one fights an inline style this plan
  deletes. Any new one means the design is wrong.
- **Do not reuse `--qti-correct` for the answer view.** That is the trick in §0.3 and it is why a
  JS-injected border changes colour depending on its parent.
- **Do not assume `.correct-option` explains what you see in the clone.** It never runs there (§0.1).
- **Do not `--update` VRT baselines in bulk.** Six move in Phase 1, two in Phase 2. Look at each.
