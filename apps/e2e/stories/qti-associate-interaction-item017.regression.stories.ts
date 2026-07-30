import { html } from 'lit';

import { qtiTransformItem } from '@qti-components/transformers';

import sourceXML from './fixtures/ITEM017.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './kennisnet.css';

// ITEM017's fixture renders through `qti-match-interaction`; the `associate` filename mirrors
// the qti-editor story name (its ProseMirror model is the associate descriptor) so both repos stay
// on one regression filename per item — see docs/regression-item-alignment-playbook.md in qti-editor.

const meta: Meta = {
  title: 'QTI Kennisnet/Regression',
  tags: ['no-tests']
};

export default meta;
type Story = StoryObj;

export const RoundtripItem017: Story = {
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
