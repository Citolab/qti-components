import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { findByShadowText, within } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';

import {
  getAssessmentItemFromTestContainerByDataTitle,
  getAssessmentItemsFromTestContainer
} from '../../../../../tools/testing/test-utils';

import type { TestEndAttempt } from './test-end-attempt';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-end-attempt');

type Story = StoryObj<TestEndAttempt & typeof args>;

/**
 * The args as attributes for `spread`, without the ones that are off. A boolean attribute is on as
 * soon as it is there, so spreading every arg would set `require-answer=""` and make the button wait
 * for an answer.
 */
const attributes = (storyArgs: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(storyArgs).filter(([, value]) => value !== false && value !== '' && value != null));

const meta: Meta<TestEndAttempt> = {
  title: 'QTI behaviour/test-end-attempt',
  component: 'test-end-attempt',
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
    html` <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-item-variables></test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(args, html`End Attempt`)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};

/** End Attempt scores the item on screen: a wrong answer shows Incorrect, a right one Correct. */
export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-item-variables>  </test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        <test-end-attempt ${spread(attributes(args))}>End Attempt</test-end-attempt>
        <test-next>Volgende</test-next>
        <test-item-link item-id="ITM-text_entry">link</test-item-link>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const endAttemptButton = await findByShadowText(canvasElement, 'End Attempt');

    await step('Go to the text entry item "Richard III (Take 3)"', async () => {
      await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
      await fireEvent.click(await canvas.findByShadowText('link'));
      await waitFor(() => expect(canvas.getByShadowText('Volgende')).toBeEnabled());
      expect(
        await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)')
      ).toBeInTheDocument();
    });

    await step('Press End Attempt with nothing typed: "Incorrect" shows', async () => {
      endAttemptButton.click();
      await new Promise(resolve => setTimeout(resolve, 0));
      const incorrect = await canvas.findByShadowText('Incorrect');
      expect(incorrect.assignedSlot).toBeVisible();
    });

    await step('Type York and press End Attempt again: "Correct" shows', async () => {
      await userEvent.type(await canvas.findByShadowRole<HTMLInputElement>('textbox'), 'York');
      endAttemptButton.click();
      await new Promise(resolve => setTimeout(resolve, 0));
      const correct = await canvas.findByShadowText('Correct');
      expect(correct.assignedSlot).toBeVisible();
    });
  }
};

const itemSessionControlTemplate = (args: any) => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url="/assets/qti-test-package/assessment-item-session-control.xml"> </test-container>
      <test-end-attempt ${spread(attributes(args))}>End Attempt</test-end-attempt>
      <test-next>Volgende</test-next>
      <test-item-link item-id="ITM-choice-default">Default</test-item-link>
      <test-item-link item-id="ITM-choice-max2">Max2</test-item-link>
      <test-item-link item-id="ITM-choice-noskip">NoSkip</test-item-link>
      <test-item-link item-id="ITM-textentry-noskip">NoSkipText</test-item-link>
    </test-navigation>
  </qti-test>
`;

/** Without `qti-item-session-control` an item gets one attempt (QTI default): after it, End Attempt is greyed out. */
export const MaxAttemptsDefault: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);
    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    await step('Go to the item without item session control: End Attempt is enabled', async () => {
      (await canvas.findByShadowText('Default')).click();
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });

    await step('Choose an answer and press End Attempt', async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
      item.querySelector<HTMLElement>('qti-simple-choice')!.click();
      endAttemptButton.click();
    });

    await step('The one attempt is used: End Attempt is greyed out', async () => {
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });
  }
};

/** `max-attempts="2"`: after a wrong first attempt End Attempt stays enabled; after the second it is greyed out. */
export const MaxAttemptsAt2: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);
    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    await step('Go to the item with max-attempts 2: End Attempt is enabled', async () => {
      (await canvas.findByShadowText('Max2')).click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });

    await step('Choose a wrong answer and press End Attempt: still enabled, one attempt left', async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
      item.querySelector<HTMLElement>('qti-simple-choice[identifier="ChoiceC"]')!.click();
      endAttemptButton.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });

    await step('Press End Attempt again: both attempts used, greyed out', async () => {
      endAttemptButton.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });
  }
};

/**
 * Our own rule, not QTI's: once an attempt is optimal (SCORE reached MAXSCORE) there is nothing to
 * improve, so End Attempt is greyed out even with attempts left.
 */
export const OptimalDisablesWithAttemptsLeft: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);
    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    await step('Go to the item with max-attempts 2: End Attempt is enabled', async () => {
      (await canvas.findByShadowText('Max2')).click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });

    await step('Choose the right answer and press End Attempt', async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
      item.querySelector<HTMLElement>('qti-simple-choice[identifier="ChoiceA"]')!.click();
      endAttemptButton.click();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await step('The attempt was optimal: greyed out, although one attempt is left', async () => {
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });
  }
};

/** `allow-skipping="false"`: End Attempt waits until the item has an answer, per item. */
export const NonSkippingItems: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await getAssessmentItemsFromTestContainer(canvasElement);
    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    await step('Go to the choice item that may not be skipped: End Attempt is greyed out', async () => {
      (await canvas.findByShadowText('NoSkip')).click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });

    await step('Choose an answer: End Attempt is enabled', async () => {
      const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
      item.querySelector<HTMLElement>('qti-simple-choice')!.click();
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });

    await step('Go to the text entry item that may not be skipped: greyed out again', async () => {
      (await canvas.findByShadowText('NoSkipText')).click();
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => expect(endAttemptButton).toBeDisabled());
    });

    await step('Type an answer: End Attempt is enabled', async () => {
      await userEvent.type((await canvas.findByShadowRole('textbox')) as HTMLInputElement, 'anything');
      await waitFor(() => expect(endAttemptButton).toBeEnabled());
    });
  }
};
