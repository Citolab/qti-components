import { html } from 'lit';

import { getManifestInfo } from '@qti-components/loader';

import packages from '../assets/packages.json';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Item',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    serverLocation: '/assets/api',
    qtipkg: 'examples',
    itemIndex: 0
  }
};
export default meta;
type Story = StoryObj;

export const Item: Story = {
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
