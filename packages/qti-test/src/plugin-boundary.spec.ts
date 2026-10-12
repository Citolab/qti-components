import { describe, expect, it } from 'vitest';

/**
 * A plugin is a folder that knows the test; the test does not know the folder. Delete the folder
 * and the line for it in `plugins/elements.ts` and nothing else may refer to it. These checks keep it that way for
 * every plugin in `PLUGINS` — a new reference from outside, or a reach from inside into the
 * test's internals, fails here instead of quietly turning the plugin back into part of the core.
 *
 * Adding a plugin means adding one entry to `PLUGINS`.
 *
 * Stories may show plugins side by side, so a `.stories.ts` file outside the folder may name a
 * plugin's tags; production code may not.
 */
interface Plugin {
  /** Folder name under `packages/qti-test/src/`. */
  name: string;
  /** Anything that names the plugin: tags, classes, contexts, attributes, import paths. */
  reference: RegExp;
  /** Imports the plugin may use beyond the common ones below. */
  allow?: RegExp[];
  /** Path prefixes of packages that build on the plugin's `/elements` entry (an override, an extension). */
  consumers?: string[];
}

const PLUGINS: Plugin[] = [
  {
    name: 'tts',
    reference:
      /test-item-to-speech|test-tts-|ttsContext|ttsElements|TestItemToSpeech|TestTts|data-tts-content|\/tts['/]/,
    allow: [
      /^\.\.\/components\/styles$/, // the shared look of the test controls
      /^\.\.\/components\/qti-assessment-item-ref\/qti-assessment-item-ref$/, // public element, type only
      /^\.\.\/public-events$/ // the public event names and helpers
    ]
  },
  {
    name: 'stamp',
    reference:
      /test-stamp|TestStamp|test-paging-buttons-stamp|TestPagingButtonsStamp|test-section-buttons-stamp|TestSectionButtonsStamp|stampContext|\/stamp['/]/,
    allow: [
      /^\.\.\/public-events$/,
      /^\.\.\/print\/test-print-context$/ // a story shows it next to the stamp
    ]
  },
  {
    name: 'print',
    reference: /test-print-context|TestPrintContext|test-print-item-variables|TestPrintVariables|\/print['/]/,
    allow: [/^\.\.\/public-events$/]
  },
  {
    name: 'scoring',
    reference: /test-scoring-buttons|TestScoringButtons|test-scoring-feedback|TestScoringFeedback|\/scoring['/]/,
    allow: [/^\.\.\/public-events$/]
  },
  {
    name: 'view',
    reference: /test-view-toggle|TestViewToggle|test-view['">\s]|TestView\b|test-check-item|TestCheckItem|\/view['/]/,
    consumers: ['/packages/qti-corrections/'], // overrides test-check-item with the correction behaviour
    allow: [
      /^\.\.\/public-events$/,
      /^\.\.\/components\/styles$/ // the shared look of the test controls
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
const folderOf = (plugin: Plugin) => `/packages/qti-test/src/${plugin.name}/`;

describe.each(PLUGINS)('plugin boundary: $name', plugin => {
  it('has a folder with sources (a rename must not leave this check empty)', () => {
    const inside = Object.keys(sources).filter(path => path.startsWith(folderOf(plugin)));
    expect(inside.length).toBeGreaterThan(0);
  });

  it('is not referred to from outside its folder', () => {
    const residue = Object.entries(sources)
      .filter(
        ([path]) =>
          !path.startsWith(folderOf(plugin)) &&
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
      .filter(([path]) => path.startsWith(folderOf(plugin)))
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
