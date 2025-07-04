import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemFromItemContainer } from '../../../testing/test-utils';
import drag from '../../../testing/drag.ts';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { ItemShowCandidateCorrection } from './item-show-candidate-correction.ts';
import './item-show-candidate-correction.ts';
import type { ItemContainer } from './item-container';
import type { QtiSimpleAssociableChoice, QtiSimpleChoice } from '../../qti-components';

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

export const Match: Story = {
  args: {
    'item-url': '/qti-test-package/items/match.xml' // Set the new item URL here
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
        <item-show-candidate-correction></item-show-candidate-correction>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    const showCorrectButton = await canvas.findByShadowText(/Show candidate correction/i);

    const matchItem1 = await canvas.findByShadowText('Prospero') as QtiSimpleAssociableChoice;
    const matchItem2 = await canvas.findByShadowText('Capulet') as QtiSimpleAssociableChoice;
    const matchItem3 = await canvas.findByShadowText('Demetrius') as QtiSimpleAssociableChoice;

    const dropZone1 = await canvas.findByShadowText('The Tempest');
    const dropZone2 = await canvas.findByShadowText("A Midsummer-Night's Dream");
    const dropZone3 = await canvas.findByShadowText('Romeo and Juliet');


    await step('Drag and drop match interaction items', async () => {
      await drag(matchItem1, { to: dropZone1 });
      await drag(matchItem2, { to: dropZone2 });
      await drag(matchItem3, { to: dropZone3 });
      await showCorrectButton.click();


      await step('Verify candidate correction state is applied', async () => {
        const matchItem1List = Array.from(await canvas.findAllByShadowText('Prospero'));
        const matchItem1CandidateResponse = matchItem1List[1] as QtiSimpleAssociableChoice
        const matchItem2List = Array.from(await canvas.findAllByShadowText('Capulet'));
        const matchItem2CandidateResponse = matchItem2List[1] as QtiSimpleAssociableChoice
        const matchItem3List = Array.from(await canvas.findAllByShadowText('Demetrius'));
        const matchItem3CandidateResponse = matchItem3List[1] as QtiSimpleAssociableChoice

        expect(matchItem1CandidateResponse.internals.states.has('candidate-correct')).toBe(true);
        expect(matchItem2CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(matchItem3CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(matchItem1CandidateResponse.internals.states.has('candidate-incorrect')).toBe(false);
        expect(matchItem2CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
        expect(matchItem3CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
      });
    });
  }
};

export const MatchAllToOneZone: Story = {
  args: {
    'item-url': '/qti-test-package/items/match.xml' // Set the new item URL here
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
        <item-show-candidate-correction></item-show-candidate-correction>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered - fresh UI state
    const canvas = within(canvasElement);
    const showCorrectButton = await canvas.findByShadowText(/Show candidate correction/i);

    const matchItem1 = await canvas.findByShadowText('Prospero') as QtiSimpleAssociableChoice;
    const matchItem2 = await canvas.findByShadowText('Lysander') as QtiSimpleAssociableChoice;
    const matchItem3 = await canvas.findByShadowText('Demetrius') as QtiSimpleAssociableChoice;

    const dropZone1 = await canvas.findByShadowText('The Tempest');

    await step('Drag and drop all match interaction items to single dropzone', async () => {
      await drag(matchItem1, { to: dropZone1 });
      await drag(matchItem2, { to: dropZone1 });
      await drag(matchItem3, { to: dropZone1 });
      await showCorrectButton.click();

      await step('Verify candidate correction state is applied', async () => {
        const matchItem1List = Array.from(await canvas.findAllByShadowText('Prospero'));
        const matchItem1CandidateResponse = matchItem1List[1] as QtiSimpleAssociableChoice
        const matchItem2List = Array.from(await canvas.findAllByShadowText('Lysander'));
        const matchItem2CandidateResponse = matchItem2List[1] as QtiSimpleAssociableChoice
        const matchItem3List = Array.from(await canvas.findAllByShadowText('Demetrius'));
        const matchItem3CandidateResponse = matchItem3List[1] as QtiSimpleAssociableChoice

        expect(matchItem1CandidateResponse.internals.states.has('candidate-correct')).toBe(true);
        expect(matchItem2CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(matchItem3CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(matchItem1CandidateResponse.internals.states.has('candidate-incorrect')).toBe(false);
        expect(matchItem2CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
        expect(matchItem3CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
      });
    });
  }
};

export const InlineChoice: Story = {
  args: {
    'item-url': '/qti-item/example-inline-choice.xml'
  },
  render: args => html`
    <qti-item>
      <div>
        <item-container
          style="display: block; width: 400px; height: 350px;"
          item-url=${args['item-url'] as string}
        >
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

        <item-show-candidate-correction></item-show-candidate-correction>
      </div>
    </qti-item>
  `,

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = await getAssessmentItemFromItemContainer(canvasElement);

    const interaction = await waitFor(() => {
      const el = item.querySelector('qti-inline-choice-interaction');
      if (!el) throw new Error('inline-choice interaction not found');
      return el;
    });

    const selectElement = await waitFor(() => {
      const select = interaction.shadowRoot?.querySelector<HTMLSelectElement>('select');
      if (!select) throw new Error('select element not yet available');
      return select;
    });

    const showButton = await canvas.findByShadowText(/Show candidate correction/i);

    await step('Select an inline choice option', async () => {
      selectElement.value = 'Y'; // de correcte identifier (York)
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected option', async () => {
        const selectedOption = Array.from(selectElement.options).find(opt => opt.selected);
        expect(selectedOption).not.toBeUndefined();
        expect(selectedOption.value).toBe('Y');
        expect(selectedOption.textContent.trim()).toBe('York');
      });
    });
  }
};

export const TextEntry: Story = {
  args: {
    'item-url': '/qti-item/example-text-entry.xml'
  },
  render: args => html`
    <qti-item>
      <div>
        <item-container
          style="display: block; width: 400px; height: 350px;"
          item-url=${args['item-url'] as string}
        >
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

        <item-show-candidate-correction></item-show-candidate-correction>
      </div>
    </qti-item>
  `,

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = await getAssessmentItemFromItemContainer(canvasElement);

    const interaction = await waitFor(() => {
      const el = item.querySelector('qti-text-entry-interaction');
      if (!el) throw new Error('text interaction not found');
      return el;
    });

  }
};
