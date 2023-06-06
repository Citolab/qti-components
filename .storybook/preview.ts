import '../src/styles.css';
import type { Preview } from '@storybook/web-components';
import { withThemeByClassName } from '@storybook/addon-styling';

import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';
setCustomElementsManifest(customElements);

import { withTests } from '@storybook/addon-jest';
import results from '../.jest-test-results.json';

export const decorators = [
  // withTests({
  //   results,
  // }),
  withThemeByClassName({
    themes: {
      vanilla: '',
      ims: 'qti-theme-ims',
      subtle: 'qti-theme-subtle',
      raised: 'qti-theme-raised'
    },
    defaultTheme: 'vanilla'
  })
];

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  // https://storybook.js.org/docs/web-components/essentials/controls#custom-control-type-matchers
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    }
  }
};

export default preview;
