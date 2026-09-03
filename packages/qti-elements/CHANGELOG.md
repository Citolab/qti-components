# @qti-components/elements

## 1.6.5

### Patch Changes

- [`29ed97e`](https://github.com/Citolab/qti-components/commit/29ed97ef79018aa99d941e7d425ac72fa9100abf) Thanks [@Marcelh1983](https://github.com/Marcelh1983)! - Substitute response processing templates in the element's own custom element registry.

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

- Updated dependencies [[`d14ea7d`](https://github.com/Citolab/qti-components/commit/d14ea7d5bfac76a138c9c870e11491c9c63469f9), [`3fab714`](https://github.com/Citolab/qti-components/commit/3fab714904293e58e53c0661792f564d84f76bed)]:
  - @qti-components/base@2.1.0
  - @qti-components/transformers@1.7.2
