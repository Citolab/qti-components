---
'@qti-components/base': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Test plugins can keep state that survives a reload. `QtiTestState.session.plugins` holds one JSON entry per plugin name; a plugin writes it with the request `cito-test-update-plugin-state` (`{ plugin, value }`, `null` removes the entry) and reads it from `computedContext.plugins` (or `pluginState(computedContext, name)`, typed by augmenting `QtiTestPluginState`). A host that already stores `state` stores it, because a change fires `cito-test-state-changed`. Entries of plugins that are not loaded are kept on a round trip. No `version` bump: the field is optional.
