import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiHottextInteraction } from '../qti-hottext-interaction';

type Story = StoryObj<QtiHottextInteraction>;

/**
 * ## Form Association Stories
 *
 * The hottext interaction inside a plain `<form>`: its response reaches `FormData` under its `name`,
 * `form.reset()` empties it, and its `min-choices` / `max-choices` rules take part in the form's
 * validation. Too many shows at once; too few waits for a submit, and from then on every change
 * reports.
 */
const meta: Meta<QtiHottextInteraction> = {
  component: 'qti-hottext-interaction',
  title: 'Interactions/Hottext/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minChoices?: number; maxChoices?: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-hottext-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-choices=${attributes.minChoices ?? 0}
      max-choices=${attributes.maxChoices ?? 0}
      data-testid="interaction"
    >
      <p>
        The <qti-hottext identifier="A">quick</qti-hottext> brown <qti-hottext identifier="B">fox</qti-hottext> jumps
        over the <qti-hottext identifier="C">lazy</qti-hottext> dog.
      </p>
    </qti-hottext-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiHottextInteraction>('interaction');
  const hottext = (text: string) => canvas.getByText(text);
  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  const click = async (text: string) => {
    await fireEvent.click(hottext(text));
    await interaction.updateComplete;
  };
  return { form, interaction, click, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ maxChoices: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, click } = getElements(canvasElement);

    await click('quick');
    await click('lazy');
    expect(new FormData(form).get('RESPONSE')).toBe('A,C');

    form.reset();
    await interaction.updateComplete;
    expect(new FormData(form).get('RESPONSE')).toBe(null);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TooFewWaitsForSubmit: Story = {
  name: 'Validation - too few shows only after a submit',
  render: () => formTemplate({ minChoices: 2, maxChoices: 0 }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, click, messageShown, onSubmit } = getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await click('quick');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await click('fox');
      expect(messageShown()).toBe(false);
    });

    await step('losing it again brings it back without a new submit', async () => {
      await click('fox');
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await click('quick');
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ maxChoices: 2 }),
  play: async ({ canvasElement }) => {
    const { interaction, click, messageShown } = getElements(canvasElement);

    await click('quick');
    await click('fox');
    expect(messageShown()).toBe(false);

    await click('lazy');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
