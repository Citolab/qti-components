import type { StorybookConfig } from '@storybook/web-components-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-jest',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-styling'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  staticDirs: ['../src/assets'],
  docs: {
    autodocs: 'tag'
  }
};
export default config;
