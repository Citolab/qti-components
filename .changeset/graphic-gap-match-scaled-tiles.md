---
'@qti-components/graphic-gap-match-interaction': patch
'@qti-components/interactions-core': patch
---

Graphic gap match: when the graphic is drawn narrower than its declared width, the drop areas and the gap images now scale with it. The measured chip size no longer acts as each hotspot's minimum size (a hotspot's box is its `coords`), gap images scale by the graphic's factor (`--qti-graphic-scale`) in the bank and in the hotspot, and the drag clone accounts for that zoom so a drop lands where it is aimed.
