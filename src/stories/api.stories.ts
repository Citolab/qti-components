import '@citolab/qti-components/qti-components';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { qtiTransformItem } from 'src/lib/qti-transformers';

const meta: Meta = {
  title: 'Api',
  argTypes: {
    qtipkg: {
      options: ['biologie', 'kennisnet-1', 'kennisnet-2'],
      control: { type: 'radio' },
      defaultValue: 'biologie'
    },
    view: {
      options: ['candidate', 'author'],
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    serverLocation: 'http://localhost:3000/api',
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

export const Api: Story = {
  render: (args, context) => {
    const { loaded } = context;

    const handleInteractionChanged = e => {
      action('on-interaction-changed')(e.detail);
      const item = args.items[args.itemIndex];
      fetch(`${args.serverLocation}/response/${args.qtipkg}/${item.href}?identifier=${item.identifier}`, {
        method: 'POST',
        body: JSON.stringify(e.detail),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
      });
    };

    return html`
      <qti-item
        @qti-assessment-item-connected=${e => {}}
        @qti-interaction-changed=${handleInteractionChanged}
        @qti-item-variables-changed=${action('qti-item-variables-changed')}
        .xmlDoc=${loaded.loaded}
      >
      </qti-item>
      <button
        @click=${() => {
          item?.processResponse();
        }}
      >
        processResponse
      </button>
    `;
  },
  loaders: [
    async ({ args }) => {
      try {
        const fetchJson = url => fetch(url).then(res => (res.ok ? res.json() : Promise.reject('error')));

        const { items } = await fetchJson(`${args.serverLocation}/${args.qtipkg}/items.json`);

        const a = await qtiTransformItem()
          .load(`${args.serverLocation}/${args.qtipkg}/items/${items[args.itemIndex].href}?noresponsexml=true`)
          .then(api => api.path(`${args.serverLocation}/${args.qtipkg}/static/`).htmldoc());
        return { loaded: a };
      } catch (error) {
        console.log(error);
      }
    }
  ]
};
