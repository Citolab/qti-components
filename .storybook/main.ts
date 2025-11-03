import path from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../app/**/*.stories.@(js|jsx|ts|tsx)', '../packages/**/*.stories.@(js|jsx|ts|tsx)'],
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
