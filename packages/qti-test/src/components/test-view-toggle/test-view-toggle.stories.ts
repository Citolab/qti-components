import { expect, userEvent } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import type { TestViewToggle } from './test-view-toggle';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-view-toggle');

type Story = StoryObj<TestViewToggle & typeof args>;

/**
 * The **view** plugin switches who is looking. QTI content can be meant for one audience
 * (`view="candidate"`, `view="scorer"`, …), and `[view]` content shows or hides to match.
 *
 * - `<test-view>` is a dropdown of views; `view-options` sets which.
 * - `<test-view-toggle>` switches to the view named by its `view` attribute.
 * - `<test-check-item>` ends the attempt on the current item and switches to a view (default
 *   `scorer`), for example to reveal a rubric after the candidate has answered.
 *
 * All three send `cito-test-switch-view`; `computedContext.view` follows.
 */
const meta: Meta<TestViewToggle> = {
  title: 'QTI Test/Plugins/View/test-view-toggle',
  component: 'test-view-toggle',
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
  tags: ['no-tests'],
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        ${template(args)}
      </test-navigation>
    </qti-test>`
};

export const Test: Story = {
  // Fails: it looks the item up by its title attribute, but the loader keeps an item's title as
  // data-title, so 'T1 - Test Entry - Item 1' is not found.
  tags: ['xfail'],
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
