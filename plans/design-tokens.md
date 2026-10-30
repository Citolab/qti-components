# Design tokens: one source for the tier-1 inputs

Roadmap phase 12. Decisions go into qti-theme `CONTRACT.md` §8 (token tiers); this file is deleted
when the phase ships.

## Why

The tier-1 inputs (`--qc-*`, CONTRACT §8) are listed by hand in six places, and they drift: the
Theming page still set `--qti-spacing` after the rename to `--qc-spacing`, and it lacked ten of the
inputs until 2026-10-28.

| Where                                                                                       | What it holds                                                                         |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `packages/qti-theme/CONTRACT.md` §8                                                         | the list, by group, with the optional ones                                            |
| `packages/qti-theme/src/styles/qti-theme/qti-variables.css`, first group                    | each input read once into a `qti-` name, with its default and the `--cito-*` fallback |
| `packages/interactions/select-point-interaction/src/qti-select-point-interaction.styles.ts` | `--qc-marker-anchor` and `--qc-icon-marker`, read in the component                    |
| `apps/e2e/src/stories/theming/theme-editor.stories.ts`                                      | a control per input, with its group, type and range                                   |
| `.storybook/themes.css`                                                                     | the presets (Default, Light, Dark, Kennisnet, Cito) as values                         |
| `apps/site/src/content/docs/guides/styling.mdx`                                             | the docs site's table                                                                 |

## The standard

The W3C Design Tokens Community Group's specification, first stable version 2025.10 (2025-10-28). It
is a Community Group report, not a W3C Recommendation; Style Dictionary 4, Tokens Studio and Figma's
variable export read or write it.

- [Format Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/):
  a JSON file (`.tokens` or `.tokens.json`, `application/design-tokens+json`) of groups and tokens;
  each token has `$value`, `$type`, optional `$description`, `$deprecated` and `$extensions`
  (reverse-domain keys, kept by tools that don't understand them). Aliases are `{group.token}`.
  Types: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`; composite
  `strokeStyle`, `border`, `transition`, `shadow`, `gradient`, `typography`.
- [Resolver Module 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-resolver-20251028/):
  how sets and modifiers combine into one resolved set, which is what our presets and light/dark are.
- Color Module 2025.10: colour spaces for `color` values; check its status before relying on `oklch`.

## Mapping

| Input                                                                                          | `$type`       | Note                                                                      |
| ---------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `--qc-color-*`                                                                                 | `color`       | our defaults are `oklch()` and `light-dark()`; see "To find out"          |
| `--qc-radius-*`, `--qc-spacing`, `--qc-size-field`, `--qc-size-drag-icon`, `--qc-border-width` | `dimension`   | `rem` and `px`                                                            |
| `--qc-size-selector`                                                                           | `dimension`   | in `em`, which the format may not allow                                   |
| `--qc-font-family`, `--qc-font-family-heading`                                                 | `fontFamily`  |                                                                           |
| `--qc-line-height`, `--qc-depth`, `--qc-motion`                                                | `number`      |                                                                           |
| `--qc-border-style`                                                                            | `strokeStyle` |                                                                           |
| `--qc-shadow-chip`                                                                             | `shadow`      | the default is a `calc()` over other tokens, so it stays in the CSS       |
| `--qc-icon-drag`, `--qc-icon-marker`, `--qc-marker-anchor`                                     | none          | a `url()` mask and a percentage; kept in `$extensions` or out of the file |
| `color-scheme`                                                                                 | none          | a CSS property, not a token; a resolver modifier (light, dark)            |

Our extensions under `$extensions["nl.cito.qti-components"]`: the group (Surface, Brand, …), core or
optional, the `--cito-*` fallback name, and the editor's control (range, step).

## Proposal (not decided)

- `packages/qti-theme/src/tokens/qc.tokens.json` holds every tier-1 input with its default and
  description. It is the only place a tier-1 name or default is written.
- One build step (`tools/build/`) generates from it:
  - the first group of `qti-variables.css` (the `var(--qc-x, var(--cito-x, default))` lines);
  - the CONTRACT §8 table and the docs site's table (between markers, so the prose stays hand-written);
  - a typed list the Theming page builds its controls from.
- The presets become token files resolved by the Resolver Module (`presets/kennisnet.tokens.json`, …);
  `.storybook/themes.css` is generated from them.
- `@qti-components/theme` publishes `qc.tokens.json` and the presets, so a brand can import them into
  Figma or Style Dictionary, and export its own preset back.
- A spec fails when a `--qc-` name in the CSS or the components is missing from the token file.

## To find out

- Whether `oklch()` and `light-dark()` defaults can be written as `color` values (Color Module), or
  need a light and a dark mode through the resolver.
- Whether `em` is a valid `dimension` unit (`--qc-size-selector`).
- Whether to generate with Style Dictionary 4 or a small script of our own (the generated CSS has a
  fixed shape: one line per input, two fallbacks).
- Whether CitoTestUit's or Kennisnet's designers work from Figma variables, and would use the export.

## Steps

- [ ] Answer "To find out"; record the decisions in CONTRACT §8.
- [ ] Write `qc.tokens.json` from the current first group; diff the generated CSS against today's, byte for byte.
- [ ] Generate the CONTRACT and docs tables and the Theming controls.
- [ ] Move the presets to token files; generate `.storybook/themes.css`.
- [ ] Publish the token files; the drift spec in CI.

## Done when

- A tier-1 input is added by editing `qc.tokens.json` only, and it appears in the CSS, both tables and
  the Theming page.
- VRT unchanged: the generated CSS is the same as the hand-written one.
