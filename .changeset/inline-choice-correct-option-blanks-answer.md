---
'@qti-components/inline-choice-interaction': patch
---

Fix the inline-choice dropdown rendering empty when the candidate's answer is
also the correct answer. `#updateOptions` builds each option's `content` once as
an array of DOM nodes, and both the trigger's `part="value"` and the
`part="correct-option"` marker bound those same nodes. A DOM node can only live
in one place, so enabling the correct response moved the nodes into the marker
and left the trigger blank — making a correct answer look unanswered in review,
and not recoverable by switching the correct response back off (lit dirty-checks
the unchanged node reference and never re-inserts it). The marker now renders its
own copy of the nodes.
