import { describe, expect, it } from 'vitest';

/**
 * A plugin is a set of files that knows the test; the test does not know them. Delete the files
 * and their line in `plugins/elements.ts` and nothing else may refer to them. These checks keep it that way for
 * every plugin in `PLUGINS` — a new reference from outside, or a reach from inside into the
 * test's internals, fails here instead of quietly turning the plugin back into part of the core.
 *
 * Adding a plugin means adding one entry to `PLUGINS`.
 *
 * Stories may show plugins side by side, so a `.stories.ts` file outside the folder may name a
 * plugin's tags; production code may not.
 */
interface Plugin {
  /** The plugin's name, for the report. */
  name: string;
  /** Its folders under `packages/qti-test/src/`, with a trailing slash. A plugin is these files. */
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

const PLUGINS: Plugin[] = [
  {
    name: 'bookmark',
    folders: ['components/test-bookmark/'],
    reference: /test-bookmark|TestBookmark|bookmarkedItems/,
    allow: [
      PUBLIC_EVENTS_FROM_COMPONENTS,
      STYLES_FROM_COMPONENTS,
      /^\.\.\/\.\.\/plugin-state$/, // the typed read of a plugin's entry
      /^\.\.\/\.\.\/types\/qti-test-state$/, // the public state type
      /^\.\.\/qti-test\/qti-test$/, // the spec drives a test through its public element
      /^@citolab\/qti-components$/, // the spec registers everything the way a host does
      DEMO_TEST_FROM_COMPONENTS
    ]
  },
  {
    name: 'tts',
    folders: ['tts/'],
    reference:
      /test-item-to-speech|test-tts-|ttsContext|ttsElements|TestItemToSpeech|TestTts|data-tts-content|\/tts['/]/,
    allow: [
      /^\.\.\/components\/styles$/,
      /^\.\.\/components\/qti-assessment-item-ref\/qti-assessment-item-ref$/, // public element, type only
      /^\.\.\/public-events$/
    ]
  },
  {
    name: 'stamp',
    folders: ['components/test-stamp/'],
    reference: /test-stamp|TestStamp|stampContext/,
    allow: [
      DEMO_TEST_FROM_COMPONENTS,
      PUBLIC_EVENTS_FROM_COMPONENTS,
      /^\.\.\/test-print-context\/test-print-context$/ // a story shows it next to the stamp
    ]
  },
  {
    name: 'print',
    folders: [
      'components/test-print-context/',
      'components/test-print-item-variables/',
      'components/test-print-state/'
    ],
    reference:
      /test-print-context|TestPrintContext|test-print-item-variables|TestPrintVariables|test-print-state|TestPrintState/,
    allow: [
      PUBLIC_EVENTS_FROM_COMPONENTS,
      /^\.\.\/\.\.\/types\/qti-test-state$/, // the public state type
      DEMO_TEST_FROM_COMPONENTS
    ]
  },
  {
    name: 'scoring',
    folders: ['components/test-scoring-buttons/', 'components/test-scoring-feedback/'],
    reference: /test-scoring-buttons|TestScoringButtons|test-scoring-feedback|TestScoringFeedback/,
    allow: [PUBLIC_EVENTS_FROM_COMPONENTS]
  },
  {
    name: 'submit',
    folders: ['components/test-submit/'],
    reference: /(?<![\w-])test-submit(?![\w-])|TestSubmit/,
    allow: [PUBLIC_EVENTS_FROM_COMPONENTS, STYLES_FROM_COMPONENTS]
  },
  {
    name: 'view',
    folders: ['components/test-view-toggle/', 'components/test-view/', 'components/test-check-item/'],
    reference: /test-view-toggle|TestViewToggle|test-view['">\s]|TestView\b|test-check-item|TestCheckItem/,
    consumers: ['/packages/qti-corrections/'], // overrides test-check-item with the correction behaviour
    allow: [
      PUBLIC_EVENTS_FROM_COMPONENTS,
      STYLES_FROM_COMPONENTS,
      /^\.\.\/test-view-toggle\/test-view$/ // a story types the element next to the toggle
    ]
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

/** The one place that composes the plugins; it names each one by design. */
const PLUGINS_ENTRY = '/packages/qti-test/src/plugins/';
const SELF = '/packages/qti-test/src/plugin-boundary.spec.ts';
const foldersOf = (plugin: Plugin) => plugin.folders.map(folder => `/packages/qti-test/src/${folder}`);
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
          !path.startsWith(PLUGINS_ENTRY) &&
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
