---
'@qti-components/corrections': minor
---

Hand the correct response to the PCI correct-response viewer through its `getInstance`
configuration, not only as a pushed response.

`QtiPortableCustomInteractionCorrection` builds a viewer clone to render the answer key, and until
now it reached that viewer one way only: `setBoundTo` once the iframe finished its handshake, which
asks the PCI to render the key as though it were a candidate response. A PCI that implements the
solution use case reads it from its configuration instead, and got nothing.

The viewer now also gets `status = 'solution'` and an explicit `responseDeclaration`, matching what
`@qti-components/portable-custom-interaction` accepts. Setting the declaration explicitly is
required rather than tidy: the viewer is marked `isFullCorrectResponse` under a `-correct`
identifier, so it never registers as a real interaction, has no `responseVariable`, and the derived
`responseDeclaration` getter returns null for it.

The `setBoundTo` push stays for PCIs that do not implement the solution use case: those only know
how to render a response bound to them.

Implements the design agreed in
https://github.com/1EdTech/qti-project-management/issues/210
