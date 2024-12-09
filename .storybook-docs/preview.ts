import preview from '../.storybook/preview';
import { create } from '@storybook/theming/create';

const docTheme = create({
  base: 'light',
  // Typography
  fontBase: '"pt-sans-pro", sans-serif'
});
export default {
  ...preview,
  parameters: {
    ...preview.parameters,
    docs: { ...preview.parameters?.doc, toc: true },
    options: {
      storySort: {
        order: ['👋 Hi QTI', 'QTI-Test', 'QTI-Item']
      }
    }
  }
};
