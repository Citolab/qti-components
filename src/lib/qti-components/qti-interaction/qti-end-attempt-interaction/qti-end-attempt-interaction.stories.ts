import '@citolab/qti-components/qti-components';

import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  component: 'qti-end-attempt-interaction'
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: args => html`
    <qti-assessment-item
      @qti-register-interaction="${action(`qti-register-interaction`)}"
      @qti-interaction-response="${action(`qti-interaction-response`)}"
    >
      <qti-item-body>
        <qti-printed-variable class="qti-well" identifier="numAttempts"></qti-printed-variable>

        <qti-end-attempt-interaction title="test num attempts"></qti-end-attempt-interaction>
      </qti-item-body>
      <qti-response-processing> </qti-response-processing>
    </qti-assessment-item>
  `
};
