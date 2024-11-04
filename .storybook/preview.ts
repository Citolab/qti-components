import type { Preview } from '@storybook/web-components';

import '../src/index.ts';
import '../src/item.css';
import { customViewports } from './custom-viewport-sizes';
// setCustomElementsManifest(customElements);

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  // https://storybook.js.org/docs/web-components/essentials/controls#custom-control-type-matchers
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
