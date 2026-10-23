import { globSync } from 'fs';
import { resolve } from 'path';

import remarkGfm from 'remark-gfm';
import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

/**
 * Fixtures next to their story. Every `fixtures/` folder under a package's `src/` is served at its
 * repo path under `/fixtures/`, keeping its shape, so links inside it (an item's images, a custom
 * interaction's scripts) resolve as they do in a real package:
 *
 *   packages/interactions/custom-interaction/src/fixtures/  ->  /fixtures/packages/interactions/custom-interaction/src/fixtures/
 *
 * The prefix is load-bearing: Vite serves source files at their bare repo path, and a story that imports
 * an image from the same folder (`import uk from './fixtures/uk.png'`) asks for that path with `?import`.
 * Served there too, the static copy would answer instead of Vite's module, and the story fails to load.
 *
 * A story reaches its folder through a `*.fixtures.ts` constant. Packages publish only `dist`, so
 * these files never reach npm. Read once at start-up: a new folder needs a Storybook restart.
 */
const root = resolve(import.meta.dirname, '..');
const colocatedFixtures = globSync('packages/**/src/**/fixtures', { cwd: root })
  .filter(dir => !dir.includes('node_modules'))
  .map(dir => ({ from: `../${dir}`, to: `/fixtures/${dir}` }));

const config: StorybookConfig = {
  // stories: [
  //   '../docs/*/!(node_modules)/**/*.mdx',
  //   '../apps/*/!(node_modules)/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
  //   '../packages/*/!(node_modules)/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
  // ],
  // VRT screenshot runs set VRT=1 (see the test:vrt scripts) to narrow the story set to
  // just the opted-in visual-regression file. Otherwise the Storybook plugin builds and
  // indexes all ~113 story files on every `test:vrt`, which is slow. Dev and other test
  // projects (no VRT env) keep the full story set below.
  stories:
    process.env.VRT === '1'
      ? [
          // The single Kennisnet suite now registers the correction element variants and applies the
          // brand itself (see kennisnet/kennisnet.stories.ts), so this one file is the whole VRT set.
          { directory: '../apps/e2e/src', files: '**/kennisnet.stories.ts' }
        ]
      : [
          {
            directory: '../docs',
            files: '**/*.stories.*'
          },
          {
            directory: '../docs',
            files: '**/*.mdx'
          },
          {
            directory: '../apps/e2e/src',
            files: '**/*.stories.*'
          },
          {
            directory: '../apps/e2e/stories',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-base/src',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-elements/src/components',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/interactions',
            files: '*/src/**/*.stories.*'
          },
          {
            directory: '../packages/qti-interactions/src/guides',
            files: '**/*.@(stories.*|mdx)'
          },
          {
            directory: '../packages/qti-item/src/components',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-processing/src/components',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-test/src/components',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-test/src/components',
            files: '**/*.mdx'
          },
          {
            directory: '../packages/qti-test/src/guides',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-test/src/guides',
            files: '**/*.mdx'
          },
          {
            directory: '../packages/qti-test/src/tts',
            files: '**/*.stories.*'
          },
          {
            directory: '../packages/qti-test/src/tts',
            files: '**/*.mdx'
          },
          {
            directory: '../packages/qti-theme/src',
            files: '**/*.stories.*'
          }
        ],
  addons: [
    '@storybook/addon-a11y',
    'storybook-addon-tag-badges',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    {
      name: '@storybook/addon-docs',
      // GitHub-flavoured Markdown (tables, strikethrough, task lists) in .mdx docs pages.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } }
    }
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: [
    '../public',
    // Serve committed VRT baseline screenshots so the in-canvas overlay decorator
    // (see preview.ts) can lay them over the live story for onion-skin review.
    { from: '../apps/e2e/src/stories/kennisnet/__screenshots__', to: '/baselines' },
    ...colocatedFixtures
  ],
  async viteFinal(config: any) {
    return {
      ...config,
      plugins: [...(config.plugins || []), tsconfigPaths()],
      resolve: {
        ...config.resolve
      }
    };
  }
};
export default config;
