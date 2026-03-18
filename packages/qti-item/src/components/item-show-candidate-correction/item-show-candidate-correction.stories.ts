import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { getAssessmentItemFromItemContainer } from '../../../../../tools/testing/test-utils';
import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { ItemShowCandidateCorrection } from './item-show-candidate-correction.ts';
import type { ItemContainer } from '../item-container/item-container';
import type {
  QtiSelectPointInteraction,
  QtiSimpleAssociableChoice,
  QtiSimpleChoice,
  QtiTextEntryInteraction,
  QtiGapMatchInteraction,
  QtiInlineChoice
} from '@qti-components/interactions';

const { events, args, argTypes } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<ItemShowCandidateCorrection & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  args: { ...args, 'item-url': 'assets/qti-item/example-choice-item.xml' },
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
    'item-url': 'assets/qti-item/example-choice-nocorrect-item.xml' // Set the new item URL here
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
    'item-url': 'assets/qti-item/example-choice-multiple-item.xml' // Set the new item URL here
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
    'item-url': 'assets/qti-test-package/items/match.xml' // Set the new item URL here
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

    const matchItem1 = (await canvas.findByShadowText('Prospero')) as QtiSimpleAssociableChoice;
    const matchItem2 = (await canvas.findByShadowText('Capulet')) as QtiSimpleAssociableChoice;
    const matchItem3 = (await canvas.findByShadowText('Demetrius')) as QtiSimpleAssociableChoice;

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
        const matchItem1CandidateResponse = matchItem1List[1] as QtiSimpleAssociableChoice;
        const matchItem2List = Array.from(await canvas.findAllByShadowText('Capulet'));
        const matchItem2CandidateResponse = matchItem2List[1] as QtiSimpleAssociableChoice;
        const matchItem3List = Array.from(await canvas.findAllByShadowText('Demetrius'));
        const matchItem3CandidateResponse = matchItem3List[1] as QtiSimpleAssociableChoice;

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
    'item-url': 'assets/qti-test-package/items/match.xml' // Set the new item URL here
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

    const matchItem1 = (await canvas.findByShadowText('Prospero')) as QtiSimpleAssociableChoice;
    const matchItem2 = (await canvas.findByShadowText('Lysander')) as QtiSimpleAssociableChoice;
    const matchItem3 = (await canvas.findByShadowText('Demetrius')) as QtiSimpleAssociableChoice;

    const dropZone1 = await canvas.findByShadowText('The Tempest');

    await step('Drag and drop all match interaction items to single dropzone', async () => {
      const matchItem1Id = matchItem1.getAttribute('identifier');
      const matchItem2Id = matchItem2.getAttribute('identifier');
      const matchItem3Id = matchItem3.getAttribute('identifier');

      await drag(matchItem1, { to: dropZone1 });
      await drag(matchItem2, { to: dropZone1 });
      await drag(matchItem3, { to: dropZone1 });
      await showCorrectButton.click();

      await step('Verify candidate correction state is applied', async () => {
        await waitFor(() => {
          const matchItem1CandidateResponse = dropZone1.querySelector(
            `qti-simple-associable-choice[identifier="${matchItem1Id}"]`
          ) as QtiSimpleAssociableChoice;
          const matchItem2CandidateResponse = dropZone1.querySelector(
            `qti-simple-associable-choice[identifier="${matchItem2Id}"]`
          ) as QtiSimpleAssociableChoice;
          const matchItem3CandidateResponse = dropZone1.querySelector(
            `qti-simple-associable-choice[identifier="${matchItem3Id}"]`
          ) as QtiSimpleAssociableChoice;

          expect(matchItem1CandidateResponse).toBeTruthy();
          expect(matchItem2CandidateResponse).toBeTruthy();
          expect(matchItem3CandidateResponse).toBeTruthy();

          expect(matchItem1CandidateResponse.internals.states.has('candidate-correct')).toBe(true);
          expect(matchItem2CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
          expect(matchItem3CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
          expect(matchItem1CandidateResponse.internals.states.has('candidate-incorrect')).toBe(false);
          expect(matchItem2CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
          expect(matchItem3CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
        });
      });
    });
  }
};

export const InlineChoice: Story = {
  args: {
    'item-url': 'assets/qti-item/example-inline-choice.xml'
  },
  render: args => html`
    <qti-item>
      <div>
        <item-container style="display: block; width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
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

    const showButton = await canvas.findByShadowText(/Show candidate correction/i);

    await step('Select an inline choice option', async () => {
      const root = interaction.shadowRoot;
      if (!root) throw new Error('inline-choice interaction has no shadowRoot');

      const select = root.querySelector<HTMLSelectElement>('select[part="select"], select');
      if (select) {
        select.value = 'Y'; // de correcte identifier (York)
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      const trigger = root.querySelector<HTMLButtonElement>('button[part="trigger"]');
      if (!trigger) throw new Error('inline-choice trigger not found (no select present)');

      trigger.click();
      await interaction.updateComplete;

      const options = Array.from(interaction.querySelectorAll<QtiInlineChoice>('qti-inline-choice'));
      const york = options.find(btn => btn.textContent?.includes('York'));
      if (!york) throw new Error('York option not found in custom dropdown');
      york.click();
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected option', async () => {
        const root = interaction.shadowRoot;
        expect(root).not.toBeNull();

        const select = root.querySelector<HTMLSelectElement>('select[part="select"], select');
        if (select) {
          const selectedOption = Array.from(select.options).find(opt => opt.selected);
          expect(selectedOption).not.toBeUndefined();
          expect(selectedOption?.value).toBe('Y');
          expect(selectedOption?.textContent?.trim()).toBe('York');
        } else {
          const displayedValue = root.querySelector('[part="value"]')?.textContent?.trim();
          expect(displayedValue).toBe('York');
          expect(interaction.response).toBe('Y');
        }
      });
    });
  }
};

export const TextEntry: Story = {
  args: {
    'item-url': 'assets/qti-item/example-text-entry.xml'
  },
  render: args => html`
    <qti-item>
      <div>
        <item-container style="display: block; width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
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

    const showButton = await canvas.findByShadowText(/Show candidate correction/i);
    const item = await getAssessmentItemFromItemContainer(canvasElement);
    const interaction: QtiTextEntryInteraction = item.querySelector('qti-text-entry-interaction');
    const input = interaction.shadowRoot?.querySelector<HTMLInputElement>('input');

    await step('Type in the correct answer text entry interaction', async () => {
      input.value = 'York';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected option', async () => {
        expect(interaction.internals.states.has('candidate-correct')).toBe(true);
        expect(interaction.internals.states.has('candidate-incorrect')).toBe(false);
        expect(interaction.internals.states.has('candidate-partially-correct')).toBe(false);
      });
    });

    await step('Type in the partially correct answer text entry interaction', async () => {
      input.value = 'york';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected option', async () => {
        const interactionResponse: QtiTextEntryInteraction = item.querySelector('qti-text-entry-interaction');
        expect(interactionResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(interactionResponse.internals.states.has('candidate-incorrect')).toBe(false);
        expect(interactionResponse.internals.states.has('candidate-partially-correct')).toBe(true);
      });
    });

    await step('Type in the incorrect answer text entry interaction', async () => {
      input.value = 'bla';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected option', async () => {
        const interactionResponse: QtiTextEntryInteraction = item.querySelector('qti-text-entry-interaction');
        expect(interactionResponse.internals.states.has('candidate-correct')).toBe(false);
        expect(interactionResponse.internals.states.has('candidate-incorrect')).toBe(true);
        expect(interactionResponse.internals.states.has('candidate-partially-correct')).toBe(false);
      });
    });
  }
};

export const SelectPoint: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/select_point.xml'
  },
  render: args => html`
    <qti-item>
      <div>
        <item-container style="display: block; width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
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
    const showButton = await canvas.findByShadowText(/Show candidate correction/i);
    const image = await canvas.findByShadowAltText('UK Map');

    await step('Click on correct point in the image', async () => {
      const rect = image.getBoundingClientRect();
      await fireEvent.click(image, {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.4
      });
    });
    await step('Click on incorrect points in the image', async () => {
      const rect = image.getBoundingClientRect();
      await fireEvent.click(image, {
        clientX: rect.left + rect.width * 0.5,
        clientY: rect.top + rect.height * 0.6
      });
      await fireEvent.click(image, {
        clientX: rect.left + rect.width * 0.55,
        clientY: rect.top + rect.height * 0.65
      });
    });

    await step('Click on the Show Candidate Correction button', async () => {
      await showButton.click();

      await step('Verify candidate correction by checking selected options', async () => {
        const item = await getAssessmentItemFromItemContainer(canvasElement);
        const interaction: QtiSelectPointInteraction = item.querySelector('qti-select-point-interaction');

        const buttonsCorrect =
          interaction.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[part="point correct"]');

        const buttonsIncorrect = interaction.shadowRoot?.querySelectorAll<HTMLButtonElement>(
          'button[part="point incorrect"]'
        );

        expect(buttonsCorrect).toHaveLength(1);
        expect(buttonsIncorrect).toHaveLength(2);
      });
    });
  }
};

export const GapMatch: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/gap_match.xml'
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
    const canvas = within(canvasElement);
    const assessmentItem = await getAssessmentItemFromItemContainer(canvasElement);
    const gapMatchInteraction = assessmentItem.querySelector('qti-gap-match-interaction') as QtiGapMatchInteraction;
    // Sortable gap-match now supports reordering from placed items; allow the story to place two drags.
    gapMatchInteraction.setAttribute('max-associations', '2');
    await gapMatchInteraction.updateComplete;

    const showCorrectButton = await canvas.findByShadowText(/Show candidate correction/i);

    const matchItem1 = (await canvas.findByShadowText('winter')) as QtiGapMatchInteraction;
    const matchItem2 = (await canvas.findByShadowText('spring')) as QtiGapMatchInteraction;
    const matchItem1Id = matchItem1.getAttribute('identifier');
    const matchItem2Id = matchItem2.getAttribute('identifier');

    const dropZones = assessmentItem.querySelectorAll(`qti-gap`);

    const dropZone1 = dropZones[0];
    const dropZone2 = dropZones[1];

    await step('Drag and drop match interaction items', async () => {
      await drag(matchItem1, { to: dropZone1 });
      await drag(matchItem2, { to: dropZone2 });
      await showCorrectButton.click();

      await step('Verify candidate correction state is applied', async () => {
        await waitFor(() => {
          const matchItem1CandidateResponse = dropZone1.querySelector(
            `qti-gap-text[identifier="${matchItem1Id}"]`
          ) as QtiGapMatchInteraction;
          const matchItem2CandidateResponse = dropZone2.querySelector(
            `qti-gap-text[identifier="${matchItem2Id}"]`
          ) as QtiGapMatchInteraction;

          expect(matchItem1CandidateResponse).toBeTruthy();
          expect(matchItem2CandidateResponse).toBeTruthy();

          expect(matchItem1CandidateResponse.internals.states.has('candidate-correct')).toBe(true);
          expect(matchItem2CandidateResponse.internals.states.has('candidate-correct')).toBe(false);
          expect(matchItem1CandidateResponse.internals.states.has('candidate-incorrect')).toBe(false);
          expect(matchItem2CandidateResponse.internals.states.has('candidate-incorrect')).toBe(true);
        });
      });
    });
  }
};

export const Order: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/order.xml'
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
    const canvas = within(canvasElement);
    const assessmentItem = await getAssessmentItemFromItemContainer(canvasElement);
    const interaction = assessmentItem.querySelector('qti-order-interaction');
    const showButton = await canvas.findByShadowText(/Show candidate correction/i);

    const drops = interaction.shadowRoot?.querySelectorAll('drop-list') ?? [];

    await step('Create candidate response with one correct and two incorrect positions', async () => {
      // Deterministic setup independent of shuffle/drag timing:
      // Correct order is DriverC, DriverA, DriverB.
      // We intentionally set DriverC, DriverB, DriverA.
      interaction.response = ['DriverC', 'DriverB', 'DriverA'];
      await interaction.updateComplete;
      await showButton.click();
    });

    await step('Verify candidate correction states on placed choices', async () => {
      const drop0Choice = drops[0].querySelector('qti-simple-choice[identifier="DriverC"]') as QtiSimpleChoice;
      const drop1Choice = drops[1].querySelector('qti-simple-choice[identifier="DriverB"]') as QtiSimpleChoice;
      const drop2Choice = drops[2].querySelector('qti-simple-choice[identifier="DriverA"]') as QtiSimpleChoice;

      expect(drop0Choice).toBeTruthy();
      expect(drop1Choice).toBeTruthy();
      expect(drop2Choice).toBeTruthy();

      expect(drop0Choice.internals.states.has('candidate-correct')).toBe(true);
      expect(drop1Choice.internals.states.has('candidate-correct')).toBe(false);
      expect(drop2Choice.internals.states.has('candidate-correct')).toBe(false);

      expect(drop0Choice.internals.states.has('candidate-incorrect')).toBe(false);
      expect(drop1Choice.internals.states.has('candidate-incorrect')).toBe(true);
      expect(drop2Choice.internals.states.has('candidate-incorrect')).toBe(true);
    });

    await step('Hide candidate correction clears states', async () => {
      await showButton.click();

      const drop0Choice = drops[0].querySelector('qti-simple-choice[identifier="DriverC"]') as QtiSimpleChoice;
      const drop1Choice = drops[1].querySelector('qti-simple-choice[identifier="DriverB"]') as QtiSimpleChoice;
      const drop2Choice = drops[2].querySelector('qti-simple-choice[identifier="DriverA"]') as QtiSimpleChoice;

      expect(drop0Choice.internals.states.has('candidate-correct')).toBe(false);
      expect(drop1Choice.internals.states.has('candidate-correct')).toBe(false);
      expect(drop2Choice.internals.states.has('candidate-correct')).toBe(false);
      expect(drop0Choice.internals.states.has('candidate-incorrect')).toBe(false);
      expect(drop1Choice.internals.states.has('candidate-incorrect')).toBe(false);
      expect(drop2Choice.internals.states.has('candidate-incorrect')).toBe(false);
    });
  }
};
