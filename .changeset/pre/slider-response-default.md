---
'@qti-components/slider-interaction': patch
'@citolab/qti-components': patch
---

`qti-slider-interaction` starts at the response declaration's `qti-default-value`, and no longer saves its lower bound as the response before the candidate moves it (#290).

QTI 3 gives a slider no initial position of its own: it starts at the default of its response variable, or has no value. The slider used to seed itself with `lower-bound` on connect and publish that, which overwrote a declared default, and let a candidate pass `allow-skipping="false"` with a value they never chose. Now:

- With a `qti-default-value`, the slider shows it and the response is that value.
- Without one, the response is `null` until the candidate moves the slider. The knob rests at the lower bound with no value label. (With `lower-bound="0"` nothing was saved before either.)
- Setting `response` (or `reset()`, which used to do nothing) shows the value without publishing it; only the candidate's input is published.
- The slider exposes `aria-valuemin`, `aria-valuemax` and `aria-valuenow` through `ElementInternals`.
