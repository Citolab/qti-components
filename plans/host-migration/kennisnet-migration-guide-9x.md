# Migrating to @citolab/qti-components 9.x

From `@kennisnet/qti-components` 7.28.1 (a republish of `@citolab/qti-components`) to
`@citolab/qti-components` 9.3+. Written for a developer or a coding agent working in this repository.

Prepared by the qti-components team from a source snapshot of 2026-10-09. We could not install the
private packages (`@kennisnet/*`, FontAwesome Pro), so we could only typecheck the QTI layer
(`projects/shared/src/lib/qti`, `projects/shared/src/lib/player`, `projects/player/src/app/qti`).
**Nothing here has been run in a browser.** Verify every step as described.

## Part 1 — already applied (patches 0001–0005 in `kennisnet-patches/`; 0006 adds this guide)

| Commit                                                       | What                                                                                                                                                                    | Verify                                                                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `deps: use @citolab/qti-components …`                        | `"@kennisnet/qti-components": "npm:@citolab/qti-components@^9.3.0"`. All imports keep their name.                                                                       | `npm install` (regenerates `package-lock.json`); `ng build`                                                                       |
| `qti: register the elements from the corrections entry`      | `app.ts` imports `@kennisnet/qti-components/corrections` instead of the root.                                                                                           | After "Nakijken" and after submit, the candidate correction and the answer key show as before. Without this they silently do not. |
| `qti: type the test config …`                                | `configContext` typed `ConfigContext & CorrectionConfig`; `disableAfterMaxReached`.                                                                                     | `tsc` passes (it did for us on the QTI layer).                                                                                    |
| `qti: drop cache-transform`                                  | The attribute was removed in 8.0 and did nothing.                                                                                                                       | —                                                                                                                                 |
| `styles: follow the renamed custom states and CSS variables` | `:state(--checked)` → `:state(checked)`, `--qti-form-size` → `--qti-control-size`, `--qti-gap-size` → `--qti-gap`, `--qti-drop-min-width` → `--qti-dropzone-min-width`. | Checked choices and hottext look selected.                                                                                        |

## Part 2 — replace the workarounds (not applied; do one at a time and check visually)

### 2.1 Load the library theme inside the test (do this first)

The player never loads `@qti-components/theme`. It injects its own `qti-styles.css` into
`test-container.shadowRoot` (`player/src/app/components/player.ts:188-226`). Most workarounds below
exist because the theme is missing: the theme draws the drag grip, the correction badges and the
states.

- Put the theme in front of your own styles in the bundle you inject. The library ships it as
  `@kennisnet/qti-components/item.css` (with the alias: `node_modules/@kennisnet/qti-components/dist/item.css`);
  add that file as the first input of the `qti-styles` bundle in `angular.json` (line ~264), before
  `qti-styles.scss`. Do not use the separate `@qti-components/theme` 1.x you depend on now; it is two
  majors behind (current: 2.2).
- Put your own rules in `@layer qti-extended { … }`. The theme leaves that layer empty for hosts, so
  you win without `!important`.
- Set tokens on `test-container { … }` (you already use `:root, test-container` in `qti-vars.scss`).
  `:root` alone does not reach into the shadow root.
- Optional, supported route instead of the manual injection:
  `<test-container><template><style>…</style></template></test-container>`; the container stamps the
  template into its shadow root.

Verify: every interaction type in a formative and a summative test, before and after "Nakijken".

### 2.2 Drag handle (`shared/src/lib/qti/item/draggables.ts:17-59`, `match-interaction.scss:9-25`, `gap-match-interaction.scss:1-9`)

With the theme loaded, every draggable chip gets a grip from `--qti-grip-mask` (painted in
`currentColor`). Remove the `<i class="drag-handle fas fa-grip-vertical">` injection and the
`.draggable` / `.drag-handle` CSS. To keep the Font Awesome glyph, set
`test-container { --qti-grip-mask: url("data:image/svg+xml,…fa-grip-vertical…"); }` the same way
`icon-mask-css-vars.ts` sets `--fa-check-mask`. Chips: `:state(drag)`; dropped chips:
`::part(drag)`; while dragging: `:state(dragging)`; the floating clone: `[data-drag-clone]`.

Note: the injected `<i>` probably draws nothing today (no Font Awesome webfont in the shadow root).

### 2.3 Correction on draggables (`draggables.ts:6-15, 60-78`, `item/state-node.ts`, `buttons.scss:183-228`)

Do not read `element.internals.states`; it is internal. Style the states instead:
`:state(candidate-correct)`, `:state(candidate-incorrect)`, `:state(candidate-partially-correct)`,
and the badges `::part(correction-correct)`, `::part(correction-incorrect)`,
`::part(correction-partially-correct)`. The icons come from `--qti-check-mask`, `--qti-times-mask`
and `--qti-partial-mask`; point them at your `--fa-check-mask`, `--fa-times-mask`, `--fa-minus-mask`
if you want your glyphs. Then remove the `btn-qti-*` classes and the injected `.state-icon`.

`span.correct-option` no longer exists (8.0): the answer key is shown as a clone of the interaction.
Remove the code and CSS for it (`draggables.ts:6-15, 28-34`; `.correct-option` in
`match-interaction.scss:5`, `gap-match-interaction.scss:28`).

### 2.4 Answer key (`test-container.ts:22-111`, `response-heading.ts`, `qti-styles.scss:28-47`)

The answer-key clone carries the attribute `answer-key` (and `inert`): style it with
`qti-*-interaction[answer-key]`. The wrapper `div.full-correct-response(-block|-inline)` still exists
but is not a supported contract. The library renders no heading; keep `response-heading.ts` if you
want one, but expect to target `[answer-key]` later.

With 2.2 and 2.3 done, the MutationObserver in `test-container.ts` no longer needs
`adjustDraggables`; remove what is left over.

### 2.5 Select point (`item/select-point-interaction.ts:20-58`, `select-point-interaction.scss`)

The marker is now built in and customisable; remove the observer and the `innerHTML` pin. Set on the
element itself (these tokens live on the component's `:host`, not on an ancestor):

```css
qti-select-point-interaction {
  --qti-select-point-icon: url('data:image/svg+xml,…your pin…'); /* used as a mask */
  --qti-select-point-marker-size: 2rem;
  --qti-select-point-marker-anchor: -100%; /* -100% = pin tip on the point, -50% = centred */
  --qti-select-point-marker-color: var(--info-color);
}
```

With the corrections entry loaded, a marker is `::part(point correct)` or `::part(point incorrect)`
and turns `--qti-correct` / `--qti-incorrect` by itself. The instruction text
(`select-point-info`, lines 77-85) is your own UX; keep it.

### 2.6 Extended text (`item/qti-extended-text-interaction.ts`, `player.ts:284-351`)

Manual scoring is yours, so the `correct` / `partiallyCorrect` / `incorrect` host classes stay. Do not
inject into the interaction's shadow root; put the icon next to the element, or style
`::part(textarea)` with a background mask. `player.ts:284-351` queries `document` and cannot reach
into the test container: it does nothing; remove it.

### 2.7 Order interaction parts (`order-interaction.scss`)

The current parts are `container`, `drags`, `drag`, `drops`, `drop`, `message`. `::part(drop-list)`
and `::part(qti-simple-choice)` no longer exist. `qti-simple-choice[style*='opacity: 0']` depends on an
inline style the library sets while dragging; use `:state(placeholder)` / `:state(dragging)` instead.

### 2.8 Modal feedback (`player/src/app/qti/custom-qti-modal-feedback.ts`)

Subclassing `QtiFeedback` with `extendElementName` stays supported. Do not write to `_context` (it is
read-only now); `checkShowFeedback()` is still public. A modal no longer opens when stored defaults
are restored before any attempt; keep re-applying stored outcomes with `setOutcomeVariable`.
The built-in dialog is `qti-modal-feedback::part(feedback)`.

### 2.9 State and scoring (`store/events.ts`, `store/mutators.ts:128-161`, `actions/check-item.ts`)

- Recommended: save from `qti-state-changed` (or `qtiTest.state`) instead of
  `qti-test-context-updated`; restore with `qtiTest.state = saved`, before or after load. Then the
  hand-rebuild in `mutators.ts:128-161` can go.
- `updateItemVariables` now fires reliably; remove the workaround (`check-item.ts:34-38`).
- `href` is not in the state; read it from the `qti-assessment-item-ref`.

### 2.10 Other

- `disabled` / `readonly` on the item now follow the item context and apply from the first render.
  Style with `:state(disabled)` / `:state(readonly)`. `aria-disabled` is no longer reflected as an
  attribute; check that `qti-match-interaction:disabled` and `qti-gap-match-interaction:disabled`
  (`match-interaction.scss:14`, `gap-match-interaction.scss:1`) still match, otherwise switch them to
  `:state(disabled)`.
- Remove the empty MutationObservers in `qti/qti-test.ts:90-105` and `qti/test-navigation.ts:18-28`.
- `:host(.qti-choices-bottom) slot` (`match-interaction.scss:1`) resolves to the test container's host
  and never applies.

## CSS variables

Renamed in part 1. **Removed, no replacement** — still set in `qti-vars.scss`, now without effect:
`--qti-hover-bg`, `--qti-disabled-bg`, `--qti-disabled-color`, `--qti-validation-error-bg`,
`--qti-validation-text`, `--qti-order-size`, `--qti-drop-border-radius`, `--qti-dropzone-padding`
(put `padding` on your own `::part(drop)` rule).

**Changed form:** `--qti-padding-vertical` / `--qti-padding-horizontal` → one shorthand,
`--qti-padding-box` (`<vertical> <horizontal>`), derived from `--qti-spacing`.

**Still the same:** `--qti-correct(-light)`, `--qti-incorrect(-light)`, `--qti-partially-correct(-light)`,
`--qti-bg`, `--qti-bg-active`, `--qti-focus-color`, `--qti-border-*`, `--qti-focus-border-width`,
`--qti-selected-bg`, `--qti-selected-color`.

**New and useful here:** `--qti-primary`, `--qti-success`, `--qti-warning`, `--qti-error`, `--qti-info`
(palette — map your `--success-color` etc.), `--qti-spacing`, `--qti-answer-fg|bg|border` (answer
key), `--qti-check-mask`, `--qti-times-mask`, `--qti-partial-mask`, `--qti-grip-mask`,
`--qti-select-point-*`, `--test-button-*` (test controls).

**Hard-coded values that should become tokens:** `#9b77a9` (border), `#f9fafb`, `#bddcff7e` (focus)
in `qti-vars.scss`; `white` on `::part(ch|cha)` in `choice-interaction.scss`; the order badge geometry
(`-8px`, `25px`, `14px`) in `order-interaction.scss`; the select-point pin sizes and the extended-text
icon offsets set as inline styles in TypeScript.

## Coming next (no action yet)

Public events get the prefix `cito-` (for example `qti-request-navigation` → `cito-test-navigate`,
`on-test-switch-view` → `cito-test-switch-view`). The current names keep working next to the new ones
until the next major. `on-test-switch-view` and `test-show-candidate-correction` will also get a
`view` property and a `showCandidateCorrection()` method on the test.
