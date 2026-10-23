---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

The test controls (`test-prev`, `test-next`, item and section links, end attempt, ...) look neutral by default, and `test-next` is the primary action.

They used to be white with a blue border and black text, painted from the shared `--qti-component-*` tokens. Now the neutral look is a white button with a thin gray border and the surrounding text colour, with a faint gray hover, and `test-next` is solid dark with white text. There are no shadows, glows or transitions. The focus ring and the disabled look are unchanged.

The controls no longer read `--qti-component-border-color`, `--qti-component-background-color` or `--qti-component-color`, so changing those tokens repaints interactions and no longer the test controls. To repaint the controls, set the `--test-button-*` slots on the test:

- `--test-button-background-color`, `--test-button-color`, `--test-button-border-color`, `--test-button-hover-background-color` for the neutral look.
- New: `--test-button-primary-background-color`, `--test-button-primary-color`, `--test-button-primary-hover-background-color` for `test-next`. Setting the neutral slots no longer repaints `test-next`.
