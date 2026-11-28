import { expect, userEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../tools/testing/test-utils';

import type { TestView as TestViewClass } from '../test-view-toggle/test-view';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-view');

type Story = StoryObj<TestViewClass & typeof args>;

const meta: Meta<TestViewClass> = {
  title: 'QTI Test/Plugins/View/test-view',
  component: 'test-view',
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
 * Choosing a view in the dropdown shows the rubric blocks of that view only. Showing the correct
 * response to a scorer is the corrections package's job, not this element's.
 */
export const Test: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"> </test-container>
        <test-view ${spread(args)}>vorige</test-view>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const selectElement = await canvas.findByShadowLabelText('view');

    await step('The item "T1 - Test Entry - Item 1" is on screen', async () => {
      // The loader keeps an item's title as data-title.
      expect(
        await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'T1 - Test Entry - Item 1')
      ).toBeInTheDocument();
    });

    const rubricElement = await canvas.findByShadowText('candidate rubric block');

    await step('Choose the candidate view: the candidate rubric block shows', async () => {
      await userEvent.selectOptions(selectElement, 'candidate');
      await waitFor(() => expect(rubricElement).toBeVisible());
    });

    await step('Choose the scorer view: the candidate rubric block is hidden', async () => {
      await userEvent.selectOptions(selectElement, 'scorer');
      await waitFor(() => expect(rubricElement).not.toBeVisible());
    });
  },
  args: {
    'view-options': 'candidate, scorer'
  }
};
