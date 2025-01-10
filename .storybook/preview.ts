import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';
import { setWcStorybookHelpersConfig } from 'wc-storybook-helpers';
import { withActions } from '@storybook/addon-actions/decorator';
import { customViewports } from './custom-viewport-sizes';

setWcStorybookHelpersConfig({
  /** hides the `arg ref` label on each control */
  hideArgRef: true,
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef: 'expandedType',
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable: false,
  /** renders default values for attributes and CSS properties */
  renderDefaultValues: false
});

setCustomElementsManifest(customElements);

import '../src/lib/qti-components';
import '../src/lib/qti-test/core';
import '../src/lib/qti-test/components';
import '../src/lib/qti-item/core';
import '../src/item.css';

const preview: Preview = {
  decorators: [withActions],

  parameters: {
    docs: { toc: true },
    viewport: { viewports: customViewports },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i
      }
    }
  },

  tags: ['!autodocs']
};

export default preview;
