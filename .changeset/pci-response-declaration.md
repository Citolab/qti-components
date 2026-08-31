---
'@qti-components/portable-custom-interaction': minor
---

Pass the response declaration into the PCI `getInstance` configuration, so a PCI can render the
correct response itself instead of having it pushed in as a candidate response.

`responseDeclaration` is a camelCased mirror of `qti-response-declaration`, derived from the item
context unless a host sets it explicitly. `status` carries the item lifecycle status, defaults to
`interacting`, and is settable through the `data-status` attribute or the `status` property.

`correctResponse` is only sent when `status` is `solution` or `review`. A PCI is third-party code
in an iframe and has no reason to hold the answer key while the candidate is still working.

Implements the design agreed in
https://github.com/1EdTech/qti-project-management/issues/210
