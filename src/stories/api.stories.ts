import '@citolab/qti-components/qti-components';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { QtiItem } from 'src/lib/qti-item';
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
    if (!context.loaded) {
      return html`<div>Loading...</div>`;
    }

    const { loaded } = context;
    const testRef = createRef<QtiItem>();

    const processResponse = () => {
      if (args.scorebackend) {
        const item = args.items[args.itemIndex];
        fetch(`${args.serverLocation}/response/${args.qtipkg}/${item.href}?identifier=${item.identifier}`, {
          method: 'POST',
          body: item.variables,
          headers: { 'Content-type': 'application/json; charset=UTF-8' }
        });
      } else {
        testRef?.value.processResponse();
      }
    };

    return html`
      <qti-item
        ${ref(testRef)}
        @qti-interaction-changed=${action('qti-interaction-changed')}
        @qti-outcomes-changed=${action('qti-outcomes-changed')}
        .xmlDoc=${loaded.loaded}
      >
      </qti-item>
      <button @click="${processResponse}">processResponse</button>
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
