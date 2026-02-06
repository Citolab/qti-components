import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  // stories: [
  //   '../docs/*/!(node_modules)/**/*.mdx',
  //   '../apps/*/!(node_modules)/**/*.@(mdx|stories.@(js|jsx|ts|tsx))',
  //   '../packages/*/!(node_modules)/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
  // ],
  stories: [
    {
      directory: '../apps/e2e/src',
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
      directory: '../packages/qti-interactions/src/components',
      files: '**/*.stories.*',
      titlePrefix: 'QTI Interactions'
    },
    {
      directory: '../packages/qti-processing/src/components',
      files: '**/*.stories.*',
      titlePrefix: 'QTI Processing'
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
      directory: '../packages/qti-theme/src/components',
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
  staticDirs: ['../public'],
  async viteFinal(config: any, { configType }: { configType?: string }) {
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
