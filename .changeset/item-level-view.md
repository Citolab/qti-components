---
'@qti-components/corrections': minor
'@qti-components/item': minor
'@qti-components/theme': patch
'@citolab/qti-components': minor
---

Add `view` to `<qti-item>`, so view-tagged content — a scorer's `qti-rubric-block` above all — can be shown on an item delivered outside a test.

QTI tags content with the audience it is for, and `item.css` hides every `[view]` element until something marks it `.show`. Only `TestViewMixin` ever did, off `sessionContext.view`. An item delivered on its own has no session, and nothing at item level did it either: `packages/qti-item` contained no occurrence of `view` at all. So the hide shipped in the *item* stylesheet without its matching show, and a `qti-rubric-block view="scorer"` in a standalone item could not be displayed by any public API — the marker saw the question and nothing to mark against.

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
