---
'@qti-components/processing': minor
'@citolab/qti-components': minor
---

Implement the `qti-printed-variable` formatting attributes: `format`, `base`, `index`, `power-form`, `field`, `delimiter` and `mapping-indicator`.

The element rendered its value with `JSON.stringify(value, null, 2)` and declared none of these attributes, so every printed variable came out as JSON: a single value carried its quotes (`"ChoiceA"`, `"1"`), and an ordered or multiple variable printed as a pretty-printed array —

> Here is a set of numbers: `["-98",\n  "2",\n  "-70",\n  "48"]`

— instead of a delimited list. That is what made the mc_stat2 example look like it was printing nothing useful (#134).

Now a container prints its values joined by `delimiter` (default `;`), a record prints `name=value` pairs using `mapping-indicator` (default `=`), `index` selects one value of an ordered variable (1-based), `field` selects one field of a record, `base` prints an integer in another number base, `power-form` prints numeric values in exponential form, and `format` applies a printf-style conversion string (`%.2f`, `Score: %d`, flags `-+ 0#`, width, precision, and the conversions `d i u o x X f F e E g G s c`). A NULL variable — absent, null, or an empty container — prints nothing.

Closes #202.
