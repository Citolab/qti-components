import preview from '../.storybook/preview';
import { create } from '@storybook/theming/create';

const docTheme = create({
  base: 'light',
  fontBase: '"pt-sans-pro", sans-serif'
});
export default {
  ...preview,
  parameters: {
    docs: { ...preview, toc: true },
    ...preview.parameters,
    options: {
      storySort: {
        order: ['👋 Hi QTI', 'QTI-Test', 'QTI-Item']
      }
    }
  }
};
