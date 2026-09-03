---
'@qti-components/elements': patch
'@citolab/qti-components': patch
---

Substitute response processing templates in the element's own custom element registry.

`qti-response-processing` with a `template="…/rptemplates/map_response.xml"` attribute replaces its
children with the built-in rules for that template. It parsed them with
`document.createRange().createContextualFragment()`, and the fragment parsing algorithm takes its
registry from the context node — `document`, so the global registry. In a player rendered into a
shadow root with a scoped registry whose tags are also defined globally, every substituted rule was
upgraded with the global class instead of the scoped one, so a registry that overrides a rule (what
`qti-corrections` does) never saw its own element.

The rules are now parsed through the element's own `innerHTML`, where the context element is the
`qti-response-processing` itself and its registry — scoped or global — is the one that upgrades
them. An unrecognised template name also leaves the authored children in place instead of clearing
them.
