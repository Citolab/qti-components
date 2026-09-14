---
'@qti-components/interactions-core': patch
'@qti-components/processing': patch
'@qti-components/base': patch
'@citolab/qti-components': patch
---

Support `shape="default"` area map entries, which neither render nor score.

A `default` area is the whole image. QTI 3.0 §7.9 ends its coords list with "default: no
coordinates should be given", but the XSD makes `coords` `use="required"`, so real items carry
filler — `0,0,100%,100%` in Citolab/qti-components#83. Both places that read an area treated that
filler as geometry:

`positionShapes` knew `circle`, `rect`, `ellipse` and `poly`, so a `default` entry fell to its
`default:` branch, logged `Unsupported shape: default` and wrote no styles at all — showing the
correct response left the area in the DOM with no size, invisible. It now spans the image, and the
coords are deliberately not read: HTML, where the vocabulary comes from, settles it with "This area
is the whole image. (The coords attribute is not used.)"

`ScoringHelper.isPointInArea` had a `case 'default'` folded in with `case 'circle'`, which demands
exactly three coords, so it rejected every real entry as an `Invalid circle definition` and a click
outside the other areas scored nothing. `default` now returns true for any point without reading
coords.

A whole-image area overlaps every other area, which made a missing `break` in
`qti-map-response-point` reachable for the first time: a point inside a smaller area scored that
area _and_ the catch-all. §7.4 — "each area is tested in turn, with those listed first taking
priority in the case where areas overlap and a point falls in the intersection" — so matching now
stops at the first area containing the point.
