---
'@qti-components/base': minor
'@qti-components/elements': minor
'@citolab/qti-components': minor
---

Feedback asks the host before it shows or hides: `cito-feedback-show` and `cito-feedback-hide`, both cancelable, so a host can show feedback its own way (a toast, a dialog, an animation).

Both are sent by `qti-feedback-block`, `qti-feedback-inline` and `qti-modal-feedback`, just before `showStatus` changes, bubble and are composed. `detail` is `{ kind: 'block' | 'inline' | 'modal', identifier, outcomeIdentifier, element, itemIdentifier? }`. Calling `preventDefault()` on `cito-feedback-show` keeps the element hidden (a modal does not open), with its content still in the DOM for the host to read or clone; the host is not asked again until the condition has gone. Cancelling `cito-feedback-hide` keeps it showing. A feedback the host took over sends no hide event. A repeat attempt that ends in the same outcome sends nothing: the item publishes the final values once, so the feedback never passes through the reset to its default. Without a listener that cancels, nothing changes.
