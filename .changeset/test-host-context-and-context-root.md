---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Components inside a `qti-test` now find it through context instead of `closest('qti-test')`. `closest()` stops at the first shadow root, so a `test-container` or item-ref that a host renders inside its own component skipped `postLoadTestTransformCallback` and `<template item-ref>` without a word; context crosses shadow roots. The context is internal to `@qti-components/test` and not exported.

A `ContextRoot` is attached to `document.documentElement`, once per page, when `@qti-components/base` loads. It holds a context request nobody answered and asks again when a provider connects, so a component that upgrades before the element providing its context still gets the value. It holds subscribing requests only, which every `@consume` in the library is, and holds them weakly. Code that registers elements in order is not affected.

What to check in a host:

- Anything that renders `test-navigation`, `test-container` or items inside a custom element's shadow root under a `qti-test`: `postLoadTestTransformCallback` and `<template item-ref>` now apply there.
- Pages that run other Lit contexts of their own: the root is page-wide and sees their unanswered requests too. It only replays them when a provider shows up, so nothing changes unless one was being missed.

Covered by this repo's stories and specs; not run against a host application. Host migration: [CitoTestUit](plans/host-migration/citotestuit.md).
