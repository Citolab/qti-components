import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import packages from '../assets/packages.json';
import { QtiItem } from '../lib/qti-item';
import { getManifestInfo } from '@citolab/qti-components/qti-loader';
import { qtiTransformItem } from '@citolab/qti-components/qti-transformers';

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
  render: (_, { loaded: { xml } }) => {
    const qtiItemRef = createRef<QtiItem>();

    const processResponse = () => {
      qtiItemRef?.value.assessmentItem.processResponse();
    };

    return html`
      <qti-item
        ${ref(qtiItemRef)}
        @qti-interaction-changed=${action('qti-interaction-changed')}
        @qti-outcomes-changed=${action('qti-outcomes-changed')}
        .xmlDoc=${xml}
      >
      </qti-item>
      <button @click="${processResponse}">processResponse</button>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { items, testURI } = await getManifestInfo(`${args.serverLocation}/${args.qtipkg}/imsmanifest.xml`);
      const itemDoc = await qtiTransformItem()
        .load(`${testURI}${items[args.itemIndex].href}`, true)
        .then(api => api.htmlDoc());
      return { xml: itemDoc };
    }
  ]
};
