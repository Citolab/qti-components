import { describe, expect, it } from 'vitest';

/**
 * A plugin is a set of files that knows the test; the test does not know them. Delete the files
 * and their line in `plugins/elements.ts` and nothing else may refer to them. These checks keep it that way for
 * every plugin in `PLUGINS` — a new reference from outside, or a reach from inside into the
 * test's internals, fails here instead of quietly turning the plugin back into part of the core.
 *
 * Plugins live in two packages: the ones a test runner needs in `@qti-components/test`
 * (`plugins/elements.ts` composes them), the candidate's toolbar in `@qti-components/extended` (its
 * `elements.ts` composes them). That one reaches the test only through the umbrella's subpaths
 * (`@citolab/qti-components/qti-test/plugin-api`, `/qti-test`, `/qti-base`), so a host has one copy.
 *
 * Adding a plugin means adding one entry to `PLUGINS`.
 *
 * Stories may show plugins side by side, so a `.stories.ts` file outside the folder may name a
 * plugin's tags; production code may not.
 */
interface Plugin {
  /** The plugin's name, for the report. */
  name: string;
  /** The package it lives in; `qti-test` unless said otherwise. */
  package?: 'qti-test' | 'qti-extended';
  /** Its folders under the package's `src/`, with a trailing slash. A plugin is these files. */
  folders: string[];
  /** Anything that names the plugin: tags, classes, contexts, attributes, import paths. */
  reference: RegExp;
  /** Imports the plugin may use beyond the common ones below. */
  allow?: RegExp[];
  /** Path prefixes of packages that build on the plugin's `/elements` entry (an override, an extension). */
  consumers?: string[];
}

const PUBLIC_EVENTS_FROM_COMPONENTS = /^\.\.\/\.\.\/public-events$/; // the public event names and helpers
/** A story runs a shared demo test: Getting started or the showcase (CLAUDE.md, Docs demos). */
const DEMO_TEST_FROM_COMPONENTS = /^\.\.\/qti-test\/(?:getting-started|showcase)\.fixtures$/;
const STYLES_FROM_COMPONENTS = /^\.\.\/styles$/; // the shared look of the test controls

/* What a plugin in `@qti-components/extended` may take from the test. */
// Through the umbrella only, so a host has one copy of the test and its contexts.
const TEST_PLUGIN_API = /^@citolab\/qti-components\/qti-test\/plugin-api$/; // events, plugin state, control styles
const TEST_ELEMENTS = /^@citolab\/qti-components\/qti-test$/; // the public elements, as types
const UMBRELLA_BASE = /^@citolab\/qti-components\/qti-(base|elements)$/; // computedContext; element types
const HOST_REGISTRATION = /^@citolab\/qti-components$/; // a spec registers everything the way a host does
const EXTENDED_REGISTRATION = /^\.\.\/register$/; // a spec registers the extended plugins the way a host does
const DEMO_TEST_FROM_EXTENDED = /^\.\.\/(?:showcase|getting-started)\.fixtures$/;
const EXTENDED = [
  TEST_PLUGIN_API,
  TEST_ELEMENTS,
  UMBRELLA_BASE,
  HOST_REGISTRATION,
  EXTENDED_REGISTRATION,
  DEMO_TEST_FROM_EXTENDED
];

const PLUGINS: Plugin[] = [
  {
    name: 'bookmark',
    package: 'qti-extended',
    folders: ['test-bookmark/'],
    reference: /test-bookmark|TestBookmark|bookmarkedItems/,
    allow: EXTENDED
  },
  {
    name: 'character-sheet',
    package: 'qti-extended',
    folders: ['test-character-sheet/'],
    reference: /test-character-sheet|TestCharacterSheet/,
    allow: EXTENDED
  },
  {
    name: 'zoom',
    package: 'qti-extended',
    folders: ['test-zoom/'],
    reference: /test-zoom|TestZoom|zoomElements|zoomLevel/,
    allow: EXTENDED
  },
  {
    name: 'tts',
    package: 'qti-extended',
    folders: ['tts/'],
    reference:
      /test-item-to-speech|test-tts-|ttsContext|ttsElements|TestItemToSpeech|TestTts|data-tts-content|\/tts['/]/,
    allow: EXTENDED
  },
  {
    name: 'stamp',
    package: 'qti-extended',
    folders: ['test-stamp/'],
    reference: /test-stamp|TestStamp|stampContext/,
    allow: [...EXTENDED, /^\.\.\/test-print-context\/test-print-context$/] // a story shows it next to the stamp
  },
  {
    name: 'print',
    package: 'qti-extended',
    folders: ['test-print-context/', 'test-print-item-variables/', 'test-print-state/'],
    reference:
      /test-print-context|TestPrintContext|test-print-item-variables|TestPrintVariables|formatVariableValue|test-print-state|TestPrintState/,
    allow: EXTENDED
  },
  {
    name: 'scoring',
    package: 'qti-extended',
    folders: ['test-scoring-buttons/', 'test-scoring-feedback/'],
    reference: /test-scoring-buttons|TestScoringButtons|test-scoring-feedback|TestScoringFeedback/,
    allow: EXTENDED
  },
  {
    name: 'view',
    package: 'qti-extended',
    folders: ['test-view-toggle/', 'test-view/'],
    reference: /test-view-toggle|TestViewToggle|<test-view[\s>]|TestView\b/,
    allow: [...EXTENDED, /^\.\.\/test-view-toggle\/test-view$/] // the view story types the element next to the toggle
  },
  {
    name: 'links',
    package: 'qti-extended',
    folders: ['test-item-link/', 'test-section-link/'],
    reference: /test-item-link|TestItemLink|test-section-link|TestSectionLink/,
    allow: EXTENDED
  },
  {
    name: 'submit',
    folders: ['components/test-submit/'],
    reference: /(?<![\w-])test-submit(?![\w-])|TestSubmit/,
    allow: [PUBLIC_EVENTS_FROM_COMPONENTS, STYLES_FROM_COMPONENTS]
  }
];

const COMMON_ALLOWED = [
  /^\.\//, // its own files
  /^lit(\/|$)/,
  /^@lit\//,
  /^@open-wc\/lit-helpers$/,
  /^@qti-components\/utilities$/, // generic helpers, no QTI semantics
  /^@heximal\/templates$/,
  /^@qti-components\/(base|elements)$/,
  /^storybook\//,
  /^@storybook\//,
  /^@wc-toolkit\//,
  /^shadow-dom-testing-library$/,
  /^vitest$/,
  /\/tools\/testing\//,
  /\/\.storybook\//
];

const sources = import.meta.glob<string>('/packages/**/src/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true
});

/** The one place per package that composes its plugins; it names each one by design. */
const PLUGIN_ENTRIES = [
  '/packages/qti-test/src/plugins/',
  '/packages/qti-extended/src/test-controls-css-reset.spec.ts', // checks several plugins' controls at once
  '/packages/qti-extended/src/elements.ts',
  '/packages/qti-extended/src/index.ts',
  '/packages/qti-extended/src/register.ts'
];
const SELF = '/packages/qti-test/src/plugin-boundary.spec.ts';
const foldersOf = (plugin: Plugin) =>
  plugin.folders.map(folder => `/packages/${plugin.package ?? 'qti-test'}/src/${folder}`);
const isInside = (path: string, plugin: Plugin) => foldersOf(plugin).some(folder => path.startsWith(folder));

describe.each(PLUGINS)('plugin boundary: $name', plugin => {
  it('has sources in every listed folder (a rename must not leave this check empty)', () => {
    for (const folder of foldersOf(plugin)) {
      expect(Object.keys(sources).filter(path => path.startsWith(folder)).length, folder).toBeGreaterThan(0);
    }
  });

  it('is not referred to from outside its folders', () => {
    const residue = Object.entries(sources)
      .filter(
        ([path]) =>
          !isInside(path, plugin) &&
          path !== SELF &&
          !plugin.consumers?.some(prefix => path.startsWith(prefix)) &&
          !PLUGIN_ENTRIES.some(entry => path.startsWith(entry)) &&
          !path.endsWith('.stories.ts')
      )
      .flatMap(([path, source]) =>
        source
          .split('\n')
          .map((line, index) => ({ path, line: index + 1, text: line.trim() }))
          .filter(({ text }) => plugin.reference.test(text))
      )
      .map(({ path, line, text }) => `${path}:${line}  ${text}`);

    expect(residue).toEqual([]);
  });

  it('reads the test only through computedContext and public events', () => {
    // An import check cannot see these: the other contexts are exported for hosts, and an ancestor
    // or event name is a string. Specs and stories may set a test up however they like.
    const forbidden = [
      /\b(sessionContext|testContext|configContext|qtiContext|testHostContext)\b/, // not plugin API
      /closest(<[^>]*>)?\(\s*['"`](qti-test|test-navigation|test-container)['"`]/, // stops at shadow roots; the test's business
      /['"`]qti-assessment-item-connected['"`]/ // internal; `qc-item-rendered` is the public one
    ];
    const breaks = Object.entries(sources)
      .filter(([path]) => isInside(path, plugin) && !/\.(spec|stories)\.ts$/.test(path))
      .flatMap(([path, source]) =>
        source
          .split('\n')
          .map((line, index) => ({ path, line: index + 1, text: line.trim() }))
          .filter(({ text }) => !/^(\*|\/\/|\/\*)/.test(text) && forbidden.some(pattern => pattern.test(text)))
      )
      .map(({ path, line, text }) => `${path}:${line}  ${text}`);

    expect(breaks).toEqual([]);
  });

  it('uses only public API of the test', () => {
    const allowed = [...COMMON_ALLOWED, ...(plugin.allow ?? [])];
    const imports = Object.entries(sources)
      .filter(([path]) => isInside(path, plugin))
      .flatMap(([path, source]) =>
        [
          ...source.matchAll(/^\s*(?:import|export)\b[^'"]*?from\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm)
        ].map(match => ({ path, specifier: (match[1] ?? match[2]).replace(/\.js$/, '') }))
      )
      .filter(({ specifier }) => !allowed.some(pattern => pattern.test(specifier)))
      .map(({ path, specifier }) => `${path} imports ${specifier}`);

    expect(imports).toEqual([]);
  });
});
