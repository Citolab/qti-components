# Correction package + scoped custom element registries

**Status:** complete
**Date:** 2026-07-20
**Branch:** `editor`

## Goal

All correction logic lives in `@qti-components/qti-corrections`. Its interactions register under the
**standard tag names** (`qti-choice-interaction`, not `qti-choice-interaction-correction`) against a
**scoped custom element registry**, so the lean and corrected variants can coexist on one page.

Concretely:

1. Every QTI element — normal *and* correction — can be registered into an arbitrary
   `CustomElementRegistry`, not just the global one.
2. The corrections package exposes a ready-made `correctionRegistry`: all normal QTI elements, with
   every interaction that has a correction variant **replaced** by the correction class under the
   same tag.
3. All correction tests move into the corrections package and run against that registry.
4. `<item-container>` and `<test-container>` can be pointed at a registry, so full items/tests render
   with correction elements.

This makes the corrections package independently consumable by third parties: they build their own
registry with their own overrides using the same primitives.

---

## Verified browser behaviour

Probed in Chromium via the `tests` vitest project (throwaway specs, since deleted). These are
measured, not assumed:

| Question | Answer |
| --- | --- |
| Does a scoped registry fall back to the global one? | **No.** An undefined tag stays an un-upgraded `HTMLElement` forever. `reg.get(tag)` returns `undefined` even when the tag is globally defined. |
| API surface of `CustomElementRegistry.prototype` | `define, get, getName, upgrade, whenDefined, initialize` |
| Does a `DOMParser` fragment upgrade against a scoped shadow root's registry? | **Yes** — inserting it into the scoped root yields the scoped class. |
| Is `registry.initialize(fragment)` needed for that? | **No.** Same result with and without. |
| What if the fragment goes into a *global* shadow root after `initialize()`? | It becomes the **global** class. The insertion target's registry always wins. |

### Consequences

- **The registry must be complete.** No fallback means every tag an item can contain must be defined,
  or it renders as an inert unknown element with no error. This is what forces the manifest work
  below — there is no shortcut.
- **`item-container` needs no changes to its load path.** Only `createRenderRoot()`. The transformer's
  fragment upgrades correctly on insertion.
- **The registry must be resolvable at `connectedCallback`.** Lit creates the render root there, and a
  shadow root's registry is fixed at `attachShadow`. So it *cannot* be derived from the loaded item
  XML — it must come from an attribute/property set before connection.

---

## Current state

**Registration is global-only, in two incompatible styles:**

- `packages/qti-elements` — `@customElement('qti-item-body')` decorators, self-registering on import.
- `packages/interactions/*` — side-effect `register.ts` files (`customElements.define(...)`),
  aggregated by `packages/qti-interactions/src/register-all.ts`.

Neither can target a non-global registry. There is no tag→constructor manifest anywhere.

**Corrections package** currently holds `QtiChoiceInteractionCorrection`, `CandidateCorrectionMixin`,
`CorrectableInteractionBase`, and two story files sharing a
`with-correction-registry.decorator.ts` that hand-defines six tags.

---

## Failure inventory (the 9 remaining `stories` failures)

Three unrelated causes. Only the first group is a registry problem.

| # | Stories | Cause | Fixed by this plan? |
| --- | --- | --- | --- |
| 7 | `item-show-correct-response`: `Default`, `Choice Internal`, `Choice Full`, `Multiple Response Internal`, `Multiple Response Full`<br>`item-show-candidate-correction`: `Default`, `Multiple Response` | Per-choice `correct-response` / `candidate-correct` states only exist on `QtiChoiceInteractionCorrection` | **Yes** |
| 1 | `item-show-candidate-correction` › `Text Entry` (line 571) | Asserts host-level `candidate-correct` on `qti-text-entry-interaction`; it calls `toggleCandidateCorrection` but the implementation moved out. No `QtiTextEntryInteractionCorrection` exists yet. | Only once that class is written (Phase 5) |
| 1 | `item-show-candidate-correction` › `Order` (line 820) | **Not a wiring bug.** Asserts `expected true to be false`. Correct order `C, A, B`, response `C, B, A` → LIS of `[0,2,1]` has length 2, so a second chip is legitimately marked correct. The test encodes pre-LIS strict-position semantics, which commit `1adbe67b` deliberately changed. | **No — needs a decision** |

---

## Architecture

### 1. The primitive (`packages/qti-base/src/registry/`)

```ts
export type QtiElementDefinition = {
  tag: string;
  ctor: CustomElementConstructor;
};

export type DefineOptions = {
  /** Defaults to the global registry. */
  registry?: CustomElementRegistry;
  /** tag -> replacement constructor. Wins over the manifest entry. */
  overrides?: Record<string, CustomElementConstructor>;
  /** Tags to skip entirely. */
  exclude?: readonly string[];
};

export function defineQtiElements(
  defs: readonly QtiElementDefinition[],
  options?: DefineOptions
): void;
```

Idempotent — skips tags already defined in the target registry, so it can be called repeatedly and
composed.

Also ships the ambient types, which TS's DOM lib still lacks:

```ts
declare global {
  interface ShadowRootInit {
    customElementRegistry?: CustomElementRegistry;
  }
  interface CustomElementRegistry {
    initialize(root: Node): void;
  }
}
```

### 2. Manifests, derived not duplicated

Each package gains an `elements.ts` exporting its definitions; its existing `register.ts` collapses to
a call against the global registry. One source of truth, global behaviour unchanged:

```ts
// packages/interactions/choice-interaction/src/elements.ts
export const elements = [{ tag: 'qti-choice-interaction', ctor: QtiChoiceInteraction }];

// packages/interactions/choice-interaction/src/register.ts
defineQtiElements(elements);
```

Aggregates:

- `@qti-components/interactions/elements` → `qtiInteractionElements`
- `@qti-components/elements/elements` → `qtiContentElements`
- `allQtiElements` = both

**`@customElement` has to go.** The decorator calls `customElements.define` at *module evaluation*.
That is not merely inconsistent with the manifest style — it is incompatible with the goal:

- A manifest must import the class. With the decorator, that import unavoidably registers the tag
  globally. A consumer who wants the element **only** in their own scoped registry cannot have it.
- It makes the packages permanently side-effectful, so a bundler can never drop an unused element.
- The global define happens at an uncontrolled time (first import), rather than when
  `register.ts` says so.

So every decorated element becomes a plain exported class plus a manifest entry, with the global
registration moved into that package's `register.ts` — exactly the shape the interaction packages
already use:

```ts
// before
@customElement('qti-item-body')
export class QtiItemBody extends LitElement { … }

// after
export class QtiItemBody extends LitElement { … }
// elements.ts:  { tag: 'qti-item-body', ctor: QtiItemBody }
// register.ts:  defineQtiElements(elements)
```

**Scope of this phase:**

| Work | Files |
| --- | --- |
| `@customElement` → plain class + manifest entry | **55** (`qti-test` 25, `qti-elements` 18, `qti-item` 6, `qti-processing` 5, `qti-base` 1) |
| `elements.ts` for interaction packages | ~22 |
| `elements.ts` for `interactions/core` elements | ~10 |
| Aggregates | ~3 |

Mechanical, but this is the bulk of the diff — call it ~90 files.

Two things to watch while converting:

- **Import-order regressions.** Anything that today relies on the decorator having registered a tag as
  a side effect of importing the class will now depend on `register.ts` being imported. Grep for
  imports of decorated classes that don't already pull in a register module.
- **`declare global { HTMLElementTagNameMap }`** blocks stay with the class; they are type-only and
  unaffected.

### 3. The correction registry

```ts
// packages/qti-corrections/src/elements.ts
export const qtiCorrectionElements = [
  { tag: 'qti-choice-interaction', ctor: QtiChoiceInteractionCorrection }
  // + one entry per correction interaction as they land
];

// packages/qti-corrections/src/registry.ts
export const createCorrectionRegistry = (extra?: readonly QtiElementDefinition[]) => {
  const registry = new CustomElementRegistry();
  defineQtiElements(allQtiElements, {
    registry,
    overrides: Object.fromEntries(qtiCorrectionElements.map(d => [d.tag, d.ctor]))
  });
  if (extra) defineQtiElements(extra, { registry });
  return registry;
};

/** The shared instance the stories use. */
export const correctionRegistry = createCorrectionRegistry();
```

Note the ordering requirement: overrides must be applied **during** the initial define pass, not
after — a tag can only be defined once per registry, so a correction class cannot replace a
lean class that is already in there.

Third parties get the same two primitives for their own overrides.

### 4. Containers

`item-container` and `test-container` are structurally identical; both change the same way.

```ts
const namedRegistries = new Map<string, CustomElementRegistry>();
export const registerNamedRegistry = (name: string, registry: CustomElementRegistry) =>
  namedRegistries.set(name, registry);

/** Registry the item's elements resolve against. Wins over `registry`. */
@property({ attribute: false }) customElementRegistry: CustomElementRegistry | null = null;

/** Name of a registry passed to `registerNamedRegistry` — the markup-friendly form. */
@property({ type: String, attribute: 'registry' }) registryName: string | null = null;

protected override createRenderRoot(): HTMLElement | DocumentFragment {
  // Resolved here, not later: a shadow root's registry is fixed at attachShadow.
  const registry =
    this.customElementRegistry ??
    (this.registryName ? (namedRegistries.get(this.registryName) ?? null) : null);

  if (this.registryName && !registry) {
    console.warn(`item-container: no registry named "${this.registryName}" is registered.`);
  }

  return (
    this.shadowRoot ??
    this.attachShadow({
      ...(this.constructor as typeof ItemContainer).shadowRootOptions,
      ...(registry ? { customElementRegistry: registry } : {})
    })
  );
}
```

No changes to `handleItemURLChange` / `handleItemXMLChange` — the fragment upgrades on insertion.

Usage:

```html
<item-container registry="qti-correction" item-url="…/example-choice-item.xml"></item-container>
```

or, where the object is in hand: `.customElementRegistry=${correctionRegistry}`.

---

## Phases

Each phase leaves the suite green.

**Phase 1 — primitive.** `defineQtiElements`, types, ambient declarations in `qti-base`. Unit tests for
overrides/exclude/idempotency. No callers yet.

**Phase 2 — manifests + de-decorating.** `elements.ts` per package; `register.ts` rewritten to consume
it; all 55 `@customElement` decorators replaced by manifest entries; aggregates. Purely mechanical,
but global registration must stay behaviourally identical — verify with a full `stories` run, and
watch for modules that were relying on the decorator's import side effect.

Splits cleanly into reviewable commits, one package at a time. Suggested order — least to most
depended-upon, so a mistake surfaces early and locally:
`qti-processing` (5) → `qti-test` (25) → `qti-item` (6) → `qti-elements` (18) → `qti-base` (1) →
interaction packages (~32) → aggregates.

**Phase 3 — correction registry.** `createCorrectionRegistry` + `correctionRegistry`. Rewrite
`with-correction-registry.decorator.ts` to use it, dropping the hand-listed six tags. The existing
corrections stories should pass unchanged.

**Phase 4 — containers.** `createRenderRoot` override + named-registry lookup on both containers.
Repoint the 7 choice-related `qti-item` stories at `registry="qti-correction"`. **This is the phase
that clears the 7 failures.** Consider moving those stories into the corrections package at this
point, per the end goal.

**Phase 5 — remaining correction interactions.** Port the rest of the interactions that have
correction behaviour into the corrections package, one per commit, each with its manifest entry:
text-entry (unblocks the `Text Entry` failure), order, match, gap-match, select-point, inline-choice,
graphic-*. As each lands, move its correction stories/tests across too.

**Phase 6 — cleanup.** Once every correction interaction has moved, strip the remaining correction
code paths from the lean packages so `@qti-components/interactions` is genuinely correction-free.

---

## Open decisions

1. **The `Order` LIS assertion.** Update the test to match the shipped LIS algorithm, or fix the
   algorithm? Needs a call on what the intended marking semantics are. Blocks nothing else.

2. **Named registries vs. context.** The `registerNamedRegistry` map is a global side-channel and
   fails silently on a typo (mitigated by the warn). Both containers already `@consume(qtiContext)`,
   so a registry could ride a context instead — but context values can arrive *after* `createRenderRoot`,
   which would silently produce a global-registry shadow root. If context is wanted, the container must
   defer creating its render root until the value lands. Recommend starting with property + named
   attribute, and revisiting.

3. **Does `item.css` stay inlined?** Both containers `?inline`-import it into their shadow roots, which
   blocks HMR for theme edits. Out of scope here, but Phase 4 touches these files.

4. **Scope of Phase 2.** ~90 files. The alternative — hand-writing one aggregate manifest inside
   `qti-corrections` — is much faster but drifts the moment an interaction is added, and gives third
   parties nothing reusable. Recommend the full version, but it is the main cost of this plan.

5. **Lint rule to hold the line.** Once Phase 2 lands, nothing should reintroduce `@customElement`.
   Worth an `no-restricted-syntax` rule banning the decorator import in `packages/**`, otherwise the
   next component added quietly breaks scoped-registry support for that element.

---

## Non-goals

- Changing the **observable behaviour** of global registration. `register-all.ts` and every
  `<package>/register` entry point keep registering the same tags at the same moment. The
  `@customElement` decorators go away, but only so registration is *explicit* — what ends up in the
  global registry after importing a register module is unchanged.
- Rewriting stories that do not involve correction.
- The `qti-theme` HMR lift.

---

## Completion notes (2026-07-20)

- Added composable package manifests, named/scoped registry support, and complete registry-aware item/test loading.
- Moved correction mixins, styles, interaction implementations, item/test controls, and correction stories into
  `@qti-components/qti-corrections`.
- Kept the standard QTI tag names in the correction registry while leaving the normal registries lean.
- Extracted correction presentation behavior from the interaction, assessment-item, item, and test host classes.
- Updated the order story to retain the shipped longest-increasing-subsequence correction semantics.
- Verified the workspace build, 459 browser unit tests, and all 606 enabled Storybook interaction tests.
