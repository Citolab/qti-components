---
'@qti-components/theme': minor
'@qti-components/upload-interaction': minor
'@citolab/qti-components': minor
---

End attempt and upload look like the test controls.

- **End attempt:** its button (`::part(button)`) is drawn like Previous and the item links: the theme's surface, border and radius, with the same hover, press and focus ring, and muted when disabled. It was the browser's default button.
- **Upload:** the file input carries a new part, `input`, and its button (`::part(input)::file-selector-button`) is drawn the same way; the file name beside it takes the item's type and colour.
- Both read the `--test-button-*` slots with the test controls' defaults, through the new `@mixin test-button`, so a host that repaints its test buttons repaints these too.
