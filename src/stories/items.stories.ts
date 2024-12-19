import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import packages from '../assets/packages.json';
import { QtiItem } from '../lib/qti-item';
import { getManifestInfo } from '../lib/qti-loader';

const meta: Meta = {
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    view: {
      options: ['candidate', 'author'],
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } },
    itemIndex: { control: { type: 'number' } }
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

export const Items: Story = {
  render: (args, { loaded: { items, testURI } }) => {
    const qtiItemRef = createRef<QtiItem>();

    const processResponse = () => {
      qtiItemRef?.value.assessmentItem.processResponse();
    };

    return html`
      <qti-item ${ref(qtiItemRef)}>
        <item-container item-url="${testURI}${items[args.itemIndex].href}"></item-container>
      </qti-item>
      <button @click="${processResponse}">processResponse</button>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { items, testURI } = await getManifestInfo(`${args.serverLocation}/${args.qtipkg}/imsmanifest.xml`);
      return { items, testURI };
    }
  ]
};
