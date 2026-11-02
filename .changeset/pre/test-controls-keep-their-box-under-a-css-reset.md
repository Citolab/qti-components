---
'@qti-components/test': patch
'@qti-components/corrections': patch
'@citolab/qti-components': patch
---

The test controls look the same on a page that uses a CSS reset, such as Tailwind's preflight.

A reset like `*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }` is a rule of the page, and a page rule beats the `:host` rules of a shadow root, whatever its layer or specificity. `test-next`, `test-prev`, `test-end-attempt`, `test-item-link`, `test-section-link`, `test-submit`, `test-check-item` and `test-bookmark` painted their padding and border on the host, so on such a page they lost both: a label against the edge of its fill, and no border.

The look now sits on an inner element, `<span class="control" part="button">`, in the shadow tree, where the page's `*` does not reach. The host keeps only what a reset leaves alone: its display, the cursor and the radius its focus ring follows. Nothing changes on a page without a reset. The inner element is also a new part: `test-next::part(button)` repaints the control from a host stylesheet.

`item-show-correct-response`, `item-show-candidate-correction` and `test-show-correct-response` get the same treatment: their padding is on the inner `div`.

If a host styled the controls by their host box (a `padding` or `border` set on `test-next` itself), that moves to `::part(button)`. The `--test-button-*` slots work as before.
