import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from '../qti-order-interaction';

type Story = StoryObj<QtiOrderInteraction>;

/**
 * ## Form Association Stories
 *
 * The order interaction inside a plain `<form>`: its response reaches `FormData` under its `name`,
 * `form.reset()` empties it, and its bounds take part in the form's validation. Too many shows at
 * once; too few waits for a submit, and from then on every change reports.
 *
 * The bounds are `min-associations` / `max-associations`, the vocabulary the drag-drop mixin reads;
 * the QTI spelling `min-choices` / `max-choices` is not implemented on this interaction.
 *
 * Chips are placed the way the mixin ends a drag, `handleDrop` and then `saveResponse`: the pointer
 * handlers only accept trusted events, which a story cannot dispatch.
 */
const meta: Meta<QtiOrderInteraction> = {
  component: 'qti-order-interaction',
  title: 'Interactions/Order/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minAssociations: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-order-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      orientation="horizontal"
      min-associations=${attributes.minAssociations}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiOrderInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  const drops = within(interaction).getAllByShadowRole('region');
  /** What the end of a drag does: drop, then publish the response. */
  const drop = async (text: string, index: number) => {
    const chip = canvas.getByText(text);
    // The drag itself would refuse a target `allowDrop` turns down; this drop is one a candidate can make.
    expect(interaction.allowDrop(chip, drops[index])).toBe(true);
    interaction.handleDrop(chip, drops[index]);
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
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 0 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, drop } = await getElements(canvasElement);

    await drop('Choice B', 0);
    await drop('Choice A', 1);
    expect(new FormData(form).get('RESPONSE')).toBe('["B","A",""]');

    form.reset();
    await settle(interaction);
    expect(new FormData(form).get('RESPONSE')).toBe('["","",""]');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export const TooFewWaitsForSubmit: Story = {
  name: 'Validation - too few shows only after a submit',
  render: () => formTemplate({ minAssociations: 2, maxAssociations: 0 }),
  play: async ({ canvasElement, step }) => {
    const { form, interaction, drop, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await drop('Choice A', 0);
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await drop('Choice B', 1);
      expect(messageShown()).toBe(false);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await settle(interaction);
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe('["","",""]');

      // Into a target that held a chip before the reset: the reset frees it.
      await drop('Choice A', 1);
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 1 }),
  play: async ({ canvasElement }) => {
    const { interaction, drop, messageShown } = await getElements(canvasElement);

    await drop('Choice A', 0);
    expect(messageShown()).toBe(false);

    await drop('Choice B', 1);
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
