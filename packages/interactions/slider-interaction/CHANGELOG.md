# @qti-components/slider-interaction

## 1.1.6-next.1

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0

## 1.1.6-next.0

### Patch Changes

- [#291](https://github.com/Citolab/qti-components/pull/291) [`0fb1914`](https://github.com/Citolab/qti-components/commit/0fb19146d8015e6b76a576671adea0d92051d891) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-slider-interaction` starts at the response declaration's `qti-default-value`, and no longer saves its lower bound as the response before the candidate moves it ([#290](https://github.com/Citolab/qti-components/issues/290)).

  QTI 3 gives a slider no initial position of its own: it starts at the default of its response variable, or has no value. The slider used to seed itself with `lower-bound` on connect and publish that, which overwrote a declared default, and let a candidate pass `allow-skipping="false"` with a value they never chose. Now:

  - With a `qti-default-value`, the slider shows it and the response is that value.
  - Without one, the response is `null` until the candidate moves the slider. The knob rests at the lower bound with no value label. (With `lower-bound="0"` nothing was saved before either.)
  - Setting `response` (or `reset()`, which used to do nothing) shows the value without publishing it; only the candidate's input is published.
  - The slider exposes `aria-valuemin`, `aria-valuemax` and `aria-valuenow` through `ElementInternals`.
