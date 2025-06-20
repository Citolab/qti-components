import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from '@storybook/test';
import { findByShadowText, within } from 'shadow-dom-testing-library';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { fireEvent } from '@storybook/test';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../testing/test-utils';

import type { TestNavigation } from './test-navigation.ts';
import type { QtiSimpleChoice } from '../../qti-components';
import type { TestShowCorrectResponse } from './test-show-correct-response';
import type { Meta, StoryObj } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('test-show-correct-response');

type Story = StoryObj<TestShowCorrectResponse & typeof args>;

const meta: Meta<TestShowCorrectResponse> = {
  component: 'test-show-correct-response',
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
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        ${template(args, html`Show Correct`)}
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`
};

export const Test2: Story = {
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package2/AssessmentTest.xml"> </test-container>
        ${template(args, html`Show Correct`)}
        <test-prev>Vorige</test-prev>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nextButton = await canvas.findByShadowText('Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());

    // check if show correct button is enabled
    const showCorrectButton = await findByShadowText(canvasElement, 'Show correct response');
    await waitFor(() => expect(showCorrectButton).toBeEnabled());

    // check the first alernative
    const firstAlternative = await findByShadowText(canvasElement, 'Richting het noorden');
    await fireEvent.click(firstAlternative);
    // check if the item is added under the correct item-ref
    const itemRef = firstAlternative.closest('qti-assessment-item-ref');
    expect(itemRef.getAttribute('identifier')).toBe('ODD-13122024-124755-RES1');

    // navigate to the next item
    await fireEvent.click(nextButton);
    const secondAlternative = await findByShadowText(canvasElement, 'bipolaire staat');
    await fireEvent.click(secondAlternative);
    await fireEvent.click(nextButton);

    // now the same item as item1 is show, check if no alternatives are selected
    const choiceA = await canvas.findByShadowText('Richting het noorden');
    expect((choiceA.closest('qti-simple-choice') as QtiSimpleChoice).internals.states.has('--checked')).toBe(false);

    const choiceC = await canvas.findByShadowText('Richting het zuiden');
    await fireEvent.click(choiceC);
    expect((choiceC.closest('qti-simple-choice') as QtiSimpleChoice).internals.states.has('--checked')).toBe(true);

    const prevButton = await canvas.findByShadowText('Vorige');
    await fireEvent.click(prevButton);
    await await findByShadowText(canvasElement, 'bipolaire staat');
    await fireEvent.click(prevButton);
    // check if A is selected again
    const choiceA2 = await canvas.findByShadowText('Richting het noorden');
    expect((choiceA2.closest('qti-simple-choice') as QtiSimpleChoice).internals.states.has('--checked')).toBe(true);
  }
};

export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-item-variables></test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        <test-show-correct-response ${spread(args)}>Show correct</test-show-correct-response>
        <test-next>Volgende</test-next>
        <test-item-link item-id="ITM-text_entry">link</test-item-link>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = await canvas.findByShadowText('link');
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    await fireEvent.click(link);

    const nextButton = await canvas.findByShadowText('Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());

    const firstItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)');
    expect(firstItem).toBeInTheDocument();

    const showCorrectButton = await findByShadowText(canvasElement, 'Show correct response');
    showCorrectButton.click();

    const incorrect = await canvas.findByShadowText('York');
    expect(incorrect).toBeInTheDocument();
  }
};

export const TestFullCorrectResponse: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-item-variables></test-print-item-variables> -->
        <test-container test-url="/assets/qti-test-package/assessment.xml"> </test-container>
        <test-show-correct-response ${spread(args)}>Show correct</test-show-correct-response>
        <test-next>Volgende</test-next>
        <test-item-link item-id="ITM-text_entry">link</test-item-link>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const testNavigation = document.querySelector('test-navigation') as TestNavigation;
    testNavigation.configContext = {
      correctResponseMode: 'full'
    };

    const canvas = within(canvasElement);

    const link = await canvas.findByShadowText('link');
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    await fireEvent.click(link);

    const nextButton = await canvas.findByShadowText('Volgende');
    await waitFor(() => expect(nextButton).toBeEnabled());

    const firstItem = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Richard III (Take 3)');
    expect(firstItem).toBeInTheDocument();

    const showCorrectButton = await findByShadowText(canvasElement, 'Show correct response');
    showCorrectButton.click();

    const fullCorrectResponse = await canvas.findByShadowRole('full-correct-response');
    expect(fullCorrectResponse).toBeInTheDocument();
  }
};
