import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSelectPointInteraction } from '../qti-select-point-interaction';

type Story = StoryObj<QtiSelectPointInteraction>;

/**
 * ## Form Association Stories
 *
 * The select point interaction inside a plain `<form>`: its response, the points as `"x y"` pairs
 * joined by commas as in its `response` attribute, reaches `FormData` under its `name`,
 * `form.reset()` empties it, and `min-choices` takes part in the form's validation: too few blocks
 * a submit and shows the message then, not before. From then on every change reports.
 */
const meta: Meta<QtiSelectPointInteraction> = {
  component: 'qti-select-point-interaction',
  title: 'Interactions/Select Point/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** A 400x120 graphic, as an SVG data URL so the story needs no asset file. */
const GRAPHIC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">` +
    `<rect width="400" height="120" fill="#eef"/>` +
    `</svg>`
)}`;

const formTemplate = (attributes: { minChoices?: number; maxChoices: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-select-point-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-choices=${attributes.minChoices ?? 0}
      max-choices=${attributes.maxChoices}
      data-testid="interaction"
    >
      <img alt="a field to place points on" src=${GRAPHIC} width="400" height="120" />
    </qti-select-point-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiSelectPointInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiSelectPointInteraction>('interaction');
  const image = canvas.getByRole<HTMLImageElement>('img', { name: 'a field to place points on' });
  await image.decode();
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  /** Click the picture at a fraction of its rendered size, as the handler on the <img> reads it. */
  const place = async (fx: number, fy: number) => {
    const rect = image.getBoundingClientRect();
    image.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width * fx,
        clientY: rect.top + rect.height * fy
      })
    );
    await interaction.updateComplete;
  };
  /** Click the first point marker, which takes that point away. */
  const removeFirst = async () => {
    await fireEvent.click(within(interaction).getAllByShadowRole('button', { name: /^Remove point at/ })[0]);
    await interaction.updateComplete;
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, place, removeFirst, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ maxChoices: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, place } = await getElements(canvasElement);

    await place(0.25, 0.5);
    await place(0.75, 0.5);
    const value = new FormData(form).get('RESPONSE');
    expect(value).toMatch(/^\d+ \d+,\d+ \d+$/);
    expect(value).toBe(interaction.response?.join(','));

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
    const { form, interaction, place, removeFirst, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await place(0.25, 0.5);
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await place(0.75, 0.5);
      expect(interaction.internals.validity.valid).toBe(true);
      expect(messageShown()).toBe(false);
    });

    await step('going below the minimum brings it back without a new submit', async () => {
      await removeFirst();
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await place(0.25, 0.5);
      expect(messageShown()).toBe(false);
    });
  }
};
