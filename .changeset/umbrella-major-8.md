---
'@citolab/qti-components': major
---

BREAKING: 8.0.0 — the umbrella republished on top of the workspace's breaking
batch. The umbrella bundles every `@qti-components/*` package into its own
`dist`, so their breaking changes are breaking here; this changeset exists
because a devDependency link does not bump a dependent, and without it the
umbrella would keep version 7.28.1 and never be republished at all.

What changed, from an umbrella consumer's point of view — see the per-package
changesets in this release for the full detail and rationale:

**Drop sizing and drag-and-drop internals** (`interactions-core`, `theme`,
`base`, `order`, `match`)

- A drop is now either a measured slot or a flat-floor card, decided per
  interaction. Order's drops size from their chips instead of stretching to a
  grid track.
- Six CSS custom properties removed: `--qti-drop-min-height`,
  `--qti-drop-min-width`, `--qti-match-target-min-width`, `--qti-drop-gap`,
  `--qti-dropzone-padding`, `--qti-form-size`. Migrate to
  `--qti-dropzone-min-height` / `--qti-dropzone-min-width` /
  `--qti-control-size`, or declare `gap` / `padding` on your own
  `::part(drop)` rule.
- The `qti-droppable` attribute is gone; drop targets carry the custom state
  `:state(droppable)` only. Migrate `[qti-droppable]` and `:state(drop)` →
  `:state(droppable)`.
- New exports from `interactions-core`: `DropzoneAutoSizeMixin`,
  `MenuAutoSizeMixin`. `DragDropSlottedMixin`'s unreachable `configuration`
  object is removed, and `applyDropzoneAutoSizing`'s trailing `hostWindow`
  parameter moved into `options`.

**`qti-match-interaction` tabular mode** — the `<table>` scaffolding is replaced
by a CSS grid. `::part(table)` → `::part(grid)`, `::part(row)` →
`::part(input-cell)`, `::part(checkmark)` is gone, and `--qti-match-rows` /
`--qti-match-cols` are now written on the inner `[part='grid']` instead of the
host.

**`qti-inline-choice-interaction`** — the open control renders as one shape and
autosizing measures rows rather than the menu; consumer CSS reaching into the
old trigger/menu structure needs revisiting.

**`item.css`** — ships from `@qti-components/theme` 2.0.0, which carries the
removed custom properties and the retargeted parts above.
