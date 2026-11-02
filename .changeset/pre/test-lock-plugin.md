---
'@qti-components/extended': minor
---

New plugin `<test-lock>`, ported from the prototype in QTI-Extended and rebuilt on the public plugin API. It locks the test when the candidate leaves the page (another tab or window, or the page hidden) and covers it with a modal until it is unlocked. Focus moving into an iframe of the test, such as a portable custom interaction, does not lock it.

The lock lives in the test's state under `session.plugins.lock` (`{ locked, times }`), so a host that stores `state` keeps it over a reload, and `times` shows a proctor how often the candidate left; `lockState(computedContext)` reads it. With a `code` the modal asks for it; without one only the host unlocks, with `unlock()`. It fires `lock` and `unlock`; the labels are attributes (Dutch by default) and the message is its content. It is a deterrent for a supervised session, not security: the code is in the page.
