import { expect, userEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../tools/testing/test-utils';

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
 *
 * Both send `qc-test-switch-view`; `computedContext.view` follows.
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

/**
 * The switch toggles between the candidate and the scorer view, and with it which rubric blocks show.
 * Showing the correct response to a scorer is the corrections package's job, not this element's.
 */
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const switchElement = await canvas.findByShadowRole('switch');

    await step('The item "T1 - Test Entry - Item 1" is on screen', async () => {
      // The loader keeps an item's title as data-title.
      expect(
        await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'T1 - Test Entry - Item 1')
      ).toBeInTheDocument();
    });

    const rubricElement = await canvas.findByShadowText('candidate rubric block');

    await step('The candidate view is the default: the candidate rubric block shows', async () => {
      await waitFor(() => expect(rubricElement).toBeVisible());
    });

    await step('Switch to the scorer view: the candidate rubric block is hidden', async () => {
      await userEvent.click(switchElement);
      await waitFor(() => expect(rubricElement).not.toBeVisible());
    });

    await step('Switch back: it shows again', async () => {
      await userEvent.click(switchElement);
      await waitFor(() => expect(rubricElement).toBeVisible());
    });
  }
};
