---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The default theme is black and white, and dark mode works.

- **Black and white.** The default `--cito-color-primary` is the text colour itself: near-black on a light page, near-white on a dark one, with `--cito-color-primary-content` the opposite. A selected choice is a black fill with white text; the focus ring, the active border, the drop highlight and the placeholder tint follow. Only the four state colours keep their hue, because they carry meaning (answer key, correct, partially correct, incorrect). A brand sets its colour with `--cito-color-primary`; a brand that sets `--qti-primary` still wins, as before.
- **Dark mode.** `qti-item-body` now takes its text colour from `--cito-color-base-content`, a `light-dark()` pair, so the words flip together with the surfaces when the page's `color-scheme` is dark. Before, an item inherited the page's text colour, which left dark text on dark fields on a page that had not set its own. The dark surfaces are neutral greys now (`oklch(20% 0 none)` and `oklch(96% 0 none)`) instead of a blue-tinted slate.

**Hosts:** item text is the theme's colour now, not the page's. A host that wants its own body text colour in items sets `--cito-color-base-content`.
