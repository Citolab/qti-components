import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../dist/custom-elements.json';
import { setWcStorybookHelpersConfig } from 'wc-storybook-helpers';
import { withActions } from '@storybook/addon-actions/decorator';

setWcStorybookHelpersConfig({
  hideArgRef: false,
  typeRef: 'expandedType',
  renderDefaultValues: false
});
setCustomElementsManifest(customElements);

import '../src/lib/qti-components';
import '../src/lib/qti-item';
import '../src/item.css';
import { customViewports } from './custom-viewport-sizes';

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  decorators: [withActions],
  parameters: {
    controls: {
      expanded: true
    },
    viewport: { viewports: customViewports },
    options: {
      storySort: {
        order: [
          'qti-conformance',
          'styles',
          'qti-interactions-basic',
          'qti-interactions-advanced',
          'qti-interactions-wip',
          'lib'
        ]
      }
    }
  }
};

export default preview;
