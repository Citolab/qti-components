import { setCustomElementsManifest } from '@storybook/web-components';
import { setWcStorybookHelpersConfig } from 'wc-storybook-helpers';
import { withActions } from '@storybook/addon-actions/decorator';
import prettier from 'prettier-v2'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import HTMLParser from 'prettier-v2/parser-html'; /* https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
import { expect } from '@storybook/test';

import customElements from '../custom-elements.json';
import { customViewports } from './custom-viewport-sizes';
import DocumentationTemplate from './DocumentationTemplate.mdx';
import { toBePositionedRelativeTo } from '../test/setup/toBePositionedRelativeTo';

import type { Preview } from '@storybook/web-components';

import '../src/lib/qti-components';
import '../src/lib/qti-test/core';
import '../src/lib/qti-test/components';
import '../src/lib/qti-item/core';
import '../src/item.css';

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

expect.extend({ toBePositionedRelativeTo });

setCustomElementsManifest(customElements);

const preview: Preview = {
  decorators: [withActions],

  parameters: {
    docs: {
      toc: true,
      source: {
        /* FIXME EVENTUALLY https://github.com/storybookjs/storybook/issues/8078#issuecomment-2325332120 */
        transform: input =>
          prettier.format(input, {
            parser: 'html',
            plugins: [HTMLParser],
            printWidth: 140,
            htmlWhitespaceSensitivity: 'ignore'
          })
      },
      page: DocumentationTemplate
    },
    viewport: { viewports: customViewports },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i
      }
    },
    layout: 'fullscreen'
  },

  tags: ['!autodocs']
};

export default preview;
