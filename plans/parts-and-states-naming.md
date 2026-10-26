# Parts and states: one vocabulary, starting with drag and drop

## Goal

A theme author or host must be able to guess a part or state name from what it means, and every
name must mean one thing. Today the non-drag interactions are reasonably consistent; drag and drop
is not. Its names grew around technical limits (a `<div>` cannot carry `:state()`, `::part()` does
not chain) rather than around one model, so one role has several names and one name has several
meanings.

This plan has two lanes:

- **Cleanup (`main`, 9.x):** dead selectors, a missing export, docs, keyboard parity. Nothing a host
  relies on changes.
- **Rename (`next`, Next major):** one drag-and-drop vocabulary, old names kept as aliases for one
  major, with host-migration notes.

The naming rule (below) is the lasting decision; the task lists turn into issues and this file goes
when they ship (CLAUDE.md, "The backlog is GitHub issues").

## The audit (2026-10-26, on `next` at `f450725c` plus the feedback branch)

Read-only inventory of every `part`, `exportparts`, `:state()`, state-like attribute and its use in
`qti-theme` and `qti-corrections`. Short names for files:

| Alias | File                                                                                    |
| ----- | --------------------------------------------------------------------------------------- |
| CORE  | `packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-core.mixin.ts`   |
| SLOT  | `packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts` |
| SSORT | `…/drag-drop-observables/drag-drop-slotted-sortable.mixin.ts`                           |
| DDU   | `…/drag-drop-observables/utils/drag-drop.utils.ts`                                      |
| TH/   | `packages/qti-theme/src/styles/qti-theme/`                                              |
| CORR/ | `packages/qti-corrections/src/`                                                         |

Verified by hand: `active`/`enabled` always toggled together (CORE:1097-1115); a full target gets
`disabled` (SLOT:842-851); `correction-partially-correct` missing from the placed chip's
`exportparts` (SLOT:701-704); `[dragging]` set only by the unused legacy mixin
(`core/src/mixins/drag-drop/drag-drop-interaction-mixin.ts:1017`); `:state(chip)` documented but
never set (`packages/qti-base/src/context/interaction.context.ts:30`).

### Drag and drop: the three roles and what they are called now

| Role                         | Names in use                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| The item you drag ("chip")   | `:state(drag)` (CORE:337), attribute `qti-draggable` (CORE:342-369), `::part(drag)` once placed (SLOT:694), "chip" in code/comments |
| The place you drop it        | `:state(droppable)` (CORE:340, custom elements only), `::part(drop)`, "dropzone" (`allDropzones`), "target", "slot" (SSORT)          |
| The store you drag from      | `::part(drags)`, "inventory" (`data-drag-origin="inventory"`), `dragContainersSelector`; match has no name for it                   |

### Flags on a drop target (DDU:96-140)

`filled`, `active`, `enabled`, `hover`, each written three ways: a plain attribute always,
`:state(x)` when the element has internals, a part token when its `part` contains `drop`. Which one
a theme must use depends on the element: part tokens for order and associate (div targets),
`:state()` for gap-match and graphic-gap-match (custom elements).

### Lifecycle of a mouse drag

| Moment                    | What is set                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Pointer down, bank chip   | clone `[data-drag-clone]` + `data-drag-origin="inventory"`; chip `:state(dragging)`; host `dragzone-enabled` + `dragzone-active`; every target and the bank `enabled` + `active` |
| Pointer down, placed chip | chip leaves its target (`filled` off if empty); target `data-drag-source`; bank originals `:state(return-anchor)`; peers temporarily lose `disabled` |
| Moving                    | `hover` on the one target under the pointer (50 ms hysteresis)                                                  |
| Drop                      | target `filled`; bank original `:state(placeholder)` when match-max is reached; `disabled` recomputed (= full) |
| End                       | `dragging`, `return-anchor`, `data-drag-source`, `dragzone-*`, `enabled`, `active`, `hover` cleared            |

The keyboard path (CORE:552-621) sets only `data-keyboard-dragging` on the chip and a plain `hover`
attribute on targets: no `:state()`, no part token, no `dragzone-*`, no `dragging`, no clone.

## Problems

### One concept, several names

- **Chip:** `drag`, `qti-draggable`, `drag` part, "chip"; documented `:state(chip)` never set.
- **Pairs do not match:** `drag` (noun) vs `droppable` (adjective); parts `drag` vs `drop`.
- **Target:** `drop`, `droppable`, dropzone, target, slot.
- **Bank:** `drags`, inventory, drag container; associate's bank slot is named after a tag
  (`name="qti-simple-associable-choice"`).
- **Drag in progress:** `active` + `enabled` (targets) and `dragzone-active` + `dragzone-enabled`
  (host) are always set together and painted identically; DDU:98 says "kept distinct because the
  themes distinguish them", and they do not.
- **Selected:** `:state(checked)`, part token `checked` (match tabular), `option-selected` (inline
  choice), `aria-ordervalue` (graphic-order).
- **Answer key:** parts `answer` (text-entry), `correct-line` (graphic-associate), `knob-correct`
  (slider, reversed word order); `:state(correct-response)`, `:state(show-correct-response)`,
  attribute `answer-key`, class `.full-correct-response`.
- **Read-only:** host `[readonly]`, choice `:state(readonly)`, `data-readonly` on the inline-choice
  trigger.

### One name, several meanings

- **`disabled`:** interaction off (host attribute), choice off (`:state`), drop target **full**
  (attribute, SLOT:848), authoring escape hatch on a chip (DDU:29).
- **`hover`:** "a chip is over this target", next to the real `:hover`.
- **`dragging`:** the hole left by a chip in flight (`:state`), the lifted in-flight look
  (`@mixin dragging`), a keyboard pick-up (`data-keyboard-dragging`).
- **`placeholder`:** a used-up bank chip (`:state`), the sortable preview slot
  (`[data-drop-placeholder]`).
- **`drop`:** the target itself (order, associate) or an inner area of the target (qti-gap,
  qti-associable-hotspot, qti-simple-associable-choice).
- **`drops`:** a div of drop divs (order), rows plus the message (associate), the prose slot
  (gap-match).
- **`point`:** a select-point marker button and a graphic-associate in-progress circle.
- **`value`:** inline-choice chosen text and the slider value (twice with the correction knob).

### Names that exist on one side only

**In the theme, never set (dead selectors):**

| Selector                                                     | Where                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| `&[dragging] { @mixin dragging }`                            | TH/interactions/qti-order, gap-match, match `.css` (40, 59, 62) |
| `[data-correct-response='true']`                             | TH choice.css:131, 149; hottext.css:115                         |
| `:state(dragzone-*)::part(drags)`                            | TH graphic-associate.css:29-39, graphic-order.css:126-136       |
| `qti-associate-interaction:state(dragzone-*) slot[name=…]`   | TH associate.css:62-66 (shadow-internal, unreachable)           |
| `::part(drag):state(candidate-*)` in associate               | TH associate.css:187, 193 (no writer)                           |
| `qti-associable-hotspot::part(drag):state(candidate-*)`      | TH graphic-gap-match.css:223, 228 (no writer)                   |
| `qti-hotspot-choice:state(correct-response)` in graphic-order | TH graphic-order.css:143-149, 176; also the check at CORR/interactions/qti-graphic-order-interaction-correction.ts:19 |
| `qti-inline-choice-interaction:state(disabled|readonly)`     | TH inline-choice.css:32, 37 (the `[disabled]` arms work)        |
| `qti-associable-hotspot:not(:empty)…`                        | TH graphic-gap-match.css:98, 102, 124                           |
| `[part='correct']`                                           | CORR/interactions/qti-text-entry-interaction-correction.ts:33 (renders `answer`) |

**Set in code, never styled by the theme:** state `incorrect-response`; state `droppable`; parts
`drag-label`, `option-prompt`, `option-clear`, `clear-icon`, `drop-row`, `c-header`, `r-header`,
`image`, `prompt`, `slot`, `marker`, `line`, `correct-line`, `knob-correct`, `rail`, `ticks`,
`bounds`, `slider` (some are styled in the component's own `.styles.ts`).

**Broken reach:** `correction-partially-correct` is styled (TH/interactions/qti-corrections.css:47)
but not exported from a placed chip (SLOT:701-704). Graphic-gap-match has no `:host([answer-key])`
rule hiding its bank; order, associate, gap-match and match do.

### Prefixes, casing, docs

- `qti-draggable` uses `qti-`, which belongs to 1EdTech (memory: qti- prefix policy).
- `aria-ordervalue`, `aria-ordercorrectvalue` are not ARIA attributes.
- `data-declarative-drops` (attribute) and `acceptsDeclarativeDrops` (property) spell one marker two
  ways.
- Parts mix abbreviations and full words: `c-header`/`r-header` next to `cols-wrap`/`rows-wrap`;
  `checkbox-grid` also holds radios. Modifier tokens are sometimes element-prefixed
  (`option-selected`, `dropdown-icon-open`) and sometimes bare (`checked`, `filled`, `correct`).
- No interaction documents its states with `@cssstate`. Missing from `@csspart`: `message` on
  order, inline-choice, extended-text and hotspot (hotspot has no JSDoc at all), `input` on upload,
  the drop flag tokens.
- `plans/host-migration/examenkompas.md:26` names a `::part(select)` that does not exist (inline
  choice renders `trigger`).
- CONTRACT §2 puts placeholder, return-anchor and badge rules in `global`; the code imports them into
  `interactions.states` and `interactions.corrections` (TH/qti-interactions.css:21-24).

## The naming rule (to add to CONTRACT §3)

1. **One name per meaning, one meaning per name,** across all interactions.
2. **Roles are nouns:** `chip`, `drop`, `bank`, `choice`, `control`, `label`, `message`.
3. **States are adjectives or participles:** `checked`, `full`, `filled`, `lifted`, `used`,
   `drag-over`, `drag-active`.
4. **A state is a `:state()` wherever the element can carry one.** A part token is used only where
   a plain `<div>` cannot, and then with exactly the state's name. An attribute is never the public
   channel.
5. **No `qti-` prefix on our own names** (`qti-` is 1EdTech's); no prefix at all on parts and states.
6. **Full words**, kebab-case; no `c-`/`r-` abbreviations.
7. **Every public part and state is documented** with `@csspart` / `@cssstate` on the element that
   exposes it.

## Proposed drag-and-drop vocabulary (next major)

| Now                                                        | Proposed                        | Meaning                                              |
| ---------------------------------------------------------- | ------------------------------- | ---------------------------------------------------- |
| `:state(drag)`, `qti-draggable`, `::part(drag)` (placed)    | `:state(chip)`, `::part(chip)`  | an item you can drag, in the bank or placed          |
| `:state(droppable)`, `::part(drop)` (two meanings)         | `:state(drop)`, `::part(drop)`  | the target itself; an inner area gets its own name   |
| `::part(drags)`, inventory, drag container                 | `::part(bank)`                  | where unplaced chips live (also on match)            |
| `::part(drops)`                                            | `::part(drops)` (one meaning)   | the area holding the targets, nothing else           |
| `active` + `enabled` (target), `dragzone-active` + `-enabled` (host) | `drag-active`         | a drag is in progress (target: and could take it)    |
| target `hover`                                             | `drag-over`                     | the dragged chip is over this target                 |
| target attribute `disabled` (at capacity)                  | `full`                          | the target takes no more chips                       |
| chip `:state(dragging)`                                    | `lifted`                        | this chip's clone is in flight; it shows as a hole   |
| chip `:state(placeholder)`                                 | `used`                          | every copy of this chip is placed (match-max)        |
| chip `:state(return-anchor)`                               | `return-target`                 | where a re-dragged placed chip goes back to          |
| `[data-drag-clone]`                                        | unchanged                       | the in-flight clone (has no internals, so attribute) |
| `data-drop-placeholder` (sortable preview)                 | `data-drop-preview`             | frees "placeholder" from its second meaning          |

Old names stay as aliases for one major: the code sets both, the theme reads the new name, and the
host-migration notes list each rename. `:state(drag)` and `::part(drag)` are documented to hosts
(`plans/host-migration/kennisnet-migration-guide-9x.md:88-89`), so this lane is breaking.

## Tasks

### Cleanup — `main`, milestone 9.x

- [ ] Remove the dead theme selectors (table above) and the dead `[part='correct']` / graphic-order
      pin-colour checks in corrections.
- [ ] Export `correction-partially-correct` from a placed chip (SLOT:701-704).
- [ ] Add the `:host([answer-key])` bank-hide rule to graphic-gap-match.
- [ ] Keyboard parity: the keyboard pick-up and arrow moves set the same states and part tokens as a
      mouse drag (`dragzone-*`, `enabled`/`active`, `hover` via `setDropFlag`, `dragging`).
- [ ] `@csspart` complete on every interaction; `@cssstate` on every element that sets states.
- [ ] Fix `interaction.context.ts:30` (`:state(chip)` → what is set) and
      `plans/host-migration/examenkompas.md:26` (`select` → `trigger`).
- [ ] Align CONTRACT §2 with where placeholder, return-anchor and badge rules actually live.

### Rename — `next`, milestone Next major

- [ ] Add the naming rule to CONTRACT §3.
- [ ] Introduce the proposed drag-and-drop names, with the old ones as aliases; theme and corrections
      read the new names.
- [ ] Split `disabled` on targets into `full`; keep `disabled` for "switched off" only.
- [ ] Merge `active` + `enabled` into `drag-active` (target and host).
- [ ] Rename `aria-ordervalue` / `aria-ordercorrectvalue` to `data-order` / `data-order-correct`.
- [ ] Rename `qti-draggable` (drop the `qti-` prefix, or make it internal).
- [ ] Smaller parts: `c-header`/`r-header` → full words, `checkbox-grid` → `cell-grid`,
      `knob-correct` → `correct-knob` (or `answer-knob`, matching the answer-key naming).
- [ ] One answer-key word across parts (`answer`, `correct-line`, `knob-correct`).
- [ ] Host-migration entries for every rename; changeset `major`.

## Open decisions

1. **`chip` or `drag` for the item?** `chip` is what the code already calls it and frees `drag` for
   the action; `drag` is what hosts use today.
2. **Alias period:** one major, or until hosts confirm they moved?
3. **Answer-key word:** `answer`, `correct` or `key` for the parts that show the correct response.
4. **The legacy drag-drop mixin** (`core/src/mixins/drag-drop/`) is exported but unused: remove it in
   the next major?
