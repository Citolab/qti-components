import { html } from 'lit';

import { qtiTransformItem } from '@qti-components/transformers';

import { regressionLayout } from './regression-layout';
import sourceXML from './fixtures/ITEM017.xml?raw';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

import './kennisnet.css';

// ITEM017's fixture renders through `qti-match-interaction` — "Sleepvraag – afbeeldingen koppelen".
// This is MATCH coverage, not associate, despite the filename.
//
// The `associate` in the name mirrored qti-editor's item017 story, under the one-filename-per-item
// rule in docs/regression-item-alignment-playbook.md. That counterpart is gone: qti-editor's ITEM017
// was a different item ("Koppelvraag - stripduo's", a real qti-associate-interaction) and was
// removed with the rest of the editor's associate support. So the name now mirrors nothing. Left as
// it is rather than renamed, to keep the associate removal from churning an unrelated story id —
// rename it when the alignment playbook is next revisited.

const meta: Meta = {
  title: 'QTI Kennisnet/Regression',
  tags: ['no-tests'],
  decorators: [regressionLayout]
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
