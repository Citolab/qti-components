---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`test-item-to-speech`: speak each reading element in its own language, read a
specific item on a multi-item page, and start reading from a chosen sentence.

- Language resolution: the nearest `lang` / `xml:lang` on the element or its
  ancestors (across shadow roots), then `<html lang>`, then the player's
  `language` attribute.
- `item-ref-id` pins a player to one `qti-assessment-item-ref`, looked up in its
  own tree first and otherwise in any reachable `test-container` shadow root.
  Starting one player stops any other.
- New `<test-tts-pick>` button: pick mode highlights every reading element and
  starts reading from the one that is clicked.
