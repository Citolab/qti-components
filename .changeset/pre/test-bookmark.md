---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

New plugin `<test-bookmark>`: a toggle (`role="button"`, `aria-pressed`) inside `<test-navigation>` that marks an item to come back to. In the toolbar it marks the item on screen; in `<template item-ref>` each item gets its own button, which marks that item. The marks are the item-ref identifiers in `state.session.plugins.bookmarks`, so a host that stores `state` stores them and a reloaded test shows them again. It reflects `bookmarked` and `disabled` on the host for styling; `bookmarkedItems(computedContext)` gives a host's own navigation the marks.

CitoTestUit can replace `marked` on its context items with it; see `plans/host-migration/citotestuit.md`.
