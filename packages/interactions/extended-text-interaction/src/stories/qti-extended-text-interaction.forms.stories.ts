import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiExtendedTextInteraction } from '../qti-extended-text-interaction';

type Story = StoryObj<QtiExtendedTextInteraction>;

/**
 * ## Form Association Stories
 *
 * The extended text interaction inside a plain `<form>`: its response reaches `FormData` under its
 * `name`, `form.reset()` empties it, and `min-strings` takes part in the form's validation: an
 * empty field blocks a submit and shows the message then, not before.
 */
const meta: Meta<QtiExtendedTextInteraction> = {
  component: 'qti-extended-text-interaction',
  title: 'Interactions/Extended Text/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minStrings: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-extended-text-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-strings=${attributes.minStrings}
      data-testid="interaction"
    ></qti-extended-text-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiExtendedTextInteraction>('interaction');
  await interaction.updateComplete;

  const textarea = within(interaction).getByShadowRole<HTMLTextAreaElement>('textbox');
  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  const type = async (value: string) => {
    textarea.value = value;
    await fireEvent.keyUp(textarea, { target: { value } });
    await interaction.updateComplete;
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, type, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ minStrings: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, type } = await getElements(canvasElement);

    await type('An essay, with a comma.');
    expect(new FormData(form).get('RESPONSE')).toBe('An essay, with a comma.');

    form.reset();
    await interaction.updateComplete;
    expect(new FormData(form).get('RESPONSE')).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const EmptyWaitsForSubmit: Story = {
  name: 'Validation - an empty field shows only after a submit',
  render: () => formTemplate({ minStrings: 1 }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, type, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change that empties the field shows no message', async () => {
      await type('draft');
      await type('');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('typing clears it, without leaving the field', async () => {
      await type('An answer');
      expect(interaction.internals.validity.valid).toBe(true);
      expect(messageShown()).toBe(false);
    });

    await step('emptying the field brings it back without a new submit', async () => {
      await type('');
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await type('draft');
      await type('');
      expect(messageShown()).toBe(false);
    });
  }
};
