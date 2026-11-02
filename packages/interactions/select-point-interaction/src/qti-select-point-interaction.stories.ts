import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import ukPng from './fixtures/uk.png';

import type { QtiSelectPointInteraction } from './qti-select-point-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-select-point-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiSelectPointInteraction & typeof args>;

/**
 *
 * ### [3.2.17 Select Point Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.ev30y6ze263d)
 * a graphic interaction in which the candidate's task is to select one or more points.
 *
 */
const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: 'Interactions/Select Point/Overview',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'iol']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html` <qti-prompt>Mark Edinburgh on this map of the United Kingdom.</qti-prompt>
        <img src=${ukPng} height="280" width="206" />`
    ),
  args: {
    'response-identifier': 'RESPONSE',
    'max-choices': 1
  }
};

/** The image scaled down by its container: a click still lands on the right point. */
export const ScaledSmallerImage: Story = {
  render: args =>
    template(
      args,
      html`
        <div style="box-sizing: content-box; width: 103px; height: auto; display: block; border: 1px solid red;">
          <qti-select-point-interaction>
            <qti-prompt>Click anywhere on the scaled interaction.</qti-prompt>
            <img src=${ukPng} alt="map of united kingdom" height="280" width="206" />
          </qti-select-point-interaction>
        </div>
      `
    ),
  args: {
    'response-identifier': 'RESPONSE'
  }
};
