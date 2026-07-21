import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import '@qti-components/qti-corrections';

import { correctionCanvas, withCorrectionRegistry } from '../../stories/with-correction-registry.decorator';
import { getAssessmentItemFromItemContainer } from '../../../../../tools/testing/test-utils';
import drag from '../../../../../tools/testing/drag';

import type { QtiSimpleChoice, QtiGapMatchInteraction } from '@qti-components/interactions';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { ItemShowCorrectResponse } from './item-show-correct-response';
import './item-show-correct-response';
import '../item-correct-response-mode/item-correct-response-mode';
import type { ItemContainer } from '@qti-components/item/elements';
import type { CorrectionConfig } from '../../context/correction-config';

const { events, args, argTypes } = getStorybookHelpers('test-print-item-variables');

type Story = StoryObj<ItemShowCorrectResponse & typeof args>;

const meta: Meta<typeof ItemContainer & { 'item-url': string }> = {
  component: 'item-container',
  decorators: [withCorrectionRegistry],
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
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: start">
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

        <item-correct-response-mode></item-correct-response-mode>
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`;
  },

  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choice to be rendered
    const canvas = within(correctionCanvas(canvasElement));
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

      <item-show-correct-response ${spread(args)}></item-show-correct-response>
      <!-- </div> -->
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // // wait for qti-simple-choice to be rendered
    const canvas = within(correctionCanvas(canvasElement));
    await canvas.findByShadowText('You must stay with your luggage at all times.', {}, { timeout: 10000 });
    const _ = canvas.getAllByShadowText(/No correct response specified/i)[0];
    const itemShowCorrect = correctionCanvas(canvasElement).querySelector('item-show-correct-response');
    await step('Verify the Show Correct button is disabled', async () => {
      expect(itemShowCorrect.disabled).toBe(true);
    });
  }
};

export const ChoiceInternalCorrectResponse: Story = {
  render: args => {
    return html`<qti-item>
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: start">
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
      </div>
    </qti-item>`;
  },

  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'internal'
    };
    // wait for qti-simple-choice to be rendered
    const canvas = within(correctionCanvas(canvasElement));
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
    });
  }
};

export const ChoiceFullCorrectResponse: Story = {
  render: args => {
    return html`<qti-item>
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: start">
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
      </div>
    </qti-item>`;
  },

  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'full',
      fullCorrectResponseOnlyWhenIncorrect: false
    };
    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('You must stay with your luggage at all times.');
    await step('Click on the Show Correct button', async () => {
      await choiceA.click();
      await fireEvent.click(showCorrectButton);

      await step('Verify correct response state is applied', async () => {
        const fullCorrectResponse = await canvas.findByShadowRole('full-correct-response');
        expect(fullCorrectResponse).toBeVisible();

        const interaction = fullCorrectResponse.querySelector('qti-choice-interaction');
        const choices = Array.from(interaction.querySelectorAll('qti-simple-choice'));

        await interaction.updateComplete;

        expect(choices[0].internals.states.has('checked')).toBe(true);
        expect(choices[1].internals.states.has('checked')).toBe(false);
        expect(choices[2].internals.states.has('checked')).toBe(false);
      });
    });
  }
};

export const ChoiceFullCorrectResponseOnlyWhenIncorrect: Story = {
  render: args => {
    return html`<qti-item>
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: start">
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
      </div>
    </qti-item>`;
  },

  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'full',
      fullCorrectResponseOnlyWhenIncorrect: true
    };
    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('You must stay with your luggage at all times.');
    await step('Click on the Show Correct button', async () => {
      await choiceA.click();
      await fireEvent.click(showCorrectButton);

      await step('Verify correct full correct response is not visible', async () => {
        const fullCorrectResponse = await canvas.queryByShadowRole('full-correct-response');
        expect(fullCorrectResponse).toBeNull();
      });
    });
  }
};

export const MultipleResponseInternalCorrectResponse: Story = {
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

        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'internal'
    };
    // wait for qti-simple-choice to be rendered
    const canvas = within(correctionCanvas(canvasElement));
    // const choices = await canvas.findAllByShadowRole('radio');
    const choiceA: QtiSimpleChoice = await canvas.findByShadowText('This is correct.');
    const choiceB: QtiSimpleChoice = await canvas.findByShadowText('This is also correct.');
    const choiceC: QtiSimpleChoice = await canvas.findByShadowText('This is wrong.');
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);
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

export const MultipleResponseFullCorrectResponse: Story = {
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
        <item-show-correct-response ${spread(args)}></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'full'
    };
    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);

    await step('Select the correct response mode full', async () => {
      await fireEvent.click(showCorrectButton);

      await step('Verify correct response full state is applied', async () => {
        const fullCorrectResponse = await canvas.findByShadowRole('full-correct-response');
        expect(fullCorrectResponse).toBeVisible();

        const interaction = fullCorrectResponse.querySelector('qti-choice-interaction');
        const choices = Array.from(interaction.querySelectorAll('qti-simple-choice'));

        await interaction.updateComplete;

        expect(choices[0].internals.states.has('checked')).toBe(true);
        expect(choices[1].internals.states.has('checked')).toBe(true);
        expect(choices[2].internals.states.has('checked')).toBe(false);
      });
    });
  }
};

export const TextEntryInternalCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/text_entry.xml' // Set the new item URL here
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
    const test = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    test.configContext = {
      correctResponseMode: 'internal'
    };
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-text-entry-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const fullCR = interaction.nextElementSibling;
      expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
      expect(fullCR?.querySelector('qti-text-entry-interaction')).toBeTruthy();
    });
  }
};

export const TextEntryFullCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/text_entry.xml' // Set the new item URL here
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
    const test = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    test.configContext = {
      correctResponseMode: 'full'
    };
    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);
    await step('Select the correct response mode full', async () => {
      await fireEvent.click(showCorrectButton);

      await step('Verify correct response full state is applied', async () => {
        const fullCorrectResponse = await canvas.findByShadowRole('full-correct-response');
        expect(fullCorrectResponse).toBeVisible();
      });
    });
  }
};

export const GapMatch: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/gap_match.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const interaction = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));

    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const gapMatchInteraction = interaction.querySelector('qti-gap-match-interaction');
      const fullCR = gapMatchInteraction?.nextElementSibling;
      expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
      expect(fullCR?.querySelector('qti-gap-match-interaction')).toBeTruthy();
    });
  }
};

export const Match: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/match.xml' // Set the new item URL here
    // 'item-url': 'api/kennisnet/ITEM002.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));

    const interaction = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const matchInteraction = interaction.querySelector('qti-match-interaction');
      const fullCR = matchInteraction?.nextElementSibling;
      expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
      expect(fullCR?.querySelector('qti-match-interaction')).toBeTruthy();
    });
  }
};

export const MatchFullCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/match.xml' // Set the new item URL here
    // 'item-url': 'api/kennisnet/ITEM002.xml' // Set the new item URL here
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
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'full'
    };

    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);

    await step('Click on the Show Correct button', async () => {
      await fireEvent.click(showCorrectButton);

      await step('Verify full correct response is shown', async () => {
        const fullCorrectResponse = await waitFor(() => canvas.getByShadowRole('full-correct-response'));
        expect(fullCorrectResponse).toBeVisible();
      });
    });
  }
};

export const MatchTabular: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/match-tabular.xml' // Set the new item URL here
    // 'item-url': 'api/kennisnet/ITEM002.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];
    const interaction = item.querySelector('qti-match-interaction');

    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const fullCR = interaction.nextElementSibling;
      expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
      expect(fullCR?.querySelector('qti-match-interaction')).toBeTruthy();
    });
  }
};

export const SelectPoint: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/select_point.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-select-point-interaction');

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
    'item-url': 'assets/qti-item/example-select-point.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-select-point-interaction');

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
    'item-url': 'assets/qti-item/example-graphic-order.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-graphic-order-interaction');
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-order-interaction');
    const showCorrectButton = canvas.getAllByShadowText(/Show correct/i)[0];

    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const fullCR = interaction.nextElementSibling;
      expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
      const cloneInteraction = fullCR?.querySelector('qti-order-interaction');
      expect(cloneInteraction).toBeTruthy();
    });
  }
};

export const InlineChoiceInternalCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-item/example-inline-choice.xml' // Set the new item URL here
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
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'internal'
    };
    const canvas = within(correctionCanvas(canvasElement));
    const itemAssessment = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = itemAssessment.querySelector('qti-inline-choice-interaction');

    const showCorrectButton = await canvas.findByShadowText(`Show correct response`);
    await step('Click on the Show Correct button', async () => {
      await showCorrectButton.click();
      const correctResponse = interaction.shadowRoot.querySelector<HTMLSpanElement>('[part="correct-option"]'); //.findByShadowLabelText('correct-response');
      expect(correctResponse).not.toBeNull();
      expect(correctResponse.innerText).toBe('York');
    });
  }
};

export const InlineChoiceFullCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-item/example-inline-choice.xml' // Zorg dat dit item een inline-choice bevat
  },
  render: args =>
    html`<qti-item>
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,

  play: async ({ canvasElement, step }) => {
    const item = correctionCanvas(canvasElement).querySelector('qti-item') as HTMLElement & {
      configContext: CorrectionConfig;
    };
    item.configContext = {
      correctResponseMode: 'full'
    };

    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);

    await step('Click on the Show Correct button', async () => {
      await fireEvent.click(showCorrectButton);

      await step('Verify full correct response is shown', async () => {
        const fullCorrectResponse = await waitFor(() => canvas.getByShadowRole('full-correct-response'));
        expect(fullCorrectResponse).toBeVisible();

        const interaction = fullCorrectResponse.querySelector('qti-inline-choice-interaction');
        expect(interaction).not.toBeNull();

        const root = interaction.shadowRoot;
        expect(root).not.toBeNull();

        const select = root.querySelector<HTMLSelectElement>('select[part="select"], select');
        if (select) {
          const selectedOption = Array.from(select.options).find(opt => opt.selected);
          expect(selectedOption).not.toBeUndefined();
          expect(selectedOption?.textContent?.trim()).toBe('York');
        } else {
          const displayedValue = root.querySelector('[part="value"]')?.textContent?.trim();
          expect(displayedValue).toBe('York');
        }
      });
    });
  }
};

export const GraphicAssociate: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/graphic_associate.xml' // Set the new item URL here
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
        <!-- <item-print-variables></item-print-variables> -->
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    // wait for qti-simple-choices to be rendered
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-graphic-associate-interaction');
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
    'item-url': 'assets/qti-item/example-slider.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));
    const item = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));
    const interaction = item.querySelector('qti-slider-interaction');

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
    'item-url': 'assets/qti-item/example-multiple-interactions.xml' // Set the new item URL here
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
    const canvas = within(correctionCanvas(canvasElement));

    const interactions = await waitFor(() => {
      const itemContainer = correctionCanvas(canvasElement).querySelector('item-container');
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

export const GapMatchCorrectResponse: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/gap_match.xml'
  },
  render: args =>
    html`<qti-item>
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
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,

  play: async ({ canvasElement, step }) => {
    const canvas = within(correctionCanvas(canvasElement));
    const showCorrectButton = await canvas.findByShadowText(/Show correct/i);
    const interaction = await getAssessmentItemFromItemContainer(correctionCanvas(canvasElement));

    const matchItem1 = (await canvas.findByShadowText('winter')) as QtiGapMatchInteraction;
    const matchItem2 = (await canvas.findByShadowText('spring')) as QtiGapMatchInteraction;

    const dropZones = interaction.querySelectorAll(`qti-gap`);

    const dropZone1 = dropZones[0];
    const dropZone2 = dropZones[1];

    await step('Drag and drop match interaction items', async () => {
      await drag(matchItem1, { to: dropZone1 });
      await drag(matchItem2, { to: dropZone2 });
      await showCorrectButton.click();

      await step('Verify correct response is shown', async () => {
        const gapMatchInteraction = interaction.querySelector('qti-gap-match-interaction');
        const fullCR = gapMatchInteraction?.nextElementSibling;
        expect(fullCR?.getAttribute('role')).toBe('full-correct-response');
        expect(fullCR?.querySelector('qti-gap-match-interaction')).toBeTruthy();
      });
    });
  }
};
