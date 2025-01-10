import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ItemContainer } from '../components/item-container';
import { qtiTransformItem } from '../../../qti-transformers';
import { expect } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('item-container');

type Story = StoryObj<ItemContainer & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  args: { ...args, 'item-url': '/qti-item/example-choice-item.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'new']
};
export default meta;

export const ItemURL: Story = {
  render: args => {
    return html`<qti-item>${template(args)}</qti-item>`;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const assessmentItem = await canvas.findByShadowTitle('Unattended Luggage');
    expect(assessmentItem).toBeInTheDocument();
  }
};

export const ItemDoc: Story = {
  render: (_, { loaded: { itemDoc } }) => {
    return html`
      <qti-item>
        <item-container .itemDoc=${itemDoc}></item-container>
      </qti-item>
    `;
  },
  loaders: [
    async ({ args }) => {
      console.log('args', args);
      const itemDoc = qtiTransformItem()
        .load(args['item-url'])
        .then(api => api.htmlDoc());
      return { itemDoc };
    }
  ],
  play: ItemURL.play,
  tags: ['!autodocs']
};

export const ItemXML: Story = {
  render: (_, { loaded: { itemXML } }) => {
    return html`
      <qti-item>
        <item-container .itemXML=${itemXML}></item-container>
      </qti-item>
    `;
  },
  loaders: [
    async ({ args }) => {
      const itemXML = await qtiTransformItem()
        .load(args['item-url'])
        .then(api => api.xml());
      return { itemXML };
    }
  ],
  play: ItemURL.play,
  tags: ['!autodocs']
};

export const ItemWithTemplate: Story = {
  render: args => {
    return html`
      <qti-item>
        <item-container item-url=${args['item-url']}>
          <template>
            <style>
              qti-simple-choice {
                border: 2px solid blue;
              }
            </style>
          </template>
        </item-container>
      </qti-item>
    `;
  },
  play: ItemURL.play,
  tags: ['!autodocs']
};

export const ItemWithTemplateScale: Story = {
  render: args => {
    return html`
      <qti-item>
        <item-container item-url=${args['item-url']}>
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
      </qti-item>
    `;
  },
  play: ItemURL.play,
  tags: ['!autodocs']
};
