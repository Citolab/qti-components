import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiUploadInteraction } from './qti-upload-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-upload-interaction');

type Story = StoryObj<QtiUploadInteraction & typeof args>;

/**
 *
 * ### [3.2.19 Upload](https://www.imsglobal.org/spec/qti/v3p0/impl#h.5bw8rpbotrcs)
 * allows the candidate to upload a pre-prepared file representing their response.
 *
 */
const meta: Meta<QtiUploadInteraction> = {
  component: 'qti-upload-interaction',
  title: '3.2 interaction types/19 Upload',
  args,
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
