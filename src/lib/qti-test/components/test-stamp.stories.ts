import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { TestStamp } from './test-stamp';

import './test-stamp';

const { events, args, argTypes, template } = getStorybookHelpers('test-stamp');

type Story = StoryObj<TestStamp & typeof args>;

const meta: Meta<TestStamp> = {
  component: 'test-stamp',
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
        <test-stamp>
          <template>
            <div>Extra content</div>
            {{ computedContext }}
          </template>
          <template type="if" if="{{ important }}"> <test-next>Volgende</test-next></template>
        </test-stamp>
      </test-navigation>
    </qti-test>`
};
