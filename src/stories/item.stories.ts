import { html } from 'lit';

import packages from '../assets/packages.json';
import { getManifestInfo } from '../lib/qti-loader';

import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'examples',
    itemIndex: 0
  }
};
export default meta;
type Story = StoryObj;

export const Items: Story = {
  render: (args, { loaded: { items } }) => {
    return html`
      <qti-item>
        <item-container item-url="${items[args.itemIndex].href}"></item-container>
      </qti-item>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { items } = await getManifestInfo(`${args.serverLocation}/${args.qtipkg}/imsmanifest.xml`);
      return { items };
    }
  ]
};
