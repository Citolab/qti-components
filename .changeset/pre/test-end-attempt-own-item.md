---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

`test-end-attempt` ends the attempt of its own item when it has one, like `test-bookmark`.

Stamped into a `<template item-ref>`, each item gets its own button, which ends the attempt of that item and is `disabled` by that item's state (`max-attempts`, `numAttempts`, an optimal or completed attempt). With `<qti-test navigate="section">` every item of the section is on screen, so a candidate can check them one by one in any order. A new `item` attribute (an item-ref identifier) names the item from anywhere. In the toolbar, without either, it follows the item on screen as before.

`cito-test-end-attempt` carries the item as `{ itemId }`; `test-navigation` then processes that item's response instead of the one on screen. Without `itemId` nothing changes.
