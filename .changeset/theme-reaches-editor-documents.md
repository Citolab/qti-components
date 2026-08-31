---
'@qti-components/theme': minor
'@qti-components/base': minor
---

Make the theme cover an editor document as well as a delivered item body, and
give author markup a look.

**`reset.css` is scoped to `.ProseMirror` too**

`@scope (qti-item-body)` → `@scope (qti-item-body, .ProseMirror)`. One definition
now normalises both a rendered item and the same markup being edited, instead of
the editor re-deriving it and drifting.

**New `prose.css`** — plain HTML author markup: tables, lists, headings, rules.
Sibling to `reset.css` and scoped the same way, imported from `index.css`.

Deliberately two scopes, and the shared one is **empty**. Rendered QTI has almost
no prose look on purpose: `.qti-bordered` exists precisely so table borders are an
author decision, and styling tables by default would take that decision away from
every delivered item. Authoring is the opposite — you cannot edit a grid you
cannot see — so the visible grid is scoped to `.ProseMirror` alone. Moving a rule
from the second scope to the first is a change to delivered items, and should be
made on purpose. Values route through `--qti-prose-*` with literal fallbacks.

**Image sizing**

`img:not([width])` → `img` for the `max-width: 100%` reset, so an author's
`width` attribute no longer opts a picture out of fitting its column. Interaction
content is exempt (`[response-identifier] img { max-width: none }`) — a hotspot or
graphic-gap-match image is positioned against its own coordinate space and must
not be scaled by the surrounding column.

**Paragraph margins** in author markup are normalised inside the scope: a
paragraph that is the only child of a non-`p` element loses its margins, and the
first/last paragraph of a `qti-simple-choice` loses its outer ones, so a choice
with several paragraphs keeps its internal rhythm without spacing away from its
own box.

**`@qti-components/base`: `QtiExpression` styles moved to a real CSS file**

`qti-expression.css`, imported with `?inline`, instead of an inline `css`
template — so DevTools reports a source file rather than an anonymous stylesheet.
The rule itself (`slot { display: none }`) is unchanged.

This is a packaging change, not only a source one: `build` now runs `build:assets`
to copy the file into `dist/abstract/`, and `src/css-inline.d.ts` declares the
`?inline` module shape. A consumer bundling from source needs a bundler that
understands `?inline` (Vite does); consumers of `dist` are unaffected.
