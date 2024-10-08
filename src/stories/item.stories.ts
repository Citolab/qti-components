import '@citolab/qti-components/qti-components';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import packages from '../assets/packages.json';
import { fetchItemFromManifest } from './fetch-item';

const meta: Meta = {
  title: 'Item',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } },
    itemIndex: { control: { type: 'range', min: 0, max: 30, step: 1 } }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'examples',
    itemIndex: 0
  },
  parameters: {
    controls: {
      expanded: false
    }
  }
};

export default meta;
type Story = StoryObj;

let item;

export const Item: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    item && (item.disabled = disabled);
    item && (item.view = view);

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${unsafeHTML(xml.itemXML)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  loaders: [
    async ({ args }) => ({ xml: await fetchItemFromManifest(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })
  ]
};
