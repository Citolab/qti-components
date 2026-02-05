import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig, type Options } from '@wc-toolkit/storybook-helpers';

import '../src';

// eslint-disable-next-line import/no-relative-packages
import '../../../packages/qti-theme/src/item.css';

import './styles.css';
import customElements from '../custom-elements.json';

const options: Options = {
  /** hides the `arg ref` label on each control */
  hideArgRef: true,
  /** sets the custom type reference in the Custom Elements Manifest */
  typeRef: 'expandedType',
  /** Adds a <script> tag where a `component` variable will reference the story's component */
  setComponentVariable: false,
  /** renders default values for attributes and CSS properties */
  renderDefaultValues: false
};

setStorybookHelpersConfig(options);

setCustomElementsManifest(customElements);

export const parameters = {
  docs: {
    extractComponentDescription: (component: any, { notes }: any) => {
      if (notes) {
        return typeof notes === 'string' ? notes : notes.markdown || notes.text;
      }
      return null;
    }
  },
  options: {
    storySort: { method: 'alphabetical' }
  }
};

export const tags = ['autodocs'];
