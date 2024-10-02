import type { Preview } from '@storybook/web-components';
import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';

import '../src/index.ts';
import '../src/item.css';
import { customViewports } from './custom-viewport-sizes';
setCustomElementsManifest(customElements);

// .storybook/preview.js

export const decorators = [
  (Story, context) => {
    const storyElement = Story(context);

    // Cleanup Lit comments after the story is rendered
    requestAnimationFrame(() => {
      removeLitComments(document.body);
    });

    return storyElement;
  }
];

// Helper function to remove Lit comments
function removeLitComments(element) {
  // Convert the element's inner HTML to a string
  const htmlContent = element.innerHTML;

  // Use regex to remove both Lit comments and empty comments
  const cleanedHtml = htmlContent.replace(/<!--\?lit\$[^\-]*\$-->|<!---->/g, '');
  // Re-apply the cleaned HTML back into the element
  element.innerHTML = cleanedHtml;
}

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  },
  // https://storybook.js.org/docs/web-components/essentials/controls#custom-control-type-matchers
  parameters: {
    controls: {
      expanded: true
    },
    viewport: { viewports: customViewports }
  }
};

export default preview;
