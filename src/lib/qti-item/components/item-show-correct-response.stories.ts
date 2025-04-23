import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect, waitFor } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { ItemShowCorrectResponse } from './item-show-correct-response';
import './item-show-correct-response';
import type { ItemContainer } from './item-container';
import type { QtiSimpleChoice } from '../../qti-components';

const { events, args, argTypes, template } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<ItemShowCorrectResponse & typeof args>;

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

      <item-show-correct-response ${spread(args)}></item-show-correct-response>
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

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();

      await step('Verify correct response state is applied', async () => {
        expect(choiceA.internals.states.has('correct-response')).toBe(true);
        expect(choiceB.internals.states.has('correct-response')).toBe(false);
        expect(choiceC.internals.states.has('correct-response')).toBe(false);
        expect(choiceA.internals.states.has('incorrect-response')).toBe(false);
        expect(choiceB.internals.states.has('incorrect-response')).toBe(true);
        expect(choiceC.internals.states.has('incorrect-response')).toBe(true);
      });
      await step('Click on the Show Correct button again', async () => {
        expect(canvas.queryByShadowText(/Show correct/i)).toBeNull();
        expect(canvas.getAllByShadowText(/Hide correct/i).length).toBe(1);
        await showCorrectButton.click();

        expect(choiceA.internals.states.has('correct-response')).toBe(false);
        expect(choiceB.internals.states.has('correct-response')).toBe(false);
        expect(choiceC.internals.states.has('correct-response')).toBe(false);
        expect(choiceA.internals.states.has('incorrect-response')).toBe(false);
        expect(choiceB.internals.states.has('incorrect-response')).toBe(false);
        expect(choiceC.internals.states.has('incorrect-response')).toBe(false);
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

      <item-show-correct-response ${spread(args)}></item-show-correct-response>
      <!-- </div> -->
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowText('You must stay with your luggage at all times.');
    const _ = canvas.getAllByShadowText(/No correct response specified/i)[0];
    const itemShowCorrect = canvasElement.querySelector('item-show-correct-response');
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    // const choices = await canvas.findAllByShadowRole('radio');
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('This is correct.');
    const choiceB: QtiSimpleChoice = await canvas.findByShadowText('This is also correct.');
    const choiceC: QtiSimpleChoice = await canvas.findByShadowText('This is wrong.');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();

      await step('Verify correct response state is applied', async () => {
        expect(choiceA.internals.states.has('correct-response')).toBe(true);
        expect(choiceB.internals.states.has('correct-response')).toBe(true);
        expect(choiceC.internals.states.has('correct-response')).toBe(false);
        expect(choiceA.internals.states.has('incorrect-response')).toBe(false);
        expect(choiceB.internals.states.has('incorrect-response')).toBe(false);
        expect(choiceC.internals.states.has('incorrect-response')).toBe(true);
      });
    });
  }
};

export const TextEntry: Story = {
  args: {
    'item-url': '/qti-test-package/items/text_entry.xml' // Set the new item URL here
  },
  render: args =>
    html` <qti-item navigate="item">
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await canvas.findByShadowTitle('Richard III (Take 3)');
    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-text-entry-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctElement = interaction.shadowRoot.querySelector('[part="correct"]');
      expect(correctElement).toBeVisible();
    });
  }
};

export const GapMatch: Story = {
  args: {
    'item-url': '/qti-test-package/items/gap_match.xml' // Set the new item URL here
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = await canvas.findByShadowTitle('Richard III (Take 1)');

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctOptions = interaction.querySelectorAll(`[class="correct-option"]`);
      expect(correctOptions.length).toBe(2);
      expect(correctOptions[0].textContent).toBe('winter');
      expect(correctOptions[1].textContent).toBe('summer');
    });
  }
};

export const Match: Story = {
  args: {
    'item-url': '/qti-test-package/items/match.xml' // Set the new item URL here
    // 'item-url': 'api/kennisnet-1/ITEM002.xml' // Set the new item URL here
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = await canvas.findByShadowTitle('Characters and Plays');

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctElements = interaction.querySelectorAll(`[class="correct-option"]`);
      expect(correctElements.length).toBe(3);
      const correctOptions = Array.from(correctElements).map(el => el.textContent);
      const allExist = correctOptions.every(element => ['Prospero', 'Demetrius', 'Capulet'].includes(element));
      expect(allExist).toBe(true);
    });
  }
};

export const MatchTabular: Story = {
  args: {
    'item-url': '/qti-test-package/items/match-tabular.xml' // Set the new item URL here
    // 'item-url': 'api/kennisnet-1/ITEM002.xml' // Set the new item URL here
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = await canvas.findByShadowTitle('Characters and Plays');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    const interaction = item.querySelector('qti-match-interaction');

    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();

      // Find all elements with rb-correct or cb-correct parts
      // This uses the shadow DOM API to find elements with specific part attributes
      const correctRadioButtons = interaction.shadowRoot.querySelectorAll('[part~="rb-correct"]');
      const correctCheckboxes = interaction.shadowRoot.querySelectorAll('[part~="cb-correct"]');

      // Combine both types of correct elements
      const allCorrectElements = [...correctRadioButtons, ...correctCheckboxes];

      // Verify we have the expected number of correct answers
      expect(allCorrectElements.length).toBe(4);

      // Get the associated row identifiers for the correct options
      const correctRowIds = Array.from(allCorrectElements).map(el => el.name);

      // Get the values of the correct inputs (which contain the row and column IDs)
      const correctValues = Array.from(allCorrectElements).map(el => el.value);

      // Parse the values to extract row IDs
      const rowIds = correctValues.map(value => value.split(' ')[0]);

      // Verify the correct row IDs exist
      const expectedRowIds = ['C', 'P', 'L', 'D'];
      const allExist = rowIds.every(rowId => expectedRowIds.includes(rowId));
      expect(allExist).toBe(true);
    });
  }
};

export const SelectPoint: Story = {
  args: {
    'item-url': '/qti-test-package/items/select_point.xml' // Set the new item URL here
  },
  render: args =>
    html`<qti-item>
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowTitle('Where is Edinburgh?');

    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-select-point-interaction');

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctIndication = interaction.shadowRoot.querySelector('[alt="correct-response-1"]');
      expect(correctIndication).not.toBeNull();
    });
  }
};

export const SelectPointMultipleNoAreaMapping: Story = {
  args: {
    'item-url': '/qti-item/example-select-point.xml' // Set the new item URL here
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choices to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowTitle('example-select-point');
    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-select-point-interaction');

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctIndication1 = interaction.shadowRoot.querySelector('[alt="correct-response-1"]');
      const correctIndication2 = interaction.shadowRoot.querySelector('[alt="correct-response-2"]');
      const correctIndication3 = interaction.shadowRoot.querySelector('[alt="correct-response-3"]');
      expect(correctIndication1).not.toBeNull();
      expect(correctIndication2).not.toBeNull();
      expect(correctIndication3).not.toBeNull();
    });
  }
};

export const GraphicOrder: Story = {
  args: {
    'item-url': '/qti-item/example-graphic-order.xml' // Set the new item URL here
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choices to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowTitle('Item 2');
    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-graphic-order-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const hotspotChoice = interaction.querySelectorAll('qti-hotspot-choice');
      // const get after content
      expect(window.getComputedStyle(hotspotChoice[0], ':after').content).toBe('"C=1"');
      expect(window.getComputedStyle(hotspotChoice[1], ':after').content).toBe('"C=4"');
      expect(window.getComputedStyle(hotspotChoice[2], ':after').content).toBe('"C=2"');
      expect(window.getComputedStyle(hotspotChoice[3], ':after').content).toBe('"C=3"');
    });
  }
};

export const InlineChoice: Story = {
  args: {
    'item-url': '/qti-item/example-inline-choice.xml' // Set the new item URL here
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = await canvas.findByShadowTitle('Richard III (Take 2)');
    const interaction = assessmentItem.querySelector('qti-inline-choice-interaction');

    const showCorrectButton = await canvas.findByShadowText(`Show correct response`);
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctResponse = interaction.shadowRoot.querySelector<HTMLSpanElement>('[part="correct-option"]'); //.findByShadowLabelText('correct-response');
      expect(correctResponse).not.toBeNull();
      expect(correctResponse.innerText).toBe('York');
    });
  }
};

export const GraphicAssociate: Story = {
  args: {
    'item-url': '/qti-test-package/items/graphic_associate.xml' // Set the new item URL here
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
                border: 2px solid blue;
                transform: scale(0.7);
                transform-origin: top left;
              }
            </style>
          </template>
        </item-container>
        <item-show-correct-response></item-show-correct-response>
        <!-- <print-item-variables></print-item-variables> -->
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choices to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowTitle('Low-cost Flying');

    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-graphic-associate-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const lines =
        interaction.shadowRoot.querySelector('line-container').querySelectorAll(`[part='correct-line']`).length === 2;
      expect(lines).toBe(true);
    });
  }
};

export const Slider: Story = {
  args: {
    'item-url': '/qti-item/example-slider.xml' // Set the new item URL here
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choices to be rendered
    const canvas = within(canvasElement);
    await canvas.findByShadowTitle('Slider Interaction – Water');

    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-slider-interaction');

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctIndication = interaction.shadowRoot.querySelectorAll('[id="knob-correct"]');
      expect(correctIndication.length).toBe(1);
    });
  }
};

export const MultipleInteractions: Story = {
  args: {
    'item-url': '/qti-item/example-multiple-interactions.xml' // Set the new item URL here
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

      <item-show-correct-response ${spread(args)}></item-show-correct-response>
      <!-- </div> -->
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // // wait for qti-simple-choice to be rendered
    const canvas = within(canvasElement);

    const interactions = await waitFor(() => {
      const itemContainer = canvasElement.querySelector('item-container');
      if (!itemContainer) {
        throw new Error('Item container not found');
      }
      if (!itemContainer.shadowRoot) {
        throw new Error('Shadow root not found');
      }
      if (!itemContainer.shadowRoot.querySelector('qti-inline-choice-interaction')) {
        throw new Error('qti-inline-choice-interaction not found');
      }
      return itemContainer.shadowRoot.querySelectorAll('qti-inline-choice-interaction');
    });
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
    });

    await step('Verify correct response state is applied', async () => {
      for (const interaction of interactions) {
        const feedback = interaction.shadowRoot.querySelector('[part="correct-option"]');
        expect(feedback).not.toBeNull();
      }
    });
  }
};
