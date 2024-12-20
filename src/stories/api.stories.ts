import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { qtiTransformItem } from '../lib/qti-transformers/';
import { QtiItem } from '../lib/qti-item/qti-item';
import { QtiAssessmentItem } from '../lib/qti-components';

const meta: Meta = {
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
    itemIndex: { control: { type: 'number' } },
    scoreBackend: { control: { type: 'boolean' } }
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

export const Api: Story = {
  render: (args, context) => {
    if (!context.loaded) {
      return html`<div>Loading...</div>`;
    }

    let assessmentItem: QtiAssessmentItem = null;
    const { loaded } = context;

    const testRef = createRef<QtiItem>();

    const processResponse = () => {
      if (args.scoreBackend) {
        fetch(
          `${args.serverLocation}/response/${args.qtipkg}/${loaded.item.href}?identifier=${loaded.item.identifier}`,
          {
            method: 'POST',
            body: JSON.stringify(assessmentItem.variables),
            headers: { 'Content-type': 'application/json; charset=UTF-8' }
          }
        );

        fetch(`${args.serverLocation}/score/${args.qtipkg}/${loaded.item.href}?identifier=${loaded.item.identifier}`, {
          method: 'GET'
        }).then(async response => {
          const serverVariables = await response.json();
          console.log('server', serverVariables);
          assessmentItem.variables = serverVariables;
        });
      } else {
        assessmentItem.processResponse();
        console.log('client', assessmentItem.variables);
      }
    };

    return html`
      <qti-item ${ref(testRef)} @qti-assessment-item-connected=${e => (assessmentItem = e.detail)}>
        <item-container .itemDoc=${loaded.itemHtmlDoc}></item-container>
      </qti-item>
      <button @click="${processResponse}">processResponse</button>
    `;
  },
  loaders: [
    async ({ args }) => {
      try {
        const fetchJson = url => fetch(url).then(res => (res.ok ? res.json() : Promise.reject('error')));
        const { items } = await fetchJson(`${args.serverLocation}/${args.qtipkg}/items.json`);
        const itemHtmlDoc = await qtiTransformItem()
          .load(
            `${args.serverLocation}/${args.qtipkg}/items/${items[args.itemIndex].href}${args.scoreBackend ? '?scorebackend=true' : ''}`
          )
          .then(api => api.path(`${args.serverLocation}/${args.qtipkg}/static/`).htmlDoc());
        return { itemHtmlDoc: itemHtmlDoc, item: items[args.itemIndex] };
      } catch (error) {
        console.log(error);
      }
      return null;
    }
  ]
};
