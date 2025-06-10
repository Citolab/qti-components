import { expect, userEvent, waitFor } from '@storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentTest } from '../../../testing/test-utils';

import type { QtiAssessmentItem } from '../../../../dist/qti-components';
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
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/test-scoring-buttons/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <template type="repeat" repeat="{{ scores }}">
              <label>
                <input type="radio" ?checked="{{item == score}}" name="scoring-buttons" value="{{item}}" />
                <span>{{ item }}</span>
              </label>
            </template>
          </template>`
        )}
        <test-next>Volgende</test-next>
        <test-stamp>
          <template> {{ item.score }} </template>
        </test-stamp>
      </test-navigation>
    </qti-test>`
};

export const Test: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const assessmentTest = await getAssessmentTest(canvasElement);
    expect(assessmentTest).toBeInTheDocument();
    // // 2 Assume the candidate rubric is not visible
    // const rubricElement = await canvas.findByShadowText('candidate rubric block');
    // expect(rubricElement).toBeVisible();
    // // 3 Select the candidate view

    // // 4 Wait for the candidate rubric to be visible
    // expect(rubricElement).toBeVisible();
    // // 5 Assume correctResponse is not set
    // const firstChoiceElement = await canvas.findByShadowText('Correct');
    // const afterStyle = getComputedStyle(firstChoiceElement, '::after');
    // expect(afterStyle.content).toBe('none');
    // // 6 Set the view to scorer
    // await userEvent.click(switchElement);
    // expect(afterStyle.content).not.toBe('none');
  }
};

export const TestOutcomeWithFractions: Story = {
  render: args =>
    html` <qti-test navigate="item" data-testid="qti-test">
      <test-navigation>
        <test-container test-url="/assets/test-scoring-buttons/assessment.xml"></test-container>
        ${template(
          args,
          html`<template>
            <template type="repeat" repeat="{{ scores }}">
              <label>
                <input type="radio" ?checked="{{item == score}}" name="scoring-buttons" value="{{item}}" />
                <span>{{ item }}</span>
              </label>
            </template>
            Score = {{ score }}
          </template>`
        )}
        <test-next>Volgende</test-next>
        <!-- <test-stamp>
          <template> {{ item.score }} </template>
        </test-stamp> -->
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // _changeOutcomeScore
    const qtiTest = await canvas.findByTestId('qti-test');
    const activeItem: QtiAssessmentItem = await new Promise<QtiAssessmentItem>(resolve => {
      qtiTest.addEventListener('qti-assessment-item-connected', (event: CustomEvent) => {
        resolve(event.detail);
      });
    });
    activeItem.setOutcomeVariable('SCORE', '0.5');
    //(scoringButtons as any)._changeOutcomeScore('0.5');

    // await waitFor(
    //   () => {
    //     // TODO: check if the score is set correctly
    //     // const button = pagingButtons.querySelector('test-item-link');
    //     // if (!button) {
    //     //   throw new Error('interaction not loaded yet');
    //     // }
    //   },
    //   { timeout: 5000 }
    // );
  }
};
