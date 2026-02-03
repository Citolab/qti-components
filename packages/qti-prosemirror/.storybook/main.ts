import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: [
    {
      directory: '../src/components',
      files: '**/*.stories.*',
      titlePrefix: 'QTI ProseMirror'
    }
  ],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  viteFinal: config => {
    // Ensure proper handling of workspace dependencies
    if (config.optimizeDeps) {
      config.optimizeDeps.include = [
        ...(config.optimizeDeps.include || []),
        '@qti-components/base',
        '@qti-components/interactions',
        '@qti-components/utilities'
      ];
    }
    return config;
  }
};

export default config;
