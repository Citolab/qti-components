---
'@qti-components/theme': minor
'@qti-components/interactions-core': patch
'@citolab/qti-components': minor
---

A disabled interaction looks disabled.

- **Disabled paints in one muted grey**, `--qti-color-disabled` (40% of the text colour into the surface): its text, edges, controls, chips and handles, and the mark of what is selected, which stays visibly selected. Not opacity, which faded the selected answer with the rest and let the background through. It applies to every interaction with the `disabled` attribute and to a single choice with `:state(disabled)`, by re-valuing the paint tokens on that element (`interactions/qti-disabled.css`). Before, only the cursor changed. Corrections still show their verdict colours.
- **Readonly is unchanged**: full look, only the cursor, so an answered test in review stays readable.
- **A disabled choice takes no focus** from a mouse press (`ActiveElementMixin`), as a disabled native control does; before, a click on it showed the focus ring.
