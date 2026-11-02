import { html } from 'lit';

import { qtiTransformItem } from '@qti-components/transformers';

import { regressionLayout } from './regression-layout';
import sourceXML from './fixtures/ITEM006.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Testing/Regression',
  tags: ['no-tests'],
  // Kennisnet's look comes from its theme preset (.storybook/themes.css).
  globals: { theme: 'Kennisnet' },
  decorators: [regressionLayout]
};

export default meta;
type Story = StoryObj;

export const RoundtripItem006: Story = {
  render: (_args, context) => {
    const item = context.loaded.itemHtmlDoc.firstElementChild;
    return html`${item}`;
  },
  loaders: [
    async () => {
      const itemHtmlDoc = qtiTransformItem().parse(sourceXML).path('/assets/api/kennisnet').htmlDoc();
      return { itemHtmlDoc };
    }
  ]
};
