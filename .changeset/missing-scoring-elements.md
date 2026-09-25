---
'@qti-components/processing': minor
'@qti-components/elements': minor
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Implement the four expressions and rules the scoring engine supports and we had no element for at
all. Each was previously an unknown tag: inert, silently contributing nothing to a score.

`qti-math-constant` returns `pi` or `e` as a float, and NULL for a name outside that vocabulary.

`qti-exit-response` ends the attempt's response processing. An exit can sit at any depth — inside a
`qti-response-condition` branch, inside a `qti-response-processing-fragment` — and has to stop every
rule after it, not just its own siblings, so it throws a `QtiExitResponseSignal` that
`qti-response-processing` catches at the top of the run. Unwinding the stack reaches every one of
those loops without each having to report upwards. The outcomes set before the exit are kept,
because a `qti-set-outcome-value` has already dispatched by the time the signal is thrown. Anything
that is not the signal rethrows, so a genuine error in a rule still surfaces.

`qti-response-processing-fragment` runs its rules in place, in document order, exactly as if they
had been written where the fragment sits. A fragment held in a separate file is still not pulled
in, because `qti-include` is not resolved — only the rules authored inside the element run.

`qti-number-selected` counts the item references the test selected, narrowed by
`section-identifier`, `include-category` and `exclude-category`. It counts the item refs in the
document rather than the entries in the test context, so it is the same set `qti-test-variables`
aggregates over and it is right before any item has been attempted.

The last two share how they choose item refs, so that selection moved into one place
(`internal/item-ref-selection`). `qti-test-variables` gains `section-identifier` from the move —
it filtered by category but had no way to scope to a section.
