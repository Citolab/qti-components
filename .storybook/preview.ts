import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';

import '../src/item.css';

import { customViewports } from './custom-viewport-sizes';
setCustomElementsManifest(customElements);

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  // https://storybook.js.org/docs/web-components/essentials/controls#custom-control-type-matchers
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      expanded: true
    },
    viewport: { viewports: customViewports }
  }
};

export default preview;
