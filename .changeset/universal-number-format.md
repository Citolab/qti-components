---
'@qti-components/base': patch
'@citolab/qti-components': patch
---

Stop mangling fractional outcome values on comma-decimal locales.

`convertNumberToUniversalFormat` ran `.replace('.', '')` over `Number.prototype.toString()`, which
always uses `.` regardless of locale. On any browser whose locale uses a decimal comma (nl, de, fr,
...) that deleted the separator instead of converting it: a score of `0.5` was stored as `"05"` and
`1.5` as `"15"`, so every SCORE with a fraction came out ten times too big. On dot-decimal locales
the other branch called `toLocaleString()`, which grouped thousands — `1234.5` became `"1,234.5"`.

Both branches are gone. `toString()` already produces QTI's format — a plain decimal with `.` and no
grouping — on every locale. Affects `qti-set-outcome-value`, `qti-lookup-outcome-value`,
`qti-set-template-value` and `qti-set-correct-response`.
