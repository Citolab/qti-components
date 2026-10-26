# @qti-components/slider-interaction

## 1.1.6-next.5

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

## 1.1.6-next.4

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.1.6-next.3

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.6-next.2

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

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
