---
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

The theme's keyboard focus ring now shows on the placed chip in graphic-gap-match and on the point in select-point. Those rules were nested under `::part()` and compiled to `:is(…::part(…)):focus-visible`, which matches nothing in any browser; they are written as one selector now. Graphic-gap-match bank chips and match targets get the theme ring too, where they showed the browser's default ring: they had no focus rule, and match's ring sat on the drop part, which never takes focus.

The build no longer wraps a `:state()` that follows `::part()` in its `[data-state]` fallback (`::part(drag):is(:state(x), [data-state~='x'])`). That form worked only because browsers parse `:is()` forgivingly; it is now emitted as plain `::part(drag):state(x)`, in a rule of its own when it shared a selector list with other selectors. No visible change.
