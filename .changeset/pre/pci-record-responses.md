---
'@qti-components/base': minor
'@qti-components/elements': patch
'@qti-components/processing': patch
'@qti-components/portable-custom-interaction': patch
'@citolab/qti-components': patch
---

Record-cardinality responses for portable custom interactions. A `qti-response-declaration` with `cardinality="record"` now reads its correct response (`qti-value field-identifier="…" base-type="…"`) into a field map and keeps the declared field base types. A PCI that reports a record in QTI Appendix C JSON (`{ record: [{ name, base: { float | point | … } }] }`) has it stored as that field map (`{ time: '4.12', point: '455 250' }`) instead of `"[object Object]"`, gets it back in `boundTo` typed by the declaration, and receives the record correct response in `responseDeclaration`. `qti-field-value` accepts a variable declared with `cardinality="record"` and reports the field's base type, so `qti-gte`/`qti-lte` compare a float field and `qti-inside` tests a point field. `qti-correct` returns a record's correct response. `BaseType` gains `point`, and `@qti-components/base` exports `RecordValue`, `isRecordValue`, `readRecordFieldValues` and `inferRecordFieldBaseType`.

Comparisons (`qti-gt`, `qti-gte`, `qti-lt`, `qti-lte`) with a NULL operand are NULL (false), as in QTI: a missing response or a missing record field used to count as 0, so `lte(RESPONSE, 5)` passed without a response.

The PCI iframe takes the language of the interaction (the nearest `lang` or `xml:lang`, else the page's `lang`) instead of always `lang="en"`, so a PCI that follows `lang` shows its own texts in the item's language.
