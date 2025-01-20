import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { QtiInlineChoiceInteraction } from './qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-inline-choice-interaction');

type Story = StoryObj<QtiInlineChoiceInteraction & typeof args>;

const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: 'components/qti-inline-choice-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html` <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
        <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        <qti-inline-choice identifier="Y">York</qti-inline-choice>`
    )
};

export const DataPrompt = {
  render: Default.render,
  args: {
    dataPrompt: 'Select the correct answer'
  }
};
