---
name: qti-spec-check
description: Check what QTI 3 says before implementing or changing behaviour in qti-components - look up the XSD structure, the spec text and the 1EdTech conformance criterion, validate an item, and decide what wins when they disagree (XSD for structure, spec text for behaviour, then the suite). Use whenever a change touches how a QTI element, attribute, interaction, response or outcome processing behaves, or a conformance story or fixture.
argument-hint: '<element, attribute, criterion ID or behaviour>'
---

# QTI spec check

Authority (`.claude/rules/qti-spec.md`): **XSD** for structure → **spec text** for behaviour →
**conformance suite**. QTI 3 only.

## 1. Look it up

With the `qti-azure` MCP server:

- `get_qti_element_spec` for the element or attribute: allowed attributes, children, cardinality.
- `search_qti_docs` / `get_qti_doc_section` for the behaviour in the spec and implementation guide.
- `get_example_item` for a reference item; `validate_qti_item` to validate an item against the
  schema.

In the repo:

- Conformance stories: `apps/e2e/src/stories/conformance/**` (criterion IDs in story names).
- Suite fixtures: `public/assets/qti-conformance/` (never edited).
- Spec example items: `apps/e2e/src/tests/spec-example-items.spec.ts`.

## 2. Compare

Write down, with references: what the XSD allows, what the spec text says, what the suite criterion
and fixture expect, what the code does now.

## 3. Decide

- All agree and the code differs → fix the code; a host that breaks gets a host-migration entry.
- Two sources disagree → **stop and ask the user**, with the evidence from step 2 side by side.
  Never pick a deviation yourself and never add a non-QTI option to keep the old behaviour.
- The item is invalid per QTI → it must be rejected, and a story or spec asserts the rejection.

## 4. Prove it

A conformance story per criterion (ID in the name, unmodified fixture, assert response and outcome
variables after processing), or a spec for pure processing logic. A criterion not passed yet: the
story stays, tagged `todo` with `// todo: #n` or `phase N`.
