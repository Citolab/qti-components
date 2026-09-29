---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Add `item` to the `<template item-ref>` model on `qti-assessment-item-ref`.

`item` is this ref's entry in the computed context — the same object the stamps iterate as `item` —
so a template can show `{{ item.index }}`, `{{ item.score }} / {{ item.maxScore }}` and the rest of
the item's state. The element subscribes to the context, so the template re-renders as scores come
in. Undefined until the test has computed it.
