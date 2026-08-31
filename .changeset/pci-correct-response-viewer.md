---
'@qti-components/corrections': patch
---

Repair show-correct-response for portable custom interactions.

A PCI has no markup the correction elements could annotate, so
`QtiPortableCustomInteractionCorrection` answers it with a second, inert instance of the interaction
fed the correct response. Two things kept that instance from ever showing one:

- It cloned every light-DOM child of the original, and the PCI appends its iframe to itself while
  `disable()` adds the review overlay just above. The viewer therefore carried a cloned iframe — one
  that never loads — painted above the live one, and reported two iframes where there should be one.
  Only the authored children (`qti-interaction-modules`, `qti-interaction-markup`, properties,
  stylesheets) are cloned now.
- It pushed the correct response from an instance-level `connectedCallback` override. Custom element
  reactions are looked up on the prototype when the element is defined, so that assignment was never
  read and `setBoundTo` never ran. The response is now pushed from a
  `qti-portable-custom-interaction-loaded` listener.

The viewer also no longer inherits the original's `id`, which put two elements with the same id in
one tree.
