---
'@qti-components/test': patch
'@citolab/qti-components': patch
---

Make `@heximal/templates` a dependency of `@qti-components/test` instead of a peer.

A peerDependency says "there must be exactly one of these, and you own the choice". Neither half is
true here: `@heximal/templates` is a templating library used by seven files inside one package, it
has no singleton requirement, and no consumer has any reason to hold an opinion about its version.
Peering it just forced every consumer to install a transitive implementation detail by hand.

That was a real failure, not a theoretical one. Under an install that does not auto-install peers —
Yarn 2+, or pnpm with `auto-install-peers=false` — the published `@qti-components/test@1.6.1` cannot
resolve its own import:

```
@heximal/templates  ->  MODULE_NOT_FOUND
```

As a plain dependency it now installs automatically, and the consumer declares nothing.

`lit` and `@lit/context` stay peers, where the reasoning does hold: two copies of Lit mean two
`ReactiveElement` base classes, so `instanceof` fails across them, and Lit's own multi-version
warning fires.
