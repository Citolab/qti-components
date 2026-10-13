---
'@qti-components/test': minor
'@qti-components/base': patch
'@citolab/qti-components': minor
---

Sequencing in linear test parts: new `qti-pre-condition` and `qti-branch-rule` elements (`target` is an item ref, section or test part, or `EXIT_SECTION` / `EXIT_TESTPART` / `EXIT_TEST`). A "next" step in a linear part now skips items, sections and test parts whose pre-condition is false and follows the first branch rule that is true; nonlinear parts, deep links and item links are untouched. An expression that throws fails open for a pre-condition and does not branch for a rule; one that gives NULL (e.g. an unknown variable) is false. The first item of a linear part is checked against its pre-conditions too.

- New public notifications: `cito-test-items-skipped` (`detail.ids`: the item refs passed over) and `cito-test-end-reached` (`EXIT_TEST`, or no eligible item left).
- `qti-variable` can read an item session with `ITEMREF.VAR` (e.g. `Q01.SCORE`); an item that was never presented gives NULL.
- `qti-match` and the other comparisons now work on `boolean` values (they were always false), so the `qti-end-attempt-interaction` pattern can be matched.
