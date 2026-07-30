import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

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
          { directory: '../apps/e2e/src', files: '**/kennisnet.stories.ts', titlePrefix: 'E2E' }
        ]
      : [
          {
            directory: '../docs',
            files: '**/*.stories.*',
            titlePrefix: 'Docs'
          },
          {
            directory: '../docs',
            files: '**/*.mdx',
            titlePrefix: 'Docs'
          },
          {
            directory: '../apps/e2e/src',
            files: '**/*.stories.*',
            titlePrefix: 'E2E'
          },
          {
            directory: '../apps/e2e/stories',
            files: '**/*.stories.*',
            titlePrefix: 'E2E'
          },
          {
            directory: '../docs',
            files: '**/*.stories.*',
            titlePrefix: 'Docs'
          },
          {
            directory: '../packages/qti-elements/src/components',
            files: '**/*.stories.*',
            titlePrefix: 'QTI Elements'
          },
          {
            directory: '../packages/interactions',
            files: '*/src/**/*.stories.*',
            titlePrefix: 'QTI Interactions'
          },
          {
            directory: '../packages/qti-item/src/components',
            files: '**/*.stories.*',
            titlePrefix: 'Item'
          },
          {
            directory: '../packages/qti-test/src/components',
            files: '**/*.stories.*',
            titlePrefix: 'Test'
          },
          {
            directory: '../packages/qti-theme/src',
            files: '**/*.stories.*',
            titlePrefix: 'Theme'
          }
        ],
  addons: [
    '@storybook/addon-a11y',
    'storybook-addon-tag-badges',
    '@storybook/addon-themes',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: [
    '../public',
    // Serve committed VRT baseline screenshots so the in-canvas overlay decorator
    // (see preview.ts) can lay them over the live story for onion-skin review.
    { from: '../apps/e2e/src/stories/kennisnet/__screenshots__', to: '/baselines' }
  ],
  async viteFinal(config: any) {
    return {
      ...config,
      plugins: [...(config.plugins || []), tsconfigPaths()],
      css: {
        ...(config.css || {}),
        devSourcemap: true
      },
      build: {
        ...(config.build || {}),
        sourcemap: true
      },
      resolve: {
        ...config.resolve
      }
    };
  }
};
export default config;
