# @qti-components/end-attempt-interaction

## 2.0.0-next.5

### Patch Changes

- Updated dependencies [[`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8), [`d37349b`](https://github.com/Citolab/qti-components/commit/d37349b2144112ae61cd0ff2dae7c1166089cbf3), [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8)]:
  - @qti-components/interactions-core@3.0.0-next.6
  - @qti-components/base@3.0.0-next.5

## 2.0.0-next.4

### Major Changes

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-end-attempt-interaction` counts the attempt it ends unless it says `count-attempt="false"`. Before, only `count-attempt="true"` counted. QTI 3 gives the attribute no default; an absent value now counts, as QTI 2.x's default `true` did and as amp-up and QTI.JS do. Fixes [#341](https://github.com/Citolab/qti-components/issues/341).

  An item whose hint or "show solution" button has no `count-attempt` now uses up an attempt when the candidate presses it, and in a test with the default `max-attempts` of 1 the item is then locked. Give such a button `count-attempt="false"`.

### Minor Changes

- [#344](https://github.com/Citolab/qti-components/pull/344) [`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-end-attempt-interaction` follows its item: it cannot be pressed while the item is `disabled` or `readonly`, or once an adaptive item has set `completionStatus` to `completed`. QTI says an adaptive item that sets `completed` closes its session, so no further attempt can start (info model §2.2.2). Before, the button stayed enabled and every press ran response processing again. Fixes [#342](https://github.com/Citolab/qti-components/issues/342).

### Patch Changes

- Updated dependencies [[`f99bbd0`](https://github.com/Citolab/qti-components/commit/f99bbd07c2dd1919f292806e520ddcc6cc0ac320), [`26cdb6e`](https://github.com/Citolab/qti-components/commit/26cdb6e1e3206392d226f70fe6f7bd90af99fe53)]:
  - @qti-components/base@3.0.0-next.4
  - @qti-components/interactions-core@2.2.0-next.5

## 1.1.6-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.1.6-next.2

### Patch Changes

- Updated dependencies [[`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd), [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd)]:
  - @qti-components/interactions-core@2.2.0-next.3

## 1.1.6-next.1

### Patch Changes

- Updated dependencies [[`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd), [`ea9e3c1`](https://github.com/Citolab/qti-components/commit/ea9e3c156cb477b20a23918a47ef3fbe83fdedbd)]:
  - @qti-components/base@2.5.0-next.1
  - @qti-components/interactions-core@2.1.4-next.1

## 1.1.6-next.0

### Patch Changes

- Updated dependencies [[`05c1822`](https://github.com/Citolab/qti-components/commit/05c1822887d82c5627c9bc526e97495618fa7cb7)]:
  - @qti-components/base@2.4.1-next.0
  - @qti-components/interactions-core@2.1.4-next.0
