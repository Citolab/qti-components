import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-jest',
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
  staticDirs: ['../src/assets'],
  docs: {
    autodocs: 'tag'
  },
  // onlye here for jest tests : https://github.com/storybookjs/storybook/issues/14856#issuecomment-1262333250
  async viteFinal(config, { configType }) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config!.resolve!.alias,
        path: require.resolve('path-browserify')
      }
    };

    return config;
  }
};
export default config;
