---
'@citolab/qti-components': patch
---

Declare the shared runtime dependencies through a pnpm catalog, so Lit cannot drift out of
alignment again.

`lit` was hand-written in 62 places across 34 manifests at two different ranges — `^3.3.1` in every
`peerDependencies` block, `^3.3.3` in every `devDependencies` block — and `@citolab/qti-components`
declared `^3.3.3` as a hard `dependency`. A consumer pinned to 3.3.1 or 3.3.2 could satisfy the
parts and not the umbrella, which is how a package manager ends up installing a second copy of Lit.
Two copies mean two `ReactiveElement` base classes (`instanceof` fails across them) and two
`@lit/context` registries; because the contexts in `@qti-components/base` are keyed with a unique
`Symbol()` rather than `Symbol.for`, every `@consume` then silently never resolves — no error, no
log.

`lit`, `@lit/context` and `@heximal/templates` now live in the `catalog:` block of
`pnpm-workspace.yaml`, and every manifest references them as `"catalog:"`. The peer and dev ranges
are unified on `^3.3.1`, the wider of the two: it still installs 3.3.3 locally, and narrowing it
would exclude consumers the sibling packages already accept.

The only change to a published manifest is `@citolab/qti-components`'s `dependencies.lit`, which
widens from `^3.3.3` to `^3.3.1` to match its own parts. Every other packed manifest is byte
identical — `pnpm pack` and `pnpm publish` resolve `catalog:` back to the real range in
`dependencies`, `devDependencies` and `peerDependencies` alike. No resolved version changes.

Two pieces of tooling had to move with it, because **npm does not understand the `catalog:`
protocol and copies the literal string through**:

- `tools/testing/consumer-types.mjs` now packs with `pnpm pack` instead of `npm pack`, and asserts
  the packed manifest contains no leftover `catalog:` or `workspace:` range.
- The pkg.pr.new prerelease workflow now passes `--pnpm`. pkg-pr-new shells out to `<pm> pack` and
  that pm defaults to npm, so without the flag every prerelease tarball would have declared
  `"lit": "catalog:"` — not a version range — and failed to install downstream.

The `storybook` override also moves to the catalog, retiring the deprecated `$storybook`
version-reference syntax that publint was warning about.
