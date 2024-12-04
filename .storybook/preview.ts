import type { Preview } from '@storybook/web-components';

import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../dist/custom-elements.json';
setCustomElementsManifest(customElements);

import '../src/lib/qti-components';
import '../src/lib/qti-test';
import '../src/lib/qti-item';
import '../src/item.css';
import { customViewports } from './custom-viewport-sizes';

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
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
