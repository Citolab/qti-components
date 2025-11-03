import path from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)', '../packages/**/*.stories.@(js|jsx|ts|tsx)'],
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
        ...config.resolve,
        alias: {
          // Ensure Storybook uses source files, not built dist files
          '@qti-components/shared': path.resolve(__dirname, '../packages/qc-shared/src'),
          '@qti-components/utilities': path.resolve(__dirname, '../packages/qc-utilities/src'),
          '@qti-components/transformers': path.resolve(__dirname, '../packages/qc-transformers/src'),
          '@qti-components/processing': path.resolve(__dirname, '../packages/qc-processing/src'),
          '@qti-components/elements': path.resolve(__dirname, '../packages/qc-elements/src'),
          '@qti-components/interactions': path.resolve(__dirname, '../packages/qc-interactions'),
          '@qti-components/item': path.resolve(__dirname, '../packages/qc-item/src'),
          '@qti-components/test': path.resolve(__dirname, '../packages/qc-test/src'),
          '@qti-components/components': path.resolve(__dirname, '../packages/qc-components/src'),
          '@qti-components/loader': path.resolve(__dirname, '../packages/qc-loader/src'),
          ...config.resolve?.alias
        }
      }
    };
  }
};
export default config;
