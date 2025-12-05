import { expect, userEvent } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestViewToggle } from './test-view-toggle';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-view-toggle');

type Story = StoryObj<TestViewToggle & typeof args>;

const meta: Meta<TestViewToggle> = {
  component: 'test-view-toggle',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['skip-test']
};
export default meta;

export const Default: Story = {
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        ${template(args)}
      </test-navigation>
    </qti-test>`
};

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        <test-view-toggle ${spread(args)} role="switch">
          <template> {{ view === 'scorer' ? 'Scorer' : 'Candidate'}} </template>
        </test-view-toggle>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = await canvas.findByShadowRole('switch');
    // 1 Wait for the item to load
    const itemElement = await canvas.findByShadowTitle('T1 - Test Entry - Item 1');
    expect(itemElement).toBeInTheDocument();
    // 2 Assume the candidate rubric is not visible
    const rubricElement = await canvas.findByShadowText('candidate rubric block');
    expect(rubricElement).toBeVisible();
    // 3 Select the candidate view

    // 4 Wait for the candidate rubric to be visible
    expect(rubricElement).toBeVisible();
    // 5 Assume correctResponse is not set
    const firstChoiceElement = await canvas.findByShadowText('Correct');
    const afterStyle = getComputedStyle(firstChoiceElement, '::after');
    expect(afterStyle.content).toBe('none');
    // 6 Set the view to scorer
    await userEvent.click(switchElement);
    expect(afterStyle.content).not.toBe('none');
  }
};
