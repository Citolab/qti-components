---
paths:
  - 'apps/site/**'
  - 'docs/**'
  - '**/*.mdx'
---

# Documentation

- **The Astro site (`apps/site`, Starlight) holds the docs; Storybook is the lab.** All prose
  (guides, theming, host integration, element pages) lives on the site. Storybook keeps autodocs and
  live examples and links to the site. No prose page exists in both; `docs/*.mdx` moves to the site
  in roadmap phase 16, so do not add prose there.
- **Pages are short and task-first**: one task per page, plain English, one live demo (the Getting
  started test), code a host can copy. Rules stay in `CONTRACT.md` and `plans/host-api.md`; pages
  link to them rather than restate them.
- **Live demos** import the built workspace packages and the shared fixtures; no Storybook iframes,
  no screenshots of components.
- **Every public member** (in `plans/host-api.md`) has JSDoc: a description, `@fires`, `@csspart`,
  `@cssstate`. A change to a public member updates its site page in the same PR.
- The site type-checks and builds in CI, `astro check && astro build` (planned, roadmap G4; not
  enforced yet).
