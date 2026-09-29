# @qti-components/transformers

## 1.7.3

### Patch Changes

- [#212](https://github.com/Citolab/qti-components/pull/212) [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Report a malformed item instead of rendering the browser's XML parse error as the item ([#211](https://github.com/Citolab/qti-components/issues/211)).

  `DOMParser.parseFromString(text, 'text/xml')` never throws: on a malformed document it returns a _document describing the failure_, an HTML page reading "This page contains the following errors…". `parseXML` and `loadXML` handed that straight back, `toHTML` copied it into the DOM node by node, and the player rendered the browser's error page as the item's content — silently, because `item-container` wraps both entry points in a `try`/`catch` that nothing ever reached.

  Both now detect the parser-error document and throw, carrying the parser's own message so the line and column of the real problem survive. The error document is matched by its namespace rather than by tag name, so an item that legitimately contains an element named `parsererror` is not mistaken for a failure.

  Leading whitespace and a BOM before the XML declaration are stripped before parsing. A blank line in front of `<?xml` is fatal to the letter of the XML spec, and it is also one of the most common artefacts of an item that has been through an editor or a copy and paste — the parser already tolerated the analogous BOM case. That is the input that surfaced this: it rendered as `error on line 2 at column 6: Invalid processing instruction: <?xml`.

## 1.7.2

### Patch Changes

- [#191](https://github.com/Citolab/qti-components/pull/191) [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reject `load()` when the XML fetch fails.

  `qtiTransformTest().load()` and `qtiTransformManifest().load()` wrapped `loadXML` in a `new
Promise` that only ever called `resolve`. When the fetch failed — offline, CORS, a 404 — the
  rejection had no handler, so it escaped as an unhandled rejection and the promise the caller was
  awaiting never settled. A player awaiting `load()` hung there with no error to render and no way
  to retry.

  Both now `await loadXML` directly, so the failure propagates to the caller and an abort still
  surfaces as `AbortError`. Successful loads resolve with the api as before.
