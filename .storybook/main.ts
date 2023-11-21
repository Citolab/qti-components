import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import * as tsconfigPaths from 'vite-tsconfig-paths';

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
    }
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: ['../public/assets'],
  docs: {
    autodocs: 'tag'
  },

  async viteFinal(config, { configType }) {
    return {
      ...config,
      optimizeDeps: {
        ...config.optimizeDeps,
        exclude: ['@citolab/qti-components']
      },
      plugins: [...config.plugins!, tsconfigPaths.default()],
      resolve: { ...config.resolve, alias: { ...config!.resolve!.alias, path: require.resolve('path-browserify') } }
    };
  }
};
export default config;
