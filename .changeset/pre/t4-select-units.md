---
'@qti-components/delivery': minor
---

`selectUnits(units, { select, withReplacement }, random)` picks which children of a section a `qti-selection` selects, as implementation guide §4.5.1 recommends: required ones always, the rest with an equal chance, clones (`with-replacement`) only once every child is in, authored order kept for ordering to shuffle later. A `select` QTI calls an error is refused with a `RangeError`. `selection.vectors.json` records the selections per seed, for a .NET port to run.
