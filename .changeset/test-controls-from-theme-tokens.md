---
'@qti-components/test': minor
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The test controls take their colours from the theme, and everything a candidate presses answers the press.

- **Test controls** (`test-next`, `test-prev`, item and section links, submit, check, end attempt, bookmark, the text-to-speech buttons) read the theme's tier-1 tokens instead of literal colours. The neutral button is the page's surface (`--qti-color-base-100`) with the theme's border; `test-next` is filled with `--qti-color-neutral` and labelled in `--qti-color-neutral-content`. Hover and press mix the content colour into the fill (`--qti-hover-mix`, `--qti-active-mix`). Without the theme they fall back to the system colours `Canvas`, `CanvasText` and `Highlight`, so they follow the page's `color-scheme`. Every `--test-button-*` slot still works; new are `--test-button-active-background-color` and `--test-button-primary-active-background-color`. Hover now applies only on a device with a fine pointer, so it no longer sticks after a tap.
- **A press is visible.** Test controls, choices and chips (gap-match, match, associate, order) darken a little while pressed (`@mixin press`), paint only.
- **Text to speech.** The highlights are see-through tints of `--qti-color-info` (the element being read) and `--qti-color-warning` (the word being spoken), re-valued with `--test-tts-element-highlight` and `--test-tts-word-highlight`. A pressed TTS button falls back to `Highlight` without the theme.
- **A choice with a radio or checkbox shown has no fill**: it shows the page behind it, not the theme's white surface. Its selection and its correction are painted on the radio or checkbox, as before. A choice drawn as a box (`qti-input-control-hidden`) keeps its fill. While pressed, a chip that has been lifted (its placeholder) does not darken.
