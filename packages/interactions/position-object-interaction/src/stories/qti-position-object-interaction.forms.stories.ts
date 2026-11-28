import { html } from 'lit';
import { expect, fn, userEvent } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import uk from '../fixtures/uk.png';
import airport from '../fixtures/airport.svg';

import type { QtiPositionObjectInteraction } from '../qti-position-object-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj<QtiPositionObjectInteraction>;

/**
 * ## Form Association Stories
 *
 * The position object interaction inside a plain `<form>`: its response, the points as `"x y"`
 * pairs joined by commas as in its `response` attribute, reaches `FormData` under its `name`,
 * `form.reset()` empties it, and `min-choices` takes part in the form's validation: too few blocks
 * a submit and shows the message then, not before. From then on every change reports.
 */
const meta: Meta<QtiPositionObjectInteraction> = {
  component: 'qti-position-object-interaction',
  title: 'Interactions/Position Object/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const STAGE_ALT = 'Map of the United Kingdom';

const formTemplate = (attributes: { minChoices?: number; maxChoices: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-position-object-stage>
      <img src=${uk} alt=${STAGE_ALT} width="206" height="280" />
      <qti-position-object-interaction
        name="RESPONSE"
        response-identifier="RESPONSE"
        min-choices=${attributes.minChoices ?? 0}
        max-choices=${attributes.maxChoices}
        data-testid="interaction"
      >
        <img src=${airport} alt="Airport" width="30" height="30" />
      </qti-position-object-interaction>
    </qti-position-object-stage>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiPositionObjectInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await interaction.updateComplete;
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiPositionObjectInteraction>('interaction');
  const stageImage = canvas.getByRole<HTMLImageElement>('img', { name: STAGE_ALT });
  await stageImage.decode();
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  const object = () => within(interaction).getByShadowRole('button', { name: 'Place Airport' });
  /** Click the object, then the stage at an offset from its top-left, in CSS pixels. */
  const place = async (x: number, y: number) => {
    const objectRect = object().getBoundingClientRect();
    const at = { x: objectRect.left + objectRect.width / 2, y: objectRect.top + objectRect.height / 2 };
    for (const type of ['pointerdown', 'pointerup']) {
      object().dispatchEvent(
        new PointerEvent(type, { bubbles: true, composed: true, button: 0, clientX: at.x, clientY: at.y })
      );
    }
    await interaction.updateComplete;
    const rect = stageImage.getBoundingClientRect();
    stageImage.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, clientX: rect.left + x, clientY: rect.top + y })
    );
    await settle(interaction);
  };
  /** Delete the first placed copy with the keyboard. */
  const removeFirst = async () => {
    within(interaction)
      .getAllByShadowRole('button', { name: /^Airport at / })[0]
      .focus();
    await userEvent.keyboard('{Delete}');
    await settle(interaction);
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

    await place(50, 60);
    await place(100, 200);
    expect(new FormData(form).get('RESPONSE')).toBe('50 60,100 200');
    expect(interaction.response).toEqual(['50 60', '100 200']);

    form.reset();
    await interaction.updateComplete;
    expect(new FormData(form).get('RESPONSE')).toBe(null);
    expect(interaction.response).toEqual([]);
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

    await step('a placement below the minimum shows no message', async () => {
      await place(50, 60);
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await place(100, 200);
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

      await place(50, 60);
      expect(messageShown()).toBe(false);
    });
  }
};
