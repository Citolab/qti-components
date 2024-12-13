import { addons } from '@storybook/manager-api';

import { create } from '@storybook/theming/create';

const docTheme = create({
  base: 'light',
  // Typography
  fontBase: '"pt-sans-pro", sans-serif',
  fontCode: '"Fira Code", monospace', // Font for code blocks

  brandTitle: 'QTI Components',
  brandUrl: 'https://example.com',
  brandImage: 'https://storybook.js.org/images/placeholders/350x150.png',
  brandTarget: '_self',

  //
  colorPrimary: '#3A10E5',
  colorSecondary: '#585C6D',

  // UI
  appBg: 'rgb(247, 245, 242)',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff', // '#ffffff'
  appBorderColor: '#585C6D',
  appBorderRadius: 4,

  // Text colors
  textColor: 'rgb(51, 51, 51)', // '#10162F'
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#9E9E9E',
  barSelectedColor: '#585C6D',
  barHoverColor: '#585C6D',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#10162F',
  inputTextColor: '#10162F',
  inputBorderRadius: 2
});

addons.setConfig({
  navSize: 300,
  bottomPanelHeight: 300,
  rightPanelWidth: 300,
  panelPosition: 'bottom',
  enableShortcuts: false,
  showToolbar: false,
  theme: docTheme,

  selectedPanel: undefined,
  initialActive: 'canvas',
  sidebar: {
    showRoots: true
    // filters: {
    //   items: item => !item.tags?.includes('hidden-docs')
    // }
    // collapsedRoots: ['other']
  }
  // toolbar: {
  //   title: { hidden: false },
  //   zoom: { hidden: false },
  //   eject: { hidden: false },
  //   copy: { hidden: false },
  //   fullscreen: { hidden: false }
  // }
});
