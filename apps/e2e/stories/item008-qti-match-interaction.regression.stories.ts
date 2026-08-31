import { html } from 'lit';

import { qtiTransformItem } from '@qti-components/transformers';

import { regressionLayout } from './regression-layout';
import sourceXML from './fixtures/ITEM008.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './kennisnet.css';

const meta: Meta = {
  title: 'QTI Kennisnet/Regression',
  tags: ['no-tests'],
  decorators: [regressionLayout]
};

export default meta;
type Story = StoryObj;

export const RoundtripItem008: Story = {
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
