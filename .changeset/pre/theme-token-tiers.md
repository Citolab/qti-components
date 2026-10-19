---
'@qti-components/theme': minor
'@citolab/qti-components': minor
---

The theme's tokens are sorted into tiers, written down in `packages/qti-theme/CONTRACT.md` §8: tier 1 are the brand knobs (the only tokens with literal values), tier 2 is derived from them, tier 3 are the variables the theme hands to a component. In `qti-variables.css` a tier-1 token is tagged `/* t1 */`.

Every token block is now also declared on `[data-qti-theme]`. Set tier-1 tokens on an element with that attribute and the derived tokens inside it follow, so a part of a page can carry its own theme. Before, a derived token such as `--qti-bg-active` kept the value worked out at `:root`, whatever an ancestor of the item set.
