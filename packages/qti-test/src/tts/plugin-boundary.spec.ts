import { describe, expect, it } from 'vitest';

/**
 * Text-to-speech is a plugin: this folder knows the test, the test does not know this folder.
 * Delete the folder and its `exports` entries and nothing else may refer to it. These checks keep
 * it that way — a new reference from outside, or a reach from here into the test's internals,
 * fails here instead of quietly turning the plugin back into a part of the core.
 *
 * Lines marked `tts-plugin: Step-A compatibility` are the deliberate exception: the core still
 * registers and re-exports text-to-speech until the next major.
 */
const sources = import.meta.glob<string>('/packages/**/src/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true
});

const PLUGIN_DIR = '/packages/qti-test/src/tts/';
const COMPAT_MARKER = 'tts-plugin: Step-A compatibility';
const UMBRELLA_ENTRY = '/packages/qti-components/src/tts.ts';

const REFERENCE =
  /test-item-to-speech|test-tts-|ttsContext|ttsElements|TestItemToSpeech|TestTts|data-tts-content|\/tts['/]/;

describe('text-to-speech plugin boundary', () => {
  it('is not referred to from outside its folder', () => {
    const residue = Object.entries(sources)
      .filter(([path]) => !path.startsWith(PLUGIN_DIR) && path !== UMBRELLA_ENTRY)
      .flatMap(([path, source]) =>
        source
          .split('\n')
          .map((line, index) => ({ path, line: index + 1, text: line.trim() }))
          .filter(({ text }) => REFERENCE.test(text) && !text.includes(COMPAT_MARKER))
      )
      .map(({ path, line, text }) => `${path}:${line}  ${text}`);

    expect(residue).toEqual([]);
  });

  it('uses only public API of the test', () => {
    const allowed = [
      /^\.\//, // its own files
      /^\.\.\/components\/styles$/, // the shared look of the test controls
      /^\.\.\/components\/qti-assessment-item-ref\/qti-assessment-item-ref$/, // public element, type only
      /^lit(\/|$)/,
      /^@lit\//,
      /^@qti-components\/(base|elements)$/,
      /^storybook\//,
      /^@storybook\//,
      /^@wc-toolkit\//,
      /^shadow-dom-testing-library$/,
      /^vitest$/,
      /\/tools\/testing\//,
      /\/\.storybook\//
    ];
    const imports = Object.entries(sources)
      .filter(([path]) => path.startsWith(PLUGIN_DIR))
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
