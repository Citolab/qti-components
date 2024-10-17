import type { Preview } from '@storybook/web-components';

import '../src/index.ts';
import '../src/item.css';
import { customViewports } from './custom-viewport-sizes';
// setCustomElementsManifest(customElements);

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
  const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, {
    acceptNode(node) {
      if (node.nodeValue && node.nodeValue.startsWith('lit$')) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_REJECT;
    }
  });
  let currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    currentNode.parentNode.removeChild(currentNode);
  }
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
