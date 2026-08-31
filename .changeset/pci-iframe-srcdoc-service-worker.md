---
'@qti-components/portable-custom-interaction': patch
---

Build the PCI iframe with `srcdoc` instead of a `blob:` object URL, and point
`<base href>` at `data-base-url` instead of the site origin.

A blob URL document is out of scope for any http(s) Service Worker
registration, so a player that serves package resources through a Service
Worker never saw the requests made from inside the interaction - module
scripts, images, media, stylesheets and the PCI's own fetches all bypassed it
and hit the network, where they 404 or land on an SPA fallback. An `srcdoc`
frame inherits the embedding document's URL and stays controlled by the same
Service Worker. It is same-origin either way, and messages already post with a
`'*'` target origin, so postMessage is unaffected.

The `<base href>` change makes relative URLs in the interaction markup resolve
against the item's directory the way the package author wrote them, rather
than against the site root.
