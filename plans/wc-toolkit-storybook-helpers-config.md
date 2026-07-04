# wc-toolkit Storybook helpers: hide privates, surface parts & states

Configure `@wc-toolkit/storybook-helpers` so the Storybook controls panel:
- No longer surfaces private members
- Shows CSS parts, CSS states, and slots as first-class categories
- Uses the current (non-deprecated) API surface

Pilot on `qti-choice-interaction`. Later phases roll the same pattern out repo-wide.

---

## Phase 0 — Discovery (facts, cite before touching)

### Allowed APIs (verbatim from `@wc-toolkit/storybook-helpers` v10.5.1 `src/types.ts`)

```ts
type Categories =
  | 'attributes' | 'cssParts' | 'cssProps' | 'cssStates'
  | 'events' | 'methods' | 'properties' | 'slots';

type StorybookHelpersOptions = {
  hideArgRef?: boolean;
  typeRef?: string;
  setComponentVariable?: boolean;
  renderDefaultValues?: boolean;
  useScopedStyles?: boolean;
  categoryOrder?: Array<Categories>;
  disableArgObserver?: boolean;
};

/** @deprecated Use StorybookHelpersOptions instead */
type Options = StorybookHelpersOptions;

type StoryOptions = {
  excludeCategories?: Array<Categories>;
  setComponentVariable?: boolean;
};
```

Sources:
- https://wc-toolkit.com/integrations/storybook/
- https://github.com/wc-toolkit/storybook-helpers/blob/main/src/types.ts
- https://github.com/wc-toolkit/storybook-helpers/blob/main/README.md

### Key facts

1. **No name-level "hide private" flag exists.** Filtering is *category-level* only.
   - Global: `categoryOrder` (reorder, cannot exclude).
   - Per-story: `excludeCategories: Array<Categories>` on `getStorybookHelpers(tag, {…})`.
2. **`Options` is deprecated** — renamed to `StorybookHelpersOptions`.
3. **Privates are hidden by the CEM analyzer, not by storybook-helpers.** `@custom-elements-manifest/analyzer` reads TS `private`/`protected` modifiers and `#`-prefixed names and stamps `"privacy": "private" | "protected"` on the manifest entry. storybook-helpers renders whatever public API the CEM exposes; if privates show up, the analyzer marked them wrong or the plugin chain re-published them.
4. **CSS parts / states / slots come from JSDoc tags** on the class:
   - `@csspart <name> - <description>`
   - `@cssstate <name> - <description>`
   - `@slot [name] - <description>`
   - `@cssprop [--name=default] - <description>`
5. **Current versions installed:**
   - `@wc-toolkit/storybook-helpers` **10.2.1** (latest **10.5.1**)
   - `@custom-elements-manifest/analyzer` **0.10.10**
   - Plus `@wc-toolkit/cem-inheritance` 1.2.2, `cem-sorter`, `cem-utilities`, `cem-validator`, `jsx-types`, `type-parser`.

### Current state of `qti-choice-interaction`

File: [packages/interactions/choice-interaction/src/qti-choice-interaction.ts](packages/interactions/choice-interaction/src/qti-choice-interaction.ts)

Direct-on-class:
- `orientation` — `@property`, public, `@deprecated`
- `#handleSlotChange` — `#`-prefixed private ✅
- `render()` — override, no modifier
- No class-level JSDoc, no `@csspart`, no `@slot`, no `@cssstate`

Template exposes three parts and one named slot (line 32 of the file):
- `part="prompt"`, `part="slot"`, `part="message"`
- `<slot name="prompt">`, default `<slot>`

### Private members visible in CEM WITHOUT `#` prefix

The user asked to know which members are declared `private` (TypeScript keyword) but do not use `#`. The following inherited members are marked `"privacy": "private"` in `custom-elements.json` yet have `_`-prefixed names (no `#`):

| Member | Declared in |
|---|---|
| `_context` | `Interaction` base class |
| `_mutationObserver` | `ChoicesMixin` |
| `_validationMessageShown` | `ChoicesMixin` |

Everything else marked `private` correctly uses `#` (VocabularyMixin). Members prefixed `_` but marked `protected` are intentional and out of scope for this cleanup.

### CEM output gap for choice-interaction

The `QtiChoiceInteraction` declaration in `custom-elements.json` (lines 638-1862) has **no** `cssParts`, `cssStates`, `slots`, or `cssProperties` arrays — none of them are documented. That is the root cause for the controls panel showing "attributes, properties, events, methods" only. Adding JSDoc tags populates these arrays.

---

## Phase 1 — Upgrade & modernize preview.ts config

**Goal:** stop using the deprecated `Options` alias; bump the package; set `categoryOrder` so parts/states/slots surface prominently.

### Tasks

1. Bump `@wc-toolkit/storybook-helpers` from `^10.2.1` → `^10.5.1` in `package.json`.
   - Run `npm install` (or the repo's lockfile equivalent) and verify the lockfile updates.
2. Edit [.storybook/preview.ts](.storybook/preview.ts):
   - Change the import from `Options` to `StorybookHelpersOptions`.
   - Add `categoryOrder` to the options object.

Target shape (copy — do not reorder existing keys):

```ts
import { setStorybookHelpersConfig, type StorybookHelpersOptions } from '@wc-toolkit/storybook-helpers';

const options: StorybookHelpersOptions = {
  hideArgRef: true,
  typeRef: 'expandedType',
  setComponentVariable: false,
  renderDefaultValues: false,
  categoryOrder: [
    'attributes',
    'properties',
    'slots',
    'cssParts',
    'cssStates',
    'cssProps',
    'events',
    'methods',
  ],
};

setStorybookHelpersConfig(options);
```

### Verification

- [ ] `grep -n "type Options" .storybook/preview.ts` — returns no matches.
- [ ] `grep -n "StorybookHelpersOptions" .storybook/preview.ts` — one match.
- [ ] `npm ls @wc-toolkit/storybook-helpers` reports 10.5.x.
- [ ] Start Storybook. The Controls panel for any existing story loads without runtime errors.

### Anti-patterns

- Do NOT invent new option keys (e.g. `hidePrivate`, `showParts`). They do not exist.
- Do NOT try to filter by member name globally — no such API.

---

## Phase 2 — Document parts, slots, and states on `qti-choice-interaction`

**Goal:** get `cssParts`, `slots` (and `cssStates` if any) populated in the CEM for this element so the controls panel shows them.

### Tasks

1. Read the current render method (already summarized above) to enumerate the exposed parts and slots.
2. Add a class-level JSDoc block above `export class QtiChoiceInteraction` in [packages/interactions/choice-interaction/src/qti-choice-interaction.ts](packages/interactions/choice-interaction/src/qti-choice-interaction.ts).

Suggested block (adjust wording to match what the parts actually style — pull descriptions from `packages/themes/kennisnet` or the existing SCSS if wording matters):

```ts
/**
 * A single-response or multiple-response choice interaction.
 *
 * @slot prompt - The prompt shown above the choices (mapped to `part="prompt"`).
 * @slot - Default slot for `qti-simple-choice` elements.
 *
 * @csspart prompt - The prompt slot wrapper.
 * @csspart slot - The wrapper around the default slot containing the choices.
 * @csspart message - The live validation message region (role="alert").
 */
export class QtiChoiceInteraction ...
```

3. If the choices support CSS custom states (e.g. `:state(checked)`), document them with `@cssstate`. If none exist yet, skip.

4. Rebuild the CEM (whatever npm script does this — likely `npm run analyze` or an equivalent that runs `custom-elements-manifest analyze`). Confirm `custom-elements.json` now has `cssParts: [...]` and `slots: [...]` on the `QtiChoiceInteraction` declaration.

### Verification

- [ ] `jq '.modules[] | .declarations[]? | select(.name=="QtiChoiceInteraction") | {cssParts, slots, cssStates}' custom-elements.json` shows non-empty `cssParts` and `slots`.
- [ ] Reload http://localhost:6006/?path=/story/qti-interactions-02-choice-interaction--default&globals=override:kennisnet — Controls panel now shows "CSS Parts" and "Slots" sections.

### Anti-patterns

- Do NOT invent JSDoc tag names. Only `@csspart`, `@cssstate`, `@slot`, `@cssprop`, `@event`, `@summary`, `@tag` are supported by the analyzer.
- Do NOT document parts that aren't actually rendered.

---

## Phase 3 — Fix TS-private members lacking the `#` prefix

**Goal:** decide whether to convert the three `_`-prefixed private fields to `#` (recommended) so tooling that keys off name syntax rather than the `privacy` field also treats them as private.

### Members in scope

| Member | File |
|---|---|
| `_context` | `Interaction` base class (search: `packages/interactions/core/src/**`) |
| `_mutationObserver` | `ChoicesMixin` (`packages/interactions/core/src/mixins/**`) |
| `_validationMessageShown` | `ChoicesMixin` (same location) |

### Decision required

Before editing, confirm with the user: rename to `#` or leave as-is? These fields already carry `"privacy": "private"` in the CEM, so storybook-helpers *should* already ignore them. If the Storybook controls panel is not showing them today, no functional fix is needed — this becomes hygiene only.

**Recommended:** rename to `#` for consistency with the rest of the codebase (VocabularyMixin already does this). Caveat: cross-file access to these fields from within their own class only — grep first.

### Tasks (if the user approves the rename)

1. `grep -rn "_context\b" packages/interactions/core/src` — verify no external readers exist. Do the same for `_mutationObserver` and `_validationMessageShown`.
2. Convert `private _foo` → `#foo` and update self-references (`this._foo` → `this.#foo`) inside the declaring class.
3. Re-run the CEM build. Confirm entries now appear under `#foo` naming.

### Verification

- [ ] `tsc --noEmit` passes (or the repo's typecheck script).
- [ ] Storybook page loads without a runtime error.
- [ ] The renamed members no longer appear in the Storybook controls panel (they shouldn't have appeared before either — this is defense in depth).

### Anti-patterns

- Do NOT touch `_`-prefixed **protected** members. They are protected on purpose (subclass API surface). Renaming them to `#` breaks subclasses.
- Do NOT rename in a mixin's public API — only truly-private state.

---

## Phase 4 — Verify the pilot & write the follow-up ticket

### Verification checklist

- [ ] Storybook Controls panel for `qti-choice-interaction/default`:
  - Shows sections for Attributes, Properties, Slots, CSS Parts (and CSS States if any)
  - Does NOT show `_context`, `_mutationObserver`, `_validationMessageShown`, `#handleSlotChange`, or any `#`-prefixed methods.
- [ ] `custom-elements.json` for `QtiChoiceInteraction` contains populated `cssParts` and `slots`.
- [ ] No `type Options` remains in `.storybook/preview.ts`.
- [ ] Package version bumped and lockfile clean.

### Follow-up (not this plan)

- Roll out `@csspart` / `@slot` / `@cssstate` JSDoc across the other 30+ interaction components. One-per-file, mechanical.
- Audit remaining TS-`private` fields across the repo with `grep -rn "private _" packages` and convert where safe.

---

## Notes for the executor

- Confirm the CEM regeneration command by reading `package.json` `scripts` (likely `analyze` or `cem`). Do not assume.
- The plans folder already contains `qti-design-system-refactor.md` and `kennisnet-*` plans — this file is scoped narrowly to storybook helpers config; do not fold in unrelated cleanup.
- Storybook URL for smoke test: http://localhost:6006/?path=/story/qti-interactions-02-choice-interaction--default&globals=override:kennisnet
