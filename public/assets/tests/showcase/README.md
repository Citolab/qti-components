# Showcase test

An English demo test with one or more items for every interaction the library renders. It is the
test to reach for when a story or docs page needs real-looking content.

- **Used by:** `packages/qti-test/src/components/qti-test/showcase.fixtures.ts` (`SHOWCASE_TEST`) and
  the story `Fixtures/Showcase` in `packages/qti-test/src/components/qti-test/stories/showcase.stories.ts`.
- **Language:** en-GB (every item declares `xml:lang="en-GB"`).
- **Source:** ITEM001–ITEM017 are translated from Kennisnet's demo test
  (`public/assets/api/kennisnet`, "Kennisnet Demonstratietoets"). Their structure, layout classes,
  identifiers, response declarations, scoring and images are unchanged; only the text is English,
  plus the fixes listed below. ITEM018–ITEM028 are new, written for this test in the same style.
- **Licence:** the Kennisnet items and their images are CC BY-SA 4.0 (Kennisnet,
  `METADATA001.xml`); the translations are shared under the same licence. The new items, their SVG
  images, `resources/car-horn-passing.mp3` (synthesised with ffmpeg) and `modules/fraction-bar.js`
  were made for this repository.

## Items

| Section               | Item    | Interaction                                       | Origin    |
| --------------------- | ------- | ------------------------------------------------- | --------- |
| Choosing              | ITEM001 | choice, one answer                                | Kennisnet |
|                       | ITEM002 | choice, several answers                           | Kennisnet |
|                       | ITEM028 | choice with pictures                              | new       |
|                       | ITEM006 | inline choice (two drop-downs)                    | Kennisnet |
|                       | ITEM010 | match as a true/false grid                        | Kennisnet |
|                       | ITEM011 | hottext, three questions                          | Kennisnet |
|                       | ITEM012 | hottext, words not marked                         | Kennisnet |
| Writing               | ITEM003 | text entry, not case-sensitive                    | Kennisnet |
|                       | ITEM004 | text entry, exact match                           | Kennisnet |
|                       | ITEM005 | extended text, marked by hand                     | Kennisnet |
| Dragging and ordering | ITEM007 | match, options above                              | Kennisnet |
|                       | ITEM008 | match, options on the right                       | Kennisnet |
|                       | ITEM009 | match, sorting into two categories                | Kennisnet |
|                       | ITEM017 | match with pictures                               | Kennisnet |
|                       | ITEM022 | associate                                         | new       |
|                       | ITEM015 | gap match                                         | Kennisnet |
|                       | ITEM013 | order, horizontal                                 | Kennisnet |
|                       | ITEM014 | order, vertical                                   | Kennisnet |
| Pointing at images    | ITEM018 | hotspot, with modal feedback                      | new       |
|                       | ITEM016 | select point                                      | Kennisnet |
|                       | ITEM020 | graphic order                                     | new       |
|                       | ITEM021 | graphic associate                                 | new       |
|                       | ITEM019 | graphic gap match (text labels)                   | new       |
|                       | ITEM025 | position object                                   | new       |
| Other                 | ITEM023 | slider, with modal feedback                       | new       |
|                       | ITEM024 | media (audio) plus a choice                       | new       |
|                       | ITEM026 | end attempt as a hint button, with feedback block | new       |
|                       | ITEM027 | portable custom interaction (`fraction-bar`)      | new       |

## Changes to the Kennisnet items beyond translation

- `xml:lang="en-GB"` on every item.
- ITEM005 has a model answer as its correct response, and ITEM016 has `191 393` (the point in
  the scoring area); the originals had none.
- The match items (ITEM007–010, ITEM017) set `max-associations` to the number of pairs. Without
  it the spec default is 1, which allows only one pair.
- ITEM003 accepts "refraction" and "refraction of light"; the Dutch original accepted two Dutch
  synonyms.
- Alt texts describe the actual images (two originals had the wrong alt text).

## Known gaps

- A host that opens this test must pass a `postLoadTransformCallback` that calls
  `transformer.configurePci(...)`, or the PCI in ITEM027 resolves its module against the site root
  and never becomes ready, without an error. The `configurePci` helper in `showcase.stories.ts` is
  the example.
- The test has no `qti-item-session-control`, so `show-feedback` is false and the modal feedback in
  ITEM018 and ITEM023 stays hidden after the attempt. It shows when a host or a session control
  allows feedback. The hint in ITEM026 does show, because ending the attempt with the hint button
  leaves the item open.
- The position-object interaction (ITEM025) can be dragged but does not record a response yet, so
  it cannot score.
- Several Kennisnet items keep a `normal-maximum` that differs from MAXSCORE, as in the original.
