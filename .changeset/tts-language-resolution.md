---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`test-item-to-speech`: speak each element in its own language, a player per item, and pick mode.

- **Language resolution.** Each reading element is spoken in the language of the nearest `lang`
  (or `xml:lang`): the element, its closest ancestor — across shadow roots — then `<html lang>`,
  and only then the `language` attribute, which is now a fallback.
- **A player per item.** `item-ref-id` pins a player to one `qti-assessment-item-ref`, so it reads
  that item whatever the navigation cursor points at. That makes a player per item possible on a
  section page, for instance from a `<template item-ref>`:
  `<test-item-to-speech item-ref-id="{{ identifier }}">`. Unset, the player follows
  `navItemRefId` as before.
- **Several players on a page** share the browser's one speech queue: starting one stops any other,
  a player never cancels speech or clears highlights it does not own, and moving to another section
  stops every player, pinned or not.
- **Pick mode.** `<test-tts-pick>` highlights every reading element; a click on one starts reading
  from there. The player reflects it as `:state(picking)`.
- Reading elements now include `qti-prompt` and `qti-simple-choice`, and nested matches are read
  once. Prev/next stay enabled before the elements have been collected, and play after the last
  element starts the item over.
- **Icon buttons.** The controls draw SVG icons instead of text glyphs, so every button has the
  same box, each with an English accessible name. Slotted content still replaces the default, and
  a slotted `<svg>` is sized like it; `label` (plus `pause-label` on `<test-tts-play>`) names the
  button, which a slotted icon needs. The controller lays its controls out as a wrapping row.
