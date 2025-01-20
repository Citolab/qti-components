import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { QtiUploadInteraction } from './qti-upload-interaction';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-upload-interaction');

type Story = StoryObj<QtiUploadInteraction & typeof args>;

const meta: Meta<QtiUploadInteraction> = {
  component: 'qti-upload-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['!autodocs']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
      <qti-prompt>
        <p>
          Build a spreadsheet to simulate 50 cartons of chocolates when each carton contains 10 chocolates, and when
          one-seventh of the chocolates have nut centres. Your spreadsheet should include 50 rows representing the 50
          cartons, each row containing 10 columns to represent the chocolates.
        </p>
      </qti-prompt>
    </qti-upload-interaction>
  `
    ),

  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
