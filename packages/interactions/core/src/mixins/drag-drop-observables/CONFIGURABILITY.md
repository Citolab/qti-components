# Should the drag-drop machinery be configurable and QTI-agnostic?

A design note, not a plan. It answers a question that came up while fixing a drop-sizing bug:

> Could we accept that drag and drop should work and size differently per interaction, broaden the
> arguments in the mixin with specifics for the interaction, and make the drag-drop library more
> QTI-agnostic — configurable rather than special-cased — so these problems are easier to reason
> about?

Short answer: **half right, and the half that is right is not the half that fixes sizing bugs.**
Nothing here has been implemented. §7 is the order to do it in if it is ever wanted, and every step
is worth doing on its own.

---

## 1. The shortage is not configuration points

Per-interaction variation is expressed through **nine** mechanisms today:

| mechanism | examples |
|---|---|
| constructor arguments | 4 selectors + collision algorithm |
| overridable methods | `isDragDropEnabled`, `afterCache`, `shouldTreatBlockedMaxAsInvalid`, `shouldReturnToInventoryOnInventoryDrop`, `totalAssociationsFromState`, `collectAutoSizeTargets`, `dropzonePropertyTarget`, `allowDrop`/`handleDrop`/`handleInvalidDrop` |
| overridable getter | `autoSizeDropzoneWidth` |
| class-field re-declaration | `autoSizeDropzones = false` (match), `collisionDetectionAlgorithm`, `flipAnimationConfig` |
| HTML attributes | `auto-size-dropzones`, `data-choices-container-width`, `match-max`, `min`/`max-associations`, `data-declarative-drops` |
| duck-typed element property | `acceptsDeclarativeDrops` |
| CSS class on the host | `qti-match-tabular`, read 6× inside `qti-match-interaction.ts` |
| CSS custom properties | the drop-sizing tokens — see `packages/qti-theme/DROP-SIZING.md` |
| config context | `allowReorder`, `disableAfterMaxReached` |

Adding positional arguments makes it ten. To answer "how does match differ from order?" you must
today read a constructor argument, a class field, a getter, a CSS class and four tokens.

Worth noting: `packages/qti-base/src/context/config.context.ts` already **states** the intended
taxonomy — *options an author chooses per question are attributes; options only a developer chooses
are factory arguments or method overrides; this context is for what a delivery environment decides
across items*. It is a good rule. The leaks in §3 are precisely the places that obey none of the
three.

## 2. Where the instinct is right, with evidence

The two variation points that were turned into real parameters are the two that work:

- **identity as selectors** — `draggablesSelector` / `droppablesSelector` / `dragContainersSelector`
- **where measurements land** — `dropzonePropertyTarget()`

The proof is a second consumer with a completely different DOM. QTI-Editor applies
`DropzoneAutoSizeMixin` **directly to `Interaction`** — no `DragDropCoreMixin`, its own drag handling
inside a ProseMirror document — in `QtiOrderInteractionEdit`, `QtiAssociateInteractionEdit` and
`QtiGapMatchInteractionEdit`, each with its own selectors and its own shadow anchor. Splitting the
measurement out is why the editor runs the same code instead of growing a parallel copy that drifts.

That consumer also imposes a hard constraint the rest of this note must respect: **never write an
attribute, including `style`, to a light-DOM element.** ProseMirror's `DOMObserver` runs with
`attributes: true`, reverts anything outside its schema, and the revert re-triggers whatever wrote
it — which hard-freezes the tab.

`isDeclarativeTarget()` (`drag-drop-slotted.mixin.ts`) is this repo's own precedent for the other
half: it replaced tag-name testing with an `acceptsDeclarativeDrops` capability opt-in, with an
attribute form for plain `<div>`s that cannot carry a property.

## 3. QTI leaking into supposedly generic machinery

- **Tag-name branch** defaulting `max-associations` to 1 for `qti-gap-match-interaction` and
  `qti-graphic-gap-match-interaction`, inside the generic mixin.
- **Tag-name branch** assigning `slot="qti-simple-associable-choice"` when the droppable is
  `QTI-SIMPLE-ASSOCIABLE-CHOICE` — match's drop element, named in generic code.
- **`qti-draggable="true"` as a second, parallel chip identity**, independent of
  `draggablesSelector`, in ~12 places. `syncDragDropState` documents that the two deliberately
  disagree and that collapsing them would change `match-max` behaviour — so the divergence is real
  and load-bearing, it is just unnamed. It wants to be a fourth selector with a default.
- **`part="drags"` / `part~='drop'`** baked into four mixin defaults *and* into runtime fallbacks in
  `collision.utils.ts` and `drag-drop.utils.ts`.
- `qti-interaction-response` events and `--qti-*` property names emitted from generic code.

The first two are exactly where the `isDeclarativeTarget` pattern was not applied.

## 4. What actually varies, reduced

Five axes. The two marked ✅ are already parameters; the rest are ad hoc.

| axis | values across the interactions | today |
|---|---|---|
| **Identity** — what is a chip / drop / bank | per interaction | selectors ✅ |
| **Shape** — slot (one chip) vs card (many) | card only for match | `autoSizeDropzones = false` + CSS + a token |
| **Size ownership, per axis** | measured / authored attribute / authored `coords` / theme floor | `autoSizeDropzoneWidth` + inline `width` + `positionShapes()` + tokens |
| **Occupancy & validity** | return-on-inventory-drop (graphic-gap-match), blocked-max validity (order), pair counting (associate) | three separate overrides |
| **Property host** | interaction host vs shadow node | `dropzonePropertyTarget()` ✅ |

Layout — prose-inline, grid track, flex rows, absolute from `coords` — is deliberately **not** an
axis here. It is the *reason* size ownership differs, and it lives in CSS where it belongs.

The size-ownership row exposes a latent bug that has nothing to do with any refactor: **a hotspot's
box comes from its authored `coords`, always.** A measured `min-width` should never have applied to
graphic-gap-match at all, with or without `data-choices-container-width`.

## 5. Recommended shape

A named options object for **values only**, leaving genuine behaviour as overridable methods. The
value/behaviour line is what stops the object becoming a tenth mechanism sitting beside the other
nine.

```ts
export interface DragDropParts {
  draggables: string;
  droppables: string;
  dragContainers?: string;           // default: 'slot[part="drags"]'
  /** How a chip re-identifies itself once cloned into a drop. Deliberately NOT `draggables` —
   *  see the note in `syncDragDropState`. Default: '[qti-draggable="true"]'. */
  placedChips?: string;
}

export type SizeOwner = 'measured' | 'authored';

export interface DragDropOptions {
  parts: DragDropParts;
  /** Which axes THIS interaction measures. Everything else belongs to CSS. */
  sizing?: { width?: SizeOwner; height?: SizeOwner };
  behaviour?: {
    collision?: CollisionDetectionAlgorithm;
    defaultMaxAssociations?: number;   // replaces the tag-name branch
    inventoryDropClears?: boolean;     // replaces shouldReturnToInventoryOnInventoryDrop
    blockedMaxIsInvalid?: boolean;     // replaces shouldTreatBlockedMaxAsInvalid
  };
}
```

Not in it, and staying methods: `totalAssociationsFromState`, `initiateDrag`, `isDragDropEnabled`,
`collectAutoSizeTargets`, `dropzonePropertyTarget`, `allowDrop`/`handleDrop`/`handleInvalidDrop`.

Two call sites under it:

```ts
// graphic-gap-match — one line states an invariant nothing says today
DragDropSlottedMixin(Interaction, {
  parts: { draggables: 'qti-gap-img, qti-gap-text', droppables: 'qti-associable-hotspot' },
  sizing: { width: 'authored' },        // a hotspot's box is its coords. Always.
  behaviour: { defaultMaxAssociations: 1, inventoryDropClears: true }
});

// match — replaces `public override autoSizeDropzones = false`
DragDropSlottedMixin(Interaction, {
  parts: { draggables: '…', droppables: '…', dragContainers: 'qti-simple-match-set:first-of-type' },
  sizing: { width: 'authored', height: 'authored' }   // targets are cards, not slots
});
```

**Rejected alternatives.** *More positional arguments* — five already, the fifth used once, and the
things that vary most are methods rather than values. *Extracting a QTI-agnostic package with an
adapter* — the genuinely reusable part has already been extracted and already has a second consumer;
what remains in `drag-drop-slotted.mixin.ts` is roughly 40% QTI response semantics, so extraction
means designing an adapter interface for nobody. Revisit if a second non-QTI consumer appears.

## 6. The limit — this would not have prevented the 128px bug

Stated plainly because it is the thing most likely to be over-claimed.

The bug: a `qti-graphic-gap-match-interaction` with `data-choices-container-width="100"` rendered its
hotspots 128px wide, because the theme began declaring `--qti-dropzone-min-width: 8rem` while the JS
had just switched from *write-then-undo* to *suppress-the-write*. Suppose `sizing: { width:
'authored' }` had existed. What could the mixin have done?

1. **Write nothing** — today's behaviour. The declared `8rem` applies. Still 128px.
2. **Write `0`** on the property target — fixes the hotspot, and collapses order's grid tracks,
   which read the same name as their `minmax()` floor.
3. **Write `0` to each droppable's `style`** — fixes it, and breaks the editor's no-light-DOM-writes
   rule. (`applyConfiguredChoicesContainerWidth` already does this with `width`; logged in §7.)

There is no JS-side option that works while one token carries several jobs. The fix was in CSS, and
the invariant is now written down in `DROP-SIZING.md` §2 and enforced by
`tools/stylelint/no-declared-measured-token.mjs`:

> A globally declared token means "the theme owns this axis unless someone closer says otherwise."
> Any layer that takes ownership of an axis — a measurement, an authored attribute, authored
> `coords` — must **set the token at a closer scope**, never merely decline to write it, and never
> write a competing property that races it.

`sizing` is still worth having: it makes ownership *declared* rather than inferred, which is what
gives the invariant something to check against. That is its value. It is not a bug fix.

## 7. If it is ever wanted, in this order

Each step is independently shippable and the sequence can be abandoned after any of them.

1. **Pure cleanup, no behaviour change.** Drop the redundant `'[qti-draggable="true"]'` argument
   repeated at all five `DragDropSlottedSortableMixin` call sites, where it equals the parameter's
   default. Delete `DragDropSortableMixin` (~293 lines, zero production call sites) and its export.
   Fix the comment above the `DragDropSlottedMixin` composition claiming a `'closestCorners'`
   default — wrong twice over: the default is `'closestCornersWithInventoryPriority'`, and associate,
   the interaction it names, is the one site that *overrides* it, to `'pointerWithin'`.
2. **Close the two tag-name leaks** with element capability opt-ins, following `isDeclarativeTarget`.
3. **Fix the graphic-gap-match coords invariant** (§4) — independent of any refactor.
4. **Stop `applyConfiguredChoicesContainerWidth` writing inline `style` to light-DOM droppables.**
   Defensible for hotspots, which `positionShapes()` already inline-styles from `coords`; not
   defensible for gap-match's `qti-gap`, which is PM-editable.
5. **Introduce `DragDropOptions` additively** — overload the factory, positional form delegating.
6. **Migrate the five call sites**, one commit and one story run each.

Steps 1–4 pay for themselves whether or not 5–6 ever happen.

**`DropzoneAutoSizeMixin`'s signature must not change.** QTI-Editor consumes it positionally and
pins `@qti-components/interactions-core` to a published SHA; changing it is a cross-repo
coordination, to be done deliberately or not at all.

## 8. Risks

- **Two repos.** Runtime and editor both build on these mixins, linked in source-link mode during
  development. Any signature change is a two-repo change.
- **The safety net** is the story suite plus the tracked VRT baselines — 17 in each repo. VRT did
  catch the sizing regression, but a moved baseline is re-blessable in one command and was; treat a
  re-blessed PNG in a diff as a claim to verify.
- **Match is the outlier** on nearly every axis, and `qti-match-tabular` turns drag-drop off
  entirely. Any move to unify the sizing model has to keep that working.
- **Not worth doing if** the interaction set is stable and no third consumer is coming. Steps 1–4
  are worth it either way; 5–6 only pay off if the machinery keeps gaining consumers.
