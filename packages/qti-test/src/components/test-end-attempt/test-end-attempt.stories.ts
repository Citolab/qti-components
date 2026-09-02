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

const meta: Meta<TestEndAttempt> = {
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

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-item-variables>  </test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        <test-end-attempt ${spread(args)}>End Attempt</test-end-attempt>
        <test-next>Volgende</test-next>
        <test-item-link item-id="ITM-text_entry">link</test-item-link>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByShadowText('link');

    const info = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    await fireEvent.click(link);

    const nextButton = await canvas.findByShadowText('Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());
    const firstItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)');
    expect(firstItem).toBeInTheDocument();
    // click end attempt
    const endAttemptButton = await findByShadowText(canvasElement, 'End Attempt');
    endAttemptButton.click();
    await new Promise(resolve => setTimeout(resolve, 0)); /* why is this necessary */

    // check if incorrect feedback block is visible
    const incorrect = await canvas.findByShadowText('Incorrect');
    expect(incorrect.assignedSlot).toBeVisible();

    // type York in the text field
    const textEntryInteraction = await canvas.findByShadowRole<HTMLInputElement>('textbox');
    await userEvent.type(textEntryInteraction, 'York');

    endAttemptButton.click();
    await new Promise(resolve => setTimeout(resolve, 0)); /* why is this necessary */

    // check if correct feedback block is visible
    const correct = await canvas.findByShadowText('Correct');
    expect(correct.assignedSlot).toBeVisible();
  }
};

const itemSessionControlTemplate = (args: any) => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container test-url="/assets/qti-test-package/assessment-item-session-control.xml"> </test-container>
      <test-end-attempt ${spread(args)}>End Attempt</test-end-attempt>
      <test-next>Volgende</test-next>
      <test-item-link item-id="ITM-choice-default">Default</test-item-link>
      <test-item-link item-id="ITM-choice-max2">Max2</test-item-link>
      <test-item-link item-id="ITM-choice-noskip">NoSkip</test-item-link>
      <test-item-link item-id="ITM-textentry-noskip">NoSkipText</test-item-link>
    </test-navigation>
  </qti-test>
`;

export const MaxAttemptsDefault: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // wait for items to load
    await getAssessmentItemsFromTestContainer(canvasElement);

    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    // Navigate to the default max-attempts item
    const defaultLink = await canvas.findByShadowText('Default');
    defaultLink.click();

    // End attempt should be enabled before any attempt
    await waitFor(() => expect(endAttemptButton).toBeEnabled());

    // Select a choice
    const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
    const choice = item.querySelector('qti-simple-choice');
    choice.click();

    // Submit the attempt
    endAttemptButton.click();

    // After 1 attempt with default max-attempts, end attempt should be disabled
    await waitFor(() => expect(endAttemptButton).toBeDisabled());
  }
};

export const MaxAttemptsAt2: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // wait for items to load
    await getAssessmentItemsFromTestContainer(canvasElement);

    // Navigate to the max-attempts=2 item
    const max2Link = await canvas.findByShadowText('Max2');
    max2Link.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    const endAttemptButton = await canvas.findByShadowText('End Attempt');

    // End attempt should be enabled before any attempt
    await waitFor(() => expect(endAttemptButton).toBeEnabled());

    // Select a *wrong* choice (suboptimal) and submit first attempt — a better
    // attempt is still possible, so attempts-remaining keeps the button enabled.
    const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
    const wrongChoice = item.querySelector('qti-simple-choice[identifier="ChoiceC"]') as HTMLElement;
    wrongChoice.click();

    endAttemptButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    // After 1 suboptimal attempt with max-attempts=2, end attempt should still be enabled
    await waitFor(() => expect(endAttemptButton).toBeEnabled());

    // Submit second attempt
    endAttemptButton.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    // After 2 attempts with max-attempts=2, end attempt should be disabled
    await waitFor(() => expect(endAttemptButton).toBeDisabled());
  }
};

export const NonSkippingItems: Story = {
  render: args => itemSessionControlTemplate(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // wait for items to load
    await getAssessmentItemsFromTestContainer(canvasElement);

    // Navigate to the no-skipping choice item
    const noSkipLink = await canvas.findByShadowText('NoSkip');
    noSkipLink.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    const endAttemptButton = await canvas.findByShadowText('End Attempt');
    const noSkipTextLink = await canvas.findByShadowText('NoSkipText');

    // Button should be disabled initially (choice not selected, allow-skipping=false)
    await waitFor(() => expect(endAttemptButton).toBeDisabled());

    // Select a choice in the first item
    const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Unattended Luggage');
    const choice = item.querySelector('qti-simple-choice');
    choice.click();

    // Now it should be enabled for individual submission
    await waitFor(() => expect(endAttemptButton).toBeEnabled());

    // Navigate to the no-skipping text entry item
    noSkipTextLink.click();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initially second item is empty, so end attempt should be disabled again
    await waitFor(() => expect(endAttemptButton).toBeDisabled());

    // type in the text field
    const textEntryInteraction = (await canvas.findByShadowRole('textbox')) as HTMLInputElement;
    await userEvent.type(textEntryInteraction, 'anything');

    // Now it should be enabled
    await waitFor(() => expect(endAttemptButton).toBeEnabled());
  }
};
