import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../dist/custom-elements.json';
import { setWcStorybookHelpersConfig } from 'wc-storybook-helpers';
import { withActions } from '@storybook/addon-actions/decorator';
import { customViewports } from './custom-viewport-sizes';

setWcStorybookHelpersConfig({
  hideArgRef: false,
  typeRef: 'expandedType',
  renderDefaultValues: false
});
setCustomElementsManifest(customElements);

import '../src/lib/qti-test';
import '../src/lib/qti-components';
import '../src/lib/qti-item';
import '../src/item.css';

const preview: Preview = {
  decorators: [withActions],

  parameters: {
    controls: {
      expanded: true
    },
    viewport: { viewports: customViewports }
  },

  tags: ['!autodocs']
};

export default preview;
