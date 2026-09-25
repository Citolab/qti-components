---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

Finish the `<template item-ref>` hook on `qti-assessment-item-ref`.

The element has carried a `myTemplate` property and a `render()` that branches on it since the
stamp components were written, but the one line that resolves the template was commented out, so
`myTemplate` was never assigned and the branch was dead. A host that wanted to put its own chrome
around every item — a bookmark, an index number, a score badge — had no seam at all, and the only
way in was to replace the registered element.

Put a `<template item-ref>` in the light DOM of your `<qti-test>` and every item-ref in the test
renders with it:

```html
<qti-test>
  <template item-ref>
    <div class="badge">{{ identifier }}</div>
    {{ xmlDoc }}
  </template>
  …
</qti-test>
```

The template is the whole render, so it places `{{ xmlDoc }}` itself; leaving it out renders the
chrome and no item. Without a template the element renders the item exactly as before, so this is
additive — nothing that works today changes.

The model is `ItemRefTemplateModel`: `xmlDoc`, `identifier`, `href`, `category`, and `itemRef` as
the escape hatch for a template that needs a handler or a host value, reached through a property on
the element.

`item` is this ref's entry in the computed context — the same object the stamps iterate as `item` —
so a template can show `{{ item.index }}`, `{{ item.score }} / {{ item.maxScore }}` and the rest of
the item's state. The element subscribes to the context, so the template re-renders as scores come
in.

Two fixes to the commented code it replaces. The lookup assumed the ref always sits directly inside
a shadow root (`getRootNode().host.closest('qti-test')`), which throws for a ref in plain light DOM
and for one nested deeper than one root; it now climbs root by root and gives up quietly when there
is no enclosing `<qti-test>`. And `myTemplate` was declared as an always-assigned
`TemplateFunction`, which it never was — it is now `TemplateFunction | null`, matching
`test-scoring-buttons`.
