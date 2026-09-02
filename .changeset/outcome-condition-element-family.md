---
'@qti-components/processing': minor
'@citolab/qti-components': minor
---

Add `qti-outcome-condition` with its `qti-outcome-if` / `qti-outcome-else-if` / `qti-outcome-else`
branches.

`outcomeCondition` is the QTI 3.0 counterpart of `responseCondition` and the element the spec's
own feedback examples branch on. Without it, an `outcomeProcessing` block that uses one had no
element to match and its rules never ran.

The two conditions are structurally identical — a container that walks its branches in order and
processes the sub-rules of the first one that applies — so that behaviour now lives in a shared
`QtiConditionBase` / `QtiConditionIfBase` / `QtiConditionElseBase` family that both the response-
and outcome- elements extend. `qti-response-condition` and its branches keep their existing
behaviour.
