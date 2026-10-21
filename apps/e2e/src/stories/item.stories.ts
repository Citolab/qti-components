import { html } from 'lit';

import { getManifestInfo } from '@qti-components/loader';

import { PACKAGE_NAMES, PACKAGES, type PackageName } from './packages.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'QTI Item/Examples',
  argTypes: {
    qtipkg: {
      options: PACKAGE_NAMES,
      control: { type: 'radio' }
    },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    qtipkg: 'showcase',
    itemIndex: 0
  }
};
export default meta;
type Story = StoryObj;

export const QtiItem: Story = {
  render: (args, { loaded: { items } }) => {
    return html`
      <qti-item>
        <item-container item-url="${items[args.itemIndex].href}"></item-container>
      </qti-item>
    `;
  },
  loaders: [
    async ({ args }) => {
      const { items } = await getManifestInfo(PACKAGES[args.qtipkg as PackageName]);
      return { items };
    }
  ]
};
