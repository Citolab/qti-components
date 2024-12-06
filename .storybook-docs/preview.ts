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
    docs: { theme: docTheme },
    options: {
      storySort: {
        order: ['QTI Test', 'QTI Item', 'qti-item', 'qti-test', 'qti-choice-interaction']
      }
    }
  }
};
