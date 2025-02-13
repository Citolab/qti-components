import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect, waitFor } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components';
import type { ItemShowCorrectResponse } from './item-show-correct-response';
import './item-show-correct-response';
import type { ItemContainer } from './item-container';
import type { QtiSimpleChoice } from '../../../qti-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('test-print-item-variables');

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
      <item-container style="width: 400px; height: 350px; display: block;" item-url=${args['item-url']}>
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
      <item-container style="width: 400px; height: 350px; display: block;" item-url=${args['item-url']}>
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
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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

export const GapMatch: Story = {
  args: {
    'item-url': '/qti-test-package/items/gap_match.xml' // Set the new item URL here
  },
  render: args =>
    html` <qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    // const choiceA: QtiSimpleChoice = await canvas.findByShadowText('This is correct.');
    // const choiceB: QtiSimpleChoice = await canvas.findByShadowText('This is also correct.');
    // const choiceC: QtiSimpleChoice = await canvas.findByShadowText('This is wrong.');
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-gap-match-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    const interaction = canvasElement
      .querySelector('item-container')
      .shadowRoot.querySelector('qti-gap-match-interaction');
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

export const SelectPoint: Story = {
  args: {
    'item-url': '/qti-test-package/items/select_point.xml' // Set the new item URL here
  },
  render: args =>
    html`<qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-select-point-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );

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
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-select-point-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    const itemContainer = canvasElement.querySelector('item-container');
    const interaction = itemContainer.shadowRoot.querySelector('qti-select-point-interaction');
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
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-graphic-order-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    const itemContainer = canvasElement.querySelector('item-container');
    const interaction = itemContainer.shadowRoot.querySelector('qti-graphic-order-interaction');
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

export const GraphicAssociate: Story = {
  args: {
    'item-url': '/qti-test-package/items/graphic_associate.xml' // Set the new item URL here
  },
  render: args =>
    html` <qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-graphic-associate-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    const itemContainer = canvasElement.querySelector('item-container');
    const interaction = itemContainer.shadowRoot.querySelector('qti-graphic-associate-interaction');
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
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url']}>
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
    await waitFor(
      () => {
        const interaction = canvasElement
          .querySelector('item-container')
          .shadowRoot.querySelector('qti-slider-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
      },
      { timeout: 5000 }
    );
    const itemContainer = canvasElement.querySelector('item-container');
    const interaction = itemContainer.shadowRoot.querySelector('qti-slider-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctIndication = interaction.shadowRoot.querySelectorAll('[id="knob-correct"]');
      expect(correctIndication.length).toBe(1);
    });
  }
};
