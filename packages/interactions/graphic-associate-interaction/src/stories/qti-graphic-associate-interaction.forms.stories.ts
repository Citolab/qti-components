import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGraphicAssociateInteraction } from '../qti-graphic-associate-interaction';

type Story = StoryObj<QtiGraphicAssociateInteraction>;

/**
 * ## Form Association Stories
 *
 * The graphic associate interaction inside a plain `<form>`: its response, the drawn lines as a JSON
 * array of `"A B"` pairs, reaches `FormData` under its `name`, `form.reset()` empties it, and
 * `min-associations` takes part in the form's validation: too few blocks a submit and shows the
 * message then, not before. From then on every change reports. Going over `max-associations` is
 * not something a candidate can do: a line past the maximum is not drawn.
 */
const meta: Meta<QtiGraphicAssociateInteraction> = {
  component: 'qti-graphic-associate-interaction',
  title: 'Interactions/Graphic Associate/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** A 400x120 graphic with three marked places, as an SVG data URL so the story needs no asset file. */
const GRAPHIC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">` +
    `<rect width="400" height="120" fill="#eef"/>` +
    [70, 200, 330].map(x => `<circle cx="${x}" cy="60" r="12" fill="#fff" stroke="#888"/>`).join('') +
    `</svg>`
)}`;

const formTemplate = (attributes: { minAssociations?: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-graphic-associate-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-associations=${attributes.minAssociations ?? 0}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <img alt="three places" src=${GRAPHIC} width="400" height="120" />
      <qti-associable-hotspot
        identifier="A"
        shape="circle"
        coords="70,60,12"
        match-max="2"
        aria-label="West"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        identifier="B"
        shape="circle"
        coords="200,60,12"
        match-max="2"
        aria-label="Middle"
      ></qti-associable-hotspot>
      <qti-associable-hotspot
        identifier="C"
        shape="circle"
        coords="330,60,12"
        match-max="2"
        aria-label="East"
      ></qti-associable-hotspot>
    </qti-graphic-associate-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiGraphicAssociateInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiGraphicAssociateInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  /** Draw a line as a pointer does: move onto the start hotspot and click it, then click the end hotspot. */
  const connect = async (from: string, to: string) => {
    const start = canvas.getByLabelText(from);
    // The in-progress line follows the pointer, so a pointer arrives before the first click.
    const { left, top } = start.getBoundingClientRect();
    await fireEvent.mouseMove(start, { clientX: left, clientY: top });
    await fireEvent.click(start);
    await fireEvent.click(canvas.getByLabelText(to));
    await interaction.updateComplete;
  };
  /** Click the first drawn line, which takes it away. */
  const removeFirstLine = async () => {
    // Each line has a remove control: a button named after the pair it removes.
    const [remove] = within(interaction).getAllByShadowRole('button', { name: /^Remove line/ });
    await fireEvent.click(remove);
    await interaction.updateComplete;
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, connect, removeFirstLine, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ maxAssociations: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, connect } = await getElements(canvasElement);

    await connect('West', 'Middle');
    await connect('Middle', 'East');
    expect(new FormData(form).get('RESPONSE')).toBe(JSON.stringify(['A B', 'B C']));

    form.reset();
    await interaction.updateComplete;
    expect(new FormData(form).get('RESPONSE')).toBe(null);
  }
};

export const StopsAtMaximum: Story = {
  name: 'FormData - a line past max-associations is not drawn',
  render: () => formTemplate({ maxAssociations: 1 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, connect } = await getElements(canvasElement);

    await connect('West', 'Middle');
    await connect('Middle', 'East');
    expect(new FormData(form).get('RESPONSE')).toBe(JSON.stringify(['A B']));
    expect(interaction.internals.validity.valid).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TooFewWaitsForSubmit: Story = {
  name: 'Validation - too few shows only after a submit',
  render: () => formTemplate({ minAssociations: 2, maxAssociations: 0 }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, connect, removeFirstLine, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await connect('West', 'Middle');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await connect('Middle', 'East');
      expect(interaction.internals.validity.valid).toBe(true);
      expect(messageShown()).toBe(false);
    });

    await step('going below the minimum brings it back without a new submit', async () => {
      await removeFirstLine();
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await connect('West', 'Middle');
      expect(messageShown()).toBe(false);
    });
  }
};
