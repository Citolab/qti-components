import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { openListboxMenu } from './qti-inline-choice-interaction.helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';

type Story = StoryObj<QtiInlineChoiceInteraction>;

/**
 * ## Form Association Stories
 *
 * The inline choice interaction inside a plain `<form>`: the chosen identifier reaches `FormData`
 * under its `name`, `form.reset()` takes the answer back and empties it, and `required` takes part in the form's validation. An unanswered dropdown waits for a submit, and
 * from then on every change reports.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: 'Interactions/Inline Choice/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { required: boolean }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <p>
      The Wars of the Roses were fought between the houses of
      <qti-inline-choice-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        required=${attributes.required ? 'true' : 'false'}
        data-testid="interaction"
      >
        <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
        <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        <qti-inline-choice identifier="Y">York</qti-inline-choice>
      </qti-inline-choice-interaction>
      and York.
    </p>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiInlineChoiceInteraction>('interaction');
  await interaction.updateComplete;

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  /** Open the menu and pick a choice. */
  const choose = async (text: string) => {
    await openListboxMenu(interaction);
    await fireEvent.click(canvas.getByText(text));
    await interaction.updateComplete;
  };
  /** Open the menu and pick the prompt row, which takes the answer back. */
  const clear = async () => {
    await openListboxMenu(interaction);
    await fireEvent.click(within(interaction).getByShadowRole('option', { name: 'select' }));
    await interaction.updateComplete;
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, choose, clear, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const Reset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ required: false }),
  play: async ({ canvasElement }) => {
    const { form, interaction, choose } = await getElements(canvasElement);

    await choose('Lancaster');
    expect(interaction.response).toBe('L');
    expect(new FormData(form).get('RESPONSE')).toBe('L');

    form.reset();
    await interaction.updateComplete;
    expect(interaction.response).toBe(null);
    expect(new FormData(form).get('RESPONSE')).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const UnansweredWaitsForSubmit: Story = {
  name: 'Validation - unanswered shows only after a submit',
  render: () => formTemplate({ required: true }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, choose, clear, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change that takes the answer back shows no message', async () => {
      await choose('Lancaster');
      await clear();
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('answering clears it', async () => {
      await choose('York');
      expect(messageShown()).toBe(false);
    });

    await step('taking the answer back brings it back without a new submit', async () => {
      await clear();
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(interaction.response).toBe(null);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await choose('Lancaster');
      await clear();
      expect(messageShown()).toBe(false);
    });
  }
};
