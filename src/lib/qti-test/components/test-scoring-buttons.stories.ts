import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestScoringButtons } from './test-scoring-buttons';

const { events, args, argTypes, template } = getStorybookHelpers('test-scoring-buttons');

type Story = StoryObj<TestScoringButtons & typeof args>;

const meta: Meta<TestScoringButtons> = {
  component: 'test-scoring-buttons',
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
    html` <qti-test>
      <test-navigation>
        <test-container test-url="/assets/api/biologie/assessment.xml"></test-container>
        ${template(args)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};
