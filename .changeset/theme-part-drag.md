---
'@qti-components/theme': minor
---

Add `::part(drag)` selectors next to the existing draggable rules for
associate, match, order, gap-match, and graphic-gap-match. Lets host
applications (e.g. editors) style a placed fake-drag custom element exposed
via `part="drag"` from inside the interaction's (or a child host's) shadow
tree using the same `drag` declarations the runtime drags use. Runtime
behavior unchanged — the existing tag-based selectors continue to style
the light-DOM drags.
