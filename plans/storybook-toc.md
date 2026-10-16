# Storybook table of contents

## Context
Storybook had 143 story files under 10+ unrelated prefixes (`Docs`, `E2E`, `Base`, `QTI Elements`,
`QTI Interactions`, `Item`, `QTI Processing`, `Test`, `Theme`) plus stray titles (`Meerkeuzevraag`,
`Test title 2`, `Stories/shuffle`, `TTS: no lang`, ~17x `QTI Kennisnet/Regression`, ...). The sidebar
now answers "what can I do" for a developer, and keeps the tests visible as evidence.

Storybook serves two purposes at once: documentation and a GUI for developers, and a testing
ground. Both stay in one Storybook; the structure keeps them apart.

## Split of responsibility
| Surface | Audience | Content |
| --- | --- | --- |
| Astro site | integrator who has QTI XML | Markup, plus a handful of CSS variables, events out and state back in. No JavaScript API. Not touched by the Storybook work. |
| Storybook | developer hosting, extending or working on components | Concepts, the public API, extending, cookbook, every component with its evidence, conformance and regression. |
| Spec files (`*.spec.ts`, `tests` project) | CI | Logic with nothing to look at. Not the evidence stories. |

## Sidebar (top level, in this order)
```
Introduction
Concepts                  how it fits together: item and test, variables, context, host in/out
QTI Test
  Overview, Navigation (Linear, Adaptive, Sequencing), Examples, Persist and restore
  Plugins                 the built-in plugins as reference: Text to speech, Bookmark, Print, Scoring, Stamp, View
  Building blocks         test-container, test-next/prev, test-item-link, section links, end attempt, ...
QTI Item                  qti-item, item-container, print variables, elements (feedback, stimulus-ref, stylesheet)
Interactions
  Evidence                generated matrix: interaction x topic, story counts
  <Name>/Overview         one per interaction, the only file with autodocs and getStorybookHelpers
  <Name>/<Topic>          Accessibility, API, Behavior, Configuration, Config Context, DOM Manipulation,
                          Forms, Theming, Validation, Vocabulary (Choice is the reference)
Extending QTI
  Creating an extended interaction   subclass Interaction; extend a built-in via class="type:..." + transformer
  Creating a plugin                  guide and requests
  Public API                         what extenders may depend on; links to API Reference
Theming                   CSS variable contract, theme
API Reference             Public API, custom elements manifest, Host API, Extension API, Test host API
Cookbook                  one recipe per host scenario: save and resume, bookmarks, review, backend scoring,
                          text beside its questions, plus the Kennisnet suite and corrections
Testing                   Conformance, Regression (VRT), Diagnostics, Shuffle, Base, Processing, E2E
Maintainers               Publishing
```
Rules behind it:
- Sort by task, not by package. Package names (`Base`, `QTI Processing`, `QTI Elements`) are gone from navigation.
- Every story file has an explicit `title:`; there are no `titlePrefix` globs. `storySort` in
  `.storybook/preview.ts` is written out in full because Storybook reads it statically.
- Names are English, no numeric prefixes, no brand names outside Cookbook.

## Evidence stays visible
Scenario stories (accessibility, API, behavior, configuration, config context, DOM, forms, theming,
validation, vocabulary) are evidence a human can read, so they stay stories, in the interaction's own
folder. Choice is the reference; the other interactions copy its topics. The Evidence page shows the
gaps. Only logic with nothing to look at is a spec.

The Overview of an interaction holds demos: a `Default` driven by controls and render-only variants.
Stories whose `play` is a behavior test live in the `Behavior` topic. A `play` that merely replays a
scripted demo (QTI Test navigation, plugins) stays where it is: it changes nothing a reader would not
choose to see, and text-to-speech stubs `speechSynthesis`, so browsing makes no sound.

## Decisions
- Kennisnet, CitoTestUit and PeilingLezen material is public: it is the Cookbook.
- `Concepts` is its own page.
- Conformance and the 17 regression stories stay stories (VRT needs them) under `Testing`.
- No docs-only Storybook build, no `!docs` tag.
- No global switch for autoplay. The audit found the Overview files, where people browse, hold at
  most 7 mutating stories left across 21 interactions, and the QTI Test sections are scripted demos
  or harmless tests.

## Verification
- `pnpm run storybook` and walk the tree top to bottom; no orphan titles.
- `pnpm run test` (stories and tests projects) and `pnpm run test:vrt` pass. VRT globs
  `apps/e2e/src/**/kennisnet.stories.ts`; its baselines are keyed by file, not by title.
- Open `Interactions/Evidence` and check that the counts match the sidebar.

## Open
- Replicate Choice's evidence topics in the other interactions (see the Evidence page for the gaps).
- Decide whether `transformer.extendElementsWithClass` joins the Public API: the extended-interaction
  guide uses it, and only `extendElementName` is listed today.
- The Astro site still documents JavaScript; trimming it is a separate piece of work.
