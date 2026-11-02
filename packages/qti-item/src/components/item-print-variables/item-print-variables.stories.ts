import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import type { ItemPrintVariables } from './item-print-variables';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { ItemContainer } from '../item-container/item-container';

const { events, args, argTypes } = getStorybookHelpers('item-print-variables');

type Story = StoryObj<ItemPrintVariables & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  title: 'QTI Item/item-print-variables',
  component: 'item-container',
  args: { ...args, 'item-url': '/assets/qti-item/example-choice-item.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs', 'new']
};
export default meta;

/** The item, scaled down, with the table of its variables beside it. */
const render: Story['render'] = args =>
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
      <item-print-variables></item-print-variables>
    </div>
  </qti-item>`;

/** The item loads, and the table lists its response variable. */
const listsResponse =
  (identifier = 'RESPONSE'): Story['play'] =>
  async ({ canvasElement }) => {
    const table = canvasElement.querySelector('item-print-variables')!;
    await waitFor(
      () => {
        const cells = [...(table.shadowRoot?.querySelectorAll('td') ?? [])].map(td => td.textContent?.trim());
        expect(cells).toContain(identifier);
      },
      { timeout: 10000 }
    );
  };

export const Default: Story = { render, play: listsResponse() };

export const MultipleResponse: Story = {
  args: { 'item-url': '/assets/qti-item/example-choice-multiple-item.xml' },
  render,
  play: listsResponse()
};

export const GraphicMatch: Story = {
  args: { 'item-url': '/assets/qti-test-package/items/graphic_gap_match.xml' },
  render,
  play: listsResponse()
};

export const Match: Story = {
  args: { 'item-url': '/assets/qti-item/example-match.xml' },
  render,
  play: listsResponse('match_languages_countries')
};
