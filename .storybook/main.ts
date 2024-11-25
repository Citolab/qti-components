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
    },
    '@ljcl/storybook-addon-cssprops',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: ['../public/assets'],
  docs: {},

  async viteFinal(config, { configType }) {
    return {
      ...config,
      resolve: { ...config.resolve, alias: { ...config!.resolve!.alias, path: require.resolve('path-browserify') } }
    };
  }
};
export default config;

// PK: to get UnoCSS to work with vite and not the postcss plugin we had to overcome some problems
// first issue integrating in storybook, second issue, UnoCSS is esm only
// https://github.com/unocss/unocss/issues/150
// https://github.com/storybookjs/storybook/issues/23972#issuecomment-1948534058
// plugins: [
//   ...config.plugins!,
//   tsconfigPaths.default()
//   // (await import('unocss/vite')).default() // { mode: 'shadow-dom' }
// ],
