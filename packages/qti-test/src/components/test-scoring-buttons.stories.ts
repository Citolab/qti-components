import { expect, userEvent } from 'storybook/test';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentTest } from '../../../../apps/e2e/src/testing/test-utils';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
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
