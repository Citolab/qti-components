---
'@qti-components/theme': patch
'@qti-components/choice-interaction': patch
'@qti-components/inline-choice-interaction': patch
---

Remove three `qti-`-prefixed presentation classes that are not in the QTI 3
shared vocabulary. The `qti-` prefix is reserved by 1EdTech for standardized
vocabulary, and — per the implementation guide — that vocabulary is "maintained
outside of the QTI specification (schema)", so names can be added to it without
a schema version bump. Inventing names inside the prefix therefore risks a
silent collision, and makes non-portable styling look portable to item authors.

- `qti-layout-offset12` (theme): removed. The shared vocabulary defines
  `qti-layout-offset1`–`offset11` against a 12-column grid; the twelfth rule was
  an off-by-one in a generated series and emitted
  `margin-left: 102.1276595745%`, pushing content off the row entirely.
- `qti-choices-stacking-6` (choice-interaction): removed. The vocabulary stops
  at `qti-choices-stacking-5`.
- `qti-input-width-5` (inline-choice-interaction): removed, for consistency with
  `text-entry-interaction`, which already implemented only the published set
  (1, 2, 3, 4, 6, 10, 15, 20, 25, 30, 35, 40, 45, 50, 72).

Authored content using these classes now falls back to default layout rather
than to a rule no other delivery engine implements.
