import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import { qtiTransformItem } from '../lib';

import type { QtiAssessmentItem, QtiItem } from '../lib';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  argTypes: {
    scoreBackend: { control: { type: 'boolean' } },
    packages: {
      options: ['kennisnet-1', 'kennisnet-2'],
      control: { type: 'radio' }
    },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    scoreBackend: false,
    serverLocation: 'http://localhost:3000/api',
    packages: 'kennisnet-1',
    itemIndex: 0
  },
  parameters: {
    controls: {
      expanded: false
    }
  },
  tags: ['no-tests']
};

/*
 /$$$$$$$$ /$$$$$$ /$$   /$$ /$$      /$$ /$$$$$$$$
| $$_____/|_  $$_/| $$  / $$| $$$    /$$$| $$_____/
| $$        | $$  |  $$/ $$/| $$$$  /$$$$| $$      
| $$$$$     | $$   \  $$$$/ | $$ $$/$$ $$| $$$$$   
| $$__/     | $$    >$$  $$ | $$  $$$| $$| $$__/   
| $$        | $$   /$$/\  $$| $$\  $ | $$| $$      
| $$       /$$$$$$| $$  \ $$| $$ \/  | $$| $$$$$$$$
|__/      |______/|__/  |__/|__/     |__/|________/

Images won't work, because the path function in the transform has already been called
and the path is set to the location of the item. ( which is an absolute path )
So the transform path here can't transform those paths again due to the line:

`qti-transfomers.ts`, line 154
```ts
    if (!attrValue.startsWith('data:') && !attrValue.startsWith('http')) {
*/

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

    const processResponse = async () => {
      try {
        if (args.scoreBackend) {
          await fetch(
            `${args.serverLocation}/response/${args.packages}/${loaded.item.href}?identifier=${loaded.item.identifier}`,
            {
              method: 'POST',
              body: JSON.stringify(assessmentItem.variables),
              headers: { 'Content-type': 'application/json; charset=UTF-8' }
            }
          );

          const response = await fetch(
            `${args.serverLocation}/score/${args.packages}/${loaded.item.href}?identifier=${loaded.item.identifier}`,
            {
              method: 'GET'
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch score from server');
          }

          const serverVariables = await response.json();
          console.log('server', serverVariables);
          assessmentItem.variables = serverVariables;
        } else {
          assessmentItem.processResponse();
          console.log('client', assessmentItem.variables);
        }
      } catch (error) {
        console.error('Error processing response:', error);
        alert('Error processing response: ' + error.message);
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
        const { items } = await fetchJson(`${args.serverLocation}/${args.packages}/items.json`);
        const href = items[args.itemIndex].href;
        const itemHtmlDoc = await qtiTransformItem()
          .load(`${args.serverLocation}/${args.packages}/items/${href}${args.scoreBackend ? '?scorebackend=true' : ''}`)
          .promise.then(api =>
            api
              .path(`${args.serverLocation}/static/${args.packages}/${href.includes('/') ? href.split('/')[0] : ''}`)
              .htmlDoc()
          );
        return { itemHtmlDoc: itemHtmlDoc, item: items[args.itemIndex] };
      } catch (error) {
        console.error('Error loading item:', error);
        alert('Error loading item: ' + error.message);
      }
      return null;
    }
  ]
};
