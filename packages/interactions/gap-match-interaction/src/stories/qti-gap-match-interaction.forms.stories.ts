import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGapMatchInteraction } from '../qti-gap-match-interaction';

type Story = StoryObj<QtiGapMatchInteraction>;

/**
 * ## Form Association Stories
 *
 * The gap match interaction inside a plain `<form>`: its response reaches `FormData` under its
 * `name`, `form.reset()` empties it, and `min-associations` / `max-associations` take part in the
 * form's validation. Too many shows at once; too few waits for a submit, and from then on every
 * change reports.
 *
 * Chips are placed the way the mixin ends a drag, `handleDrop` and then `saveResponse`: the pointer
 * handlers only accept trusted events, which a story cannot dispatch.
 */
const meta: Meta<QtiGapMatchInteraction> = {
  component: 'qti-gap-match-interaction',
  title: 'Interactions/Gap Match/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minAssociations: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-gap-match-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-associations=${attributes.minAssociations}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
      <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
      <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
      <p>
        First <qti-gap identifier="G1"></qti-gap>, then <qti-gap identifier="G2"></qti-gap>, then
        <qti-gap identifier="G3"></qti-gap>.
      </p>
    </qti-gap-match-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiGapMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiGapMatchInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  // A gap is an empty inline box: it has no role, name or text to query it by.
  const gap = (identifier: string) => interaction.querySelector(`qti-gap[identifier="${identifier}"]`) as HTMLElement;
  /** What the end of a drag does: drop, then publish the response. */
  const drop = async (text: string, target: string) => {
    const chip = canvas.getByText(text);
    // The drag itself would refuse a target `allowDrop` turns down; this drop is one a candidate can make.
    expect(interaction.allowDrop(chip, gap(target))).toBe(true);
    interaction.handleDrop(chip, gap(target));
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

    await drop('winter', 'G1');
    await drop('summer', 'G3');
    expect(new FormData(form).get('RESPONSE')).toBe('["W G1","Su G3"]');

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
      await drop('winter', 'G1');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await drop('spring', 'G2');
      expect(messageShown()).toBe(false);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await settle(interaction);
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe('[]');

      // Into a gap that held a chip before the reset: the reset frees it.
      await drop('winter', 'G2');
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 1 }),
  play: async ({ canvasElement }) => {
    const { interaction, drop, messageShown } = await getElements(canvasElement);

    await drop('winter', 'G1');
    expect(messageShown()).toBe(false);

    await drop('spring', 'G2');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
