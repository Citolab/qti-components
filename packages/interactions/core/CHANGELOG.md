# @qti-components/interactions-core

## 2.2.0-next.3

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A choice selects the moment it is pressed.

  - **`qti-simple-choice` activates on `pointerdown`** (primary button), not on release: holding a choice down already shows it selected. The `click` that follows is swallowed, so a checkbox does not toggle back. Keyboard (Space, Enter) and a programmatic `.click()` work as before. A choice used as a drag chip (order interaction, `qti-draggable`) still waits for the click, because there a press starts the drag. `ActiveElementMixin` takes this as an option, `ActiveElementMixin(Base, type, { activateOn: 'press' })`; the default stays `'click'`.
  - **No grey press tint on choices and chips.** The selection is a choice's press feedback now, and a chip's is its drag; the `:active` wash on top of either is gone. The test controls keep theirs, because they act on release.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Words on an image, and points in the right place.

  - **Select point:** a response given in the markup (`response="203 159"`) now shows its marker where it belongs. It was rendered before the image's size was read and placed against a width of 1, thousands of percent off the image.
  - **Graphic gap match with words:** a `qti-gap-text` chip is a label box, the inline-field box that gap-match chips have, in the bank and once placed on the image; an image tile (`qti-gap-img`) stays plain. A placed word carries the part `drag drag-text` (new) next to `drag`, so a theme can tell a word from a tile. A placed chip no longer shrinks in a hotspot narrower than it (`qti-associable-hotspot`). An empty hotspot shows a dashed edge at rest, unless the interaction has `qti-unselected-hidden`.
  - **Select point marker on any picture:** the marker gets a halo that follows its colour, white round a dark marker and black round a light one (lightness below or above 0.7, derived with relative colour syntax), so it stays visible on a dark or busy image. Set the colour with the new optional input `--cito-color-marker` (the primary by default) and the shape with `--cito-icon-marker` (a mask; the pin by default), with `--cito-marker-anchor` saying where that shape points: `-100%` stands it on the point by its bottom, like the pin, `-50%` centres it, for a ring or a star. `--qti-select-point-halo` overrides the derived halo. The marker's shape is now drawn by its `::before`, so the halo can follow it.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - One focus ring, and a neutral border by default.

  - **Neutral border.** `--qti-border-color` is a grey derived from the base colours (`color-mix(in oklab, var(--cito-color-base-content) 45%, var(--cito-color-base-100))`, about 3.3:1 on white) instead of the primary colour, so fields, choices, tables and drops are no longer drawn in the brand blue at rest. The primary still marks what is active or selected. A brand that wants its colour on every edge sets `--qti-border-color: var(--qti-primary)`, as the Kennisnet sheet now does.
  - **One focus ring.** `@mixin foc` is an `outline` (`--qti-focus-border-width` in `--qti-focus-color`, now the primary colour, `--qti-focus-offset` outside the box) on `:focus-visible`, not a `box-shadow` on `:focus`. A mouse click on a choice or a chip no longer shows a ring, and a focused chip keeps its lift. The theme no longer writes `outline: none` anywhere.
    - A text entry is ringed on its host (`:focus-within`), around the border you see; the input inside draws no ring of its own (Chrome drew an orange one). An extended text is ringed on its textarea, an inline choice on its trigger, pushed out past the field's border (`--qti-focus-offset-past-border`) so it sits where a text entry's does. Rows in the inline choice menu are ringed inside (`--qti-focus-offset-inset`), because the menu clips.
    - A choice with a radio or checkbox shown rings the control, as a native one does. A choice drawn as a box (`qti-input-control-hidden`) rings the whole box.
    - A stacked choice is pulled out by the ring's reach less (`--qti-choice-outdent`), so the ring round its radio stays inside the column.
    - Associate's bank chip gets the theme's ring; before, only a placed chip did.
  - **`qti-simple-choice` takes focus on its host.** It no longer delegates focus into its shadow root, and its `part="control"` no longer has a `tabindex`. The host already carried `tabindex="0"` and handled the keys. Delegating meant the host never matched `:focus-visible`, so a theme could not ring it, and a choice whose control is hidden (`qti-input-control-hidden`) had nothing to delegate to and could not be reached with Tab at all. `document.activeElement` is the choice, as before.

  The two Kennisnet multiple-choice VRT baselines are regenerated: their radios and checkboxes sit 4px further right, inside the prose edge, so a focus ring round them stays inside the column. Nothing else in the suite moved.

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - The chip you drag is opaque and raised.

  - **No more half-transparent clone.** The drag code no longer writes `opacity: 0.8` on the clone, and a dropped chip no longer fades in from 0.8. It also no longer copies the chip's resting `box-shadow` onto the clone inline, where it outranked the theme.
  - **The theme raises it.** A chip in flight (`[data-drag-clone]`) takes `--qti-drag-elevation`, a soft shadow from the text colour. Set your own with the new optional input `--cito-shadow-drag` (any `box-shadow`, `none` for flat). A graphic-gap-match image tile stays as it is.

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - A disabled interaction looks disabled.

  - **Disabled paints in one muted grey**, `--qti-color-disabled` (40% of the text colour into the surface): its text, edges, controls, chips and handles, and the mark of what is selected, which stays visibly selected. Not opacity, which faded the selected answer with the rest and let the background through. It applies to every interaction with the `disabled` attribute and to a single choice with `:state(disabled)`, by re-valuing the paint tokens on that element (`interactions/qti-disabled.css`). Before, only the cursor changed. Corrections still show their verdict colours.
  - **Readonly is unchanged**: full look, only the cursor, so an answered test in review stays readable.
  - **A disabled choice takes no focus** from a mouse press (`ActiveElementMixin`), as a disabled native control does; before, a click on it showed the focus ring.

## 2.1.4-next.2

### Patch Changes

- [#305](https://github.com/Citolab/qti-components/pull/305) [`f700c5d`](https://github.com/Citolab/qti-components/commit/f700c5d4d0acd4219797211b1078c539fa43c62c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Graphic gap match: when the graphic is drawn narrower than its declared width, the drop areas and the gap images now scale with it. The measured chip size no longer acts as each hotspot's minimum size (a hotspot's box is its `coords`), gap images scale by the graphic's factor (`--qti-graphic-scale`) in the bank and in the hotspot, and the drag clone accounts for that zoom so a drop lands where it is aimed.

## 2.1.4-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1

## 2.1.4-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0

## 2.1.3

### Patch Changes

- [#215](https://github.com/Citolab/qti-components/pull/215) [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54) Thanks [@BrianCitolab](https://github.com/BrianCitolab)! - Support `shape="default"` area map entries, which neither render nor score.

  A `default` area is the whole image. QTI 3.0 §7.9 ends its coords list with "default: no
  coordinates should be given", but the XSD makes `coords` `use="required"`, so real items carry
  filler — `0,0,100%,100%` in Citolab/qti-components#83. Both places that read an area treated that
  filler as geometry:

  `positionShapes` knew `circle`, `rect`, `ellipse` and `poly`, so a `default` entry fell to its
  `default:` branch, logged `Unsupported shape: default` and wrote no styles at all — showing the
  correct response left the area in the DOM with no size, invisible. It now spans the image, and the
  coords are deliberately not read: HTML, where the vocabulary comes from, settles it with "This area
  is the whole image. (The coords attribute is not used.)"

  `ScoringHelper.isPointInArea` had a `case 'default'` folded in with `case 'circle'`, which demands
  exactly three coords, so it rejected every real entry as an `Invalid circle definition` and a click
  outside the other areas scored nothing. `default` now returns true for any point without reading
  coords.

  A whole-image area overlaps every other area, which made a missing `break` in
  `qti-map-response-point` reachable for the first time: a point inside a smaller area scored that
  area _and_ the catch-all. §7.4 — "each area is tested in turn, with those listed first taking
  priority in the case where areas overlap and a point falls in the intersection" — so matching now
  stops at the first area containing the point.

- [#214](https://github.com/Citolab/qti-components/pull/214) [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix a dropped picture rendering low and hanging out of its hotspot in `qti-graphic-gap-match-interaction` ([#213](https://github.com/Citolab/qti-components/issues/213)).

  `qti-gap-img` never called `super.connectedCallback()`, so Lit never enabled updating and the element had no shadow root — which made `qti-gap-img.styles.ts`, the stylesheet that centres the picture, dead code. The source already carried a note saying exactly that. Without it the authored `<img>` / `<object>` was laid out as an inline replaced element on a text baseline rather than centred: it sat low in the chip with the line box's descender space below it.

  On the 1EdTech "Airport Tags" example, whose hotspot `A` is authored `coords="12,108,39,121"` (27x13) around an 18x9 picture, the picture rendered 7px down from the hotspot top, 2.5px below its centre, with its bottom 3px past the box. The chip also measured 18px tall for a 9px picture, and that measurement feeds `--qti-dropzone-min-height` — so the hotspot itself was inflated to 27x18 and the box on screen was not the box in the item either.

  `qti-gap-img` now calls `super.connectedCallback()` and renders a `<slot part="label">`, matching `qti-gap-text`, the sibling chip that always did this correctly. The chip is the size of its picture, the hotspot keeps the size its `coords` declare, and the picture lands centred inside it.

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix `qti-graphic-order-interaction` on the QTI 3 spec form of an ordering item ([#209](https://github.com/Citolab/qti-components/issues/209)). Two defects, either of which broke it on its own.

  **RESPONSE ignored the candidate's ordering.** The interaction only wrote `aria-ordervalue` on each hotspot; the response itself was published by `ChoicesMixin` as the set of _checked_ choices in **DOM order** — the one thing an ordering must not do. `ChoicesMixin.maxChoices` also defaults to `1`, so each click cleared the previous hotspot and made the interaction a `radiogroup` of `radio`s. Clicking A, D, C, B left `RESPONSE` as the single identifier `"B"` where the `ordered` cardinality declaration expects `["A","D","C","B"]`, so response processing never scored the item — while the pins painted 1-2-3-4 and made it look right.

  The response is now the ordering: `max-choices` defaults to `0` (no limit, QTI's default for an ordering), the interaction publishes the ordered identifier list itself, and pins plus `aria-ordervalue` are derived from the response rather than kept as a second copy of it. Deselecting a hotspot renumbers the rest by falling out of the array, and a response set from anywhere else — a restored attempt, a correct-response display, an author setting the property — now repaints the pins.

  **An `<object>` graphic left every hotspot unpositioned.** QTI 3 carries the graphic as `<object type="image/png" data="…">`, which is what the spec's own graphic interaction examples use, but the hotspots were positioned against `querySelector('img')`. On a spec-form item that is `null`, `positionShapes` threw, and no hotspot got a position — so all of them collapsed onto the theme's `100%x100%` and stacked as one large box below the graphic. Only items that had been through a converter rendered at all.

  `findGraphic` now accepts `<img>` and `<object type="image/*">` alike, and `positionShapes` resolves the coordinate space from either — including the two forms where the attributes cannot supply it. `width`/`height` are **optional** on the QTI `<object>` (only `data` and `type` are required), so a graphic that declares no size falls back to the bitmap's own, probed by loading the same URL and cached per element. And QTI's `LengthDType` is `[0-9]+%?`, so `width="50%"` is valid markup on either form: a percentage is a layout instruction, not a coordinate space, and reading it as `50px` used to push every hotspot off the graphic — it now falls back to the intrinsic size too. A graphic whose size cannot be resolved at all is reported instead of silently writing `NaN%` and leaving the hotspots full-size.

  `qti-hotspot-interaction`, `qti-graphic-associate-interaction` and `qti-select-point-interaction` make the same `img`-only assumption and are not covered here.

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/base@2.3.0

## 2.1.2

### Patch Changes

- [`1252a5b`](https://github.com/Citolab/qti-components/commit/1252a5b0f6c9dc1205101ab9844729c6a9e2918c) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Fix drops being refused by a drop target that spans the full width of its interaction.

  `closestCornersWithInventoryPriority` — the default collision algorithm for slotted drag-drop — ranks zones by **average corner distance**, which grows with a zone's own dimensions: the corners of a wide target are far from the drag even when the drag sits dead centre in it. The inventory container then won the `distance <= droppableDistance * 1.5` comparison, so the chip animated back to the source set and the response stayed empty.

  A `qti-match-interaction` whose second match set holds a single target hit this every time, because one target renders full-width. That is the item reported in [#145](https://github.com/Citolab/qti-components/issues/145): four image choices and one "The biggest obtuse angle" target that nothing could be dropped into.

  The closest droppable now wins outright when the drop point is inside it, which is size-independent — mirroring the absolute priority the inventory container already had for the same test. Scoped to the closest droppable on purpose: it settles droppable-vs-inventory and never which droppable wins, so overlapping targets (a filled `qti-associable-hotspot` grown over its neighbour, say) stay the corner ranking's business.

## 2.1.1

### Patch Changes

- [`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b) Thanks [@herrKlein](https://github.com/herrKlein)! - Fix the drag-handle grip rendering off-centre on `qti-gap-text` chips and `qti-simple-associable-choice` chips (used by gap-match, associate and match interactions).

  The grip is a theme-drawn `::before` on `::part(control)`, centred with `vertical-align: middle` — a line-box/font-metric alignment, not a geometric one. `qti-gap-text` and `qti-simple-associable-choice` gave their `control` div no layout of its own, so the glyph's position drifted with font/line-height. `[part='control']` now flex-centres its content (`display: flex; align-items: center; justify-content: center`), matching the fix `qti-simple-choice` already had for its own control.

- Updated dependencies [[`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/base@2.2.0

## 2.1.0

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

### Patch Changes

- Updated dependencies [[`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9)]:
  - @qti-components/base@2.1.0

## 2.0.1

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
