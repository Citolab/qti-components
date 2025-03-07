import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { PrintItemVariables } from './print-item-variables';
import './print-item-variables';
import type { ItemContainer } from './item-container';

const { events, args, argTypes } = getStorybookHelpers('print-item-variables');

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

export const MultipleResponse: Story = {
  args: {
    'item-url': '/qti-item/example-choice-multiple-item.xml' // Set the new item URL here
  },
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

export const GraphicMatch: Story = {
  args: {
    'item-url': '/qti-test-package/items/graphic_gap_match.xml' // Set the new item URL here
  },
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

export const Match: Story = {
  args: {
    'item-url': '/qti-item/example-match.xml' // Set the new item URL here
  },
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
