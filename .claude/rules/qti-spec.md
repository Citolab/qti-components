---
paths:
  - 'packages/qti-elements/**'
  - 'packages/qti-processing/**'
  - 'packages/qti-loader/**'
  - 'packages/qti-transformers/**'
  - 'packages/qti-test/**'
  - 'packages/qti-item/**'
  - 'packages/interactions/**'
  - '**/*.xml'
  - 'apps/e2e/src/stories/conformance/**'
---

# QTI conformance

## Authority, in this order

1. **The QTI 3 XSD** decides structure: which elements and attributes exist and where.
2. **The QTI 3 spec text** (and the 1EdTech implementation guide) decides behaviour.
3. **The 1EdTech conformance suite** shows the expected behaviour per criterion.

When two disagree, stop: present the evidence (the XSD fragment, the spec section, the criterion
and fixture) and ask. Never pre-pick a deviation, never add a non-QTI option to keep old
behaviour; a host that breaks gets a host-migration entry instead. Use the `/qti-spec-check` skill
and the `qti-spec-reviewer` agent; the `qti-azure` MCP server has the spec, element specs and item
validation.

## Scope

- QTI 3 only. QTI 2.x is not supported (roadmap phase 15 removes what remains).
- A delivery option that QTI does not define is allowed only when `plans/host-api.md` lists it, as
  an attribute with a reflecting property.

## Names

- `qti-` belongs to 1EdTech: use it only for what QTI defines (elements, attributes, the shared
  vocabulary classes). Everything ours is `qc-`, except the host elements `qti-test` and `qti-item`,
  which keep their names.
- QTI element and attribute names are spelled exactly as in the XSD; never invent a `qti-*`
  element, attribute or class.

## Fixtures

- Every valid item fixture validates against the XSD (planned, roadmap G3; not enforced yet).
- Suite fixtures are never edited.
- An item that QTI says is invalid is rejected, and a story or spec asserts the rejection.
