import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from 'storybook/test';

import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from './qti-order-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-order-interaction');

type Story = StoryObj<QtiOrderInteraction & typeof args>;

/**
 *
 * ### [3.2.10 Order Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.4n8gips6tlv4)
 * Candidate reorders choices; initial order is significant.
 *
 */
const meta: Meta<QtiOrderInteraction> = {
  component: 'qti-order-interaction',
  title: '10 Order',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['drag-drop']
};
export default meta;

const withForm = (content: unknown) =>
  html`<form @submit=${(e: Event) => e.preventDefault()}>
    ${content}
    <button type="submit" data-testid="submit">Submit</button>
  </form>`;

const baseChoices = html`
  <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
  <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
  <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
`;

export const Default: Story = {
  render: args =>
    withForm(
      template(
        args,
        html`
          <qti-prompt
            >The following F1 drivers finished on the podium in the first ever Grand Prix of Bahrain. Can you rearrange
            them into the correct finishing order?</qti-prompt
          >
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: Drag to reorder and assert response array matches new order; verify initial order is preserved before interactions.
    // TODO: Click submit to trigger validation display when applicable.
  }
};

export const MinChoices: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'min-choices': 2 },
        html`
          <qti-prompt>At least two choices must be ordered.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: Leave fewer than 2 placed and expect validation fail; place 2+ and expect validation pass on validate/report.
    // TODO: Click submit to trigger validation display.
  }
};

export const MaxChoices: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'max-choices': 2 },
        html`
          <qti-prompt>Only two choices may be ordered.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: Place two choices, then attempt third and assert it is rejected/flagged on validation (no global disabling).
    // TODO: Click submit to trigger validation display.
  }
};

export const MinAndMaxChoices: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'min-choices': 1, 'max-choices': 1 },
        html`
          <qti-prompt>Exactly one choice must be placed.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: With zero placed, expect validation error; with one placed, expect pass; adding a second should fail validation.
    // TODO: Click submit to trigger validation display.
  }
};

export const DisabledMode: Story = {
  render: args =>
    withForm(
      template(
        { ...args, disabled: true },
        html`
          <qti-prompt>Interaction is disabled.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: Verify drags are ignored and order stays unchanged; validate/report should not change state.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const ReadonlyMode: Story = {
  render: args =>
    withForm(
      template(
        { ...args, readonly: true },
        html`
          <qti-prompt>Interaction is readonly.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async () => {
    // TODO: Pre-set an order (via args/initial response) and assert it renders but cannot be changed; drag attempts ignored.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const PrefilledValue: Story = {
  render: args =>
    withForm(
      template(
        { ...args, response: ['DriverA', 'DriverB', 'DriverC'] },
        html`
          <qti-prompt>Prefilled order.</qti-prompt>
          ${baseChoices}
        `
      )
    ),
  play: async ({ canvasElement }) => {
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    submit?.click();
    // TODO: Assert prefilled order is rendered and validation reflects placed choices.
  }
};

export const DragDropOrderTest: Story = {
  name: 'Drag Drop Order Behavior',
  render: args =>
    withForm(
      template(
        { ...args, 'response-identifier': 'RESPONSE', name: 'RESPONSE' },
        html`
          <qti-prompt>Test drag and drop behavior for order interaction.</qti-prompt>
          <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
          <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
          <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
          <qti-simple-choice identifier="DriverD">Sebastian</qti-simple-choice>
        `
      )
    ),
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiOrderInteraction>('qti-order-interaction')!;
    const rubens = canvasElement.querySelector<HTMLElement>('qti-simple-choice[identifier="DriverA"]')!;
    const jenson = canvasElement.querySelector<HTMLElement>('qti-simple-choice[identifier="DriverB"]')!;
    const michael = canvasElement.querySelector<HTMLElement>('qti-simple-choice[identifier="DriverC"]')!;
    const sebastian = canvasElement.querySelector<HTMLElement>('qti-simple-choice[identifier="DriverD"]')!;

    await interaction.updateComplete;

    await step('Verify all choices initially visible', async () => {
      expect(window.getComputedStyle(rubens).opacity).toBe('1');
      expect(window.getComputedStyle(jenson).opacity).toBe('1');
      expect(window.getComputedStyle(michael).opacity).toBe('1');
      expect(window.getComputedStyle(sebastian).opacity).toBe('1');
      expect(interaction.response).toEqual([]);
    });

    await step('Test QTI spec response format for order interaction', async () => {
      // QTI spec: Order interactions use identifier base-type with single or multiple cardinality
      // Response should be array of identifiers in the ordered sequence

      interaction.response = ['DriverB', 'DriverA', 'DriverD', 'DriverC'];

      await waitFor(() => {
        const response = interaction.response;
        expect(Array.isArray(response)).toBe(true);
        expect(response).toEqual(['DriverB', 'DriverA', 'DriverD', 'DriverC']);
      });
    });

    await step('Test draggable visibility during drag operation', async () => {
      // Test that only the dragged item becomes invisible, others remain visible
      const pointerDownEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
        isPrimary: true
      });

      rubens.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Other draggables should remain visible
      expect(window.getComputedStyle(jenson).opacity).toBe('1');
      expect(window.getComputedStyle(michael).opacity).toBe('1');
      expect(window.getComputedStyle(sebastian).opacity).toBe('1');

      // End drag
      const pointerUpEvent = new PointerEvent('pointerup', {
        pointerId: 1,
        clientX: 200,
        clientY: 200,
        button: 0,
        bubbles: true,
        isPrimary: true
      });
      document.dispatchEvent(pointerUpEvent);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(window.getComputedStyle(rubens).opacity).toBe('1');
    });
  }
};
