import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiHotspotInteraction } from '../qti-hotspot-interaction';

type Story = StoryObj<QtiHotspotInteraction>;

/**
 * ## Form Association Stories
 *
 * The hotspot interaction inside a plain `<form>`: its response reaches `FormData` under its `name`,
 * `form.reset()` empties it, and its `min-choices` / `max-choices` rules take part in the form's
 * validation. Too many shows at once; too few waits for a submit, and from then on every change
 * reports.
 */
const meta: Meta<QtiHotspotInteraction> = {
  component: 'qti-hotspot-interaction',
  title: 'Interactions/Hotspot/Forms',
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
    [70, 200, 330].map(x => `<circle cx="${x}" cy="60" r="30" fill="#fff" stroke="#888"/>`).join('') +
    `</svg>`
)}`;

const formTemplate = (attributes: { minChoices?: number; maxChoices: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-hotspot-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-choices=${attributes.minChoices ?? 0}
      max-choices=${attributes.maxChoices}
      data-testid="interaction"
    >
      <img alt="three places" src=${GRAPHIC} width="400" height="120" />
      <qti-hotspot-choice identifier="A" shape="circle" coords="70,60,30" aria-label="West"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="B" shape="circle" coords="200,60,30" aria-label="Middle"></qti-hotspot-choice>
      <qti-hotspot-choice identifier="C" shape="circle" coords="330,60,30" aria-label="East"></qti-hotspot-choice>
    </qti-hotspot-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiHotspotInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiHotspotInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  const click = async (name: string) => {
    // The checkbox role lives on ElementInternals, which testing-library's role query does not read.
    await fireEvent.click(canvas.getByLabelText(name));
    await interaction.updateComplete;
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, click, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ maxChoices: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, click } = await getElements(canvasElement);

    await click('West');
    await click('East');
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
    const { form, interaction, click, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await click('West');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await click('Middle');
      expect(messageShown()).toBe(false);
    });

    await step('losing it again brings it back without a new submit', async () => {
      await click('Middle');
      expect(messageShown()).toBe(true);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await interaction.updateComplete;
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe(null);

      await click('West');
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ maxChoices: 2 }),
  play: async ({ canvasElement }) => {
    const { interaction, click, messageShown } = await getElements(canvasElement);

    await click('West');
    await click('Middle');
    expect(messageShown()).toBe(false);

    await click('East');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
