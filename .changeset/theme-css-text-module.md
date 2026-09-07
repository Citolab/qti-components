---
'@qti-components/theme': minor
'@qti-components/item': patch
'@qti-components/test': patch
'@citolab/qti-components': minor
---

Ship the theme sheet as a real module, so `@qti-components/item` and `@qti-components/test` can be
installed on their own.

Both packages adopt the theme into their shadow root, so they need the sheet as *text*. They got it
with `import itemCss from '../../../../qti-theme/src/item.css?inline'` — but `?inline` is
bundler-only syntax, and `tsc` (how all 32 non-umbrella packages build) copies the specifier through
verbatim. `@qti-components/item@1.4.3` therefore shipped that exact line. Two things wrong with it:
the `?inline` suffix no plain bundler resolves, and the path climbs out of the package into a
sibling directory that `files: ["dist"]` never publishes. Installing the package from npm and
bundling it fails outright:

```
✘ [ERROR] Could not resolve "../../../../qti-theme/src/item.css?inline"
    @qti-components/item/dist/components/item-container/item-container.js:15:20
```

It went unnoticed because the umbrella inlines these packages at build time and its esbuild plugin
resolves the `?inline` right there — inside the workspace, where `dist/` sits at the same depth as
`src/` and the relative path happens to land on a real file. Consumers of `@citolab/qti-components`
never saw the broken specifier. Consumers of the granular packages could not get past it.

`@qti-components/theme` now exposes `./item-css`, an ES module exporting the compiled sheet as a
string. It is generated from the already-built `dist/item.css` rather than by running PostCSS a
second time, and the result is byte-for-byte what the inline plugin produced (279,603 chars) — so
the text these containers adopt is unchanged and nothing renders differently. `item-container` and
`test-container` import that instead, and `@qti-components/theme` moves to a real `dependency` of
`@qti-components/item` (it already was one of `@qti-components/test`) so the topological build
order guarantees it exists first.

Verified: with the fix, `@qti-components/item` installed from a tarball bundles cleanly and carries
exactly one copy of the sheet.

Also in this change:

- **Every package now cleans before it builds.** None did, so `dist/` accumulated files whose
  sources were deleted — `@qti-components/corrections` was carrying a stale
  `dist/stories/with-correction-registry.decorator.js` from a removed source file, itself
  containing a `?inline` import. Nothing broken had actually shipped from this (the file was
  outside the published tarball), but `publish-if-needed.mjs` runs `--ignore-scripts`, so the
  tarball is whatever happens to be on disk.
- **An eslint rule** rejects `?inline`/`?raw`/`?url` specifiers in package sources, naming the fix
  in the message. `import/no-relative-packages` had already flagged the original line and was
  silenced with an inline disable; that disable is gone. Exempt: `packages/qti-theme` (owns the
  dev-side source shim), spec/story files and `apps/*` (never compiled into a published dist).
- The five spec files and two `apps/e2e` stories that loaded the sheet through `?inline` now use
  the same entry point as production, so they exercise the path consumers actually take rather than
  a dev-only one.
- Removed a dead `@qti-components/theme` mapping in the root `tsconfig.json` pointing at a
  `src/index.ts` that does not exist.
