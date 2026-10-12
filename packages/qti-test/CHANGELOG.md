# @qti-components/test

## 1.9.0

### Minor Changes

- [#231](https://github.com/Citolab/qti-components/pull/231) [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9) Thanks [@herrKlein](https://github.com/herrKlein)! - Items publish whether their interactions are valid, as `ItemContext.valid`, and the test reads it from there instead of asking every loaded item to validate on each update. The item checks when an answer changes, when it connects, and after answers are handed in through `variables`. `qti-assessment-item` also exposes a read-only `itemContext` (the whole context, declarations included), which the test used to reach for as a private field.

  This fixes a bug: after a restore (`qtiTest.state`) or after coming back to an answered item, `ComputedItem.valid` stayed `false` until some later update, because it was read before the answer was adopted. In a section with `allow-skipping="false"` that kept `test-end-attempt` disabled on an item that was already answered.

  What to check in a host:

  - Components that read `ComputedItem.valid` from `computedContext`: it now settles after a restore and after navigating back.
  - `test-end-attempt` in sections that do not allow skipping.
  - Inline validation messages. Read from the code, not observed: `validate()` on an interaction can update its inline message, and the test used to call it on every update of the test. It is now called when the item's answers change.

  Covered by this repo's stories; not run against a host application. Host migration: [PeilingLezen](plans/host-migration/peilinglezen.md), the only surveyed host that consumes `computedContext`.

- [#230](https://github.com/Citolab/qti-components/pull/230) [`7937fd5`](https://github.com/Citolab/qti-components/commit/7937fd52870a18938f24c3f835d591f6b644cc3c) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiContext` (the `QTI_CONTEXT` variable: test, candidate and environment identifiers plus the optional shuffle `seed`) is now provided by `qti-test`, and the test reads the seed from itself instead of reaching into `test-navigation`. Set it with `qtiTest.qtiContext = …`.

  `test-navigation.qtiContext` is deprecated and kept as an alias: reading it returns the enclosing test's value and writing it replaces that value, so hosts that set the seed there keep working. It is removed in the next major, and writing it prints one console warning per element naming the replacement. Reading it does not warn, and neither does the library's own writing. Before this change it was a second provider; now there is one value, so the two can no longer disagree. The alias finds the test across shadow roots. Set before the navigation is inside a `qti-test` (a React host sets props before attaching the element), a write is held and handed over when it connects.

  Covered by this repo's stories: the seed through both routes gives the same shuffle order, including a story that builds the elements in the order React does, which also passes on the previous release. Not run against a host application. CitoTestUit, which passes its per-session seed as the `qtiContext` prop of `<test-navigation>`, is the flow to check.

  Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).

  Everything deprecated, and what is planned for the next major: the new Deprecations page.

- [#225](https://github.com/Citolab/qti-components/pull/225) [`6e87e20`](https://github.com/Citolab/qti-components/commit/6e87e20ddb86495c08d3469fdb6e6de61675c108) Thanks [@herrKlein](https://github.com/herrKlein)! - Add `qtiTest.state` and the `qti-state-changed` event: one value to persist and restore a candidate's test session (item variables, per-interaction state, test outcomes, position) without declaration metadata or the answer key. The state can be assigned before the test loads and is applied before the first item does. Also restores per-interaction state (e.g. a PCI's `getState()`) into an item when it loads, and makes `navigate="section"` start at the restored section.

  `updateItemVariables()` now updates the test context immutably, so components reading it update and `qti-state-changed` fires; values for items that have not loaded yet are kept instead of dropped. Its values no longer need a `type` (only for a variable the item does not declare), and an optional third argument sets per-interaction state.

  Deprecated, to be removed in the next major: the `qti-test-context-updated` event (listen to `qti-state-changed` instead), and `SessionContext.navItemLoading` / `navTestLoading`, which were never set.

  ## Migration for hosts

  No breaking change: `testContext`, `qti-test-context-updated` and `navigateTo` still work, so nothing has to change on upgrade. Recommended, because it removes workarounds:

  - **Persist** from `qti-state-changed` (or read `qtiTest.state`) instead of `qti-test-context-updated`. The payload is built after the update, so it is never stale, and it no longer carries declaration metadata or the answer key.
  - **Restore** by assigning `qtiTest.state = saved`, before or after load, instead of assigning `testContext` and calling `navigateTo`. The restored position is applied for you, and assigning no longer needs a guard against a late restore overwriting newer answers.
  - **Keep your own fields** (current item, pages, manual scores) next to the stored `state`.
  - **Pass the shuffle seed again on every load.** It is deliberately not part of `state`: set it through `test-navigation.qtiContext` (`asSeed`) as before, or the restored order changes.
  - **`href` is not in `state`.** Read it from the `qti-assessment-item-ref` instead of from the context.
  - **Bookmarks are not in `state` yet.** A host that stores them as `marked` on context items must keep using `testContext` for those until `state.session` carries them.

  Per host (read from source, not run):

  - **Kennisnet** (7.28.1, own republish): replace the `qti-test-context-updated` save and the `testContext` restore in `store/events.ts`, and drop the by-hand store rebuild in `mutators.ts`, which existed because assigning emitted nothing. `updateItemVariables` now fires `qti-state-changed`, so the "doesn't fire reliably" workaround in `check-item.ts` can go. Take `href` from the item-ref (`check-item.ts`).
  - **CitoTestUit** (9.3.0): replace the save in `AssessmentPlayerView.tsx` with `qti-state-changed`, and the guarded one-time `testContext` restore plus `navigateTo` with `state`. The live `qtiTest.testContext` read for stale payloads is no longer needed. Keep the `qtiContext` seed. Bookmarks (`marked`) stay on `testContext` for now.
  - **PeilingLezen** (7.1–7.14, imports surveyed only): its components consume `testContext` / `computedContext`, which are unchanged. Nothing to do; `state` is available once it upgrades.

  `SessionContext.navItemLoading` / `navTestLoading` were never set. Stop reading them before the next major.

- [#232](https://github.com/Citolab/qti-components/pull/232) [`c572724`](https://github.com/Citolab/qti-components/commit/c572724b9f2a57cabac632354b49f6caf8911533) Thanks [@herrKlein](https://github.com/herrKlein)! - Components inside a `qti-test` now find it through context instead of `closest('qti-test')`. `closest()` stops at the first shadow root, so a `test-container` or item-ref that a host renders inside its own component skipped `postLoadTestTransformCallback` and `<template item-ref>` without a word; context crosses shadow roots. The context is internal to `@qti-components/test` and not exported.

  A `ContextRoot` is attached to `document.documentElement`, once per page, when `@qti-components/base` loads. It holds a context request nobody answered and asks again when a provider connects, so a component that upgrades before the element providing its context still gets the value. It holds subscribing requests only, which every `@consume` in the library is, and holds them weakly. Code that registers elements in order is not affected.

  What to check in a host:

  - Anything that renders `test-navigation`, `test-container` or items inside a custom element's shadow root under a `qti-test`: `postLoadTestTransformCallback` and `<template item-ref>` now apply there.
  - Pages that run other Lit contexts of their own: the root is page-wide and sees their unanswered requests too. It only replays them when a provider shows up, so nothing changes unless one was being missed.

  Covered by this repo's stories and specs; not run against a host application. Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).

- [#254](https://github.com/Citolab/qti-components/pull/254) [`24337a8`](https://github.com/Citolab/qti-components/commit/24337a83f98677b5f5152009ca215f70d6fa611a) Thanks [@herrKlein](https://github.com/herrKlein)! - `<test-item-to-speech>`:

  - Skips content that is not rendered (hidden feedback, a scorer-only rubric block) and reads it once it is shown.
  - Decides which item to read from where it is placed: inside a `qti-assessment-item-ref` (e.g. a `<template item-ref>`) it reads that item; anywhere else it follows the navigation cursor, as before.
  - Keeps working after navigating to the item already on screen.

  `item-ref-id` is removed: a player in a `<template item-ref>` already reads its own item without it. A player outside any item ref that used `item-ref-id` to pin one item now follows navigation instead.

### Patch Changes

- [#253](https://github.com/Citolab/qti-components/pull/253) [`614c666`](https://github.com/Citolab/qti-components/commit/614c666eb28117e9dd8d432c00465793704448a2) Thanks [@herrKlein](https://github.com/herrKlein)! - A shared stimulus is placed as its whole `qti-assessment-stimulus` instead of only its `qti-stimulus-body`, so the content inherits the stimulus' `xml:lang` and text-to-speech and screen readers read it in the right language. The new `qti-assessment-stimulus` element generates no box (`display: contents`), so layout is unchanged. It drops the stimulus' QTI `title` when placed, which would otherwise show as a tooltip over the whole passage.

- [#234](https://github.com/Citolab/qti-components/pull/234) [`aeda9f1`](https://github.com/Citolab/qti-components/commit/aeda9f10f7a816a90b671632957b96cce3502d90) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTest.outcomeProcessing()` now finds the test's own outcome processing when the test is loaded through `test-container`. The container renders the test into its own shadow root, which the old lookup on `qti-test` could not see, so the call found nothing, returned `false` and did nothing. With a test rendered straight into `qti-test` it behaved as before.

  No surveyed host calls it. If one does, it now runs where it used to be a silent no-op, so check what it was relied on to do.

  Covered by a story that loads a test with an `<qti-outcome-processing>` through `test-container`, which fails on the old code.

- Updated dependencies [[`614c666`](https://github.com/Citolab/qti-components/commit/614c666eb28117e9dd8d432c00465793704448a2), [`b0f1c6d`](https://github.com/Citolab/qti-components/commit/b0f1c6d4cc885d361247ac41973874659f6494e0), [`c5d80aa`](https://github.com/Citolab/qti-components/commit/c5d80aa2a5e2e1e09853931cc758a3677ed42593), [`7786381`](https://github.com/Citolab/qti-components/commit/7786381f03a20ab5a28d86dedbbeae34e50aaac9), [`6e87e20`](https://github.com/Citolab/qti-components/commit/6e87e20ddb86495c08d3469fdb6e6de61675c108), [`9e52bb7`](https://github.com/Citolab/qti-components/commit/9e52bb7720ab9b47895e57fd80410486bacf29b1), [`0fe97cf`](https://github.com/Citolab/qti-components/commit/0fe97cf00fa96710ce38754c05282b1eb03ef53d), [`c572724`](https://github.com/Citolab/qti-components/commit/c572724b9f2a57cabac632354b49f6caf8911533)]:
  - @qti-components/elements@1.9.0
  - @qti-components/base@2.4.0

## 1.8.0

### Minor Changes

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - Add `item` to the `<template item-ref>` model on `qti-assessment-item-ref`.

  `item` is this ref's entry in the computed context — the same object the stamps iterate as `item` —
  so a template can show `{{ item.index }}`, `{{ item.score }} / {{ item.maxScore }}` and the rest of
  the item's state. The element subscribes to the context, so the template re-renders as scores come
  in. Undefined until the test has computed it.

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - The test controls (`test-next`, `test-prev`, `test-item-link`, `test-section-link`,
  `test-check-item`, `test-end-attempt` and the text-to-speech buttons) share one resting look that
  reads the qti-theme tokens — `--qti-component-*` for the box, `--qti-bg-active` on hover,
  `--qti-focus-*` for a `:focus-visible` ring — with the theme's defaults as fallbacks, so they
  follow a brand and still look the same without qti-theme loaded. This replaces the light-grey
  fill. `--test-button-*` slots (`background-color`, `color`, `border-color`, `border-radius`,
  `hover-background-color`, `size`) repaint the test controls alone.

- [#221](https://github.com/Citolab/qti-components/pull/221) [`c156699`](https://github.com/Citolab/qti-components/commit/c1566999833777e5c95d4759fe72600bcdd0b1ee) Thanks [@herrKlein](https://github.com/herrKlein)! - `test-item-to-speech`: speak each element in its own language, a player per item, and pick mode.

  - **Language resolution.** Each reading element is spoken in the language of the nearest `lang`
    (or `xml:lang`): the element, its closest ancestor — across shadow roots — then `<html lang>`,
    and only then the `language` attribute, which is now a fallback.
  - **A player per item.** `item-ref-id` pins a player to one `qti-assessment-item-ref`, so it reads
    that item whatever the navigation cursor points at. That makes a player per item possible on a
    section page, for instance from a `<template item-ref>`:
    `<test-item-to-speech item-ref-id="{{ identifier }}">`. Unset, the player follows
    `navItemRefId` as before.
  - **Several players on a page** share the browser's one speech queue: starting one stops any other,
    a player never cancels speech or clears highlights it does not own, and moving to another section
    stops every player, pinned or not.
  - **Pick mode.** `<test-tts-pick>` highlights every reading element; a click on one starts reading
    from there. The player reflects it as `:state(picking)`.
  - Reading elements now include `qti-prompt` and `qti-simple-choice`, and nested matches are read
    once. Prev/next stay enabled before the elements have been collected, and play after the last
    element starts the item over.
  - **Icon buttons.** The controls draw SVG icons instead of text glyphs, so every button has the
    same box, each with an English accessible name. Slotted content still replaces the default, and
    a slotted `<svg>` is sized like it; `label` (plus `pause-label` on `<test-tts-play>`) names the
    button, which a slotted icon needs. The controller lays its controls out as a wrapping row.

## 1.7.0

### Minor Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - **Interpolation tables now match on ranges, which changes existing scores.** An entry's
  `source-value` is the lower bound of a range, not a value to match exactly, and `include-boundary`
  (default `true`) says whether the bound itself is in range. Entries are tested in document order and
  the first one the value clears wins.

  We matched exactly and ignored `include-boundary` entirely, so a value between two entries found
  nothing and scored 0. Read this one before upgrading: a table in this repo's own fixture
  (`3 -> 2`, `2 -> 1`, `1 -> 0`, `0 -> 0`, every entry `include-boundary="false"`) now scores a raw 3 as
  1 where it used to be 2, and a raw 2 as 0 where it used to be 1. If your tables were authored
  against the old exact matching, their scores move. This also diverges deliberately from the Citolab
  scoring engine, which documents exact matching rather than ranges.

  `OutcomeVariable.interpolationTable` changes type with it, from `Map<number, number>` to an ordered
  `InterpolationTableEntry[]` — a Map keyed by source value cannot express a bound, a boundary rule or
  document order.

  `qti-lookup-outcome-value` returns `null` rather than `0` when nothing matches, and leaves the
  outcome at the default its declaration gave it instead of writing a score the table never specified.
  It never wrote on a miss before either; only the return value changed.

  **`qti-equal` supports `tolerance-mode="absolute"` and `"relative"`.** Both previously logged
  "toleranceMode is not supported yet" and returned false whatever the values, so a tolerant
  comparison could never succeed. `tolerance` takes one or two numbers (one means both sides);
  `absolute` reads them as offsets around the second expression, `relative` as percentages of it.
  `include-lower-bound` and `include-upper-bound` default to true and are read off the attribute
  rather than declared as Lit boolean properties, because QTI writes `include-lower-bound="false"` and
  Lit's boolean converter takes the mere presence of an attribute as true.

  **`qti-exit-test`** ends a test's outcome processing, the counterpart of `qti-exit-response` and
  caught the same way in `QtiOutcomeProcessingProcessor`.

- [#219](https://github.com/Citolab/qti-components/pull/219) [`aee42e6`](https://github.com/Citolab/qti-components/commit/aee42e664e5c2dce5630cce0493118bff8655e7c) Thanks [@herrKlein](https://github.com/herrKlein)! - Finish the `<template item-ref>` hook on `qti-assessment-item-ref`.

  The element has carried a `myTemplate` property and a `render()` that branches on it since the
  stamp components were written, but the one line that resolves the template was commented out, so
  `myTemplate` was never assigned and the branch was dead. A host that wanted to put its own chrome
  around every item — a bookmark, an index number, a score badge — had no seam at all, and the only
  way in was to replace the registered element.

  Put a `<template item-ref>` in the light DOM of your `<qti-test>` and every item-ref in the test
  renders with it:

  ```html
  <qti-test>
    <template item-ref>
      <div class="badge">{{ identifier }}</div>
      {{ xmlDoc }}
    </template>
    …
  </qti-test>
  ```

  The template is the whole render, so it places `{{ xmlDoc }}` itself; leaving it out renders the
  chrome and no item. Without a template the element renders the item exactly as before, so this is
  additive — nothing that works today changes.

  The model is `ItemRefTemplateModel`: `xmlDoc`, `identifier`, `href`, `category`, and `itemRef` as
  the escape hatch for a template that needs a handler or a host value, reached through a property on
  the element.

  Two fixes to the commented code it replaces. The lookup assumed the ref always sits directly inside
  a shadow root (`getRootNode().host.closest('qti-test')`), which throws for a ref in plain light DOM
  and for one nested deeper than one root; it now climbs root by root and gives up quietly when there
  is no enclosing `<qti-test>`. And `myTemplate` was declared as an always-assigned
  `TemplateFunction`, which it never was — it is now `TemplateFunction | null`, matching
  `test-scoring-buttons`.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Implement the four expressions and rules the scoring engine supports and we had no element for at
  all. Each was previously an unknown tag: inert, silently contributing nothing to a score.

  `qti-math-constant` returns `pi` or `e` as a float, and NULL for a name outside that vocabulary.

  `qti-exit-response` ends the attempt's response processing. An exit can sit at any depth — inside a
  `qti-response-condition` branch, inside a `qti-response-processing-fragment` — and has to stop every
  rule after it, not just its own siblings, so it throws a `QtiExitResponseSignal` that
  `qti-response-processing` catches at the top of the run. Unwinding the stack reaches every one of
  those loops without each having to report upwards. The outcomes set before the exit are kept,
  because a `qti-set-outcome-value` has already dispatched by the time the signal is thrown. Anything
  that is not the signal rethrows, so a genuine error in a rule still surfaces.

  `qti-response-processing-fragment` runs its rules in place, in document order, exactly as if they
  had been written where the fragment sits. A fragment held in a separate file is still not pulled
  in, because `qti-include` is not resolved — only the rules authored inside the element run.

  `qti-number-selected` counts the item references the test selected, narrowed by
  `section-identifier`, `include-category` and `exclude-category`. It counts the item refs in the
  document rather than the entries in the test context, so it is the same set `qti-test-variables`
  aggregates over and it is right before any item has been attempted.

  The last two share how they choose item refs, so that selection moved into one place
  (`internal/item-ref-selection`). `qti-test-variables` gains `section-identifier` from the move —
  it filtered by category but had no way to scope to a section.

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Close the gaps between our scoring and the QTI expression vocabulary, found by comparing against
  the Citolab QTI scoring engine's supported-feature list. Four of these silently produced a wrong
  score rather than failing.

  **`qti-test-variables` never aggregated anything.** The test-level expression that sums an
  item variable across the test — the one that computes a test's total — always returned 0, or
  threw. Three faults stacked:

  - It resolved the test element from a `qti-assessment-test-connected` listener on itself, but that
    event bubbles _up_ from the test while the expression sits inside that test's
    `qti-outcome-processing`. The listener never fired. It now walks up with `closest()`.
  - The item-ref query read `qti-asssessment-test qti-assessment-item-ref` — three s's, and a
    descendant selector that would match nothing even spelled right, since it runs _on_ the test
    element. `test-base.ts` already had the correct form.
  - `exclude-category` overwrote the `include-category` result instead of narrowing it, so an item
    passing both attributes was decided by the exclude list alone. Both now apply, and each side
    reads `category` as the space-separated list the spec defines.

  **`weight-identifier` was a no-op.** `QtiAssessmentItemRef.weigths` was an empty `Map` nothing ever
  wrote to: the `<qti-weight>` children in the test document were never read, so every weight fell
  back to 1 and a `value="0"` item still counted. Replaced by a `weights` getter that reads them on
  access — they are not in the DOM at construction time. This repo's own `biologie` test masked it,
  because its zero-weight items are also excluded by category.

  The misspelled `weigths` is gone rather than kept as a deprecated alias. Nothing that worked is
  broken by that: the property only ever handed back an empty Map. An alias was the first attempt,
  but two accessors where one returns the other sends the custom-elements-manifest analyzer's type
  parser circular, failing `pnpm run cem`.

  **`qti-math-operator` `log` returned the natural logarithm.** The QTI vocabulary defines `log` as
  base 10 and `ln` as natural; both called `Math.log`. Any item using `log` scored against the wrong
  curve. Items relying on the old behaviour should move to `ln`, which is unchanged. Also adds
  `secant`/`cosecant`/`cotangent` (and the short `sec`/`csc`/`cot`), `toDegrees` and `toRadians`,
  which had no implementation and fell through to a null.

  **`qti-pattern-match` was unanchored.** `new RegExp(pattern).test(value)` matches a substring, so
  `[0-9]+` accepted `"abc123"`. XML Schema pattern semantics match the whole value; the pattern is
  now wrapped as `^(?:…)$` so a top-level alternation cannot escape the anchors. Compiled with the
  unicode flag first so `\p{L}` category escapes work, falling back without it for patterns that flag
  rejects.

  **`qti-field-value` threw on a missing field.** `qti-is-null` over a `qti-field-value` is the
  specified way to ask whether a record carries a field, which requires a missing one to be an
  ordinary NULL — throwing aborted the whole response-processing run instead. Every failure path is
  now NULL.

  **`qti-integer-modulus` disagreed with `qti-integer-divide` on negatives.** The divide rounds down
  (`Math.floor`) while the modulus used JavaScript's `%`, which truncates toward zero: `-7 divide 3`
  gave `-3` but `-7 modulus 3` gave `-1`, where floored division leaves `2`. The remainder is now
  computed to pair with the divide.

  **`qti-stats-operator` implemented two of six functions.** `median`, `popVariance`,
  `sampleVariance` and `sampleSD` warned and returned null; only `mean` and `popSD` worked. A sample
  statistic over a single observation is NULL rather than a division by zero.

  **`qti-match-table` was not read at all.** `qti-outcome-declaration` parsed only
  `qti-interpolation-table`, so `qti-lookup-outcome-value` against a match table always scored 0.
  Match-table targets keep their authored spelling, since a match table may map onto identifiers or
  strings rather than numbers.

  **`qti-repeat` had no iteration cap.** `number-repeats` may name a variable, so a bad value could
  build an unbounded container and hang the tab. Capped at 1000, matching the scoring engine.

### Patch Changes

- [#218](https://github.com/Citolab/qti-components/pull/218) [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Stop doing expensive work for log lines nobody reads, and log at the right level.

  Two traces serialised data on every expression evaluation, whether or not anything was listening —
  `console.debug` computes its arguments regardless of the console's level:

  - `qti-multiple` logged `this.innerHTML`, serialising its whole DOM subtree. It wraps the correct
    response in most choice items, so this ran on every scoring pass.
  - `qti-default` logged `JSON.stringify(itemContext)`, serialising an item's entire variable set —
    and did it _before_ the null check that may return early.

  Two more fired per child per expression evaluation in `QtiExpression.getVariables` and carried no
  information the caller did not already have. All four are gone; no debug infrastructure gated them,
  so they were development traces rather than diagnostics anyone could rely on.

  Error conditions in `qti-lte` and `qti-gte` were reported with `console.log` rather than
  `console.error` (and `qti-gte` named itself "qte"), and the `disableAfterIfMaxChoicesReached`
  deprecation notice used `console.log` where a deprecation belongs at `console.warn`. No
  `console.log` remains in shipped source.

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/processing@1.6.0
  - @qti-components/base@2.3.0
  - @qti-components/elements@1.8.0
  - @qti-components/theme@2.2.1
  - @qti-components/transformers@1.7.3

## 1.6.2

### Patch Changes

- [#206](https://github.com/Citolab/qti-components/pull/206) [`3984227`](https://github.com/Citolab/qti-components/commit/39842270a207dfb43e0cd95a9a63faaaaf6a8989) Thanks [@herrKlein](https://github.com/herrKlein)! - Make `@heximal/templates` a dependency of `@qti-components/test` instead of a peer.

  A peerDependency says "there must be exactly one of these, and you own the choice". Neither half is
  true here: `@heximal/templates` is a templating library used by seven files inside one package, it
  has no singleton requirement, and no consumer has any reason to hold an opinion about its version.
  Peering it just forced every consumer to install a transitive implementation detail by hand.

  That was a real failure, not a theoretical one. Under an install that does not auto-install peers —
  Yarn 2+, or pnpm with `auto-install-peers=false` — the published `@qti-components/test@1.6.1` cannot
  resolve its own import:

  ```
  @heximal/templates  ->  MODULE_NOT_FOUND
  ```

  As a plain dependency it now installs automatically, and the consumer declares nothing.

  `lit` and `@lit/context` stay peers, where the reasoning does hold: two copies of Lit mean two
  `ReactiveElement` base classes, so `instanceof` fails across them, and Lit's own multi-version
  warning fires.

- [#205](https://github.com/Citolab/qti-components/pull/205) [`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce) Thanks [@herrKlein](https://github.com/herrKlein)! - Ship the theme sheet as a real module, so `@qti-components/item` and `@qti-components/test` can be
  installed on their own.

  Both packages adopt the theme into their shadow root, so they need the sheet as _text_. They got it
  with `import itemCss from '../../../../qti-theme/src/item.css?inline'` — but `?inline` is
  bundler-only syntax, and `tsc` (how all 32 non-umbrella packages build) copies the specifier through
  verbatim. `@qti-components/item@1.4.3` therefore shipped that exact line. Two things wrong with it:
  the `?inline` suffix no plain bundler resolves, and the path climbs out of the package into a
  sibling directory that `files: ["dist"]` never publishes. Installing the package from npm and
  bundling it fails outright:

  ```
  ✘ [ERROR] Could not resolve "../../../../qti-theme/src/item.css?inline"
      @qti-components/item/dist/components/item-container/item-container.js:15:20
  ```

  It went unnoticed because the umbrella inlines these packages at build time and its esbuild plugin
  resolves the `?inline` right there — inside the workspace, where `dist/` sits at the same depth as
  `src/` and the relative path happens to land on a real file. Consumers of `@citolab/qti-components`
  never saw the broken specifier. Consumers of the granular packages could not get past it.

  `@qti-components/theme` now exposes `./item-css`, an ES module exporting the compiled sheet as a
  string. It is generated from the already-built `dist/item.css` rather than by running PostCSS a
  second time, and the result is byte-for-byte what the inline plugin produced (279,603 chars) — so
  the text these containers adopt is unchanged and nothing renders differently. `item-container` and
  `test-container` import that instead, and `@qti-components/theme` moves to a real `dependency` of
  `@qti-components/item` (it already was one of `@qti-components/test`) so the topological build
  order guarantees it exists first.

  Verified: with the fix, `@qti-components/item` installed from a tarball bundles cleanly and carries
  exactly one copy of the sheet.

  Also in this change:

  - **Every package now cleans before it builds.** None did, so `dist/` accumulated files whose
    sources were deleted — `@qti-components/corrections` was carrying a stale
    `dist/stories/with-correction-registry.decorator.js` from a removed source file, itself
    containing a `?inline` import. Nothing broken had actually shipped from this (the file was
    outside the published tarball), but `publish-if-needed.mjs` runs `--ignore-scripts`, so the
    tarball is whatever happens to be on disk.
  - **An eslint rule** rejects `?inline`/`?raw`/`?url` specifiers in package sources, naming the fix
    in the message. `import/no-relative-packages` had already flagged the original line and was
    silenced with an inline disable; that disable is gone. Exempt: `packages/qti-theme` (owns the
    dev-side source shim), spec/story files and `apps/*` (never compiled into a published dist).
  - The five spec files and two `apps/e2e` stories that loaded the sheet through `?inline` now use
    the same entry point as production, so they exercise the path consumers actually take rather than
    a dev-only one.
  - Removed a dead `@qti-components/theme` mapping in the root `tsconfig.json` pointing at a
    `src/index.ts` that does not exist.

- Updated dependencies [[`8959ee7`](https://github.com/Citolab/qti-components/commit/8959ee7e6417061d80fba5d027900dd7fc42afce)]:
  - @qti-components/theme@2.2.0

## 1.6.1

### Patch Changes

- [#201](https://github.com/Citolab/qti-components/pull/201) [`eac8b80`](https://github.com/Citolab/qti-components/commit/eac8b80db65b08c01314fc5a6fd9630afbae3541) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - No-op `test-navigation`'s candidate events when there is nothing to act on.

  The navigation buttons are clickable before a test document has loaded — a failed
  `assessment.xml` fetch leaves them enabled indefinitely — so a click could reach a handler
  that dereferenced the test element, the item-ref and its assessment item unguarded, throwing
  `TypeError: Cannot read properties of undefined (reading 'querySelector')`.

  `test-end-attempt` now resolves the item through the existing `activeAssessmentItem` getter and
  `test-update-outcome-variable` through `#assessmentItemFor`, each returning early when nothing is
  rendered. Autoscoring resolves the item from the interaction event's own path, so
  `qti-interaction-changed` also returns early for a change raised outside an assessment item.

  `test-show-correct-response` and `test-show-candidate-correction` need no change: they are handled
  by `TestNavigationCorrection` in qti-corrections, which already resolves the item through optional
  chaining.

- Updated dependencies [[`0822231`](https://github.com/Citolab/qti-components/commit/0822231381b8b4d5d6f98c524e86cf2ef42f12ce)]:
  - @qti-components/processing@1.5.0

## 1.6.0

### Minor Changes

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Gate linear navigation and further attempts on item doneness.

  An item is done once an attempt has ended and either reached the optimal outcome or exhausted its
  `max-attempts`. `test-navigation` computes that centrally and publishes `done` and `optimal` on the
  computed context.

  Optimality is judged from the scored outcome where there is one — `SCORE` having reached `MAXSCORE`,
  which handles partial-credit and `qti-mapping` items correctly — and otherwise from an exact match
  against the declared `qti-correct-response`. Items with neither (essays, info items) count as done
  after one attempt, since there is no optimal value to require.

  It is latched only when `processResponse` ends an attempt: `qti-assessment-item` now flags that
  context update with `responseProcessed`, so a mid-attempt selection never counts. A restored session
  seeds the latch once from the persisted context.

  `test-next` in linear/individual mode gates on `done` in place of "any attempt ended", and
  `test-end-attempt` is additionally disabled once a non-adaptive item's last ended attempt was
  already optimal — there is nothing left to improve.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-item-session-control`, and honour `max-attempts` and `allow-skipping`.

  The element exposes the QTI 3.0 `ItemSessionControl` attributes, and `test-navigation` cascades
  them from test-part to section to item into the computed context, so every item carries the
  settings that apply to it.

  `test-end-attempt` reads that cascade: it is disabled once a non-adaptive item has reached its
  `max-attempts` (`max-attempts="0"` means unlimited), and — when `allow-skipping` is false — while
  the active item's response is still invalid or untouched. Adaptive items are exempt from the
  attempt limit, since they are meant to keep iterating.

  The computed context gains `valid` and `isDefaultResponse` per item to support that, alongside
  `maxAttempts` and `allowSkipping`.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Apply the `show-feedback` constraint per the QTI `ItemSessionControl` rules.

  `test-navigation` cascades `show-feedback` from the session control into the computed context, and
  `QtiFeedback` consults it.

  The constraint governs exactly one state: after the end of the last attempt. Until then the spec
  requires any applicable feedback to be shown — "a value of max-attempts greater than 1, by
  definition, indicates that any applicable feedback must be shown" — and only "once the maximum
  number of allowed attempts have been used (or for adaptive items, completionStatus has been set to
  completed)" does `show-feedback` decide. So the gate asks whether the item is out of attempts, which
  is answered per item kind:

  - adaptive items ignore `max-attempts` entirely, and are out of attempts only once
    `completionStatus` is `completed`;
  - `max-attempts="0"` means no limit, so that state is never reached and feedback always shows;
  - otherwise, once `numAttempts` reaches `max-attempts`, `show-feedback` decides, defaulting to
    false.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reveal the solution after an ended attempt when `show-solution` says so.

  `test-navigation` settles item doneness on an ended attempt and hands it to a new
  `afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
  needed because the computed context only catches up on the next update, after the event has finished
  bubbling.

  `TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
  an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
  The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
  corrections rendering, not to item session control.

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep the test-level outcomes a test document declares.

  Test-level `qti-outcome-declaration` elements register themselves into the test context as they
  connect, by dispatching `qti-register-variable`. They are children of `qti-assessment-test`, so they
  connect — and register — _before_ the test element announces `qti-assessment-test-connected`.

  The test host reset its context on that announcement, which threw every one of those registrations
  away. No test-level outcome could then be read or set: `getOutcome` returned nothing, and
  `qti-set-outcome-value` at test level reported the identifier as unavailable.

  `test-container` now announces a new test document with `qti-testdoc-loaded` at the point it assigns
  it, and the host resets on that instead. Lit's re-render is async, so the reset still lands before
  any child of the new document connects. `qti-assessment-test-connected` keeps its remaining job of
  adding the item-refs, and now preserves what the document registered.

  This also removes a dead guard: the old handler tested `testContext.items.length > 0` immediately
  after assigning the initial context, so the condition could never hold.

### Patch Changes

- Updated dependencies [[`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/base@2.2.0
  - @qti-components/elements@1.7.0
  - @qti-components/processing@1.4.1

## 1.5.4

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

- Updated dependencies [[`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d)]:
  - @qti-components/base@2.0.1

## 1.5.3

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.
- Updated dependencies [[`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4)]:
  - @qti-components/theme@2.0.1
