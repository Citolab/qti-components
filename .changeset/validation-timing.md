---
'@qti-components/base': major
'@qti-components/interactions-core': major
'@qti-components/choice-interaction': major
'@qti-components/text-entry-interaction': major
'@qti-components/extended-text-interaction': major
'@qti-components/inline-choice-interaction': major
'@qti-components/select-point-interaction': major
'@qti-components/graphic-order-interaction': major
'@citolab/qti-components': major
---

A validity message is timed like a native form. Too many shows at once on the change that caused it;
too few (below `min-choices`, `min-associations`, `min-strings`, or `required`) shows only after a
submit, the item's end attempt or a form's submit, and from then on every change reports in full. A
reset forgets the submit. The validity itself is set on every change as before, so a form with a
below-minimum interaction still does not submit.

Validity is now also set before the first change and whenever a response is restored or written by a
host, so an untouched interaction below its minimum makes a form's submit fail (breaking: such a form
used to submit). Fixed along the way: a choice interaction parsed together with its choices (innerHTML,
a restored item) lost its `response` attribute; a drag-drop reset left targets that held a chip
refusing drops.

Before, dragging a chip into a target and back showed "Please select at least 1 association." at
once. `reportValidity()` takes an optional `{ trigger: 'change' | 'submit' }` (default `submit`);
`ValidityKind` and `ValidityTrigger` are exported from `@qti-components/base`.
