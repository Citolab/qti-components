---
'@qti-components/base': minor
'@qti-components/elements': minor
'@citolab/qti-components': minor
---

`disabled` on `qti-assessment-item` is now published in the item context (`ItemContext.disabled`) and the interactions follow it, the same way they already follow `readonly`. The item no longer sets it on each registered interaction. Setting `item.disabled` still locks and unlocks the interactions.

What changes:

- A `disabled` attribute present on the item from the start now applies. Before, only a change after the first render did.
- An interaction that was authored `disabled` stays so inside an item that does not mention `disabled`. The item only touches it when `item.disabled` is set.
- An interaction that registers after the item was disabled now comes up disabled.

Covered by this repo's stories; not run against a host application. Hosts that lock submitted items by setting `item.disabled` (Kennisnet) should check that flow.
