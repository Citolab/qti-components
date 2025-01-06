import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import { QtiEndAttemptInteraction } from './qti-end-attempt-interaction';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-end-attempt-interaction');

type Story = StoryObj<QtiEndAttemptInteraction & typeof args>;

const meta: Meta<QtiEndAttemptInteraction> = {
  component: 'qti-end-attempt-interaction',
  title: 'components/qti-end-attempt-interaction',
  args: { ...args, title: 'end attempt' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: () => html`
    <qti-assessment-item>
      <qti-item-body>
        <qti-printed-variable class="qti-well" identifier="numAttempts"></qti-printed-variable>
        ${template(args)}
      </qti-item-body>
      <qti-response-processing> </qti-response-processing>
    </qti-assessment-item>
  `
};
