import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiMatchInteraction } from '../qti-match-interaction';

type Story = StoryObj<QtiMatchInteraction>;

/**
 * ## Form Association Stories
 *
 * The match interaction inside a plain `<form>`: its response reaches `FormData` under its `name`,
 * `form.reset()` empties it, and `min-associations` / `max-associations` take part in the form's
 * validation. Too many shows at once; too few waits for a submit, and from then on every change
 * reports.
 *
 * Chips are placed the way the mixin ends a drag, `handleDrop` and then `saveResponse`: the pointer
 * handlers only accept trusted events, which a story cannot dispatch.
 */
const meta: Meta<QtiMatchInteraction> = {
  component: 'qti-match-interaction',
  title: 'Interactions/Match/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minAssociations: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-match-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-associations=${attributes.minAssociations}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
      </qti-simple-match-set>
      <qti-simple-match-set>
        <qti-simple-associable-choice identifier="M" match-max="3">A Midsummer-Nights</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="R" match-max="3">Romeo and Juliet</qti-simple-associable-choice>
        <qti-simple-associable-choice identifier="T" match-max="3">The Tempest</qti-simple-associable-choice>
      </qti-simple-match-set>
    </qti-match-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiMatchInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  /** What the end of a drag does: drop, then publish the response. */
  const drop = async (source: string, target: string) => {
    // A placed chip is a copy of its source; the source in the first set comes first.
    const chip = canvas.getAllByText(source)[0];
    const targetChoice = canvas.getByText(target);
    // The drag itself would refuse a target `allowDrop` turns down; this drop is one a candidate can make.
    expect(interaction.allowDrop(chip, targetChoice)).toBe(true);
    interaction.handleDrop(chip, targetChoice);
    interaction.saveResponse();
    await settle(interaction);
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, drop, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 3 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, drop } = await getElements(canvasElement);

    await drop('Capulet', 'Romeo and Juliet');
    await drop('Prospero', 'The Tempest');
    expect(new FormData(form).get('RESPONSE')).toBe('["C R","P T"]');

    form.reset();
    await settle(interaction);
    expect(new FormData(form).get('RESPONSE')).toBe('[]');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TooFewWaitsForSubmit: Story = {
  name: 'Validation - too few shows only after a submit',
  render: () => formTemplate({ minAssociations: 2, maxAssociations: 3 }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, drop, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await drop('Capulet', 'Romeo and Juliet');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await drop('Prospero', 'The Tempest');
      expect(messageShown()).toBe(false);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await settle(interaction);
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe('[]');

      await drop('Demetrius', 'A Midsummer-Nights');
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 1 }),
  play: async ({ canvasElement }) => {
    const { interaction, drop, messageShown } = await getElements(canvasElement);

    await drop('Capulet', 'Romeo and Juliet');
    expect(messageShown()).toBe(false);

    await drop('Prospero', 'The Tempest');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
