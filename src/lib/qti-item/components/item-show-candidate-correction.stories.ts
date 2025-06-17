import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { ItemShowCandidateCorrection } from './item-show-candidate-correction.ts';
import './item-show-candidate-correction.ts';
import type { ItemContainer } from './item-container';
import type { QtiSimpleChoice } from '../../qti-components';

const { events, args, argTypes } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<ItemShowCandidateCorrection & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  args: { ...args, 'item-url': '/qti-item/example-choice-item.xml' },
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs', 'new']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`<qti-item>
      <!-- <div style="display: flex; flex-direction: column; gap: 1rem;"> -->
      <item-container style="width: 400px; height: 350px; display: block;" item-url=${args['item-url'] as string}>
        <template>
          <style>
            qti-assessment-item {
              padding: 1rem;
              display: block;
              aspect-ratio: 4 / 3;
              width: 800px;
              border: 2px solid blue;
              transform: scale(0.5);
              transform-origin: top left;
            }
          </style>
        </template>
      </item-container>

      <item-show-candidate-correction ${spread(args)}></item-show-candidate-correction>
      <!-- </div> -->
    </qti-item>`;
  },

  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    // const choices = await canvas.findAllByShadowRole('radio');
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('You must stay with your luggage at all times.');
    const choiceB: QtiSimpleChoice = await canvas.findByShadowText('Do not let someone else look after your luggage.');
    const choiceC: QtiSimpleChoice = await canvas.findByShadowText('Remember your luggage when you leave.');

    const showCorrectButton = canvas.getAllByShadowText(/Show candidate correction/i)[0];
    await step('Click on the Show candidate correction button', async () => {
      await choiceA.click();
      await showCorrectButton.click();

      await step('Verify candidate correction is applied', async () => {
        expect(choiceA.internals.states.has('candidate-correct')).toBe(true);
        expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceC.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceB.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceC.internals.states.has('candidate-incorrect')).toBe(false);
      });
      await step('Click on the Show Candidate Correction again', async () => {
        expect(canvas.queryByShadowText(/Show candidate correction/i)).toBeNull();
        expect(canvas.getAllByShadowText(/Hide candidate correction/i).length).toBe(1);
        await showCorrectButton.click();
        await choiceA.click(); // Deselect option

        expect(choiceA.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceC.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceB.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceC.internals.states.has('candidate-incorrect')).toBe(false);
      });
      await step('Change answer after showing Candidate Correction', async () => {
        expect(canvas.getAllByShadowText(/Show candidate correction/i).length).toBe(1);
        await choiceA.click();
        await showCorrectButton.click();
        await choiceB.click();

        expect(choiceA.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceC.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceB.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceC.internals.states.has('candidate-incorrect')).toBe(false);

        expect(canvas.queryByShadowText(/Hide candidate correction/i)).toBeNull();

        await choiceB.click(); // Deselect option
      });
    });
  }
};

export const NoCorrectResponse: Story = {
  args: {
    'item-url': '/qti-item/example-choice-nocorrect-item.xml' // Set the new item URL here
  },
  render: args =>
    html` <qti-item>
      <item-container style="width: 400px; height: 350px; display: block;" item-url=${args['item-url'] as string}>
        <template>
          <style>
            qti-assessment-item {
              padding: 1rem;
              display: block;
              aspect-ratio: 4 / 3;
              width: 800px;
              border: 2px solid blue;
              transform: scale(0.5);
              transform-origin: top left;
            }
          </style>
        </template>
      </item-container>

      <item-show-candidate-correction ${spread(args)}></item-show-candidate-correction>
      <!-- </div> -->
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowText('You must stay with your luggage at all times.');
    const _ = canvas.getAllByShadowText(/No correct response specified/i)[0];
    const itemShowCorrect = canvasElement.querySelector('item-show-candidate-correction');
    await step('Verify the Show Correct button is disabled', async () => {
      expect(itemShowCorrect.disabled).toBe(true);
    });
  }
};

export const MultipleResponse: Story = {
  args: {
    'item-url': '/qti-item/example-choice-multiple-item.xml' // Set the new item URL here
  },
  render: args =>
    html` <qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
          <template>
            <style>
              qti-assessment-item {
                padding: 1rem;
                display: block;
                aspect-ratio: 4 / 3;
                width: 800px;

                border: 2px solid blue;
                transform: scale(0.5);
                transform-origin: top left;
              }
            </style>
          </template>
        </item-container>
        <item-show-candidate-correction ${spread(args)}></item-show-candidate-correction>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    // const choices = await canvas.findAllByShadowRole('radio');
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('This is correct.');
    const choiceB: QtiSimpleChoice = await canvas.findByShadowText('This is also correct.');
    const choiceC: QtiSimpleChoice = await canvas.findByShadowText('This is wrong.');
    const showCorrectButton = canvas.getAllByShadowText(/Show candidate correction/i)[0];

    await step('Click on the Show Correct button', async () => {
      await choiceA.click();
      await choiceC.click();
      await showCorrectButton.click();

      await step('Verify candidate correction state is applied', async () => {
        expect(choiceA.internals.states.has('candidate-correct')).toBe(true);
        expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceC.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceB.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceC.internals.states.has('candidate-incorrect')).toBe(true);
      });
    });

    await step('Click on the Hide Correct button and deselect options', async () => {
      await showCorrectButton.click();

      await step('Verify candidate correction state is removed', async () => {
        expect(choiceA.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceB.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceC.internals.states.has('candidate-correct')).toBe(false);
        expect(choiceA.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceB.internals.states.has('candidate-incorrect')).toBe(false);
        expect(choiceC.internals.states.has('candidate-incorrect')).toBe(false);
      });

      await choiceA.click();
      await choiceC.click();
    });
  }
};
