# Unified `response` / `correct-response` Attribute Converter

## Goal

One reusable primitive so every `@property({ attribute: 'response' | 'correct-response' })` declaration parses/serializes the attribute string identically. **Attribute grammar** (spec-canonical):

- single value: `"a"`
- comma-separated list: `"a,b,c"`
- directed pairs / points: `"a b,c d,e f"` (space between parts, comma between values)

**Internal shape stays `string | string[] | null`** — the codec still returns the same three-shape union. Only the attribute converter is unified. No callsite has to change its runtime type or its consumer normalizations.

## Scope

Only sites that declare an HTML `@property({ attribute: … })` for `response` or `correct-response`. Programmatic-only getter/setter APIs (custom-interaction, media-interaction, upload-interaction) are out of scope — they never see attribute strings.

## Phase 0: Discovery — every attribute site enumerated

Verified by grep + read; sourced from the subagent report. Cite `file:line` on every row.

### 0.1 `correct-response` attribute sites

| File:line | Owner | Converter today | Empty sentinel |
|---|---|---|---|
| [`packages/qti-base/src/abstract/interaction.ts:57`](packages/qti-base/src/abstract/interaction.ts#L57) | base class `Interaction` | codec (via getter/setter at :59, :63) | `null` |

Every concrete interaction (choice, hottext, order, match, gap-match, associate, graphic-*, hotspot, select-point, inline-choice, extended-text, text-entry, slider, portable-custom) inherits this. No overrides found.

### 0.2 `response` attribute sites

| File:line | Owner | Converter today | Empty sentinel | Property type |
|---|---|---|---|---|
| [`packages/interactions/core/src/mixins/choices/choices.mixin.ts:61`](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L61) | mixin `ChoicesMixin` | codec ✅ | `''` | `string \| string[] \| null` |
| [`packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts:124`](packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L124) | mixin `DragDropSlottedMixin` | hand-rolled `.split(',').map(trim).filter` ❌ | `[]` | `string` (getter) |
| [`packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts:48`](packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts#L48) | element | codec ✅ + array-wrap | `[]` | `string[]` |
| [`packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts:34`](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L34) | element | codec ✅ + array-wrap | `null` | `string[] \| null` |
| [`packages/interactions/text-entry-interaction/src/qti-text-entry-interaction.ts:24`](packages/interactions/text-entry-interaction/src/qti-text-entry-interaction.ts#L24) | element | none — plain `type: String` | (Lit default) | `string \| null` |
| [`packages/interactions/slider-interaction/src/qti-slider-interaction.ts:36`](packages/interactions/slider-interaction/src/qti-slider-interaction.ts#L36) | element | `noAccessor: true` + custom setter (parseFloat) | (setter handles) | numeric-coerced |
| [`packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts:232`](packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts#L232) | element | `noAccessor: true` + custom setter (options-lookup) | (setter handles) | `string \| null` |
| [`packages/interactions/portable-custom-interaction/src/qti-portable-custom-interaction.ts:66`](packages/interactions/portable-custom-interaction/src/qti-portable-custom-interaction.ts#L66) | element | hand-rolled `if (has comma) split else single` ❌ | `null` | `string \| string[] \| null` |

Elements that inherit their `response` attribute from a mixin (`choice`, `hottext`, `hotspot`, `extended-text` from ChoicesMixin; `order`, `match`, `associate`, `gap-match`, `graphic-order`, `graphic-gap-match`, `position-object` from DragDropSlottedMixin) don't re-declare it. Migrating the mixin migrates all of them.

### 0.3 Sites where the codec is technically unnecessary but should migrate for uniformity

- `text-entry` — single string, no separator. `parseResponseAttribute("paris")` returns `"paris"` (unchanged). Migrate.
- `slider` — `noAccessor: true`. The converter is bypassed by Lit; the custom setter must call `parseResponseAttribute` itself before its `parseFloat`. Migrate.
- `inline-choice` — same pattern as slider. The custom setter should route through the codec. Migrate.

### 0.4 What we're moving off

Three flavours of ad-hoc parsing that all express the same grammar:

1. `value.split(',').map(s => s.trim()).filter(s => s.length > 0)` — DragDropSlottedMixin.
2. `if (value.includes(',')) value.split(',').map(trim) else value.trim()` — PortableCustomInteraction.
3. Plain string identity — text-entry.

After migration, every site imports one function.

## Phase 1: Rename the codec (hard break)

**File:** [`packages/qti-base/src/lib/correct-response.ts`](packages/qti-base/src/lib/correct-response.ts) → rename file to `packages/qti-base/src/lib/response.ts`.

Renames inside:
- `parseCorrectResponseAttribute` → `parseResponseAttribute`
- `serializeCorrectResponseAttribute` → `serializeResponseAttribute`
- `CorrectResponseValue` (type) → `ResponseValue`
- `iterCorrectResponseValues` → `iterResponseValues`
- Keep `parsePair` / `serializePair` / `parsePoint` / `serializePoint` and their types (`DirectedPair`, `Point`, `Identifier`) — already generic-named. Same file.

Update the file's top docstring: replace *"correct-response attribute codec"* with *"response / correct-response attribute codec"*, keep the format table.

Update the re-export barrel:
- [`packages/qti-base/src/index.ts:16`](packages/qti-base/src/index.ts#L16) `export * from './lib/correct-response';` → `export * from './lib/response';`

Downstream call-sites already using the old names:
- [`packages/qti-base/src/abstract/interaction.ts:9,59,63`](packages/qti-base/src/abstract/interaction.ts#L9)
- [`packages/interactions/core/src/mixins/choices/choices.mixin.ts:7-8,69,71`](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L7)
- [`packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts:9-10,55,59`](packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts#L9)
- [`packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts:9,11,40,44`](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L9)

All four get the identifier renamed in imports and in bodies. Nothing else. Behaviour-preserving.

**Verification for Phase 1:**
```bash
# No references to the old names should remain.
grep -rn -E "parseCorrectResponseAttribute|serializeCorrectResponseAttribute|CorrectResponseValue|iterCorrectResponseValues" packages/ --include="*.ts" | grep -v node_modules | grep -v dist
# Expected: no output.

# Every downstream file imports from the new path.
grep -rn "from '../lib/response'\|from '../../lib/response'\|@qti-components/base" packages/ --include="*.ts" | grep -v node_modules | grep -v dist | grep -E "parseResponse|serializeResponse|ResponseValue" | head
# Expected: 4 files at the sites listed above.

# TypeScript passes.
pnpm --filter '@qti-components/base' build
pnpm --filter '@qti-components/interactions' build
```

**Anti-patterns:**
- Do NOT keep deprecated re-exports (`export const parseCorrectResponseAttribute = parseResponseAttribute`). User explicitly requested a hard break.
- Do NOT rename `parsePair` / `serializePair` / `parsePoint` / `serializePoint` — already correctly named.

## Phase 2: Introduce the reusable primitive

**Where:** append to the newly-renamed [`packages/qti-base/src/lib/response.ts`](packages/qti-base/src/lib/response.ts), after the parse/serialize functions.

**Add** — a factory that returns a Lit `converter` object with the empty-sentinel baked in:

```ts
/**
 * Ready-to-use Lit `converter` for response / correct-response attributes.
 * Spread into `@property({ attribute, ...responseAttributeConverter(...) })`.
 *
 * The `emptyAs` option controls what the property returns when the attribute
 * is absent or blank. Three sentinels exist in the codebase today; pick the
 * one that matches your callsite's existing behaviour:
 *
 *   - '' (empty string)   — ChoicesMixin convention
 *   - []                  — DragDropSlottedMixin, graphic-associate convention
 *   - null                — base interaction / select-point convention
 */
export function responseAttributeConverter<E extends '' | null | []>(opts: {
  emptyAs: E
}): {
  converter: {
    fromAttribute: (value: string | null) => ResponseValue | E;
    toAttribute: (value: ResponseValue | E) => string | null;
  };
};
```

Implementation is trivial — wraps `parseResponseAttribute` + `serializeResponseAttribute` and normalizes `null` to `emptyAs`. Serialize side: treats `emptyAs` sentinel as null so `reflect: true` drops the attribute.

**Anti-patterns:**
- Do NOT ship as a decorator (`@responseAttribute(...)`). It offers nothing over the converter object and requires learning a new abstraction. Stick to Lit's stock `@property({ ...converter })`.
- Do NOT reach for a fourth `emptyAs` value. Three sentinels is already one too many — future work may unify to `null`, but not in this refactor.

**Verification for Phase 2:**
```bash
grep -n "responseAttributeConverter" packages/qti-base/src/lib/response.ts
# Expected: 1 hit (the export).

# Type-check.
pnpm --filter '@qti-components/base' build
```

## Phase 3: Migrate every site

Each row is behaviour-preserving. Every existing story should render identically. The `emptyAs` sentinel per site MUST match the current behaviour (Phase 0 tables).

### 3.1 Sites already on the codec — replace the inline converter with the primitive

| File:line | Attribute | New converter |
|---|---|---|
| [`packages/qti-base/src/abstract/interaction.ts:57`](packages/qti-base/src/abstract/interaction.ts#L57) | correct-response | `...responseAttributeConverter({ emptyAs: null })` |
| [`packages/interactions/core/src/mixins/choices/choices.mixin.ts:61`](packages/interactions/core/src/mixins/choices/choices.mixin.ts#L61) | response | `...responseAttributeConverter({ emptyAs: '' })` |
| [`packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts:48`](packages/interactions/graphic-associate-interaction/src/qti-graphic-associate-interaction.ts#L48) | response | `...responseAttributeConverter({ emptyAs: [] })` — **refactor**: drop the local array-wrap; change property type from `string[]` to `string \| string[]`. Downstream code that iterates the response gets an `Array.isArray(this.response) ? this.response : [this.response]` guard at those spots. Low-risk since the interaction isn't heavily used. |
| [`packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts:34`](packages/interactions/select-point-interaction/src/qti-select-point-interaction.ts#L34) | response | `...responseAttributeConverter({ emptyAs: null })` + preserve local array-wrap in setter (single-string codec output becomes `[string]` for point cardinality) |

Note: `select-point` keeps its local single-string → `[string]` wrap outside the primitive (point cardinality requires an array). `graphic-associate` drops its wrap per the refactor above. The primitive itself does NOT force `string → [string]` — that would change the shape returned to all other sites.

### 3.2 Sites that need real migration

| File:line | Change |
|---|---|
| [`packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts:124-138`](packages/interactions/core/src/mixins/drag-drop-observables/drag-drop-slotted.mixin.ts#L124-L138) | Replace the hand-rolled `.split(',')` converter with `...responseAttributeConverter({ emptyAs: [] })` + `.map(v => Array.isArray(v) ? v : [v])` in `fromAttribute` composition (mixin uses `string[]` internally). Existing getter/setter at :139-180 is untouched. |
| [`packages/interactions/portable-custom-interaction/src/qti-portable-custom-interaction.ts:66`](packages/interactions/portable-custom-interaction/src/qti-portable-custom-interaction.ts#L66) | Replace the hand-rolled `if (has comma) split else single` with `...responseAttributeConverter({ emptyAs: null })`. Codec's `null → single-string → array` promotion matches the current behaviour. |

### 3.3 Sites where the codec adds nothing today — migrate for uniformity

| File:line | Change |
|---|---|
| [`packages/interactions/text-entry-interaction/src/qti-text-entry-interaction.ts:24`](packages/interactions/text-entry-interaction/src/qti-text-entry-interaction.ts#L24) | Replace `type: String` with `...responseAttributeConverter({ emptyAs: null })`. Codec's behaviour on comma-less strings is identity — no regression. |
| [`packages/interactions/slider-interaction/src/qti-slider-interaction.ts:36`](packages/interactions/slider-interaction/src/qti-slider-interaction.ts#L36) | Cannot use the converter directly (`noAccessor: true`). Instead, the custom setter should call `parseResponseAttribute(value)` before its `parseFloat` step. Same source of truth for the parse. |
| [`packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts:232`](packages/interactions/inline-choice-interaction/src/qti-inline-choice-interaction.ts#L232) | Same pattern as slider — custom setter routes through `parseResponseAttribute` before its options-lookup. |

**Anti-patterns for Phase 3:**
- Do NOT change any element's declared property TYPE, EXCEPT the explicit exception for `graphic-associate` (`string[]` → `string | string[]`) called out in 3.1. All other sites keep their declared type.
- Do NOT touch the internal getter/setter LOGIC anywhere — just the attribute parser.
- Do NOT delete `noAccessor: true` on slider / inline-choice. Their custom setters exist for reasons unrelated to this refactor.
- Do NOT try to "clean up" the empty-sentinel divergence in this refactor. Preserve each site's current sentinel exactly. A future refactor can normalize.

## Phase 4: Migrate QTI-Editor to the renamed codec

QTI-Editor lives at `/Users/patrickklein/Projects/Editor/QTI-Editor` and consumes the codec from `@qti-components/base`. This is the ONE downstream project affected by the hard-break rename — the user has confirmed they own it and want it migrated in the same pass.

### 4.1 Scope (verified by grep)

22 files reference the old codec names across the editor. The layout is friendly:

- **One central re-export** at [`packages/prose-qti/src/components/shared/correct-response/codec.ts`](../../Editor/QTI-Editor/packages/prose-qti/src/components/shared/correct-response/codec.ts) — a thin barrel that pulls from `@qti-components/base`.
- **One shared barrel** at [`packages/prose-qti/src/components/shared/index.ts:33`](../../Editor/QTI-Editor/packages/prose-qti/src/components/shared/index.ts#L33): `export * from './correct-response/codec.js';`
- Everything else imports via that barrel or directly from `../shared/correct-response/codec.js`.

### 4.2 Migration steps

1. **Rename the directory** `packages/prose-qti/src/components/shared/correct-response/` → `packages/prose-qti/src/components/shared/response/`.
2. **Update the re-export file** (now at `.../shared/response/codec.ts`) to pull the NEW names from `@qti-components/base`:
   ```ts
   export {
     parseResponseAttribute,
     serializeResponseAttribute,
     type ResponseValue,
     type Identifier,
     type DirectedPair,
     type Point,
     iterResponseValues,
     parsePair,
     serializePair,
     parsePoint,
     serializePoint,
   } from '@qti-components/base';
   ```
3. **Update the shared barrel** at `packages/prose-qti/src/components/shared/index.ts:33`:
   ```ts
   export * from './response/codec.js';
   ```
4. **Update the 22 downstream files** — rewrite identifiers in-place:
   - `parseCorrectResponseAttribute` → `parseResponseAttribute`
   - `serializeCorrectResponseAttribute` → `serializeResponseAttribute`
   - `CorrectResponseValue` → `ResponseValue`
   - `iterCorrectResponseValues` → `iterResponseValues`
   - Any direct `from '.../correct-response/codec.js'` import path → `from '.../response/codec.js'`
5. **Optional (recommended for consistency)**: rename the local wrapper functions `parseCorrectResponseValues` in `packages/prose-qti/src/core/composer/index.ts:96` and `packages/prose-qti/src/components/match/components/qti-match-interaction/qti-match-interaction.compose.ts:18` to `parseResponseValues`. These are local helpers, not the codec — but their names will look stale after the rename.

### 4.3 Verification for Phase 4

```bash
cd /Users/patrickklein/Projects/Editor/QTI-Editor

# No references to old names.
grep -rn -E "parseCorrectResponseAttribute|serializeCorrectResponseAttribute|CorrectResponseValue|iterCorrectResponseValues" packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v dist
# Expected: no output.

# No references to the old directory path.
grep -rn "correct-response/codec" packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v dist
# Expected: no output.

# Type-check.
pnpm --filter '@citolab/prose-qti' build
# Expected: clean.
```

### 4.4 Anti-patterns for Phase 4
- Do NOT keep a deprecated `correct-response/codec.ts` file. Fully move the directory.
- Do NOT change any editor-side logic beyond the renames. The editor's own parse/serialize semantics are unchanged — it's just calling the renamed functions.
- Do NOT rename anything that references the QTI ATTRIBUTE `correct-response` (e.g. `node.getAttribute('correct-response')`, prose-mirror attr name `correctResponse`, editor UI labels). The attribute NAME is unchanged; only the codec's FUNCTION names change.

## Phase 5: Verification (across both repos)

### 5.1 Grep integrity (QTI-Components)
```bash
cd /Users/patrickklein/Projects/Edtech/QTI/QTI-Components

# No old-name references left.
grep -rn -E "parseCorrectResponseAttribute|serializeCorrectResponseAttribute|CorrectResponseValue|iterCorrectResponseValues" packages/ --include="*.ts" | grep -v node_modules | grep -v dist
# Expected: no output.

# No hand-rolled comma splits on response/correct-response attributes.
grep -rn "response.split(','\|correct-response.split(','" packages/interactions/ --include="*.ts" | grep -v node_modules | grep -v dist | grep -v spec | grep -v stories
# Expected: no output.

# Every response/correct-response attribute site uses the primitive.
grep -rn "responseAttributeConverter" packages/ --include="*.ts" | grep -v node_modules | grep -v dist
# Expected: 1 declaration in packages/qti-base/src/lib/response.ts + ~9 consumers.
```

### 5.2 Type-check (both repos)
```bash
pnpm --dir /Users/patrickklein/Projects/Edtech/QTI/QTI-Components build
pnpm --dir /Users/patrickklein/Projects/Editor/QTI-Editor --filter '@citolab/prose-qti' build
# Expected: clean.
```

### 5.3 Story-level regression
Boot Storybook. For EACH of the affected interactions, spot-check ONE story that exercises attribute-driven `response` or `correct-response`:

- choice: any `correctresponse` story — `correct-response="A,B"` should render highlighted choices.
- order: `correctresponse` story — pair-list attribute should parse.
- match / gap-match / associate: `correctresponse` stories — `"src tgt,src2 tgt2"` grammar must roundtrip.
- graphic-associate: correctresponse story.
- select-point: correctresponse story — `"100 150,200 250"` must produce points.
- text-entry: any `response="paris"` story.
- slider: any numeric response story.
- inline-choice: any correctresponse story.
- portable-custom: correctresponse story.

For each: reload the page, verify visual output matches the pre-refactor screenshot / current state. Any regression means the `emptyAs` sentinel or the array-wrap was mis-mapped in Phase 3.

### 5.4 Roundtrip check
For at least one site per grammar shape (single, comma-list, pair-list), open DevTools and:
```js
const el = document.querySelector('qti-choice-interaction');
el.setAttribute('correct-response', 'A,B,C');
console.log(el.correctResponse);   // → ['A', 'B', 'C']
el.correctResponse = ['A', 'B'];
console.log(el.getAttribute('correct-response'));  // → 'A,B'
```

Same pattern for match (`"a b,c d"`) and select-point (`"100 150,200 250"`).

### 5.5 Editor smoke check
Open the QTI-Editor in dev mode. Load one item that exercises `correct-response` (a choice or match item). Verify the correct-response chip renders and roundtrips through the editor's serialize path unchanged.

## Rollback

Every code change lives in one of:
- `QTI-Components/packages/qti-base/src/lib/response.ts` (the codec)
- `QTI-Components/packages/qti-base/src/index.ts` (barrel)
- One property declaration per consumer site (QTI-Components)
- `QTI-Editor/packages/prose-qti/src/components/shared/response/codec.ts` (editor re-export)
- `QTI-Editor/packages/prose-qti/src/components/shared/index.ts` (editor barrel)
- 22 downstream files in QTI-Editor (mechanical renames)

`git checkout HEAD -- <file>` reverts any single site atomically. If the rename in Phase 1 needs to be undone, revert the file rename + barrel edit in QTI-Components AND the equivalent in QTI-Editor. A global find/replace can restore old names.

## Summary of what the plan does NOT do

- Does NOT normalize the three `emptyAs` sentinels (`''`, `[]`, `null`). That's a follow-up.
- Does NOT force `string | string[] | null` → `string[]` at any callsite. Internal shapes untouched.
- Does NOT introduce a decorator abstraction. Just a Lit converter object.
- Does NOT touch programmatic-only response APIs (custom-interaction, media-interaction, upload-interaction) — they never see attribute strings.
- Does NOT touch `parsePair` / `serializePair` / `parsePoint` / `serializePoint`. Already correctly generic.
