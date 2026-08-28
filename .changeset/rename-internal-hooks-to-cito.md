---
'@qti-components/theme': patch
'@qti-components/elements': patch
'@qti-components/graphic-order-interaction': patch
---

Move the last two internally-minted `qti-` presentation classes to the `cito-` prefix. The
`qti-` prefix is 1EdTech's; see `tools/qti-vocabulary/check.mjs` for why squatting inside it
is a standing collision risk.

- `qti-dialog` → `cito-dialog` (`qti-modal-feedback`). Not observable outside the component:
  the class only ever existed inside its own shadow root, and the public styling contract is
  and remains `part="feedback"`.
- `qti-graphic-order-marker` → `cito-graphic-order-marker`, and
  `qti-graphic-order-marker--poly` → `cito-graphic-order-marker--poly`
  (`qti-graphic-order-interaction`). **Potentially breaking for custom CSS.** Unlike the
  above, this class is applied to light-DOM children, so it is externally targetable, and
  `@qti-components/theme` ships a rule for it. Any downstream stylesheet targeting
  `.qti-graphic-order-marker` must be updated to the new name.

Not renamed, deliberately: `qti-shared-stimulus` and `qti-base-stimulus`. Neither is
referenced by any shipped code — they appear only in sample content under `public/assets`
(including stylesheets items load via `qti-stylesheet`) and in story markup. The component's
actual contract is the `data-stimulus-idref` attribute. Renaming those would mean editing
authored content to match our code.
