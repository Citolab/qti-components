import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-essentials',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    },
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: ['../public/assets'],
  async viteFinal(config, { configType }) {
    return {
      ...config,
      plugins: [...config.plugins!, tsconfigPaths()]
    };
  }
};
export default config;
