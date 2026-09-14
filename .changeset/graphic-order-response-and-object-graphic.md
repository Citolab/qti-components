---
'@qti-components/graphic-order-interaction': patch
'@qti-components/interactions-core': patch
'@citolab/qti-components': patch
---

Fix `qti-graphic-order-interaction` on the QTI 3 spec form of an ordering item (#209). Two defects, either of which broke it on its own.

**RESPONSE ignored the candidate's ordering.** The interaction only wrote `aria-ordervalue` on each hotspot; the response itself was published by `ChoicesMixin` as the set of _checked_ choices in **DOM order** — the one thing an ordering must not do. `ChoicesMixin.maxChoices` also defaults to `1`, so each click cleared the previous hotspot and made the interaction a `radiogroup` of `radio`s. Clicking A, D, C, B left `RESPONSE` as the single identifier `"B"` where the `ordered` cardinality declaration expects `["A","D","C","B"]`, so response processing never scored the item — while the pins painted 1-2-3-4 and made it look right.

The response is now the ordering: `max-choices` defaults to `0` (no limit, QTI's default for an ordering), the interaction publishes the ordered identifier list itself, and pins plus `aria-ordervalue` are derived from the response rather than kept as a second copy of it. Deselecting a hotspot renumbers the rest by falling out of the array, and a response set from anywhere else — a restored attempt, a correct-response display, an author setting the property — now repaints the pins.

**An `<object>` graphic left every hotspot unpositioned.** QTI 3 carries the graphic as `<object type="image/png" data="…">`, which is what the spec's own graphic interaction examples use, but the hotspots were positioned against `querySelector('img')`. On a spec-form item that is `null`, `positionShapes` threw, and no hotspot got a position — so all of them collapsed onto the theme's `100%x100%` and stacked as one large box below the graphic. Only items that had been through a converter rendered at all.

`findGraphic` now accepts `<img>` and `<object type="image/*">` alike, and `positionShapes` resolves the coordinate space from either — including the two forms where the attributes cannot supply it. `width`/`height` are **optional** on the QTI `<object>` (only `data` and `type` are required), so a graphic that declares no size falls back to the bitmap's own, probed by loading the same URL and cached per element. And QTI's `LengthDType` is `[0-9]+%?`, so `width="50%"` is valid markup on either form: a percentage is a layout instruction, not a coordinate space, and reading it as `50px` used to push every hotspot off the graphic — it now falls back to the intrinsic size too. A graphic whose size cannot be resolved at all is reported instead of silently writing `NaN%` and leaving the hotspots full-size.

`qti-hotspot-interaction`, `qti-graphic-associate-interaction` and `qti-select-point-interaction` make the same `img`-only assumption and are not covered here.
