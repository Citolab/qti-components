# Interaction Attribute Spec Conformance

## Problem

The custom elements in `packages/interactions/*` do not expose the attribute set that
QTI 3 defines for their tag. Comparing the nine interactions used by the Kennisnet
example set (`public/assets/api/kennisnet/ITEM001–ITEM017.xml`) against the QTI 3
Implementation Guide §3.2 attribute tables:

- **4 elements accept fewer QTI attributes than the spec defines** — authored markup is
  silently ignored.
- **5 elements accept non-QTI attributes** — some are legitimate platform concerns, some
  are the wrong vocabulary borrowed from a mixin.
- **2 defaults disagree with the spec** in ways that are deliberate and must stay.

One of these is a live bug against our own content: `ITEM005.xml` sets
`expected-lines="5"` and nothing in the repo reads it.

## Sources of truth

- QTI 3 Implementation Guide §3.2 "Interaction Types" — per-element attribute tables.
  Retrieved via the `qti` MCP server (`impl-guide/03-item-structure.md`).
- QTI 3 Shared Interaction Vocabulary §1.2 — the `qti-*` class vocabulary and the
  `data-*` extension attributes (`vocab/01-section-1-shared-interaction-vocabulary.md`).

## Phase 0: Documentation Discovery (facts already gathered)

### 0.1 The inherited baseline

`Interaction` declares four attributes; only the first is QTI.

| Attribute | Anchor | Spec? |
|---|---|---|
| `response-identifier` | [interaction.ts:47](../packages/qti-base/src/abstract/interaction.ts#L47) | QTI |
| `disabled` | [interaction.ts:49](../packages/qti-base/src/abstract/interaction.ts#L49) | platform (WHATWG form-associated) |
| `readonly` | [interaction.ts:51](../packages/qti-base/src/abstract/interaction.ts#L51) | platform |
| `name` | [interaction.ts:53](../packages/qti-base/src/abstract/interaction.ts#L53) | platform (form-associated) |

`response` is declared per-element or per-mixin (e.g.
[choices.mixin.ts:52](../packages/interactions/core/src/mixins/choices/choices.mixin.ts#L52))
and is a transitional runtime API, not a QTI attribute — see `packages/interactions/AGENTS.md`.

These five appear on all nine elements and are **out of scope** for this plan.

### 0.2 Where the shared attributes come from

| Mixin | Attributes | Anchor |
|---|---|---|
| `ChoicesMixin` | `min-choices` (0), `max-choices` (1) | [choices.mixin.ts:30-33](../packages/interactions/core/src/mixins/choices/choices.mixin.ts#L30-L33) |
| `VocabularyMixin` | `class` (tokenized, drives label vocabulary) | [vocabulary-mixin.ts:29](../packages/interactions/core/src/mixins/vocabulary/vocabulary-mixin.ts#L29) |
| `DragDropSlottedMixin` | `min-associations` (1), `max-associations` (0), `disable-animations`, `auto-size-dropzones` | [drag-drop-slotted.mixin.ts:95-119](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L95-L119), [:294](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L294), [:308](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L308) |

**Note:** `packages/interactions/core/src/mixins/drag-drop/drag-drop-interaction-mixin.ts`
declares a near-duplicate `min-associations`/`max-associations` pair at lines 97-98, but it
is **dead** — every consumer's import is commented out
([match](../packages/interactions/match-interaction/src/qti-match-interaction.ts#L10),
[gap-match](../packages/interactions/gap-match-interaction/src/qti-gap-match-interaction.ts#L9),
[index.ts:1](../packages/interactions/core/src/mixins/drag-drop-observables/index.ts#L1)).
All edits target `drag-drop-observables/drag-drop-slotted.mixin.ts`. Removing the dead
mixin is out of scope here but worth a follow-up.

### 0.3 The comparison table

Spec attrs exclude the universal `id`/`class`/`label`/`dir`/`language`/`data-*` group.
Implemented/extra columns exclude the five baseline attributes from 0.1.

| Element | QTI spec attrs | Implemented | Missing | Extra |
|---|---|---|---|---|
| `qti-choice-interaction` | max-choices, min-choices, orientation\*, shuffle | min-choices, max-choices, orientation, class | `shuffle` | — |
| `qti-text-entry-interaction` | base, string-identifier, expected-length, pattern-mask, placeholder-text, format | expected-length, pattern-mask, placeholder-text, data-patternmask-message | `base`, `string-identifier`, `format` | — |
| `qti-extended-text-interaction` | base, string-identifier, expected-length, pattern-mask, placeholder-text, max-strings, min-strings, **expected-lines**, format | expected-length, pattern-mask, placeholder-text, data-patternmask-message, class | `base`, `string-identifier`, `max-strings`, `min-strings`, **`expected-lines`**, `format` | — |
| `qti-inline-choice-interaction` | required, shuffle | *(none)* | `required`, `shuffle` | `data-prompt` (undeclared) |
| `qti-match-interaction` | max-associations, min-associations, shuffle | min-associations, max-associations, class | `shuffle` | `auto-size-dropzones`, `disable-animations` |
| `qti-hottext-interaction` | min-choices, max-choices | min-choices, max-choices | — | — |
| `qti-order-interaction` | **min-choices, max-choices**, orientation, shuffle | orientation, min-associations, max-associations | `min-choices`, `max-choices`, `shuffle` | `min-associations`, `max-associations`, `auto-size-dropzones`, `disable-animations` |
| `qti-gap-match-interaction` | max-associations, min-associations, shuffle | min-associations, max-associations | `shuffle` | `auto-size-dropzones`, `disable-animations` |
| `qti-select-point-interaction` | min-choices, max-choices | min-choices, max-choices | — | `area-mappings` |

\* `orientation` is deprecated by the spec in favour of the `qti-orientation-*` class vocabulary.

### 0.4 `data-patternmask-message` is NOT an extension

Confirmed against the Shared Interaction Vocabulary §1.2.2.2 (text entry) and §1.2.3.3
(extended text). It is spec-sanctioned. Both implementations are correct
([text-entry:28](../packages/interactions/text-entry-interaction/src/qti-text-entry-interaction.ts#L28),
[extended-text:32](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts#L32)).
No action.

### 0.5 `shuffle` is implemented, but not on the elements

[shuffle-interactions.ts](../packages/qti-transformers/src/item/shuffle-interactions.ts)
performs shuffling as an XML transform before render: it selects `[shuffle="true"]`,
maps tag → child selector, honours `fixed="true"`, and supports a seeded PRNG for
reproducibility. It covers choice, order, inline-choice, match, gap-match, and associate.

This is a **better** place for it than the element:

- correct-response mapping and the corrections package read the post-shuffle DOM order;
- the element would have to distinguish "authored order" from "already shuffled" on every
  re-render;
- seeding across an item/test is a document-level concern, not an element-level one.

Conclusion: **do not move shuffling into the components.** See Phase 3.

### 0.6 Defaults that deliberately deviate — do NOT "fix"

| Attribute | Spec default | Ours | Why ours must stay |
|---|---|---|---|
| `min-associations` | 0 | 1 ([:95](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L95)) | Feeds `belowMin` validity at [:924](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L924). Setting it to 0 makes an empty drag response *valid* across match, gap-match and order at once. |
| `max-associations` (match) | 1 | 0 / unlimited ([:98](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L98)) | Kennisnet ITEM007/008/009/017 all omit the attribute and need many associations. A spec-literal default of 1 breaks every real match item. |

Note the existing gap-match-only carve-out at
[:109](../packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L109),
which already applies the spec default of 1 for gap-match only. That asymmetry is
intentional and should be **documented**, not removed.

---

## Phase 1: Pure additions (no behaviour change)

Each item adds an attribute that is currently ignored. No existing markup changes meaning.

### 1.1 `expected-lines` on extended-text

**File:** [qti-extended-text-interaction.ts](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts)

Add `@property({ type: Number, attribute: 'expected-lines' }) expectedLines: number;`.

Row precedence becomes, highest first:

1. `qti-height-lines-N` class — existing branch at [:40-46](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts#L40-L46)
2. `expected-lines` — new
3. `expected-length`-derived estimate — existing fallback

Do not change `expected-length`'s existing role as `maxlength` on the textarea
([:24](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts#L24)).

**Verifies:** `ITEM005.xml` renders 5 rows without needing a `qti-height-lines-5` class.

### 1.2 `data-prompt` on inline-choice

**File:** [qti-inline-choice-interaction.ts:177](../packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts#L177)

Already functional via `this.dataset.prompt`. Promote to a declared
`@property({ attribute: 'data-prompt' })` backing the same value so it appears in the
manifest, the generated types, and Storybook controls. Keep the existing fallback chain:
`data-prompt` → `configContext.inlineChoicePrompt` → `'select'`.

Runtime behaviour must not change. `ITEM006.xml` and
`apps/e2e/src/stories/kennisnet/*.stories.ts` already rely on it.

### 1.3 `required` on inline-choice

**File:** [qti-inline-choice-interaction.ts](../packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts)

Boolean, default `false`. When true and no choice is selected, report invalid through the
same `setInteractionValidity` path the other interactions use (see
[extended-text:101](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts#L101)
for the call shape). The prompt option must not count as a selection.

### 1.4 `format` on the text interactions

**Files:** text-entry + extended-text

Accept the vocabulary `plain | preformatted | xhtml`, default `plain`.

- `plain` — current behaviour, no change.
- `preformatted` — `white-space: pre-wrap` on the textarea/input.
- `xhtml` — **explicitly out of scope.** Both elements render a plain `<textarea>`
  ([:130-147](../packages/interactions/extended-text-interaction/src/qti-extended-text-interaction.ts#L130-L147));
  rich text is a separate project. Accept the value, reflect it, warn once, render as `plain`.

Document the `xhtml` gap in the package AGENTS.md so it is a known limitation rather than
a silent one.

### 1.5 `min-strings` / `max-strings` on extended-text — RESOLVED: documented, not implemented

QTI defines these for a **multi-string** response: several bound variables, one field each.
This element renders one textarea bound to one variable, so there is nothing for the bounds
to count. The tempting reading — treat them as a word or paragraph limit — would invent a
rule the spec does not state, and would then have to be un-invented when multi-string
rendering lands.

Both stay documented as `Not implemented.` on the element, which keeps them out of the MCP
contract via the marker convention. Revisit only alongside multi-string rendering.

---

## Phase 2: Real semantics, contained blast radius

### 2.1 `min-choices` / `max-choices` on order-interaction

**File:** [qti-order-interaction.ts](../packages/interactions/order-interaction/src/qti-order-interaction.ts)

The element is built on `DragDropSlottedMixin`
([:15](../packages/interactions/order-interaction/src/qti-order-interaction.ts#L15))
and therefore inherits the association vocabulary. QTI constrains order with
`min-choices`/`max-choices`. An author writing spec-conformant markup gets no effect today.

Approach:

- Declare `min-choices` / `max-choices` as first-class properties on the element.
- Feed them into the same bounds `minAssociations`/`maxAssociations` drive.
- Keep `min-associations`/`max-associations` working as **deprecated aliases** so existing
  stories and content keep passing; mark them `@deprecated` in the JSDoc so the manifest
  and the sorter's `deprecatedLast` surface it.
- Precedence: if both are present, the QTI-correct `*-choices` wins.

**Risk:** contained to one element. `qti-choice-interaction` and `qti-hottext-interaction`
already use `ChoicesMixin` correctly and are untouched.

### 2.2 `string-identifier` and `base` — declare, defer

Neither Kennisnet item uses them, and both require reaching into
`packages/qti-processing` (`string-identifier` writes the raw string to a second response
variable; `base` is numeric-base conversion of the recorded value).

Declare both on text-entry and extended-text so they are visible in the manifest and typed,
with JSDoc stating they are accepted but not yet processed. Implement only when content
requires it. **Do not** silently accept them with no documentation — that is the failure
mode this whole plan exists to remove.

---

## Phase 3: `shuffle` — surface it, do not move it

Per 0.5, shuffling stays in the transformer. What is wrong today is only that the
attribute is invisible to the component layer.

For the five elements that accept it (choice, order, inline-choice, match, gap-match):

- Declare `shuffle` as a reflected boolean property with JSDoc stating that shuffling is
  applied by the loader/transform pipeline, not by the element.
- Have [shuffle-interactions.ts](../packages/qti-transformers/src/item/shuffle-interactions.ts)
  stamp a marker (e.g. `data-shuffled`) on interactions it has processed, so the element
  can distinguish "shuffle requested and already applied" from "shuffle requested, no
  transform ran".
- In the standalone case (attribute present, marker absent), log a single dev-mode warning
  pointing at the transform. Do **not** shuffle in the element.

**Explicit non-goal:** no shuffling logic enters `packages/interactions`.

---

## Phase 4: Documentation of intentional deviations

Add to `packages/interactions/AGENTS.md`:

- The five platform attributes from 0.1 are intentional non-QTI additions.
- The two default deviations from 0.6, with the reasoning.
- `auto-size-dropzones` and `disable-animations` are intentional presentation extensions
  on the drag interactions.
- `area-mappings` on select-point
  ([:69](../packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L69))
  is an intentional standalone alternative to `qti-area-mapping` in the response
  declaration; QTI puts area mapping on the response declaration, we additionally allow it
  inline for editor use.
- `format="xhtml"` is accepted but downgraded to `plain`.

---

## Phase 5: Verification

Per `packages/interactions/AGENTS.md` story taxonomy:

- `*.api.stories.ts` — each newly declared attribute is settable and reflected.
- `*.validation.stories.ts` — `required`, `min-strings`/`max-strings`, and the order
  `min-choices`/`max-choices` bounds.
- One Kennisnet-anchored assertion that `ITEM005.xml` produces a 5-row textarea.
- Queries follow the testing-library policy in that file — no raw `querySelector`.

Then:

- Regenerate the manifest. **Note:** `custom-elements.json` is currently stale —
  `qti-order-interaction` lists only `orientation` and omits every inherited attribute,
  which means the inheritance step is not producing correct output for that element. This
  must be re-checked after the CEM generator migration (tracked separately) rather than
  worked around here.
- Run the `conformance/qti3.0` suite to see whether any of these attributes are already
  covered by an existing conformance check.
- `pnpm run test` and a VRT pass — none of these changes should move pixels, so a clean
  VRT run is the evidence for that claim.

## Sequencing

Phase 1 first: five contained edits, fixes the one live bug in our own content, needs no
decisions. Phase 2 and 3 after. Phase 4 can land alongside any of them. Phase 5 gates each.

## Open questions

1. Should the deprecated `min-associations`/`max-associations` aliases on order-interaction
   have a removal target, or stay indefinitely?
2. `qti-position-object-interaction` does not observe the `response` attribute, though its
   point coordinates are expressible by the codec and `qti-select-point-interaction` already
   accepts them. Found by the guard test in
   `packages/qti-interactions/src/response-attribute.spec.ts`, which documents it as an
   exclusion. Likely the same omission extended-text had, rather than a principled one.
