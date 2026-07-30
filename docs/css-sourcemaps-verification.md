# CSS Source Map Verification

This checklist verifies CSS source mapping quality for:
- PostCSS build output
- Storybook runtime CSS (Vite dev sourcemaps)
- Lit component styles migrated to external CSS files

## 1. Verify PostCSS Build Maps

Run the CSS build:

```sh
pnpm css
```

Confirm map artifacts exist:

```sh
ls dist/item.css dist/item.css.map
```

Confirm the CSS points to the map:

```sh
tail -n 3 dist/item.css
```

Expected: a trailing sourceMappingURL comment referencing item.css.map.

## 2. Verify Storybook Runtime CSS Maps

Start Storybook:

```sh
pnpm storybook:dev
```

Open a story and DevTools, then inspect any rule coming from:
- docs styles
- qti theme styles
- e2e story styles

Check that rule locations point to source files (not only bundled virtual files).

Storybook CSS map settings are enabled in:
- .storybook/main.ts

## 3. Verify Lit Style Provenance

Use a component that imports external CSS through ?inline, for example:
- packages/qti-base/src/abstract/qti-expression.ts
- packages/qti-base/src/abstract/qti-expression.css

In Storybook DevTools console, run:

```js
window.__qtiInspectStyles('qti-expression')
```

This prints style origins for:
- document stylesheets and style tags
- shadowRoot adoptedStyleSheets

The helper is registered in:
- .storybook/preview.ts

## Notes

- PostCSS mixin expansion keeps sourcemaps, but some mapped locations may resolve to mixin definitions rather than call sites.
- Lit css template literals remain less traceable than external CSS files. Prefer external .css for styles you need to debug frequently.
