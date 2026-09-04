# @citolab/qti-components

## 8.2.0

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

- [#199](https://github.com/Citolab/qti-components/pull/199) [`9073338`](https://github.com/Citolab/qti-components/commit/9073338d093389485b43449e53043c451e04159a) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix inherited attributes/members/slots/events/csspart metadata silently missing from the generated custom elements manifest and JSX types for components that only inherited an API from a mixin/base class and didn't declare an entry of their own. Caused by a breaking change in `@wc-toolkit/cem-utilities@1.6.0` that `@wc-toolkit/cem-inheritance` relies on; `@wc-toolkit/cem-utilities` is now pinned to `1.2.0` until upstream is fixed ([wc-toolkit/cem-inheritance#30](https://github.com/wc-toolkit/cem-inheritance/issues/30)).

- [`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix the drag-handle grip rendering off-centre on `qti-gap-text` chips and `qti-simple-associable-choice` chips (used by gap-match, associate and match interactions).

  The grip is a theme-drawn `::before` on `::part(control)`, centred with `vertical-align: middle` — a line-box/font-metric alignment, not a geometric one. `qti-gap-text` and `qti-simple-associable-choice` gave their `control` div no layout of its own, so the glyph's position drifted with font/line-height. `[part='control']` now flex-centres its content (`display: flex; align-items: center; justify-content: center`), matching the fix `qti-simple-choice` already had for its own control.

- [#198](https://github.com/Citolab/qti-components/pull/198) [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Resolve test-level outcomes in variable expressions.

  The `variable` expression and `getVariables()` only consulted item scope, so a test-level outcome
  that had just been set — a total summed in outcome processing, say — could not be read back:
  `<qti-variable identifier="TEST_SCORE"/>` resolved to `undefined` and threw once used in a
  comparison.

  Item scope is resolved first, then the test-level outcome variables, mirroring how
  `qti-printed-variable` already does it — and an unresolved identifier now returns `null` instead of
  throwing. This is the pattern the QTI 3.0 spec's own feedback examples rely on: set a total via
  `qti-test-variables`, then branch on it with `qti-variable` in an `outcomeCondition`.

## 8.1.0

### Minor Changes

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Keep interactions working where custom states are unsupported.

  Interactions track selection and correct/incorrect marking through `internals.states`, with bare
  state names (`checked`, `radio`, `correct-response`, …). Two browser profiles cannot service that,
  and on both, picking a choice throws rather than registering:

  - Safari 16.4–17.3 implement `ElementInternals` but not `CustomStateSet`, so `internals.states` is
    `undefined` and reading it throws.
  - Chrome and Edge before the CSS custom-state spec change expose `states` but reject names that do
    not start with `--`, so `states.add('radio')` throws a `SyntaxError`.

  `attachInternals` is unguarded throughout the interaction base classes, which puts the hard support
  floor at Safari 16.4 — inside the range that breaks.

  `@qti-components/base` now classifies custom-state support by behaviour — `missing`, `legacy` or
  `modern`, probing a throwaway element rather than sniffing versions — and on the first two replaces
  `states` with a permissive `Set` that also mirrors its contents to a space-separated `data-state`
  attribute on the host. Where `states` works natively nothing is installed and nothing changes.

  The mirror is needed because these browsers' CSS parsers also drop any selector list containing
  `:state()`, so checked, correct-response and drag styling never rendered there either. The theme's
  built stylesheets now pair every `:state(x)` with a `[data-state~='x']` arm, applied at build time by
  `tools/postcss/custom-state-fallback.mjs`. `:is()` is what makes the pairing work in both
  directions: its forgiving parsing means a browser that does not understand `:state()` keeps the
  attribute arm, while a browser that does keeps matching the state arm.

- [#193](https://github.com/Citolab/qti-components/pull/193) [`7c7619c`](https://github.com/Citolab/qti-components/commit/7c7619c4a9ab8e98ec6ab7e5bfcc5475bc32aa3e) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Add `qti-outcome-condition` with its `qti-outcome-if` / `qti-outcome-else-if` / `qti-outcome-else`
  branches.

  `outcomeCondition` is the QTI 3.0 counterpart of `responseCondition` and the element the spec's
  own feedback examples branch on. Without it, an `outcomeProcessing` block that uses one had no
  element to match and its rules never ran.

  The two conditions are structurally identical — a container that walks its branches in order and
  processes the sub-rules of the first one that applies — so that behaviour now lives in a shared
  `QtiConditionBase` / `QtiConditionIfBase` / `QtiConditionElseBase` family that both the response-
  and outcome- elements extend. `qti-response-condition` and its branches keep their existing
  behaviour.

### Patch Changes

- [`29ed97e`](https://github.com/Citolab/qti-components/commit/29ed97ef79018aa99d941e7d425ac72fa9100abf) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Substitute response processing templates in the element's own custom element registry.

  `qti-response-processing` with a `template="…/rptemplates/map_response.xml"` attribute replaces its
  children with the built-in rules for that template. It parsed them with
  `document.createRange().createContextualFragment()`, and the fragment parsing algorithm takes its
  registry from the context node — `document`, so the global registry. In a player rendered into a
  shadow root with a scoped registry whose tags are also defined globally, every substituted rule was
  upgraded with the global class instead of the scoped one, so a registry that overrides a rule (what
  `qti-corrections` does) never saw its own element.

  The rules are now parsed through the element's own `innerHTML`, where the context element is the
  `qti-response-processing` itself and its registry — scoped or global — is the one that upgrades
  them. An unrecognised template name also leaves the authored children in place instead of clearing
  them.

- [#190](https://github.com/Citolab/qti-components/pull/190) [`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Flatten native CSS nesting in the published stylesheet, and state the browser support floor.

  The theme sources use `&`-nested rules throughout and the postcss pipeline passed them through, so
  `dist/item.css` shipped 283 nested selectors. Safari below 16.5 cannot parse native nesting and
  dropped those rules. `postcss-nesting` now runs after `postcss-mixins` — the mixins can themselves
  emit nesting — leaving none in the built stylesheet.

  `.browserslistrc` gives autoprefixer an explicit floor in place of the implicit `defaults`.
  Safari/iOS 16.4 is the hard minimum, imposed by the unguarded `ElementInternals.attachInternals`
  calls in the interaction base classes.

  The same postcss config feeds the inline-css esbuild plugin, so shadow-DOM component styles get
  both behaviours too.

- [#191](https://github.com/Citolab/qti-components/pull/191) [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reject `load()` when the XML fetch fails.

  `qtiTransformTest().load()` and `qtiTransformManifest().load()` wrapped `loadXML` in a `new
Promise` that only ever called `resolve`. When the fetch failed — offline, CORS, a 404 — the
  rejection had no handler, so it escaped as an unhandled rejection and the promise the caller was
  awaiting never settled. A player awaiting `load()` hung there with no error to render and no way
  to retry.

  Both now `await loadXML` directly, so the failure propagates to the caller and an abort still
  surfaces as `AbortError`. Successful loads resolve with the api as before.

## 8.0.2

### Patch Changes

- [`46665d7`](https://github.com/Citolab/qti-components/commit/46665d7b8fca9a285089db230f1da8f65e1eed5d) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Make the published types usable from outside the workspace, and stop shipping a second copy of Lit.

  - **qti-components**: stop bundling Lit into the npm build. `noExternal` included `lit`, while `package.json` also declared it a dependency, so a consumer received the bundled copy _and_ installed one — and anything with its own Lit components ran two. Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them), two `@lit/context` registries, and lit's "Multiple versions of Lit loaded" warning, which counts registered instances rather than comparing versions. `lit`, `lit-html`, `lit-element` and `@lit/*` are now external for the npm build; the CDN builds still bundle everything, as they must.
  - **qti-components**: emit self-contained declarations. `dts: { resolve: true }` only inlines types behind bare specifiers, so the ~20 deep subpath imports of `@qti-components/*` — devDependencies, deliberately not published — stayed in the output. The runtime worked while the types were unresolvable, and consumers had to install those devDependencies by hand to type-check at all. The declaration build now resolves each specifier to the sibling package's built `.d.ts`; nothing but real runtime dependencies (`lit`, `@heximal/templates`) is left external.
  - **qti-components**: accept a React ref. The generated JSX types declared `ref` as the element or a callback taking it, which is right for a Lit template and wrong for React — and unfixable downstream, since the generator emits both `declare module "react"` and `declare global`, so a consumer's augmentation merges rather than replaces. `ref` now also accepts a `RefObject`.
  - **qti-item**, **qti-test**: type `itemURL` / `itemDoc` / `itemXML` and `testURL` / `testDoc` / `testXML` as `| null`. All six initialise to `null` while declaring a non-null type, which compiled only because the workspace builds without `strictNullChecks`. Consumers on `strict` were unable to pass the `null` these properties already hold — note that they now have to handle it.
  - **base**, **interactions-core**, **inline-choice-interaction**: take `PropertyValues` rather than `PropertyValues<this>` in `firstUpdated`, `willUpdate` and `updated`. The polymorphic `this` narrowed the parameter per subclass, which made every interaction structurally incompatible with `LitElement` — so `Constructor<LitElement>`, the standard constraint for a Lit mixin, rejected all of them and a consumer could not wrap an interaction in a mixin without casting.
  - **qti-test**: describe what `TestNavigationMixin` actually adds. Its interface placeholder was an empty `declare class`, so the returned `Constructor<…> & T` contributed nothing and `navigate`, `requestTimeout`, `postLoadTransformCallback`, `postLoadTestTransformCallback` and `navigateTo` were all erased from `QtiTest`'s public type — consumers had to intersect the class with `IQtiTest` by hand to describe one element. `ITestNavigationMixin` now carries them, plus the previously undeclared `getLoadingProgress`, and the mixin class `implements` it so the two cannot drift apart.
  - **qti-test**: drop `showLoadingIndicators` and `retryNavigation` from `ITestNavigationMixin`, and so from `IQtiTest`. Nothing implemented either — they existed only in the interface, and `retryNavigation()` would have thrown. No runtime behaviour changes, but code that referenced them in a type position will no longer compile.

## 8.0.1

### Patch Changes

- [`a861f1f`](https://github.com/Citolab/qti-components/commit/a861f1fc72b7185955cfbbaa8544b52e375453c4) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - - **qti-components**: give `./react` a real `default` condition next to its `types`, and emit the matching `dist/qti-components-jsx.js` stub during `cem:react-types`, so bundlers and `attw` can resolve the subpath instead of only type-resolving it.
  - **qti-components**: build `.d.ts` with `dts: { resolve: true }` and raise the tsup heap to 8 GB, so declarations that reference workspace types resolve instead of failing the build.
  - **qti-theme**: reorganize the CSS layers — move item structure into `styles/item-structure.css`, and restructure the native, prose, states and interaction (corrections, prompt, slider, position-object) stylesheets around it.
  - **qti-test**: export `qti-outcome-processing` and `qti-test-variables` from the components barrel; they were shipped but not reachable from the package entry.
  - **text-entry-interaction**: correct the `@csspart` documentation — document `answer` and `message`, and drop the `correct` part that no longer exists.

## 8.0.0

### Major Changes

BREAKING: the umbrella republished on top of the workspace's breaking batch. The umbrella bundles every `@qti-components/*` package into its own `dist`, so their breaking changes are breaking here.

#### Drop sizing and drag-and-drop internals

`interactions-core`, `theme`, `base`, `order-interaction`, `match-interaction`

- A drop is now either a **measured slot** or a **flat-floor card**, decided per interaction rather than per drop. Order's drops size from their chips instead of stretching to a grid track.
- **Six CSS custom properties removed:**

  | removed                        | use instead                                       |
  | ------------------------------ | ------------------------------------------------- |
  | `--qti-drop-min-height`        | `--qti-dropzone-min-height`                       |
  | `--qti-drop-min-width`         | `--qti-dropzone-min-width`                        |
  | `--qti-match-target-min-width` | `--qti-dropzone-min-width` (fallback `150px`)     |
  | `--qti-drop-gap`               | declare `gap` on your own `::part(drop)` rule     |
  | `--qti-dropzone-padding`       | declare `padding` on your own `::part(drop)` rule |
  | `--qti-form-size`              | `--qti-control-size`                              |

- The `qti-droppable` **attribute is gone**; drop targets carry the custom state `:state(droppable)` only. Migrate `[qti-droppable]` and `:state(drop)` → `:state(droppable)`.
- New exports from `interactions-core`: `DropzoneAutoSizeMixin`, `MenuAutoSizeMixin`. Both re-measure on resize and mutation, so a late-loading image no longer leaves a drop the wrong size.
- `DragDropSlottedMixin`'s unreachable `configuration` object is removed, and `applyDropzoneAutoSizing`'s trailing `hostWindow` parameter moved into `options`.

See `packages/qti-theme/DROP-SIZING.md` for the full model.

#### `qti-match-interaction` tabular mode

The `<table>` / `<tr>` / `<td>` scaffolding is replaced by a CSS grid with subgrid wrappers, sharing its shadow structure with the editor's tabular implementation. Input cells are now `<label>`-wrapped, so clicking anywhere on a cell toggles it.

- `::part(table)` → `::part(grid)`
- `::part(row)` → `::part(input-cell)` (or drop it; rows are no longer a styled boundary)
- `::part(checkmark)` is gone — the checkmark is drawn by the `check-checkbox-checked` mask
- `--qti-match-rows` / `--qti-match-cols` are now written on the inner `[part='grid']`, not on the host

#### `qti-inline-choice-interaction`

The open control renders as one shape, and autosizing measures option rows rather than the menu — fixing a control that grew by one chevron on every open, and one that came out ~60px too wide. The measured width is written on `::part(trigger)`, not the host. The anchor is renamed `--qti-inline-choice-trigger` → `--qti-inline-choice-anchor`. Consumer CSS reaching into the old trigger/menu structure needs revisiting.

Four component-local custom properties removed in favour of shared tokens: `--qti-inline-choice-overlay-z-index` → `--qti-overlay-z-index`, `--qti-inline-choice-popover-z-index` → `--qti-popover-z-index`, `--qti-inline-choice-motion-duration-fast` → `--qti-motion-duration-fast`, `--qti-inline-choice-trigger-gap` → `--qti-glyph-gap`.

#### `item.css`

Ships from `@qti-components/theme` 2.0.0, which carries the removed custom properties and the retargeted parts above.

### Minor Changes

- **Portable custom interactions** now receive `responseDeclaration` and `status` in their `getInstance` configuration, so a PCI can render the correct response itself instead of having it pushed in as a candidate response. `correctResponse` is only sent when `status` is `solution` or `review`. Implements the design agreed in [1EdTech/qti-project-management#210](https://github.com/1EdTech/qti-project-management/issues/210).
- **The theme covers editor documents.** `reset.css` is scoped to `.ProseMirror` as well as `qti-item-body`, and a new `prose.css` gives plain author markup (tables, lists, headings, rules) a look.
- **Shared `correct-response` codec** extracted into `@qti-components/base` (`parseCorrectResponseAttribute` / `serializeCorrectResponseAttribute` and value-shape helpers), so the runtime and downstream editors cannot drift.
- `::part(drag)` selectors added for associate, match, order, gap-match and graphic-gap-match, letting host applications style a placed fake-drag element with the same declarations as runtime drags.

### Patch Changes

- **The drag clone stays visible in fullscreen.** `createDragClone` now resolves its host instead of assuming the interaction's root, and corrects for a containing block that establishes a new coordinate space for `position: fixed` children.
- **A placed chip can shrink to its drop**, so it is the same box in the bank and in the drop when the bank is narrower than the chip's label (`flex: 0 0 auto` → `0 1 auto`).
- **PCI show-correct-response repaired** — the correction viewer no longer clones the live iframe or relies on an instance-level `connectedCallback`, and no longer duplicates the original's `id`.
- **Inline-choice answers the internal correct-response mode with the full variant**, matching text-entry, instead of painting a competing `part="correct-option"` marker that blanked the candidate's answer. The withholding rule is now an overridable `withholdsFullCorrectResponseWhenCorrect` hook.
- **The PCI iframe is built with `srcdoc`** instead of a `blob:` object URL, so a player serving package resources through a Service Worker sees the interaction's requests. `<base href>` now points at `data-base-url` rather than the site origin.
- `::part(drag)` selectors no longer silently drop in Chrome — an in-list CSS comment made Chrome's nesting parser discard the selector that followed it.

### Vocabulary

Three non-spec `qti-`-prefixed presentation classes removed — `qti-layout-offset12`, `qti-choices-stacking-6`, `qti-input-width-5` — and two internally-minted ones moved to the `cito-` prefix: `qti-dialog` → `cito-dialog`, and `qti-graphic-order-marker` → `cito-graphic-order-marker`. The last is applied to light-DOM children, so **any downstream stylesheet targeting `.qti-graphic-order-marker` must be updated**. The `qti-` prefix is reserved by 1EdTech for standardized vocabulary maintained outside the schema, so minting names inside it risks a silent collision.
