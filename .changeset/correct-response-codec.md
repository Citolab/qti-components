---
'@qti-components/base': minor
---

Extract the canonical `correct-response="..."` attribute codec into
`@qti-components/base` so the runtime and downstream editors (e.g.
`@citolab/prose-qti`) share one implementation and cannot drift.

- New module `lib/correct-response.ts` exports `parseCorrectResponseAttribute`
  / `serializeCorrectResponseAttribute` plus value-shape helpers
  `iterCorrectResponseValues`, `parsePair` / `serializePair`,
  `parsePoint` / `serializePoint`.
- New type exports document the on-the-wire format:
  `CorrectResponseValue = string | string[] | null`, `Identifier`,
  `DirectedPair = \`${string} ${string}\``, `Point = \`${number} ${number}\``.
- `Interaction.correctResponse` setter now delegates to the shared parser
  instead of duplicating the comma-split / trim logic inline. Observable
  behaviour is unchanged: `null` / empty → `null`, no comma → trimmed
  string, one-or-more commas → trimmed `string[]` with single-element
  collapse to a string.
- Format reference (per interaction) is documented in the new module's
  header — single source of truth for what `"A,B,C"` vs `"src tgt,..."`
  vs `"x y,..."` mean.
