---
'@qti-components/portable-custom-interaction': minor
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The PCI iframe no longer loads anything from a public CDN. RequireJS (2.3.8, minified) and the QTI 3 shared vocabulary stylesheet (`native.css`: `qti-layout-row`, `qti-well`, `qti-padding-*`, …) are inlined into the iframe from this version of qti-components. It used to load RequireJS from cdnjs, and the whole qti-components bundle and `item.css` from unpkg (`@latest`). That bundle and the full `item.css` are not needed to run a PCI and are no longer loaded by default: a host that wants them in the iframe names its own copy with `data-components-cdn-url` / `data-components-css-url` (for example its own build of `@citolab/qti-components/cdn/index.js` and `item.css`). `data-require-js-url` still loads a different RequireJS instead of the inlined one. `@qti-components/theme` exports the vocabulary sheet as text: `@qti-components/theme/native-css`.
