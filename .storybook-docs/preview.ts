import { create } from '@storybook/theming/create';

import preview from '../.storybook/preview';

import '../.storybook/preview'; // make sure imports of webcomponents are loaded

const docTheme = create({
  base: 'light',
  fontBase: '"pt-sans-pro", sans-serif'
});
export default {
  ...preview,
  parameters: {
    docs: { ...preview, toc: true },
    ...preview.parameters
    // options: {
    //   storySort: {
    //     order: ['👋 Hi QTI', 'qti-tem', 'qti-test']
    //   }
    // }
  }
};
