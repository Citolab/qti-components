---
'@citolab/qti-components': patch
---

Fix inherited attributes/members/slots/events/csspart metadata silently missing from the generated custom elements manifest and JSX types for components that only inherited an API from a mixin/base class and didn't declare an entry of their own. Caused by a breaking change in `@wc-toolkit/cem-utilities@1.6.0` that `@wc-toolkit/cem-inheritance` relies on; `@wc-toolkit/cem-utilities` is now pinned to `1.2.0` until upstream is fixed ([wc-toolkit/cem-inheritance#30](https://github.com/wc-toolkit/cem-inheritance/issues/30)).
