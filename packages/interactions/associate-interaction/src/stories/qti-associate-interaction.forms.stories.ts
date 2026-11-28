import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssociateInteraction } from '../qti-associate-interaction';

type Story = StoryObj<QtiAssociateInteraction>;

/**
 * ## Form Association Stories
 *
 * The associate interaction inside a plain `<form>`: its response reaches `FormData` under its
 * `name`, `form.reset()` empties it, and `min-associations` takes part in the form's validation.
 * Too few waits for a submit, and from then on every change reports.
 *
 * Chips are placed the way the mixin ends a drag, `handleDrop` and then `saveResponse`: the pointer
 * handlers only accept trusted events, which a story cannot dispatch.
 */
const meta: Meta<QtiAssociateInteraction> = {
  component: 'qti-associate-interaction',
  title: 'Interactions/Associate/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const formTemplate = (attributes: { minAssociations: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-associate-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-associations=${attributes.minAssociations}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B" match-max="1">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiAssociateInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiAssociateInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  // No semantic role or test id exists for the internal drop zones.
  const dropZone = (identifier: string) =>
    interaction.shadowRoot?.querySelector(`[part~='drop'][identifier="${identifier}"]`) as HTMLElement;
  /** What the end of a drag does: drop, then publish the response. */
  const drop = async (text: string, target: string) => {
    const chip = canvas.getByText(text);
    // The drag itself would refuse a target `allowDrop` turns down; this drop is one a candidate can make.
    expect(interaction.allowDrop(chip, dropZone(target))).toBe(true);
    interaction.handleDrop(chip, dropZone(target));
    interaction.saveResponse();
    await settle(interaction);
  };
  /** Fill row `row` with two chips, which is one association. */
  const associate = async (row: number, left: string, right: string) => {
    await drop(left, `droplist${row}_left`);
    await drop(right, `droplist${row}_right`);
  };
  // Counts the submits that get past the browser's validation.
  const onSubmit = fn();
  form.addEventListener('submit', onSubmit);
  return { form, interaction, associate, messageShown, onSubmit };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORM DATA AND RESET
// ═══════════════════════════════════════════════════════════════════════════════

export const FormDataAndReset: Story = {
  name: 'FormData - holds the response, reset empties it',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 2 }),
  play: async ({ canvasElement }) => {
    const { form, interaction, associate } = await getElements(canvasElement);

    await associate(0, 'Antonio', 'Brutus');
    expect(new FormData(form).get('RESPONSE')).toBe('["A B"]');

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
    const { form, interaction, associate, messageShown, onSubmit } = await getElements(canvasElement);

    await step('a change below the minimum shows no message', async () => {
      await associate(0, 'Antonio', 'Brutus');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await associate(1, 'Capulet', 'Demetrius');
      expect(messageShown()).toBe(false);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await settle(interaction);
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe('[]');

      // Into a row that held a pair before the reset: the reset frees it.
      await associate(0, 'Antonio', 'Brutus');
      expect(messageShown()).toBe(false);
    });
  }
};
