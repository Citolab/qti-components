import preview from '../.storybook/preview';
import { create } from '@storybook/theming/create';

const docTheme = create({
  base: 'light',
  fontBase: '"pt-sans-pro", sans-serif'
});
export default { ...preview, parameters: { ...preview.parameters, docs: { theme: docTheme } } };
