# Host migration notes

What a host must do when it upgrades `@citolab/qti-components`, one file per host. Hosts are the
apps in `/Users/patrickklein/Projects/PrototypesQTI`; the member tables in `plans/public-api.md`
say which host uses what.

- [kennisnet.md](kennisnet.md): Angular, `@kennisnet/qti-components` 7.28.1
- [citotestuit.md](citotestuit.md): React, `@citolab/qti-components` 9.3.0
- [peilinglezen.md](peilinglezen.md): pinned 7.14, surveyed by imports only
- [examenkompas.md](examenkompas.md): React, `@citolab/qti-components` 7.27.4

## Rule

A change that touches a member listed in `plans/public-api.md` adds or updates the entries here in
the same commit, and its changeset links to them.

## Entry format

```
### <change>  (since <commit> / PR #<n>)
Status: breaking | behaviour change | deprecated | recommended
Members: <host members it touches>
Do: <what the host must do>
Evidence: read from <file:line>, not run
```

Each file starts with a baseline (the version the host is on) and is appended in order, so a host
reads from its own version downward.

## Changes that hit every host

| Change                                                                                                                                                         | Since                        | Status                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- |
| `qtiTest.state` + `qti-state-changed`                                                                                                                          | PR #225                      | recommended                              |
| Public test events renamed `cito-*`; new `cito-test-navigated`                                                                                                 | PR #285                      | recommended, old names sent              |
| Public events renamed `qc-*`; `cito-*` still sent for one major; the 7.x names (`qti-request-navigation`, `test-end-attempt`, …) are gone                      | feat/parts-states-vocabulary | breaking (7.x names), aliases now        |
| `qti-test-context-updated`, `SessionContext.navItemLoading` / `navTestLoading`                                                                                 | PR #225                      | deprecated, removed in next major        |
| Restored template values are kept                                                                                                                              | PR #226                      | behaviour change                         |
| Session context labelled `sessionContext`                                                                                                                      | PR #227                      | devtools only                            |
| Interactions, feedback and `readonly` follow the item context; `qti-register-feedback` removed                                                                 | PR #228                      | behaviour change                         |
| Tier-1 theme tokens (`--cito-color-*`, `--cito-radius-*`, `--cito-size-*`, `--cito-border-width`, `--cito-font-family`, `--cito-depth`); old names are aliases | feat/theme-tokens            | recommended                              |
| One vocabulary for parts and states (qti-theme `CONTRACT.md` §3); old names still set                                                                          | feat/parts-states-vocabulary | breaking in next major, aliases now      |
| Theme inputs `--cito-*` → `--qc-*`, `--test-button-*` → `--button-*`, `qti-variables.css` internal; CONTRACT §11 is the override contract                      | feat/parts-states-vocabulary | recommended, old names read as fallbacks |

## Changes that hit one host

| Change                                                                                                             | Host         | Since   | Status                             |
| ------------------------------------------------------------------------------------------------------------------ | ------------ | ------- | ---------------------------------- |
| `disabled` follows the item context                                                                                | Kennisnet    | PR #229 | behaviour change                   |
| `qtiContext` on `qti-test`; `test-navigation.qtiContext` is a deprecated alias                                     | CitoTestUit  | PR #230 | deprecated alias, recommended move |
| Item validity published by the item (`ComputedItem.valid` stays right after a restore)                             | PeilingLezen | PR #231 | behaviour change                   |
| Components find their `qti-test` through context (callback and `<template item-ref>` now work across shadow roots) | CitoTestUit  | PR #232 | behaviour change                   |
