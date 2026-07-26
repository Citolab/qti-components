import { html } from 'lit';
import { expect } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import { qtiTransformItem } from '@qti-components/transformers';

import { getAssessmentItemFromItemContainer } from '../../../../../tools/testing/test-utils';

import type { ItemContainer } from './item-container';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('item-container');

type Story = StoryObj<ItemContainer & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  args: { ...args, 'item-url': 'assets/qti-item/example-choice-item.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs', 'new']
};
export default meta;

export const ItemURL: Story = {
  render: args => {
    return html`<qti-item>${template(args)}</qti-item>`;
  },
  play: async ({ canvasElement }) => {
    const assessmentItem = await getAssessmentItemFromItemContainer(canvasElement);
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

/**
 * Proof that the Kennisnet brand can be a CLASSLESS overlay adopted INTO the item shadow (rather
 * than a `.qti-theme-kennisnet` class on <html>, which can't cross the shadow boundary). The
 * `<template>` content is rendered inside item-container's shadow, right next to the chips, so
 * plain `:state(drag)` / `::part(drag)` selectors reach them — no class, no --qti-chip-* tokens.
 */
export const ItemWithKennisnetOverlay: Story = {
  render: () => html`
    <qti-item>
      <item-container item-url="assets/qti-test-package/items/gap_match.xml">
        <template>
          <style>
            /* Re-declare the layer order so 'brand' sits above 'base': this style and the adopted
               item.css are separate sheets in the shadow and do not otherwise share layer order,
               so 'brand' would land below 'base' and lose. */
            @layer qti-components.reset, qti-components.global, qti-components.interactions.base,
              qti-components.interactions.brand, qti-components.interactions.states,
              qti-components.interactions.corrections, qti-components.elements, qti-components.overrides;

            @layer qti-components.interactions.brand {
              :state(drag):where(
                  :not(qti-graphic-gap-match-interaction *, [data-drag-interaction='qti-graphic-gap-match-interaction'])
                ),
              [data-drag-clone]:where(:not([data-drag-interaction='qti-graphic-gap-match-interaction'])),
              qti-gap::part(drag),
              qti-associate-interaction::part(drag),
              qti-simple-associable-choice::part(drag) {
                --component-background-color: var(--qti-primary);
                --component-color: var(--qti-primary-fg);
                --component-box-shadow: 0 3px color-mix(in srgb, var(--qti-primary) 50%, transparent);
                --component-border-color: transparent;
              }
            }
            @layer qti-components.interactions.states {
              :state(placeholder):where(
                  :not(qti-graphic-gap-match-interaction *, [data-drag-interaction='qti-graphic-gap-match-interaction'])
                ) {
                --component-background-color: var(--qti-placeholder-bg);
                --component-border-color: transparent;
                --component-box-shadow: inset var(--qti-placeholder-shadow);
              }
            }
          </style>
        </template>
      </item-container>
    </qti-item>
  `,
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
