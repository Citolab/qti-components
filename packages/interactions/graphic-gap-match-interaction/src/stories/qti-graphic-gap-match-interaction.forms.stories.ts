import { html } from 'lit';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGraphicGapMatchInteraction } from '../qti-graphic-gap-match-interaction';

type Story = StoryObj<QtiGraphicGapMatchInteraction>;

/**
 * ## Form Association Stories
 *
 * The graphic gap match interaction inside a plain `<form>`: its response reaches `FormData` under
 * its `name`, `form.reset()` empties it, and `min-associations` / `max-associations` take part in
 * the form's validation. Too many shows at once; too few waits for a submit, and from then on every
 * change reports.
 *
 * Chips are placed the way the mixin ends a drag, `handleDrop` and then `saveResponse`: the pointer
 * handlers only accept trusted events, which a story cannot dispatch.
 */
const meta: Meta<QtiGraphicGapMatchInteraction> = {
  component: 'qti-graphic-gap-match-interaction',
  title: 'Interactions/Graphic Gap Match/Forms',
  tags: ['form-associated', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** A 400x120 graphic with three drop areas, as an SVG data URL so the story needs no asset file. */
const GRAPHIC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">` +
    `<rect width="400" height="120" fill="#eef"/>` +
    [20, 150, 280].map(x => `<rect x="${x}" y="30" width="100" height="60" fill="#fff" stroke="#888"/>`).join('') +
    `</svg>`
)}`;

const formTemplate = (attributes: { minAssociations: number; maxAssociations: number }) => html`
  <form role="form" @submit=${(e: Event) => e.preventDefault()}>
    <qti-graphic-gap-match-interaction
      name="RESPONSE"
      response-identifier="RESPONSE"
      min-associations=${attributes.minAssociations}
      max-associations=${attributes.maxAssociations}
      data-testid="interaction"
    >
      <img alt="three drop areas" src=${GRAPHIC} width="400" height="120" />
      <qti-gap-text identifier="X" match-max="1">one</qti-gap-text>
      <qti-gap-text identifier="Y" match-max="1">two</qti-gap-text>
      <qti-gap-text identifier="Z" match-max="1">three</qti-gap-text>
      <qti-associable-hotspot identifier="A" shape="rect" coords="20,30,120,90" match-max="1"></qti-associable-hotspot>
      <qti-associable-hotspot identifier="B" shape="rect" coords="150,30,250,90" match-max="1"></qti-associable-hotspot>
      <qti-associable-hotspot identifier="C" shape="rect" coords="280,30,380,90" match-max="1"></qti-associable-hotspot>
    </qti-graphic-gap-match-interaction>
    <input type="submit" value="submit" />
  </form>
`;

const settle = async (interaction: QtiGraphicGapMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const form = canvas.getByRole<HTMLFormElement>('form');
  const interaction = canvas.getByTestId<QtiGraphicGapMatchInteraction>('interaction');
  await settle(interaction);

  // The inline message is hidden while empty, so it is only reachable as a hidden alert.
  const message = () => within(interaction).getByShadowRole('alert', { hidden: true });
  const messageShown = () => message().style.display === 'block' && message().textContent !== '';
  // A hotspot is an empty area over the graphic: it has no role, name or text to query it by.
  const hotspot = (identifier: string) =>
    interaction.querySelector(`qti-associable-hotspot[identifier="${identifier}"]`) as HTMLElement;
  /** What the end of a drag does: drop, then publish the response. */
  const drop = async (text: string, target: string) => {
    const chip = canvas.getByText(text);
    // The drag itself would refuse a target `allowDrop` turns down; this drop is one a candidate can make.
    expect(interaction.allowDrop(chip, hotspot(target))).toBe(true);
    interaction.handleDrop(chip, hotspot(target));
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

    await drop('one', 'A');
    await drop('three', 'C');
    expect(new FormData(form).get('RESPONSE')).toBe('["X A","Z C"]');

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
      await drop('one', 'A');
      expect(interaction.internals.validity.valid).toBe(false);
      expect(messageShown()).toBe(false);
    });

    await step('a submit is blocked and shows the message', async () => {
      form.requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(messageShown()).toBe(true);
    });

    await step('meeting the minimum clears it', async () => {
      await drop('two', 'B');
      expect(messageShown()).toBe(false);
    });

    await step('form.reset() clears the message and the response, and forgets the submit', async () => {
      form.reset();
      await settle(interaction);
      expect(messageShown()).toBe(false);
      expect(new FormData(form).get('RESPONSE')).toBe('[]');

      // Onto a hotspot that held a chip before the reset: the reset frees it.
      await drop('one', 'B');
      expect(messageShown()).toBe(false);
    });
  }
};

export const TooManyShowsAtOnce: Story = {
  name: 'Validation - too many shows at once, without a submit',
  render: () => formTemplate({ minAssociations: 0, maxAssociations: 1 }),
  play: async ({ canvasElement }) => {
    const { interaction, drop, messageShown } = await getElements(canvasElement);

    await drop('one', 'A');
    expect(messageShown()).toBe(false);

    await drop('two', 'B');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(messageShown()).toBe(true);
  }
};
