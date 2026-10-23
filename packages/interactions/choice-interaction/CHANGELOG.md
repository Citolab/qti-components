# @qti-components/choice-interaction

## 1.2.0-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.2.0-next.2

### Minor Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Items read more comfortably by default: a taller line height, columns that start level, choices aligned with the prose, and air around inline fields.

  - **Line height.** `qti-item-body` sets `line-height: var(--qti-line-height)`. Browsers and normalize sheets leave it at about 1.15, which put every sentence against the next. The token is derived from the height of an inline field (a field line, plus its block padding and border, about 30px for 16px text), so a line holding a text entry is no taller than the lines around it. Rendered items only: an editor document keeps its own. Re-value `--qti-line-height` to change it, or set it to `normal` to get the old look back. **Items get taller**, from 2% for a short item to about 30% for a matrix or a hottext, so a host that fixes the height of an item box may need more room.
  - **Aligned tops.** A `qti-prompt` no longer carries space above itself, and the first child of a `qti-layout-col*` starts at the column's top edge. Side-by-side columns line up whatever opens them: a heading, a paragraph or an interaction.
  - **Inline elements.** `qti-text-entry-interaction`, `qti-inline-choice-interaction` and `qti-gap` get `var(--qti-inline-gap)` of margin on both sides (a quarter of the spacing unit), so they no longer touch the words around them. Text entry and inline choice also take a block padding of `var(--qti-inline-padding-block)` (a quarter of the spacing unit, not a whole one), so the line holding a field stays close to the height of the lines around it. Both tokens are re-valued on the host or any ancestor.
  - **Choices line up with the text.** A choice with a visible control is pulled out by the room it reserves for its selected paint (`--qti-choice-outdent`, its padding plus its border), so the radio or checkbox sits on the same edge as the paragraphs around it and the selected paint reaches into the gutter. Set `--qti-choice-outdent: 0` for the old indent, or inside a box that clips its content.
  - **Choice spacing.** `qti-choice-interaction` no longer puts a fixed `10px` between its choices: its gap is `--qti-choice-gap`, `0` by default, because each choice's own padding already spaces a list. The theme sets it to the spacing unit for choices drawn as boxes (`qti-input-control-hidden`), where the visible borders need air between them.

  The Kennisnet VRT baselines are regenerated: every item is 8px to 310px taller, and stacked choices sit one padding further left, level with the prompt.

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.6-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.1.6-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0
