---
'@qti-components/position-object-interaction': major
'@qti-components/processing': patch
'@qti-components/theme': minor
'@citolab/qti-components': major
---

`qti-position-object-interaction` is a real QTI interaction (3.2.16). It extends `Interaction`, so it
has a `response-identifier`, a `point` response (each placement's centre point in the stage image's
own coordinates), a form value, validity with `min-choices` / `max-choices` (default 1) and the
change/submit message timing, `center-point`, `reset`, and restore through `response`. Placing: drag
the object onto the stage or click it and then the stage; drag a copy to move it or off the stage
to remove it; keyboard Enter places a copy at the stage centre, arrows move it, Delete removes it.
Parts `object` (tokens `selected`, `used`), `point`, `message`; state `used`.

`qti-position-object-stage` is now layout only: it no longer moves the object image itself.

`mapResponsePoint` no longer throws on an unanswered single `point` response.
