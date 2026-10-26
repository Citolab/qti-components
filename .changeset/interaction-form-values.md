---
'@qti-components/inline-choice-interaction': minor
'@qti-components/select-point-interaction': minor
'@qti-components/upload-interaction': minor
'@qti-components/graphic-associate-interaction': major
'@qti-components/graphic-order-interaction': patch
'@qti-components/extended-text-interaction': patch
'@citolab/qti-components': major
---

Every interaction that carries a response now works inside a `<form>`.

- Inline choice, select point and upload write a form value (the chosen identifier; the points as
  `x y,x y`; the file as a base64 data URL). Select point sets validity with `min-choices` /
  `max-choices` and renders `::part(message)`.
- Graphic associate reads `min-associations` and `max-associations`; the latter defaults to 1, as
  QTI specifies (breaking: an item without the attribute used to accept any number of lines). It
  writes a form value and sets validity. Its points are visible (rings), its lines are black with a
  white outline, a point cannot be paired with itself, "B A" is the existing "A B", each point's
  `match-max` is enforced (`:state(full)`), the chosen start point carries `:state(checked)`, Escape
  or a click on the image cancels a started line, lines have a wide remove target, and points and
  lines are reachable by keyboard.
- Graphic order validates after the click is applied (it was one click behind).
- Extended text reports as the candidate types, not only on blur.
