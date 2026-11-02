import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { InputType } from 'storybook/internal/types';
import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from './qti-order-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-order-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiOrderInteraction & typeof args>;

/**
 *
 * ### [3.2.10 Order Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.4n8gips6tlv4)
 * the candidate's task is to reorder the choices, the order in which the choices are displayed initially is significant.
 *
 */
const meta: Meta<QtiOrderInteraction & { class: InputType }> = {
  component: 'qti-order-interaction',
  title: 'Interactions/Order/Overview',
  args,
  argTypes: {
    ...argTypes,
    class: {
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right', 'qti-match-tabular'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    }
  },
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
      html`
        <qti-prompt
          >The following F1 drivers finished on the podium in the first ever Grand Prix of Bahrain. Can you rearrange
          them into the correct finishing order?</qti-prompt
        >
        <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
        <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
        <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
      `
    )
};

/** The same interaction with the choices stacked vertically (`orientation="vertical"`). */
export const Vertical: Story = {
  render: () => html`
    <qti-order-interaction response-identifier="RESPONSE" orientation="vertical">
      <qti-prompt>Put the steps in the right order.</qti-prompt>
      <qti-simple-choice identifier="A">Choose the ingredients</qti-simple-choice>
      <qti-simple-choice identifier="B">Mix them</qti-simple-choice>
      <qti-simple-choice identifier="C">Bake</qti-simple-choice>
    </qti-order-interaction>
  `
};
