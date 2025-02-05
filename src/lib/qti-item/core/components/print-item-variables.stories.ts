import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { PrintItemVariables } from './print-item-variables';
import './print-item-variables';
import type { ItemContainer } from './item-container';

const { events, args, argTypes } = getWcStorybookHelpers('print-item-variables');

type Story = StoryObj<PrintItemVariables & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  args: { ...args, 'item-url': '/qti-item/example-choice-item.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs', 'new']
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-item>
      <div style="display: flex; gap: 1rem;">
        <item-container style="width: 400px" item-url=${args['item-url']}>
          <template>
            <style>
              qti-assessment-item {
                padding: 1rem;
                display: block;
                aspect-ratio: 4 / 3;
                width: 800px;
                border: 2px solid blue;
                transform: scale(0.5);
                transform-origin: top left;
              }
            </style>
          </template>
        </item-container>
        <print-item-variables></print-item-variables>
      </div>
    </qti-item>`
};
