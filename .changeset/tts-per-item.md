---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`<test-item-to-speech>`:

- Skips content that is not rendered (hidden feedback, a scorer-only rubric block) and reads it once it is shown.
- Decides which item to read from where it is placed: inside a `qti-assessment-item-ref` (e.g. a `<template item-ref>`) it reads that item; anywhere else it follows the navigation cursor, as before.
- Keeps working after navigating to the item already on screen.

`item-ref-id` is removed: a player in a `<template item-ref>` already reads its own item without it. A player outside any item ref that used `item-ref-id` to pin one item now follows navigation instead.
