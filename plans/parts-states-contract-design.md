# Element / Part / State contract — design

Companion to `plans/css-contract-audit.md` §3. This is the "what should the names be, and
what should be a part at all" document.

---

## Decisions (agreed)

| Question | Decision |
|---|---|
| Where do dropped chips live? | **Inside the drop target's own shadow root**, rendered there declaratively (§8c). Not slotted, not appended. The target — authored (`qti-gap`, `qti-associable-hotspot`, `qti-simple-associable-choice`) or generated (a `<div part="drop">` in order/associate's shadow) — owns them. Supersedes the earlier "Option C" slotting plan. |
| `ch` / `cha` | → **`control` / `control-mark`**. The role (radio / checkbox / grip) stays a `:state()`. |
| Drop rendering | **Declarative, context-driven** (§8c, §8d). The interaction provides a reactive `dragDropContext`; each drop target subscribes and renders its own clones into its own shadow root via Lit. No `cloneNode`+`appendChild`, no `querySelectorAll` to recover state. **No `<qti-drop-slot>`.** |
| Styling a dropped chip | **`part="drag"`** on the clone. A **bare `::part(drag)`** reaches it in *any* target's shadow root (§7 #5), and composes with states (§7 #3). `:state(dropped)` is unnecessary. |
| Styling the chip's internals | Keep the contract **one level deep**. The grip glyph moves from `::part(control)::before` to the chip host's own `::before`, because parts do not chain (§7 #7). `exportparts` then becomes optional. |
| Token vocabulary | **Not a precondition for Stage B.** A chip reads no tokens of its own, but `::part(drag)` reaches it regardless. Stays on `css-contract-audit.md` step 2, off the critical path. |
| Drag/drop states | **`dragging`** and **`placeholder`** on the *source* chip in the light-DOM bank (§9). "Dropped" is structural, not a state. |
| Who provides context | **The `qti-*-interaction`**, never `qti-assessment-item` — interactions must work standalone, in a plain form or on their own (§8e). Consumers read `this.ctx?.x ?? default`. |
| How a choice learns its role | `qti-simple-choice` **subscribes** to `interactionContext` for `radio` / `checkbox` / `drag`, instead of the parent querying and pushing `states.add(role)` (§8e). |

Consequences to hold onto while implementing:

- A chip has **three homes** — the light-DOM bank, the floating clone, and a drop target's shadow
  root. The theme addresses the first with `:state(drag)` and the other two with `::part(drag)`.
  Two selectors, exactly as many as kennisnet already carries. `[data-drag-clone]` is retired by
  rendering the floating clone inside the interaction's shadow with `part="drag"`.
- `part="qti-simple-choice"` (`qti-order-interaction.ts:174`, assigned imperatively at runtime) is
  deleted. It is `part="drag"` under a name that leaks the tag it was standing in for.
- `<drop-list>` is **not a defined custom element** — zero `customElements.define` calls. It is a
  `<div>` with a hyphen, which is why it needs `role="region"` bolted on. It becomes
  `<div part="drop">`.
- `drag-drop.invariance.spec.ts` is the acceptance test for Stage B: after the move, a chip's three
  homes are three different tree scopes, and "same border-box in bank, clone, and drop" is exactly
  the property that catches a theme rule reaching only two of them.

> **Superseded:** an earlier revision recorded "Option C" (chips stay slotted, never cross a shadow
> boundary, no `exportparts` needed). §8c replaced it with declarative rendering into the target's
> shadow. The `[qti-draggable="true"]` unification it promised does **not** survive that change —
> attributes cannot cross a shadow boundary (§7 #1). `::part(drag)` replaces it.

---

## 0. The three facts that decide everything

Before arguing about `ch` vs `control`, three structural facts. All verified in the source.

### Fact 1 — `::part()` only reaches a component's own shadow tree

A `part` attribute on a **light-DOM** element does nothing. `qti-order-interaction::part(x)`
matches only elements inside `qti-order-interaction`'s shadow root.

This means **a part can never be the cross-interaction vocabulary** for things that live in
the light DOM — and most QTI draggables and drop targets do.

### Fact 2 — on drop, a **clone** of the chip is appended to the droppable

`drag-drop-slotted.mixin.ts:420-434`:

```ts
const cleanClone = draggable.cloneNode(true) as HTMLElement;
cleanClone.setAttribute('qti-draggable', 'true');
…
droppable.appendChild(cleanClone);
```

So where the chip *ends up* depends on where the droppable lives. And that differs per
interaction:

| Interaction | droppablesSelector | Droppable lives in | Dropped chip ends up in |
|---|---|---|---|
| `qti-order-interaction` | `drop-list` | **shadow** (rendered by the interaction) | **shadow** |
| `qti-associate-interaction` | `div[part=drop-list]` | **shadow** | **shadow** |
| `qti-gap-match-interaction` | `qti-gap` | light | light |
| `qti-match-interaction` | `qti-simple-associable-choice` | light | light |
| `qti-graphic-gap-match-interaction` | `qti-associable-hotspot` | light | light |

**This single inconsistency is the source of almost every naming problem in the audit.**

Consequences, all observable in the tree today:

- In order/associate, a dropped chip is inside the interaction's shadow, so the light-DOM
  selector `qti-order-interaction qti-simple-choice` **stops matching it**. That is precisely
  why `qti-order-interaction.ts:174` does
  `el.setAttribute('part', 'qti-simple-choice')` — the clone inherits the attribute, and
  `::part(qti-simple-choice)` becomes the only way to reach it. Kennisnet has four such rules
  (`order-interaction.scss:26,46,123,138`).
- A part named after a tag (`part="qti-simple-choice"`) is not a contract. It is a workaround
  for Fact 1.
- The dropped chip's **own** parts (`ch`, `cha`) become unreachable from outside, because
  `::part()` does not pierce two shadow boundaries. See §3 (`exportparts`).

### Fact 3 — a uniform draggable hook already exists, and no theme uses it

`drag-drop-core.mixin.ts:166` and `drag-drop-slotted.mixin.ts:423`:

```ts
draggable.setAttribute('qti-draggable', 'true');
```

Every draggable chip — light or shadow, original or dropped clone — carries
`[qti-draggable="true"]`. **Neither `qti-theme` nor the Kennisnet override references it.**

Kennisnet instead enumerates every draggable by tag, six times over:

```scss
qti-order-interaction qti-simple-choice,
qti-gap-match-interaction qti-gap-text,
qti-match-interaction:not(.qti-match-tabular) qti-simple-match-set:first-of-type qti-simple-associable-choice,
qti-match-interaction:not(.qti-match-tabular) qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice,
qti-associate-interaction qti-simple-associable-choice,
[data-drag-clone]
```

That entire list is `[qti-draggable="true"], [data-drag-clone]`.

There is **no** droppable equivalent — droppables are only tracked in JS
(`trackedDroppables`), never marked in the DOM. That asymmetry is why drop targets ended up
with five different part names instead of one selector.

---

## 1. So what should be a part, and what shouldn't?

A clean division:

| Concern | Mechanism | Why |
|---|---|---|
| Structure **inside one component's shadow** | `part` | That is exactly what parts are for. |
| A **role** an element plays (draggable, droppable) | attribute | Elements are in light DOM; a part can't reach them (Fact 1). |
| A **condition** an element is in (checked, disabled, filled) | `:state()` | Already the contract; set from `ElementInternals`. |
| A component's shadow parts, seen **through** an outer component | `exportparts` | Parts don't pierce two boundaries (§3). |

The recurring mistake in the current code is using `part` for roles (`part="drag"`,
`part="drop-list"`, `part="qti-simple-choice"`) when those elements are — or become —
light-DOM siblings rather than shadow internals.

---

## 2. `ch` / `cha` — the naming problem is real, but it's a *role* problem

`ch` = "check", `cha` = "check active". The actual markup:

```ts
// qti-simple-choice
html`<div part="ch" tabindex="0"><div part="cha"></div></div>
     ${this.marker ? html`<div id="label">${this.marker}</div>` : nothing}
     <slot part="slot"></slot>`

// qti-hottext          →  <div part="ch"><div part="cha"></div></div>
// qti-gap-text         →  <div part="ch"></div>                     (no inner mark)
// qti-simple-associable-choice → <div part="ch"></div>              (no inner mark)
```

Structurally this is always the same thing: **a box before the label, and optionally a mark
inside it**. What it *depicts* changes with role:

| Host context | `ch` depicts | `cha` depicts |
|---|---|---|
| `qti-choice-interaction` (single) | radio circle | inner dot |
| `qti-choice-interaction` (multiple) | checkbox square | checkmark |
| `qti-order-interaction` | **drag grip** | unused |
| `qti-gap-match-interaction` (`qti-gap-text`) | **drag grip** | — |

You are right that `ch`/`cha` are bad names. But note the fix is *not* to rename them to
`radio`/`checkbox`/`grip` — the same element is all three. The correct model is:

> **one part name for the box, and the role is expressed as a state.**

which is already half-built: `:state(radio)` and `:state(checkbox)` exist. The missing third
is a `draggable` state (or the `[qti-draggable]` attribute from Fact 3).

```css
qti-simple-choice::part(control)                       { /* the box */ }
qti-simple-choice:state(radio)::part(control)          { border-radius: 50%; }
qti-simple-choice:state(checkbox)::part(control)       { border-radius: 0.25rem; }
qti-simple-choice[qti-draggable]::part(control)        { mask: var(--qti-grip-icon); }
```

### Naming options for `ch` / `cha`

| | `ch` → | `cha` → | Reads as |
|---|---|---|---|
| **A** | `control` | `control-mark` | "the form control, and the mark inside it" |
| **B** | `indicator` | `indicator-mark` | neutral; works for grip and checkmark alike |
| **C** | `box` | `mark` | shortest; `box` is vague |
| **D** | `adornment` | `adornment-mark` | precise but wordy |

Recommendation: **A (`control` / `control-mark`)**. It is the term the ARIA/forms world uses,
it survives the drag case (a grip *is* the interactive control of a chip), and it reads well
next to `:state(radio)`.

### Also missing

`<div id="label">${this.marker}</div>` — the order-number marker — has **no part at all**, so
it cannot be themed. It should be `part="marker"`.

And `part="slot"` on a `<slot>` is confusing: it names the mechanism, not the content.
`part="label"` says what it is. (Kennisnet relies on `::part(slot)` today, so this is a
breaking rename.)

---

## 3. `exportparts` — what it actually does, and where you need it

`part` exposes a shadow-internal element **one level up**, to whoever hosts that shadow root.
It does not chain. So if `<qti-simple-choice>` sits inside `<qti-order-interaction>`'s shadow
tree, then from the document:

```css
qti-order-interaction::part(control)          /* ✗ no match — `control` is 2 levels deep */
qti-simple-choice::part(control)              /* ✗ no match — the chip is inside a shadow root */
```

`exportparts` forwards a nested component's parts up through the outer host:

```html
<!-- inside qti-order-interaction's shadow -->
<qti-simple-choice exportparts="control, control-mark, label"></qti-simple-choice>
```

```css
qti-order-interaction::part(control) { … }    /* ✓ now matches */
```

You can also rename while forwarding: `exportparts="control: chip-control"`.

**Where this repo needs it:** exactly the two interactions from Fact 2 — `qti-order-interaction`
and `qti-associate-interaction` — because only there does a chip end up inside the
interaction's shadow. In gap-match / match / graphic-gap-match the chip stays in the light
DOM and plain `qti-gap-text::part(control)` already works.

This is why `::part(drag)` exists in `qti-theme` (and why QTI-Editor projects an element
carrying `part="drag"`): it is the only handle on a shadow-resident chip.

**Important:** `exportparts` must be set on the *clone*, in `dropDraggableInDroppable`, since
the clone is what lands in the shadow.

---

## 4. Drop targets — five names for one idea

| Interaction | Container part | Individual drop target | Kind |
|---|---|---|---|
| order | `drops` (div) | `drop-list` (`<drop-list>` — **an undefined element**) | shadow |
| associate | `drop-container` (div) + `associables-container` (row div) | `drop-list` (div.dl) | shadow |
| gap-match | `drops` (slot) | *(none — `qti-gap`, light DOM)* | light |
| match | — | *(none — `qti-simple-associable-choice`'s `dropslot` slot)* | light |
| graphic-gap-match | — | *(none — `qti-associable-hotspot`, light DOM)* | light |

Two findings from re-reading this (2026-07-09):

- **`<drop-list>` is never defined.** `grep -c customElements.define … drop-list` → `0`. It is a
  `<div>` whose name happens to contain a hyphen, hence the hand-added `role="region"`.
- **`data-has-drop` is asymmetric.** It is *set* only inside the `QTI-SIMPLE-ASSOCIABLE-CHOICE`
  branch of `dropDraggableInDroppable` (`drag-drop-slotted.mixin.ts:516`) but *removed* generically
  in two other places. It should be a state on every drop target: `:state(filled)`.

Three of five have **no part for the drop target at all**, because it's a light-DOM element.
So no part vocabulary can unify them. The unifying hook has to be an attribute, mirroring
`qti-draggable`:

```ts
droppable.setAttribute('qti-droppable', 'true');   // does not exist yet — add it
```

Then, regardless of interaction or shadow/light placement:

```css
[qti-draggable='true']            { /* every chip */ }
[qti-droppable='true']            { /* every drop target */ }
[qti-droppable'][data-has-drop]   { /* an occupied target */ }
```

`data-has-drop` already exists (`drag-drop-slotted.mixin.ts:432`) but is only set in the
`QTI-SIMPLE-ASSOCIABLE-CHOICE` branch — it should be set on every drop.

Naming for the parts that *do* stay (shadow containers):

- `drags` — source container (already consistent: order, gap-match, graphic-gap-match) ✅
- `drops` — target container. Rename associate's `drop-container` → `drops`.
- `drop` — an individual shadow drop target. Rename order's and associate's `drop-list` → `drop`.
- `drop-row` — associate's `associables-container` (a pair of drops). Or drop the wrapper.
- `dropslot` → `drop` as well (match's slot *is* the target).

---

## 5. Other inconsistencies worth fixing in the same pass

**Correct-answer affordance has four names:** `correct` (text-entry), `correct-option`
(inline-choice), `correct-line` (graphic-associate), `knob-correct` (slider). All mean "the
overlay showing the right answer". → `correct` everywhere.

### `::part(control checked)` vs `:state(checked)::part(control)`

Not interchangeable. A **part names what something is**; a **state names the condition it is in**.
`::part(control radio checked)` is a *different name for the same part*, matched by subset — not
a more specific selector.

Verified in Chromium (2/2). In both pairs the "more specific looking" rule is written **first**:

| First rule | Second rule | Winner |
|---|---|---|
| `::part(control checked)` | `::part(control)` | `::part(control)` — extra part tokens add **no specificity** |
| `:state(checked)::part(control)` | `::part(control)` | `:state(checked)::part(control)` — `:state()` adds pseudo-class specificity |

Prefer `:state()` + `::part()` wherever the element can hold state:

1. **Cascade.** With part tokens every variant rule ties, so a vendor override beats the base
   theme only by loading later. With states it wins on specificity. (Kennisnet does load later,
   so this is fragile rather than broken.)
2. **Composition.** `:state()` combines with `:not()`, `:has()`, `:hover`. Part tokens cannot be
   negated — `::part(control):not(...)` negates pseudo-classes on the part element, not tokens.
3. **Reactivity.** A state toggles through `internals.states`: no re-render, no markup change. A
   part token is an attribute string, so flipping `checked` re-renders `part="…"`.
4. **Meaning.** `checked` is a condition. `radio` is a role — modelled as `:state(radio)`
   everywhere else. Neither belongs in a name.

**Why match-interaction is the exception.** `::part(x):state(y)` requires the state to live on
the part's *own* element. Match's cells are plain `<span>`s in the interaction's shadow root:
no `ElementInternals`, no states. Multi-token parts are the only mechanism available, and they
exist for exactly this.

The escape hatch, if uniformity is ever wanted: make the cell a custom element whose **host**
carries `part="control"` plus the states — then `qti-match-interaction::part(control):state(checked)`
works. Cost: the inner mark cannot be conditioned on the host's state from outside (parts don't
chain), so its checked appearance moves into the cell's shadow behind CSS variables, and
Kennisnet's four mark rules are rewritten. Not worth it to buy specificity nothing depends on.

✅ **`qti-match-interaction`'s part tokens now reuse the state vocabulary.** Was:

```ts
const chPart = `ch ${typeBase} ${checkedMarker} ${correctVariant}`; // "ch rb rb-checked rb-correct"
```

Now `control radio checked correct` / `control-mark radio checked correct`, so
`::part(control checked)` reads the same as `:state(checked)::part(control)` elsewhere. The
mechanism stays token-based for the reason above; only the words changed.

**Universal parts are missing on several interactions:** `message` is absent from order and
slider; `prompt` exists only on `qti-choice-interaction` (others use `<slot name="prompt">`
with no part).

**`qti-associable-hotspot` has no ElementInternals at all** — no `ActiveElementMixin`, so no
`checked`/`disabled`/`readonly` states. Its six `[aria-*]` theme rules were dead and are now
deleted.

---

## 6. Proposed contract

### Parts — per component, structural only

| Part | On | Meaning | Was |
|---|---|---|---|
| `control` | choice-likes | the box before the label (radio / checkbox / grip) | `ch` |
| `control-mark` | choice-likes | the mark inside it (dot / check) | `cha` |
| `label` | choice-likes | default content slot | `slot` |
| `marker` | `qti-simple-choice` | the order-number badge | *(none — unstylable)* |
| `prompt` | every interaction | the `qti-prompt` region | *(only choice-interaction)* |
| `message` | every interaction | validation message | *(missing on order, slider)* |
| `drags` | dnd interactions | source container | `drags` ✅ |
| `drops` | dnd interactions | drop-target container | `drops`, `drop-container` |
| `drop` | **every** dnd interaction | one drop target, shadow-internal, containing a `<slot>` | `drop-list`, `dropslot`, `associables-container`, *(none)* |
| `drag` | order, associate | QTI-Editor's projected chip | `drag` ✅ |
| `correct` | any | the correct-answer overlay | `correct`, `correct-option`, `correct-line`, `knob-correct` |

Deleted: `qti-simple-choice` and `qti-simple-associable-choice` as part names (tags, not roles).

### States — the condition vocabulary (already bare idents)

```
checked  radio  checkbox  disabled  readonly
dragzone-enabled  dragzone-active
dragging  placeholder  dropped                     ← new (§8b, §9)
candidate-correct  candidate-partially-correct  candidate-incorrect
correct-response  incorrect-response  show-correct-response
```

### Attributes — the cross-cutting role vocabulary

Under Option C the chip always stays in the light DOM, so these keep working everywhere.

```
[qti-draggable="true"]   every chip, bank or dropped      (exists — no theme uses it yet)
[data-drag-clone]        the floating clone during a drag (exists)
```

`[qti-droppable]` is **not** needed: drop targets are now uniformly shadow-internal and are
addressed as `::part(drop)`.

### `exportparts`

Not required under Option C — chips never enter a shadow root, so their parts are only ever one
boundary deep. It remains relevant only if QTI-Editor's projected `part="drag"` element ever
needs its internals styled from the document.

### Default drag/drop presentation moves out of JS

The four `element.style.opacity` / `pointerEvents` writes in the drag-drop mixins are replaced
by `:state(dragging)` / `:state(placeholder)`, and the two places that *read* `style.opacity` back as
state (`drag-drop-core.mixin.ts:335`, `drag-drop-slotted.mixin.ts:302`) read the state instead.
New tokens: `--qti-placeholder-bg`, `--qti-placeholder-shadow`.

---

## 7. Verified: what CSS can and cannot do here

Probed in Chromium. Rows 1–4 from the original spec; rows 5–7 added 2026-07-09 after the question
"why custom properties — can't we just use exportParts?" turned out to be correct.

| # | Question | Result |
|---|---|---|
| 1 | Can document CSS reach a shadow-resident chip by tag or `[attribute]`? | ❌ **No.** Neither `probe-chip` nor `[part='drag']` matches from outside. |
| 2 | Does `host::part(drag)` reach it? | ✅ Yes. |
| 3 | Does `host::part(drag):state(checked)` work? | ✅ Yes — parts compose with custom states. |
| 4 | Does `exportparts` forward a nested component's part up one level? | ✅ Yes — `host::part(control)` matches the chip's inner `part="control"`. |
| 5 | Does a **bare** `::part(drag)`, no element on the left, match? | ✅ **Yes.** One selector reaches a chip in *any* drop target's shadow root. |
| 6 | Does `exportparts` support **renaming** (`control: drag-control`)? | ✅ Yes — `::part(drag-control)` matches the chip's inner control. |
| 7 | Do parts **chain** (`::part(drag)::part(control)`)? | ❌ **No.** Inert. `exportparts` is the only route inward. |

**The load-bearing consequence of #1:** the moment a chip lives in the interaction's shadow,
`[qti-draggable="true"]` (Fact 3) and every tag selector stop working on it. Attributes are
*not* a substitute for parts across a shadow boundary — they only unify light-DOM chips.

Results #3 and #5 together are stronger than this document originally assumed. `::part(drag)`
alone — no `qti-gap`, no `qti-associable-hotspot`, no per-target selector list — is a complete
styling contract for a dropped chip, and it composes with custom states. Kennisnet's six
tag-scoped chip lists collapse to **two** selectors covering all three homes a chip has:

```css
:state(drag),   /* the bank chip: slotted, light DOM, so `part=` is unreachable (§8b) */
::part(drag)    /* the floating clone and every dropped chip, in whatever shadow root */
{ … }
```

That is the same count kennisnet carries today (`:state(drag), [data-drag-clone]`), so declarative
rendering costs the theme nothing. `[data-drag-clone]` disappears once the floating clone is
rendered inside the interaction's shadow carrying `part="drag"` as well.

### Custom properties are *not* required — a correction

It was briefly argued that a chip moved into a shadow root goes dark for the theme — it carries no
styling of its own (verified: **0** `var(--qti-*)` reads in `qti-gap-text.styles.ts` and
`qti-simple-choice.styles.ts`) — and therefore that the token vocabulary had to be frozen *before*
Stage B.

Wrong. Result #5 means the theme reaches the chip perfectly well through `::part(drag)`. Order and
associate already prove it: their dropped chips live in the interaction's shadow and *are* themed,
via the `part="qti-simple-choice"` hack, which is `part="drag"` with a bad name. Tokenising the
chip's appearance stays worthwhile on its own merits (`css-contract-audit.md` step 2) but it **does
not gate Stage B** and is off the critical path.

### The one genuine cost: result #7

Today the grip glyph is drawn by reaching *through* the chip into its shadow:

```css
:state(drag)::part(control)::before { /* grip */ }
```

which works only because a bank chip is itself a light-DOM host. Once the chip is rendered inside
`qti-gap`'s shadow, `::part(drag)::part(control)` is inert (#7), so the inner part must be forwarded
and renamed (#6) — giving the theme two spellings of one glyph.

**Decision: draw the grip on the chip host, not on its control** — `:state(drag)::before` and
`::part(drag)::before`. The grip is decoration on the chip, not on the control it happens to sit
beside. Nothing needs forwarding, the part vocabulary stays one level deep everywhere, and
`exportparts` on the clone becomes optional rather than load-bearing.

---

## 8. The decision that gates the rest

Three coherent models. The current code is none of them — it is A and B mixed per interaction.

**Option A — all dropped chips stay in the light DOM.**
Make order + associate render their drop targets as light/slotted elements, like gap-match
already does. Chips never cross a boundary. `qti-simple-choice::part(control)` then works
identically everywhere and `[qti-draggable]` unifies every chip. No `exportparts` needed.
Kills the `part="qti-simple-choice"` hack. But it drops `::part(drag)`, which QTI-Editor
depends on, so that integration must be renegotiated.

**Option B — all dropped chips live in the interaction's shadow root.** ← *requested*
Make gap-match, match, and graphic-gap-match drop into shadow targets, as order and associate
already do. The styling contract becomes purely `::part()` + `:state()`, which is the
strongest, most encapsulated option and matches what QTI-Editor already expects.

What it requires, given the probe results:

1. Every clone that lands in a shadow droppable gets `part="drag"` **and**
   `exportparts="control, control-mark, label"` — set in `dropDraggableInDroppable`, since the
   clone is what enters the shadow.
2. Themes address dropped chips **only** as `qti-*-interaction::part(drag)` and
   `::part(control)`. Tag and attribute selectors are dead there (probe #1). Kennisnet's
   six-way selector list becomes `::part(drag)`, and `[qti-draggable]` remains useful only for
   the *source* chips.
3. **The source chips are the catch.** Authored `<qti-simple-choice>` children are projected
   through `<slot part="drags">` and stay in the light DOM. So a chip in the bank is styled
   `qti-order-interaction qti-simple-choice`, while the same chip once dropped is styled
   `qti-order-interaction::part(drag)`. Two selectors for one concept — the very problem we
   are trying to remove.

   To get true uniformity the interaction must also **adopt the source chips into its shadow**
   rather than slotting them. That is the real cost: `this.querySelectorAll('qti-simple-choice')`
   stops finding them, which the interactions, the response serialisation, and a large number
   of stories/specs all rely on.

**Option C — chips always light, drop targets always shadow.**
Shadow drop targets (`::part(drop)`) that contain a `<slot>` per target, into which the chip is
projected while staying a light-DOM child of the interaction. Best of both: uniform
`::part(drop)` for targets, uniform `qti-simple-choice::part(control)` + `[qti-draggable]` for
chips, no `exportparts`, and `::part(drag)` can be kept for QTI-Editor's projected element.
Costs a per-target named slot and slot bookkeeping on drop.

|  | uniform chip selector | uniform target selector | `exportparts` needed | QTI-Editor `::part(drag)` | churn |
|---|---|---|---|---|---|
| A | ✅ light | ✅ light | no | ✗ breaks | medium |
| B | ⚠️ only if chips leave light DOM | ✅ shadow | yes | ✅ keeps | **high** |
| C | ✅ light | ✅ shadow | no | ✅ keeps | medium |

Option B as literally requested (drops in shadow) gives the cleanest *encapsulation* and the
strongest contract — but only pays off fully if the source chips move into the shadow too,
which is the expensive part. Option C reaches nearly the same contract at much lower cost by
moving the *target* into shadow and letting the chip stay light.

---

## 8b. Styling a chip that sits in a drop container

> **Superseded by §8c.** This section analysed the *slotted* model. The adopted model renders
> chips into the target's own shadow root, where `part="drag"` **does** work. Kept because the
> slotted-vs-shadow distinction below is the reason why, and it is easy to get backwards.

Desired: a dropped chip should look different from a chip in the bank — e.g. borderless, so it
sits flush inside the drop container.

The instinct is `part="dragged"` on the dropped chip. **If the chip is slotted, that cannot
work**, and the reason is worth internalising: a *slotted* element is not in the shadow tree. It
stays a light-DOM child of the host and is merely rendered at the slot's position. `part` only
applies to elements inside the shadow tree, and `::part()` cannot select descendants of a part
(`::part(drop) > *` is invalid).

If instead the target *renders* the chip into its shadow root (§8c), the chip is in the shadow
tree and `part="drag"` is exactly the right hook.

Probed in Chromium (6/6 passed):

| Selector | Matches a slotted chip? |
|---|---|
| `host::part(dragged)` (with `part="dragged"` on the chip) | ❌ no |
| `host::part(drop)` (the shadow drop target) | ✅ yes |
| `host qti-simple-choice` (descendant) | ✅ yes |
| `qti-simple-choice:state(dropped)` | ✅ yes |
| `qti-simple-choice::part(control)` | ✅ yes |

This is a feature, not a limitation. Because the chip stays light, it is directly addressable —
you get `:state()`, its own `::part(control)`, and the normal cascade. A part would have given
you strictly less.

**So: `:state(dropped)`, set on the chip while it lives in a drop container.**

```css
/* qti-theme default */
qti-simple-choice:state(dropped) {
  border: none;                       /* slip flush into the drop container */
  box-shadow: none;
  border-radius: 0;
}

/* the container itself, still a real part */
qti-order-interaction::part(drop) { … }
```

### Three chips, three states — keep them distinct

There are three distinct elements in flight, and it is easy to conflate them:

| Element | Where | State | Renders as |
|---|---|---|---|
| the source chip in the bank, while its clone is mid-drag | light, `drags` slot | `dragging` | empty inset box |
| the source chip in the bank, once its copy is placed | light, `drags` slot | `placeholder` | empty inset box |
| the clone sitting inside a drop container | light, projected into `::part(drop)` | `dropped` | borderless chip |
| the clone following the cursor | `document.body` | `[data-drag-clone]` | lifted / rotated |

`placeholder` rather than `placed`: the state sits on the chip that *stayed behind* and is now
a hole, so naming it after the hole avoids colliding with `dropped`, which sits on the chip
that actually moved.

---

## 8c. Drop targets and `<drop-list>` — the shadow markup, and what to do about it

### Current state, all five drag-drop interactions

| Interaction | Draggable | Drop target element | Is it defined? | Target lives in | Target's part today | "occupied" hook today |
|---|---|---|---|---|---|---|
| `qti-order-interaction` | `qti-simple-choice` | `<drop-list>` | ❌ **undefined tag** | interaction **shadow** (generated) | `drop-list` | `[part='drop-list']:has([part='qti-simple-choice'])` |
| `qti-associate-interaction` | `qti-simple-associable-choice` | `<div class="dl">` | plain `div` | interaction **shadow** (generated) | `drop-list` | — |
| `qti-gap-match-interaction` | `qti-gap-text` | `<qti-gap>` | ✅ custom element | **light** — authored *inline in a sentence* | *(none)* | — |
| `qti-match-interaction` | `qti-simple-associable-choice` | `<qti-simple-associable-choice>` (last match-set) | ✅ custom element | **light** — authored | `dropslot` (a slot in its *own* shadow) | `data-has-drop` |
| `qti-graphic-gap-match-interaction` | `qti-gap-img, qti-gap-text` | `<qti-associable-hotspot>` | ✅ custom element | **light** — authored, positioned on an image | *(none)* | — |

Plus, set by `drag-drop-core.mixin.ts:781-792` on **every** zone: `[enabled]`, `[active]`.
And `[data-cross-slot-target]`, styled in `qti-order-interaction.styles.ts:57`.

Three separate problems are visible in that table:

1. **`<drop-list>` is not a custom element.** No `customElements.define('drop-list')` anywhere —
   it is a bare unknown tag used as a styling hook. `<line-container>` in graphic-associate is
   the same. They work (an unknown hyphenated tag is a valid `HTMLElement`), but they have no
   shadow root, no `ElementInternals`, and therefore **no states** — which is why order and
   associate express "occupied" as `:has([part='qti-simple-choice'])` and `data-has-drop`
   instead of `:state(filled)`.
2. **Two of five targets are generated, three are authored.** The generated ones sit in the
   interaction's shadow; the authored ones cannot.
3. **State is carried by bare attributes** (`[enabled]`, `[active]`, `[data-has-drop]`,
   `[data-cross-slot-target]`) rather than `:state()`, because plain divs have no internals.

### The hard constraint

> **Drop targets cannot all live in the interaction's shadow root.**

`<qti-gap>` is authored inline in the item body:

```html
<p>“Een oplossing met een pH lager dan 7 noemen we <qti-gap identifier="gap_low"></qti-gap>, …”</p>
```

Its position *in the prose* is its meaning. The same holds for `qti-associable-hotspot`
(absolutely positioned on an authored image) and match's `qti-simple-associable-choice`. None of
them can be relocated into `qti-*-interaction`'s shadow root.

So the goal is not "every drop target in the interaction's shadow". The achievable — and better —
goal is:

> **Every drop target is a custom element that owns a shadow root, with a uniform internal
> structure, uniform parts, and real custom states.**

The dropped chip then always lives inside *a* shadow root — the **target's**, not the
interaction's. That satisfies the encapsulation goal and works identically for authored and
generated targets.

### Suggestion — declarative drop rendering (no `<qti-drop-slot>`, no `appendChild`)

**Rejected:** introducing a `<qti-drop-slot>` element. Unnecessary.

**Adopted:** the drop target renders its contents from *data*, in its own shadow root, via the
Lit template. The interaction owns the response; each target receives the chips it holds and
renders them. No `cloneNode` + `appendChild` into someone else's DOM, and no reading the DOM
back to compute the response.

```ts
// qti-gap / qti-associable-hotspot / qti-simple-associable-choice (target side)
@property({ attribute: false }) drags: HTMLElement[] = [];

render() {
  return html`<div part="drop">
    ${repeat(this.drags, el => el.getAttribute('identifier'), el => el)}
  </div>`;
}
```

Order and associate need no new element either: they render their drop lists **and** the chips
inside them declaratively in their own shadow:

```ts
html`<div part="drops">
  ${this.dropLists.map(list => html`
    <div part="drop" identifier=${list.id}>
      ${repeat(list.drags, el => el.getAttribute('identifier'), el => el)}
    </div>`)}
</div>`
```

Verified in Chromium (6/6): Lit renders `Node` values directly, a cloned custom element upgrades
and builds its own shadow root, and `target::part(drop)` / `::part(drag)` / `::part(control)`
(via `exportparts`) all resolve.

#### Why this is strictly better

| | today (imperative) | proposed (declarative) |
|---|---|---|
| chip enters the DOM by | `droppable.appendChild(cleanClone)` | Lit template, from `response` |
| response is computed by | `collectResponseData()` → `querySelectorAll` | it *is* the state; DOM is derived |
| "occupied" is expressed as | `[data-has-drop]`, `:has([part='qti-simple-choice'])` | `this.drags.length > 0` → `:state(filled)` |
| chip styling hook | tag selectors + `part="qti-simple-choice"` hack | `::part(drag)` |

The two places that read `style.opacity` back as state (§9) and the four that write it disappear
along with it: the source chip's `placeholder` state becomes a pure function of the response.

#### Consequence 1 — `part="drag"` now works (this reverses §8b)

§8b concluded that `part="dragged"` cannot work, because a *slotted* chip stays in the light
tree. Under declarative rendering the chip is **not slotted** — it is rendered *inside the
target's shadow root*. So it is in the shadow tree, and `part` applies:

```css
qti-gap::part(drag)                 { border: none; }   /* the dropped chip, borderless */
qti-gap::part(drag)::part(control)  { /* ✗ invalid — parts don't chain */ }
qti-gap::part(control)              { /* ✓ via exportparts="control" on the chip */ }
```

So `:state(dropped)` is **no longer needed**. "Dropped" is expressed structurally: a chip
reachable as `::part(drag)` is by definition inside a drop target. Keep `:state(dragging)` and
`:state(placeholder)`, which live on the *source* chip in the light-DOM bank.

The clone must carry `part="drag"` and `exportparts="control, control-mark, label"`.

#### Consequence 2 — the interaction can no longer find dropped chips by query ⚠️

Verified: a chip rendered into `qti-gap`'s shadow is invisible to
`interaction.shadowRoot.querySelectorAll(...)` and to `document.querySelectorAll('qti-gap qti-gap-text')`
— it is one shadow root deeper. So:

- `cacheInteractiveElements()` will not collect dropped chips into `trackedDraggables`.
- `collectResponseData(droppables, draggablesSelector)` and
  `isDroppableAtCapacity()` / `countTotalAssociations()` stop working — they all
  `querySelectorAll` inside the droppable.

This is not a blocker, it is the *point*: those functions exist only because the DOM was the
source of truth. Under the new model the response is, and they are replaced by reads of the
response. Pointer hit-testing is unaffected — `findDraggableTarget` already uses
`event.composedPath()`, which pierces shadow roots. Keyboard navigation, which walks
`trackedDraggables`, needs the target to expose its chips (e.g. a `get drags()` accessor) rather
than a global query.

#### Consequence 3 — clone identity must be stable

`this.drags.map(el => el.cloneNode(true))` inside `render()` would mint a new node every update:
focus loss, restarted transitions, broken drag state. Clone **once, when the drop happens**, keep
the node in the interaction's state, and pass the same node reference each render. Lit renders a
`Node` by reference, so a stable node is *moved*, never recreated. Key the `repeat()` by
`identifier`.

#### Still to unify

Regardless of rendering strategy, these names collapse:

| Was | Becomes |
|---|---|
| `<drop-list>` / `<div class="dl">` (both undefined-ish, no states) | `<div part="drop">` in the interaction's shadow |
| `part="drop-list"`, `part="dropslot"`, `part="associables-container"` | `part="drop"` |
| `part="drop-container"` | `part="drops"` |
| `[enabled]` | `:state(dropzone-enabled)` |
| `[active]` | `:state(dropzone-active)` |
| `[data-has-drop]`, `:has([part='qti-simple-choice'])` | `:state(filled)` |
| `[data-cross-slot-target]` | `:state(cross-slot-target)` |

Note: authored targets are custom elements, so they can carry real `:state()`. The generated
`<div part="drop">`s inside order/associate cannot (a plain div has no `ElementInternals`) — they
must express `filled` / `active` as attributes, **or** the interaction hoists the state to itself.
This is the one place a small custom element would still pay for itself; if `<qti-drop-slot>` is
off the table, use `[data-filled]` on those divs and accept the asymmetry, or expose
`::part(drop)` variants (`part="drop drop-filled"`), which is how `qti-match-interaction` already
does it.

---

## 8d. The plumbing: `@lit/context` instead of DOM queries

§8c says the drop target renders its own chips from data. It leaves one question open: **how
does the interaction hand `drags` to an authored `<qti-gap>` buried inside a `<p>`?** Setting a
property on it means finding it — `querySelectorAll` — which is exactly what we are removing.

Inverting it with `@lit/context` solves this: the interaction *provides* reactive drag-drop
state; each drop target *subscribes* and pulls the slice it needs. Nobody queries anybody.

The repo already uses this pattern (`itemContext`, `configContext`, `qtiContext`, all
`Readonly<T>` with `@consume({ subscribe: true })`), and `@lit/context` is already a dependency
of `qti-base`.

```ts
// qti-base/src/context/drag-drop.context.ts
export type DragDropState = Readonly<{
  dragsByTarget: Readonly<Record<string, HTMLElement[]>>;  // targetId → stable clone nodes
  mode: 'idle' | 'dragging';
}>;
export const dragDropContext = createContext<DragDropState>(Symbol('dragDrop'));
```

```ts
// the interaction — provider, owns the truth
@provide({ context: dragDropContext })
state: DragDropState = { dragsByTarget: {}, mode: 'idle' };

handleDrop(chip: HTMLElement, targetId: string) {
  this.state = { ...this.state, dragsByTarget: { ...this.state.dragsByTarget, [targetId]: [chip] } };
}
```

```ts
// qti-gap / qti-associable-hotspot / qti-simple-associable-choice — consumer, renders itself
@consume({ context: dragDropContext, subscribe: true })
ctx!: DragDropState;

get drags() { return this.ctx?.dragsByTarget?.[this.identifier] ?? []; }

render() {
  return html`<div part="drop">
    ${repeat(this.drags, el => el.getAttribute('identifier'), el => el)}
  </div>`;
}
```

Verified in Chromium (3/3):

| Probe | Result |
|---|---|
| An authored `<c-gap>` nested inside a `<p>`, inside the interaction, receives the context and renders the clone into its own shadow root — no queries | ✅ |
| **In-place mutation of the context object does *not* notify consumers** | ✅ (silently does nothing) |
| A consumer that upgrades *before* its provider still connects, given a `ContextRoot` | ✅ |

### Three rules this imposes

1. **Reassign, never mutate.** `state.dragsByTarget[id] = [chip]` updates nothing and fails
   silently — the probe confirms it. Always spread a new object. This is the single most likely
   bug in the migration.
2. **A `ContextRoot` is required.** QTI item bodies are parsed before the interaction upgrades,
   so `<qti-gap>` can issue its `context-request` before a provider exists. `ContextRoot`
   buffers those requests and satisfies them when the provider appears. Without it, targets that
   connect early silently never receive state.
3. **Clone nodes must be stable** (§8c, consequence 3). Store the clone in `dragsByTarget` once,
   at drop time; `repeat()` keyed on `identifier` then moves rather than recreates it.

### What this deletes

- `cacheInteractiveElements()`'s droppable/draggable queries, `collectResponseData()`,
  `isDroppableAtCapacity()`, `countTotalAssociations()` — all read the DOM to recover state the
  interaction already has.
- `droppable.appendChild(cleanClone)` and every `element.style.opacity` write (§9).
- `part="qti-simple-choice"`, `[data-has-drop]`, `[enabled]`, `[active]`.

### What replaces target discovery

The interaction still needs to know which targets exist (hit-testing, capacity). Rather than
querying, reuse the pattern `ActiveElementMixin` already uses: each target dispatches a
`register-drop-target` / `unregister-drop-target` event (bubbling, composed) on connect and
disconnect. The interaction keeps the list. `findDraggableTarget` continues to use
`event.composedPath()`, which pierces shadow roots and so is unaffected by chips moving into a
target's shadow.

### Granularity caveat

Every subscriber re-renders on any context change, so dropping into one gap re-renders all gaps.
For QTI item sizes this is irrelevant (a handful of targets), and Lit's `repeat()` keeps the DOM
stable. If it ever matters, give each target its own context slice or memoise on `identifier`.

---

## 8e. `qti-simple-choice` doesn't know what it is — and shouldn't have to be told imperatively

`qti-simple-choice` renders a radio in `qti-choice-interaction[max-choices=1]`, a checkbox when
`max-choices != 1`, and a drag grip in `qti-order-interaction`. The element itself knows none of
this. Today the parent *pushes* the role in, imperatively, after finding the children by query:

```ts
// choices.mixin.ts:282-283
choiceElement.internals.states.delete(role === 'radio' ? 'checkbox' : 'radio');
choiceElement.internals.states.add(role);
```

That is inversion of control done the hard way: a query, then a mutation, on every child. Same
smell as §8c/§8d. The fix is the same shape — the parent *provides*, the child *subscribes*:

```ts
// qti-base/src/context/interaction.context.ts
export type InteractionState = Readonly<{
  role: 'radio' | 'checkbox' | 'drag';   // what the choice should render as
  disabled: boolean;
  readonly: boolean;
}>;
export const interactionContext = createContext<InteractionState>(Symbol('interaction'));
```

```ts
// qti-simple-choice — pulls its own role, derives its own states
@consume({ context: interactionContext, subscribe: true })
ctx!: InteractionState;
```

This deletes `choices.mixin`'s child queries and its `states.add(role)` push, and it makes the
element self-describing: it can be dropped into a new parent and behave correctly.

### The context must be provided by the *interaction*, not by `qti-assessment-item`

Interactions have to work standalone — inside a plain `<form>`, in a Storybook story, in a
vendor's own app — with no QTI item, test, or session around them. So:

| Context | Provider | Why |
|---|---|---|
| `interactionContext` (role, disabled, readonly) | **the `qti-*-interaction`** | must work with no QTI ancestor |
| `dragDropContext` (§8d) | **the `qti-*-interaction`** | same |
| `itemContext`, `sessionContext`, `testContext` | `qti-assessment-item` / `qti-test` | genuinely item/test scoped |

This is already the direction of travel: `Interaction` consumes `itemContext` and `configContext`
*optionally* (`this.ctx?.…`), so an interaction with no item above it still functions. The two new
contexts must follow that rule — every consumer reads `this.ctx?.x ?? <sane default>`, never
assuming a provider exists.

Consequence: `qti-simple-choice` used entirely on its own (no interaction) gets no context and
must fall back to a sensible default role. That fallback is part of the contract, not an accident.

---

## 8f. Dropzone auto-sizing — measured once, applied to almost nothing

Verified by probe, not inspection:

| | `--qti-dropzone-min-width` |
|---|---|
| initial | `32px` |
| after the chips get wider (late CSS / font load) | `32px` |
| after a new chip is added to the bank | `32px` |
| after a drop | `32px` |

Three defects:

1. **`min-width` reaches only two of five interactions.** `applyDropzoneAutoSizing` sets it when
   `droppables[0]` is a `QTI-GAP` or a `QTI-SIMPLE-ASSOCIABLE-CHOICE`. Order's `drop-list`,
   associate's `.dl` and graphic-gap-match's hotspots get `min-height` only. Order's drop-lists
   merely *look* sized because they are `flex: 1`.
2. **It is not reactive.** `updateMinDimensionsForDropZones()` runs once from `afterCache()`. It
   survives neither a late-loading font, nor a chip added to the bank, nor a drop. Same failure
   mode as the inline-choice trigger width: measure once, before the CSS lands, freeze the wrong
   number.
3. **`autoSizeDropzones` is decorative.** A public property with an `auto-size-dropzones`
   attribute, default `false`, read by nothing. The feature it names is unconditionally on.

### Decisions (agreed)

- **Extend `min-width` to every dropzone type.** A dropzone that cannot fit its chip is a bug.
  This moves VRT baselines and wants its own pass.
- **`autoSizeDropzones` defaults to `true`** — it is an opt-out, and the current `false` default
  is simply wrong. When switched off, the dropzone falls back to vendor-settable variables
  rather than to `0`:

  ```css
  min-height: var(--qti-dropzone-min-height, var(--qti-drop-min-height, 0));
  min-width:  var(--qti-dropzone-min-width,  var(--qti-drop-min-width, 0));
  ```

  `--qti-dropzone-*` is the measurement the interaction publishes; `--qti-drop-*` is the theme's
  floor. With auto-sizing off, the interaction publishes nothing and the theme's value applies.

- **Make it reactive**, folded into Stage B rather than done twice. The variable indirection
  makes this cheap: a `ResizeObserver` over the chips (they are in layout, unlike a closed
  popover) updating two custom properties on the host — no DOM writes to droppables, no
  re-render. Measure after `document.fonts.ready` for the first pass.

### Also noted while doing this

- `width` cannot move to a custom property. `qti-associable-hotspot` carries an inline `width`
  from its `coords`, and an authored `data-choices-container-width` must override it; a `:host`
  variable never beats an inline style. Confirmed by making D105/D106 fail at 80px.
- `min-width` beats `width`. Auto-sizing therefore silently discarded
  `data-choices-container-width` whenever the theme's chips were wider than the authored gap.
  This, not Bootstrap layout, was the cause of the Kennisnet `Q6-L2-D1` drop failure.
- `qti-simple-associable-choice` is both chip and drop target, so dropzone sizing must be scoped
  `:host(:not(:state(drag)))`. Its `dropslot` slot exists on source chips too, and sizing it
  there inflated them.

---

## 9. The drag placeholder — presentation hard-coded in JS

The drag-drop mixins paint directly onto `element.style`:

```ts
dragElement.style.opacity = '0';          // drag-drop-core.mixin.ts:477   — source, while dragging
dragElement.style.pointerEvents = 'none';

item.style.opacity = '0.0';               // drag-drop-slotted.mixin.ts:542 — source, matchMax reached
item.style.pointerEvents = 'none';
```

A theme cannot override this — inline styles beat any stylesheet rule short of `!important`.
So Kennisnet resorts to matching the *inline style string*:

```scss
/* overrides/kennisnet/qti/order-interaction.scss:37 */
&[style*='opacity: 0'] {
  background-color: var(--bs-placeholder-bg);
  opacity: 1 !important;                 /* undo the JS */
  box-shadow: inset var(--bs-placeholder-box-shadow);
  color: transparent;
}
```

That is the behaviour to promote into the contract: **the gap a chip leaves behind should be
an empty, inset box — not an invisible element.**

Worse, the mixins *read the styles back as if they were state*:

```ts
this.trackedDraggables.filter(d => d.style.opacity !== '0')   // drag-drop-core.mixin.ts:335
} else if (dragSource.style.opacity === '0') {                // drag-drop-slotted.mixin.ts:302
```

So `opacity` is doing duty as a state variable. Introducing real states fixes the logic and
the styling in one move.

### Two distinct conditions, not one

| Condition | Today | Meaning | Lifetime |
|---|---|---|---|
| source of the in-flight drag | `style.opacity = 0` | its clone is currently following the cursor | transient |
| source consumed | `style.opacity = 0.0` | `matchMax` reached; a copy sits in a dropzone | persists until removed |

Both leave a hole in the bank, and both should render as an empty inset box. But they are not
the same state, and a theme may well want to distinguish them (e.g. dashed while dragging,
solid once placed).

Note an existing inconsistency: a `[dragging]` **attribute** already exists and is styled in
four theme files (`qti-order-interaction.css:15`, `qti-match-interaction.css:30,74`,
`qti-gap-match-interaction.css:40`, `qti-associate-interaction.css:24`) — but it is set only by
the *legacy* `drag-drop-interaction-mixin.ts:1028`, and on the floating clone, not the source.
The observable mixins never set it. So `[dragging]` and `style.opacity` describe overlapping
ideas through two different mechanisms.

### Proposal

Replace all four inline-style writes with custom states on the source chip:

```
:state(dragging)     — this chip's clone is currently in flight
:state(placeholder)  — this chip's copy sits in a dropzone (matchMax reached)
```

The mixins then read `internals.states.has('placeholder')` instead of `style.opacity`,
`[dragging]` is retired in favour of `:state(dragging)`, and `qti-theme` ships a sane default:

```css
qti-simple-choice:state(dragging),
qti-simple-choice:state(placeholder) {
  color: transparent;                       /* keep the box size, hide the text */
  background: var(--qti-placeholder-bg);
  box-shadow: inset var(--qti-placeholder-shadow);
  border-color: transparent;                /* NOT `border: none` — see below */
  pointer-events: none;
}
```

Kennisnet's `[style*='opacity: 0']` rule then collapses to `:state(placeholder)` with no
`!important` anywhere, and its `--bs-placeholder-bg` / `--bs-placeholder-box-shadow` become the
theme's `--qti-placeholder-*` tokens.

`pointer-events` stays in CSS so a theme can re-enable interaction if it wants.

> An earlier draft of this snippet said `border: none`, and so did kennisnet. It costs the
> placeholder 2px per axis, the drag bank rewraps, and the gap the user is aiming at slides a line
> up mid-drag. That was the root of `Q6-L2-D1`. **A transient state may repaint an element; it may
> never resize or move it** — now enforced by `tools/stylelint/no-layout-in-transient-state.mjs` and
> measured by `drag-drop.invariance.spec.ts`.

---

## 10. Sequencing (revised 2026-07-09)

The token vocabulary was previously believed to gate Stage B. It does not (§7). The order is:

### Step 1 — the naming pass (mechanical, independently verifiable)

No behaviour change, no data-flow change. Every drop target gets one vocabulary:

| Today | Becomes |
|---|---|
| `<drop-list part="drop-list" role="region">` (order) | `<div part="drop">` |
| `<div class="dl" part="drop-list">` (associate) | `<div part="drop">` |
| `part="dropslot"` (match) | `part="drop"` |
| `part="drop-container"` (associate) | `part="drops"` |
| `part="associables-container"` (associate) | `part="drop-row"`, or delete the wrapper |
| `part="associable-choices"` (associate) | `part="drags"` |
| `part="qti-simple-choice"` (order, set at runtime) | **deleted** — it is `part="drag"` |
| `[data-has-drop]` (match only) | `:state(filled)`, on every drop target |
| *(nothing)* | `qti-droppable="true"` — the light-DOM counterpart of `qti-draggable` |

`qti-droppable` exists because three of the five targets are light-DOM elements that no part can
reach (§7 #1). It is the drop-side twin of Fact 3's `qti-draggable`.

### Step 2 — Stage B: declarative drop rendering (§8c, §8d)

`dragDropContext` becomes the source of truth; each target renders `${repeat(this.drags, …)}` into
its own shadow root; the clone carries `part="drag"`; the grip moves to the chip host.

**Size this first:** a chip one shadow root deeper is invisible to `querySelectorAll`. Known reads
to convert to context lookups:

- `toggleCandidateCorrection` in gap-match — `targetChoice.querySelectorAll('qti-gap-text')`
- `cacheInteractiveElements()` — will no longer collect dropped chips
- `DragDropSlottedSortableMixin:132` — `#sourceSlot.appendChild(targetItem)` reorders placed chips
  by moving DOM nodes; must become a reorder of the context array
- `collectResponseData`, `countTotalAssociations`, `isDroppableAtCapacity` — `@deprecated`, and no
  longer called by `drag-drop-slotted.mixin.ts` (which references them only in a comment). They do
  still have **three live call sites in the legacy `drag-drop/drag-drop-interaction-mixin.ts`**, the
  deprecated parallel implementation. Stage B does not have to touch that file, but it cannot delete
  the helpers until it goes.

Pointer hit-testing is unaffected: `findDraggableTarget` (`utils/drag-drop.utils.ts:2`) walks
`event.composedPath()`, which pierces shadow roots.

### Step 3 — token vocabulary (`css-contract-audit.md` step 2)

Independent. Worth doing; gates nothing.
