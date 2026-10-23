# @qti-components/select-point-interaction

## 1.1.6-next.3

### Patch Changes

- Updated dependencies [[`9e22536`](https://github.com/Citolab/qti-components/commit/9e225363df4072db7c9a7a7d680528611d5302b6)]:
  - @qti-components/base@3.0.0-next.3
  - @qti-components/interactions-core@2.2.0-next.4

## 1.1.6-next.2

### Patch Changes

- [#329](https://github.com/Citolab/qti-components/pull/329) [`9c83247`](https://github.com/Citolab/qti-components/commit/9c83247192fb9b0fe073cf21056ab80e6b579ecd) Thanks [@herrKlein](https://github.com/herrKlein)! - Words on an image, and points in the right place.

  - **Select point:** a response given in the markup (`response="203 159"`) now shows its marker where it belongs. It was rendered before the image's size was read and placed against a width of 1, thousands of percent off the image.
  - **Graphic gap match with words:** a `qti-gap-text` chip is a label box, the inline-field box that gap-match chips have, in the bank and once placed on the image; an image tile (`qti-gap-img`) stays plain. A placed word carries the part `drag drag-text` (new) next to `drag`, so a theme can tell a word from a tile. A placed chip no longer shrinks in a hotspot narrower than it (`qti-associable-hotspot`). An empty hotspot shows a dashed edge at rest, unless the interaction has `qti-unselected-hidden`.
  - **Select point marker on any picture:** the marker gets a halo that follows its colour, white round a dark marker and black round a light one (lightness below or above 0.7, derived with relative colour syntax), so it stays visible on a dark or busy image. Set the colour with the new optional input `--cito-color-marker` (the primary by default) and the shape with `--cito-icon-marker` (a mask; the pin by default), with `--cito-marker-anchor` saying where that shape points: `-100%` stands it on the point by its bottom, like the pin, `-50%` centres it, for a ring or a star. `--qti-select-point-halo` overrides the derived halo. The marker's shape is now drawn by its `::before`, so the halo can follow it.

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
