import type { StorybookConfig } from '@storybook/web-components-vite';
import path from 'path';
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
    },
    '@storybook/addon-mdx-gfm'
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
    console.log('W000000000T', path.resolve(__dirname, '../src/lib'));
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config!.resolve!.alias,
        path: require.resolve('path-browserify'),
        '@citolab/qti-components/qti-components': path.resolve(__dirname, '../src/lib/qti-components'),
        '@citolab/qti-components/qti-test': path.resolve(__dirname, '../src/lib/qti-test'),
        '@citolab/qti-components/qti-item': path.resolve(__dirname, '../src/lib/qti-item'),
        '@citolab/qti-components/react/qti-test': path.resolve(__dirname, '../src/lib/qti-test-react'),
        '@citolab/qti-components/react/qti-item': path.resolve(__dirname, '../src/lib/qti-item-react'),
        '@citolab/qti-components/qti-transform': path.resolve(__dirname, '../src/lib/qti-transform')
      }
    };

    return config;
  }
};
export default config;
