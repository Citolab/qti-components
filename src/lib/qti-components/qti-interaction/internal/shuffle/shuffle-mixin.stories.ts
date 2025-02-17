import { html } from 'lit';
import { expect, waitFor } from '@storybook/test';
import { within } from 'shadow-dom-testing-library';

import { toBePositionedRelativeTo } from '../../../../../../test/setup/toBePositionedRelativeTo';

import type { QtiSimpleChoice } from '../../qti-simple-choice';
import type { StoryObj, Meta } from '@storybook/web-components';
import type { ShuffleMixin } from './shuffle-mixin';

// type Story = StoryObj<typeof args>;

const meta: Meta<typeof ShuffleMixin> = {
  component: 'shuffle-mixin',
  title: 'Stories/shuffle'
};
export default meta;

export const Choice: StoryObj = {
  render: () =>
    html` <qti-choice-interaction shuffle="true">
      <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
      <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
      <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
    </qti-choice-interaction>`,
  play: async ({ canvasElement, step }) => {
    // const interaction = await waitFor(
    //   () => {
    //     const interaction = canvasElement.querySelector('qti-choice-interaction');
    //     if (!interaction) {
    //       throw new Error('interaction not loaded yet');
    //     }
    //     return interaction;
    //   },
    //   { timeout: 5000 }
    // );
    await step('Verify options are shuffled', async () => {
      const canvas = within(canvasElement);
      const ChoiceA = canvas.getByText<QtiSimpleChoice>('Optie A');
      const ChoiceB = canvas.getByText<QtiSimpleChoice>('Optie B');
      const ChoiceC = canvas.getByText<QtiSimpleChoice>('Optie C');
      const bUnderA = toBePositionedRelativeTo(ChoiceA, ChoiceB, 'below');
      const cUnderb = toBePositionedRelativeTo(ChoiceB, ChoiceC, 'below');
      expect(bUnderA.pass && cUnderb.pass).toBe(false);
    });
  }
};

export const InlineChoice: StoryObj = {
  render: () =>
    html` <qti-inline-choice-interaction data-testid="inline-choice" shuffle="true">
      <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
      <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
      <qti-inline-choice identifier="Y">York</qti-inline-choice>
    </qti-inline-choice-interaction>`,
  play: async ({ canvasElement, step }) => {
    const interaction = await waitFor(
      () => {
        const interaction = canvasElement.querySelector('qti-inline-choice-interaction');
        if (!interaction) {
          throw new Error('interaction not loaded yet');
        }
        return interaction;
      },
      { timeout: 5000 }
    );
    await step('Verify options are shuffled', async () => {
      const originalOrder = ['Gloucester', 'Lancaster', 'York'];
      const renderedOptions = (Array.from(interaction.shadowRoot.querySelectorAll('option')) as HTMLOptionElement[])
        .filter(option => option.textContent !== 'select')
        .map(option => option.textContent);

      expect(renderedOptions.join('&')).not.toBe(originalOrder.join('&'));
    });
  }
};

export const MatchInteraction: StoryObj = {
  render: () =>
    html`<qti-match-interaction shuffle="true" response-identifier="RESPONSE" max-associations="4">
      <qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-simple-match-set>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="M" match-max="4"
          >A Midsummer-Night's Dream</qti-simple-associable-choice
        >
        <qti-simple-associable-choice identifier="R" match-max="4">Romeo and Juliet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="T" match-max="4">The Tempest</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>`
  //   play: async ({ canvasElement, step }) => {
  //     // const interaction = await waitFor(
  //     //     () => {
  //     //         const interaction = canvasElement.querySelector('qti-inline-choice-interaction');
  //     //         if (!interaction) {
  //     //             throw new Error('interaction not loaded yet');
  //     //         }
  //     //         return interaction;
  //     //     },
  //     //     { timeout: 5000 }
  //     // );
  //     // await step('Verify options are shuffled', async () => {
  //     //     const originalOrder = ['Gloucester', 'Lancaster', 'York'];
  //     //     const renderedOptions = (Array.from(interaction.shadowRoot.querySelectorAll('option')) as HTMLOptionElement[])
  //     //         .filter(option => option.textContent !== 'select')
  //     //         .map(option => option.textContent);
  //     //     expect(renderedOptions.join('&')).not.toBe(originalOrder.join('&'));
  //     // });
  //   }
};
