---
paths:
  - 'packages/qti-extended/**'
---

# Test plugins (`qti-extended`)

- **Host API only.** A plugin uses what `plans/host-api.md` lists and nothing else
  (`plugin-boundary.spec.ts`). When a plugin needs more, the missing piece becomes a host-API
  member; never a private import. Plugins are the proof the host API is enough.
- **Each plugin ships**: a main docs story plus an `.api` story (`.claude/rules/stories.md`);
  styling through parts, states and `--qc-*` inputs only, no token names of its own; a correct
  rendering on a bare page with no theme, painting itself from the tier-1 inputs like the `test-*`
  controls; a page on the Astro site.
- Published alone with the umbrella as a peer dependency; never re-exported from the umbrella.
