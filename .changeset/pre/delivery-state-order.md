---
'@qti-components/delivery': minor
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`qtiTest.state` reports a value it cannot read with `qc-test-state-refused` (`{ message, state }`), sent once the test has loaded, instead of only a console warning; the test goes on without it (host migration: [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md)).

`DeliveryState` (experimental) gets `order`, the item instances after selection and ordering, and `plugins`. `createDeliveryState` takes an `order`, and `parseDeliveryState` checks every field and refuses a state with a missing or mistyped one.
