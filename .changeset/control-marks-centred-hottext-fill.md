---
'@qti-components/theme': patch
'@citolab/qti-components': patch
---

Radio and checkbox marks sit dead centre at any size, and a plain hottext has the field surface.

- **Marks:** `--qti-control-size` and the marks drawn inside a control (the radio's dot, the checkbox's tick box) are rounded to an even number of pixels. At a fractional size (19.2px with `--cito-size-selector: 0.3em`) the gap round the dot was fractional, the ring and the dot antialiased differently, and the dot looked off centre. At the default 16px nothing changes.
- **Hottext:** a hottext without `qti-input-control-hidden` or `qti-unselected-hidden` fills with the field surface (`--qti-bg`), as a text entry does, so on a tinted page or in a theme without borders a word still shows it can be picked. On a white page nothing changes.
