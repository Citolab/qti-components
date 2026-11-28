# @qti-components/transformers

## 1.8.0-next.4

### Minor Changes

- [#378](https://github.com/Citolab/qti-components/pull/378) [`f2b2a07`](https://github.com/Citolab/qti-components/commit/f2b2a074f32f3c6709089e0d9d8648c98b842f93) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-selection` takes effect: when a test loads, each section presents the item-refs and subsections its selection picks, required ones always, the same for the same `qtiContext` seed, before ordering shuffles them (implementation guide §4.5.1). `qtiTransformTest().applySelection(seed)` does it, and `test-container` calls it before `shuffleOrdering`. A `with-replacement` clone is a copy of the item-ref (or subsection) with the next instance id, `item-3#2`. A selection QTI calls an error stops the test loading; a `qti-selection` with attributes or children it does not know is ignored. Answers in a restored state for items the test does not present are dropped with a console warning. Conformance S3-L2-D1/D2 and S4-L2-D1 pass (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).

### Patch Changes

- Updated dependencies [[`6613f9a`](https://github.com/Citolab/qti-components/commit/6613f9a89de9c89b0d42c4b03950a8b9e58f8d0f)]:
  - @qti-components/delivery@0.1.0-next.3

## 1.8.0-next.3

### Minor Changes

- [#376](https://github.com/Citolab/qti-components/pull/376) [`8719d6c`](https://github.com/Citolab/qti-components/commit/8719d6c8658c42b0649ca2a38f79386f074c4a9c) Thanks [@herrKlein](https://github.com/herrKlein)! - Section ordering follows QTI 3 (implementation guide §4.5.2): in a section with `<qti-ordering shuffle="true">`, a subsection moves as one block and stays a section, with its rubric blocks and session control, unless it is both `visible="false"` and `keep-together="false"`; only then do its item-refs and subsections merge into the parent, carrying its `qti-item-session-control`. A visible subsection with `keep-together="false"` is no longer split up. A `qti-ordering` with attributes or children other than `shuffle` is an extension for another algorithm and is ignored (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).

## 1.8.0-next.2

### Minor Changes

- [#373](https://github.com/Citolab/qti-components/pull/373) [`ffd4e9a`](https://github.com/Citolab/qti-components/commit/ffd4e9a581f59bc790b442b4ab28876c8176a378) Thanks [@herrKlein](https://github.com/herrKlein)! - A test loaded by URL includes every `qti-assessment-section-ref`: the referenced section replaces the reference before ordering and the transform callback, under the reference's `identifier`, with its URLs still pointing at its own files (QTI 3 info model §7.5). A test given as a string keeps the reference, with a warning.

  Next and Previous follow the test's document order in nested sections; in a linear part where a section's item-refs and subsections interleave, Next could get stuck. Each `computedContext.testParts[]` carries `itemOrder`, and `itemsInOrder(testPart)` from `@qti-components/test` reads a part's items in that order (host migration: [Kennisnet](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/kennisnet.md), [CitoTestUit](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/citotestuit.md), [PeilingLezen](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/peilinglezen.md), [ExamenKompas](https://github.com/Citolab/qti-components/blob/next/plans/host-migration/examenkompas.md)).

## 1.8.0-next.1

### Patch Changes

- [#358](https://github.com/Citolab/qti-components/pull/358) [`8df1bea`](https://github.com/Citolab/qti-components/commit/8df1beaa8b9833661cb91f5daa067101eb5c8f99) Thanks [@herrKlein](https://github.com/herrKlein)! - The seeded shuffle of sections and interactions now comes from `@qti-components/delivery`, a new dependency. The order for a given seed is unchanged.
- Updated dependencies [[`8df1bea`](https://github.com/Citolab/qti-components/commit/8df1beaa8b9833661cb91f5daa067101eb5c8f99), [`f1718a8`](https://github.com/Citolab/qti-components/commit/f1718a843fafef1e339daa4ddac38d3338f1f34e)]:
  - @qti-components/delivery@0.1.0-next.0

## 1.8.0-next.0

### Minor Changes

- [#345](https://github.com/Citolab/qti-components/pull/345) [`f450725`](https://github.com/Citolab/qti-components/commit/f450725ce5d9223345b33a52654a9d85dc5b9ce8) Thanks [@herrKlein](https://github.com/herrKlein)! - `qtiTransformItem()` has a `validateBindings()` step: it throws a `QTI validation error` listing every interaction bound to a response it cannot hold, by the base-type, cardinality and max-choices / max-associations rules the information model states for each interaction (for example an inline choice interaction bound to multiple cardinality, §5.74). `load()` and `parse()` do not run it; a host calls it and shows the error. Conformance: Q12-L2-I21, Q12-L2-D21.

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
