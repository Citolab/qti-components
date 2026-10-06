---
'@qti-components/base': minor
'@qti-components/elements': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Items publish whether their interactions are valid, as `ItemContext.valid`, and the test reads it from there instead of asking every loaded item to validate on each update. The item checks when an answer changes, when it connects, and after answers are handed in through `variables`. `qti-assessment-item` also exposes a read-only `itemContext` (the whole context, declarations included), which the test used to reach for as a private field.

This fixes a bug: after a restore (`qtiTest.state`) or after coming back to an answered item, `ComputedItem.valid` stayed `false` until some later update, because it was read before the answer was adopted. In a section with `allow-skipping="false"` that kept `test-end-attempt` disabled on an item that was already answered.

What to check in a host:

- Components that read `ComputedItem.valid` from `computedContext`: it now settles after a restore and after navigating back.
- `test-end-attempt` in sections that do not allow skipping.
- Inline validation messages. Read from the code, not observed: `validate()` on an interaction can update its inline message, and the test used to call it on every update of the test. It is now called when the item's answers change.

Covered by this repo's stories; not run against a host application. Host migration: [PeilingLezen](plans/host-migration/peilinglezen.md), the only surveyed host that consumes `computedContext`.
