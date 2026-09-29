# @qti-components/corrections

## 0.4.0

### Minor Changes

- [#217](https://github.com/Citolab/qti-components/pull/217) [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Add `view` to `<qti-item>`, so view-tagged content — a scorer's `qti-rubric-block` above all — can be shown on an item delivered outside a test.

  QTI tags content with the audience it is for, and `item.css` hides every `[view]` element until something marks it `.show`. Only `TestViewMixin` ever did, off `sessionContext.view`. An item delivered on its own has no session, and nothing at item level did it either: `packages/qti-item` contained no occurrence of `view` at all. So the hide shipped in the _item_ stylesheet without its matching show, and a `qti-rubric-block view="scorer"` in a standalone item could not be displayed by any public API — the marker saw the question and nothing to mark against.

  The asymmetry was visible in this repo's own layout. `qti-corrections` has an item-level counterpart for every test-level correction control (`item-show-correct-response`, `item-show-candidate-correction`, `item-correct-response-mode`), but nothing matching `test-view`. And the Kennisnet VRT stories author `qti-rubric-block view="scorer"` into bare `qti-item-body` fragments with no test in the tree, where those blocks can never render.

  `ItemViewMixin` closes it, as the item-level twin of `TestViewMixin`:

  ```html
  <qti-item view="scorer">
    <item-container item-url="./path/to/item.xml"></item-container>
  </qti-item>
  ```

  It resolves the view on every change and whenever an item connects, toggling `.show` on `[view]` content inside the item, and accepts an `item-switch-view` event so a child control can drive it. A plain property rather than a session context: a session is precisely what a standalone item does not have.

  `QtiItemCorrection` pairs `scorer` with the answer key through the mixin's `updateAssessmentItemView` hook, which is byte-for-byte what `QtiTestCorrection` already does inside a test — so a marker switching view gets the rubric and the key together instead of asking for them separately. Without `@qti-components/corrections` loaded the mixin reveals the rubric and paints nothing else.

  One theme change comes with it: the structural rule is now `[view]:not(qti-item)`. `view` on content marks who it is for, but on the host it says which audience to resolve, and without the exclusion `<qti-item view="scorer">` would hide the item it configures wherever the sheet reaches the host — which it does in a shadow root that adopts `item.css` above `qti-item` rather than inside `item-container`. Both rules moved up one specificity point together, so their order relative to each other is unchanged.

  There is no item-level equivalent of `<test-view>` or `<test-view-toggle>` yet; `item-switch-view` is the hook for one.

### Patch Changes

- Updated dependencies [[`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`f08846d`](https://github.com/Citolab/qti-components/commit/f08846d28d4df75bcce80ea443b3c2662f4a7d9b), [`ef9793e`](https://github.com/Citolab/qti-components/commit/ef9793ef56ae950989e6d8e1e5b35d2ea3c64606), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`89727fa`](https://github.com/Citolab/qti-components/commit/89727fa0f9113fbd68ef46bf06a3c8839367c205), [`aee42e6`](https://github.com/Citolab/qti-components/commit/aee42e664e5c2dce5630cce0493118bff8655e7c), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`faf8844`](https://github.com/Citolab/qti-components/commit/faf884461a8fa9ad3a27e1a10e9311f2362595e5), [`4c59dc6`](https://github.com/Citolab/qti-components/commit/4c59dc6060fe83d0b92dde95e5c28924dbd87f54)]:
  - @qti-components/processing@1.6.0
  - @qti-components/base@2.3.0
  - @qti-components/elements@1.8.0
  - @qti-components/interactions-core@2.1.3
  - @qti-components/test@1.7.0
  - @qti-components/graphic-order-interaction@1.2.1
  - @qti-components/item@1.5.0

## 0.3.0

### Minor Changes

- [#194](https://github.com/Citolab/qti-components/pull/194) [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13) Thanks [@RyanPetersClassroomReady](https://github.com/RyanPetersClassroomReady)! - Reveal the solution after an ended attempt when `show-solution` says so.

  `test-navigation` settles item doneness on an ended attempt and hands it to a new
  `afterAttemptEnded` extension point, alongside the item and its computed-context entry. The hook is
  needed because the computed context only catches up on the next update, after the event has finished
  bubbling.

  `TestNavigationCorrection` overrides it for the standard `qti-item-session-control show-solution`:
  an ended attempt marks the candidate's selection, and a done item also reveals the correct answer.
  The player takes no opinion of its own — whether marks accumulate across attempts belongs to the
  corrections rendering, not to item session control.

### Patch Changes

- Updated dependencies [[`bad7a8a`](https://github.com/Citolab/qti-components/commit/bad7a8a052c009d80c343e828bee99df363c739b), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`db1364a`](https://github.com/Citolab/qti-components/commit/db1364adbf2f081f96cde3a9e5511a65c0a17d13), [`0173d1d`](https://github.com/Citolab/qti-components/commit/0173d1d93e6e780d97cf5c1412fad89cccf6743c)]:
  - @qti-components/interactions-core@2.1.1
  - @qti-components/test@1.6.0
  - @qti-components/base@2.2.0
  - @qti-components/elements@1.7.0
  - @qti-components/processing@1.4.1
