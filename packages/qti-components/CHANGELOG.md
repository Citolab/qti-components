# @citolab/qti-components

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
