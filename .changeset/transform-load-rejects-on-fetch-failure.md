---
'@qti-components/transformers': patch
'@citolab/qti-components': patch
---

Reject `load()` when the XML fetch fails.

`qtiTransformTest().load()` and `qtiTransformManifest().load()` wrapped `loadXML` in a `new
Promise` that only ever called `resolve`. When the fetch failed — offline, CORS, a 404 — the
rejection had no handler, so it escaped as an unhandled rejection and the promise the caller was
awaiting never settled. A player awaiting `load()` hung there with no error to render and no way
to retry.

Both now `await loadXML` directly, so the failure propagates to the caller and an abort still
surfaces as `AbortError`. Successful loads resolve with the api as before.
