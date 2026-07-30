import { html } from 'lit';

import { qtiTransformItem } from '@qti-components/transformers';

import sourceXML from './fixtures/ITEM011.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './kennisnet.css';

const meta: Meta = {
  title: 'QTI Kennisnet/Regression',
  tags: ['no-tests']
};

export default meta;
type Story = StoryObj;

export const RoundtripItem011: Story = {
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
