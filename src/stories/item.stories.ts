import '@citolab/qti-components/qti-components';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import packages from '../assets/packages.json';
import { fetchItem } from './fetch-item';

const meta: Meta = {
  title: 'Examples',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'examples',
    itemIndex: 0
  }
};

export default meta;
type Story = StoryObj;

let item;

export const Examples: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    const onInteractionChangedAction = action('on-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-item-first-updated');
    };

    item && (item.disabled = disabled);
    item && (item.view = view);

    return html`
      <div
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-item-first-updated=${onItemFirstUpdated}
      >
        ${unsafeHTML(xml.itemXML)}
      </div>
      <button style="background:lightgray; padding:1rem" @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  loaders: [async ({ args }) => ({ xml: await fetchItem(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })]
};
