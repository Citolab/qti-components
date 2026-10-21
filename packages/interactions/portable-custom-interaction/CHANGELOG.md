# @qti-components/portable-custom-interaction

## 1.3.0-next.5

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6), [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6), [`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/theme@2.3.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.3.0-next.4

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/theme@2.3.0-next.2
  - @qti-components/interactions-core@2.2.0-next.3

## 1.3.0-next.3

### Patch Changes

- [#316](https://github.com/Citolab/qti-components/pull/316) [`b58d409`](https://github.com/Citolab/qti-components/commit/b58d4093456e38c992bf08cbbbc85ddf97abea40) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - The PCI iframe is now exactly as high as its content: it no longer adds 100px of empty space below it. The iframe keeps the width of its host instead of a fixed pixel width, so a PCI follows the item layout when it gets narrower, e.g. when QTI layout columns stack.

## 1.3.0-next.2

### Minor Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - The PCI iframe no longer loads anything from a public CDN. RequireJS (2.3.8, minified) and the QTI 3 shared vocabulary stylesheet (`native.css`: `qti-layout-row`, `qti-well`, `qti-padding-*`, …) are inlined into the iframe from this version of qti-components. It used to load RequireJS from cdnjs, and the whole qti-components bundle and `item.css` from unpkg (`@latest`). That bundle and the full `item.css` are not needed to run a PCI and are no longer loaded by default: a host that wants them in the iframe names its own copy with `data-components-cdn-url` / `data-components-css-url` (for example its own build of `@citolab/qti-components/cdn/index.js` and `item.css`). `data-require-js-url` still loads a different RequireJS instead of the inlined one. `@qti-components/theme` exports the vocabulary sheet as text: `@qti-components/theme/native-css`.

### Patch Changes

- [#309](https://github.com/Citolab/qti-components/pull/309) [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Record-cardinality responses for portable custom interactions. A `qti-response-declaration` with `cardinality="record"` now reads its correct response (`qti-value field-identifier="…" base-type="…"`) into a field map and keeps the declared field base types. A PCI that reports a record in QTI Appendix C JSON (`{ record: [{ name, base: { float | point | … } }] }`) has it stored as that field map (`{ time: '4.12', point: '455 250' }`) instead of `"[object Object]"`, gets it back in `boundTo` typed by the declaration, and receives the record correct response in `responseDeclaration`. `qti-field-value` accepts a variable declared with `cardinality="record"` and reports the field's base type, so `qti-gte`/`qti-lte` compare a float field and `qti-inside` tests a point field. `qti-correct` returns a record's correct response. `BaseType` gains `point`, and `@qti-components/base` exports `RecordValue`, `isRecordValue`, `readRecordFieldValues` and `inferRecordFieldBaseType`.

  Comparisons (`qti-gt`, `qti-gte`, `qti-lt`, `qti-lte`) with a NULL operand are NULL (false), as in QTI: a missing response or a missing record field used to count as 0, so `lte(RESPONSE, 5)` passed without a response.

  The PCI iframe takes the language of the interaction (the nearest `lang` or `xml:lang`, else the page's `lang`) instead of always `lang="en"`, so a PCI that follows `lang` shows its own texts in the item's language.

- Updated dependencies [[`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a), [`d0a05aa`](https://github.com/Citolab/qti-components/commit/d0a05aa7415a8fa98b21557481231bc434b06f6a)]:
  - @qti-components/theme@2.3.0-next.1
  - @qti-components/base@2.5.0-next.2

## 1.2.1-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.2.1-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0
