import tsconfigPaths from 'vite-tsconfig-paths';

import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    {
      directory: '../src/stories',
      files: '**/*.stories.*',
      titlePrefix: 'QTI ProseMirror'
    }
  ],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
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
