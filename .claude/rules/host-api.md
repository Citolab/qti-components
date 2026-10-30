---
paths:
  - 'packages/qti-test/src/**'
  - 'packages/qti-item/src/**'
  - 'plans/host-api.md'
  - 'plans/host-migration/**'
---

# Host API and migration notes

`plans/host-api.md` is the host API: what implementing parties may use, change and rely on, and
every decision about it. A member not on that page is internal (`@internal`, stripped in phase 10).
`plans/host-migration/{kennisnet,citotestuit,peilinglezen,examenkompas}.md` say what each host uses
and must do. In the same commit as the change:

- A change that touches a member in `host-api.md` adds or updates the entries for every host that
  uses it, and its changeset links to them. Its JSDoc and its site page change in the same PR.
- A change that gives hosts a better way to do something (a new member replacing a workaround) adds
  a `recommended` entry to the affected hosts' files, naming the workaround it replaces.
- A survey that shows a host using a member writes it into that host's file.
- Entries found by reading source, not running the host, say so.
- A decision goes into `host-api.md` → Decided; the roadmap phase that finds it gets a line under
  Found.
