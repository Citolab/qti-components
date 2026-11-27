---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`stateFromContexts(testContext, sessionContext?)` turns a `testContext` and `sessionContext` a 9.x host stored into a `QtiTestState`, so `qtiTest.state = stateFromContexts(saved, { navItemRefId })` resumes a session saved before `state` existed. It reads plain JSON as hosts stored it (no `type`, numbers as JSON numbers) and keeps values only, written as strings. `qtiTest.state` now reads the live contexts the same way, so a number in the test context is saved as a string (host migration: [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md)).
