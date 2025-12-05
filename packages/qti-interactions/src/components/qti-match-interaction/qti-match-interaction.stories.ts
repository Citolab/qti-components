import { expect } from 'storybook/test';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiMatchInteraction } from './qti-match-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-match-interaction');

type Story = StoryObj<QtiMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.9 Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.be4ll1tm4t99)
 * Two sets of choices; candidates create associations between the sets.
 *
 */
const meta: Meta<QtiMatchInteraction> = {
  component: 'qti-match-interaction',
  title: '09 Match',
  subcomponents: { QtiSimpleAssociableChoice: 'qti-simple-associable-choice' },
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['drag-drop', 'autodocs']
};
export default meta;

const withForm = (content: unknown) => html`
  <form
    @submit=${(e: Event) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const entries = Array.from(formData.entries());

      console.log('FormData entries', entries);
    }}
  >
    ${content}
    <button type="submit" data-testid="submit">Submit</button>
    <button type="reset" data-testid="reset">Reset</button>
  </form>
`;

const baseMatchSets = html`
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="P" match-max="1">Prospero</qti-simple-associable-choice>
  </qti-simple-match-set>

  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="M" match-max="2">A Midsummer-Nights</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="R" match-max="2">Romeo and Juliet</qti-simple-associable-choice>
    <qti-simple-associable-choice identifier="T" match-max="2">The Tempest</qti-simple-associable-choice>
  </qti-simple-match-set>
`;

export const Default: Story = {
  render: args =>
    withForm(
      template(
        args,
        html`<qti-prompt>Match the following characters to the Shakespeare play they appeared in:</qti-prompt>
          ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: Drag associations and assert response updates; submit should surface validation state.
  }
};

export const MinAssociations: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'min-associations': 2 },
        html`<qti-prompt>Make at least two matches.</qti-prompt> ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    const interaction = canvasElement.querySelector<QtiMatchInteraction>('qti-match-interaction');
    expect(interaction).not.toBeNull();
    await interaction.updateComplete;

    interaction!.response = ['C R'];
    await interaction!.updateComplete;
    expect(interaction!.validate()).toBe(false);
    expect(interaction!.reportValidity()).toBe(false);

    interaction!.response = ['C R', 'D M'];
    await interaction!.updateComplete;
    expect(interaction!.validate()).toBe(true);
    expect(interaction!.reportValidity()).toBe(true);
  }
};

export const MaxAssociations: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'max-associations': 2 },
        html`<qti-prompt>Only two matches allowed.</qti-prompt> ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: Create two pairs, attempt third; expect rejection/flag on validation (no global disabling).
  }
};

export const MinAndMaxAssociations: Story = {
  render: args =>
    withForm(
      template(
        { ...args, 'min-associations': 1, 'max-associations': 1 },
        html`<qti-prompt>Exactly one match required.</qti-prompt> ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: 0 pairs -> validation error; 1 pair -> pass; second pair should fail validation.
  }
};

export const MixedMatchMaxPerChoice: Story = {
  render: args =>
    withForm(
      template(
        args,
        html`<qti-prompt>Some choices can be matched multiple times.</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="A" match-max="1">Single-use A</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="B" match-max="2">Twice B</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="C" match-max="0">Unlimited C</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="X" match-max="1">Single-use X</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="Y" match-max="2">Twice Y</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="Z" match-max="0">Unlimited Z</qti-simple-associable-choice>
          </qti-simple-match-set>`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: Verify match-max per choice is respected (A/X single, B/Y twice, C/Z unlimited) and validation behaves accordingly.
  }
};

export const DisabledMode: Story = {
  render: args =>
    withForm(
      template({ ...args, disabled: true }, html`<qti-prompt>Interaction is disabled.</qti-prompt> ${baseMatchSets}`)
    ),
  play: async ({ canvasElement }) => {
    // TODO: Assert drags are ignored and validation state remains unchanged on submit.
  }
};

export const ReadonlyMode: Story = {
  render: args =>
    withForm(
      template({ ...args, readonly: true }, html`<qti-prompt>Interaction is readonly.</qti-prompt> ${baseMatchSets}`)
    ),
  play: async ({ canvasElement }) => {
    // TODO: Pre-fill (via args/initial response) and ensure matches render but cannot be changed; submit should not alter state.
  }
};

export const PrefilledValue: Story = {
  render: args =>
    withForm(
      template(
        { ...args, response: ['C R', 'D M'] },
        html`<qti-prompt>Prefilled matches.</qti-prompt> ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: Assert prefilled pairs render in correct matrix cells and validation reflects placed matches.
  }
};

export const TabularLayout: Story = {
  name: 'Tabular layout (kept)',
  render: args =>
    withForm(
      template(
        { ...args, class: 'qti-match-tabular', maxAssociations: 4 },
        html`<qti-prompt>Tabular presentation.</qti-prompt> ${baseMatchSets}`
      )
    ),
  play: async ({ canvasElement }) => {
    // TODO: Ensure tabular layout renders correctly and accepts matches; validate after submit.
  }
};

export const DragDropMatchBehavior: Story = {
  name: 'Drag Drop Match Behavior',
  render: args =>
    withForm(
      template(
        { ...args, 'response-identifier': 'RESPONSE', name: 'RESPONSE', 'max-associations': 4 },
        html`
          <qti-prompt>Test drag and drop behavior for match interaction.</qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="2">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="M" match-max="2">Midsummer</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="R" match-max="2">Romeo</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="T" match-max="1">Tempest</qti-simple-associable-choice>
          </qti-simple-match-set>
        `
      )
    ),
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiMatchInteraction>('qti-match-interaction')!;
    const capulet = canvasElement.querySelector<HTMLElement>('[identifier="C"]')!;
    const demetrius = canvasElement.querySelector<HTMLElement>('[identifier="D"]')!;
    const lysander = canvasElement.querySelector<HTMLElement>('[identifier="L"]')!;
    const midsummer = canvasElement.querySelector<HTMLElement>('[identifier="M"]')!;
    const romeo = canvasElement.querySelector<HTMLElement>('[identifier="R"]')!;
    const tempest = canvasElement.querySelector<HTMLElement>('[identifier="T"]')!;

    await interaction.updateComplete;

    await step('Verify all choices initially visible', async () => {
      expect(window.getComputedStyle(capulet).opacity).toBe('1');
      expect(window.getComputedStyle(demetrius).opacity).toBe('1');
      expect(window.getComputedStyle(lysander).opacity).toBe('1');
      expect(window.getComputedStyle(midsummer).opacity).toBe('1');
      expect(window.getComputedStyle(romeo).opacity).toBe('1');
      expect(window.getComputedStyle(tempest).opacity).toBe('1');
    });

    await step('Test QTI spec directedPair response format', async () => {
      // QTI spec: Match interactions use directedPair base-type
      // Response format: "source_id target_id" for each association

      interaction.response = ['C M', 'D R']; // Capulet->Midsummer, Demetrius->Romeo

      await waitFor(() => {
        const response = interaction.response;
        expect(Array.isArray(response)).toBe(true);
        expect(response).toContain('C M');
        expect(response).toContain('D R');
      });
    });

    await step('Test match-max constraints between sets', async () => {
      // QTI spec: Match interaction creates associations between two sets, not within same set
      // Test match-max limits per choice

      // Demetrius has match-max=2, should allow 2 associations
      interaction.response = ['D M', 'D R']; // Two associations for Demetrius

      await waitFor(() => {
        const response = interaction.response;
        expect(response).toContain('D M');
        expect(response).toContain('D R');
      });

      // Capulet has match-max=1, should be limited to one association
      interaction.response = ['C M']; // One association for Capulet

      await waitFor(() => {
        const response = interaction.response;
        expect(response).toContain('C M');
      });
    });

    await step('Test draggable visibility during drag', async () => {
      // Test that during drag operation, only dragged item becomes invisible
      const pointerDownEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
        isPrimary: true
      });

      capulet.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Other choices should remain visible
      expect(window.getComputedStyle(demetrius).opacity).toBe('1');
      expect(window.getComputedStyle(lysander).opacity).toBe('1');
      expect(window.getComputedStyle(midsummer).opacity).toBe('1');

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
    });
  }
};

export const QTISpecMatchCompliance: Story = {
  name: 'QTI 3.0 Match Spec Compliance',
  render: args =>
    withForm(
      template(
        {
          ...args,
          'max-associations': 3,
          'min-associations': 1,
          'response-identifier': 'RESPONSE',
          name: 'RESPONSE',
          'data-max-associations-message': 'Maximum 3 character-play associations allowed',
          'data-min-associations-message': 'At least 1 association required'
        },
        html`
          <qti-prompt>
            QTI 3.0 Match Interaction: Associate characters with plays. Each character has different match-max
            constraints.
          </qti-prompt>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="C" match-max="1">Capulet (max 1)</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D" match-max="1">Demetrius (max 1)</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L" match-max="1">Lysander (max 1)</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="O" match-max="2">Othello (max 2)</qti-simple-associable-choice>
          </qti-simple-match-set>
          <qti-simple-match-set>
            <qti-simple-associable-choice identifier="M" match-max="4">Midsummer (max 4)</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="R" match-max="4"
              >Romeo & Juliet (max 4)</qti-simple-associable-choice
            >
            <qti-simple-associable-choice identifier="T" match-max="2">Tempest (max 2)</qti-simple-associable-choice>
          </qti-simple-match-set>
        `
      )
    ),
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiMatchInteraction>('qti-match-interaction')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await step('Test QTI spec requirements for match interaction', async () => {
      // QTI spec: Match interaction presents two sets of choices for association
      expect(interaction.maxAssociations).toBe(3);
      expect(interaction.minAssociations).toBe(1);

      const firstSet = interaction.querySelector('qti-simple-match-set:first-of-type');
      const secondSet = interaction.querySelector('qti-simple-match-set:last-of-type');
      expect(firstSet).toBeTruthy();
      expect(secondSet).toBeTruthy();
    });

    await step('Test directedPair response validation', async () => {
      // Test that associations are properly formatted as directedPair
      interaction.response = ['C R', 'D M', 'L M']; // 3 associations

      const response = interaction.response;
      expect(response.length).toBe(3);
      expect(response.every(pair => pair.includes(' '))).toBe(true); // All pairs have space separator
    });

    await step('Test validation messages', async () => {
      // Test min-associations validation
      interaction.response = [];
      submit.click();
      interaction.reportValidity();

      const validationElement = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement;
      await waitFor(() => {
        expect(validationElement?.textContent).toContain('At least 1 association required');
      });

      // Test max-associations validation
      interaction.response = ['C R', 'D M', 'L M', 'O T']; // 4 associations (exceeds max=3)
      submit.click();
      interaction.reportValidity();

      await waitFor(() => {
        expect(validationElement?.textContent).toContain('Maximum 3 character-play associations allowed');
      });
    });

    await step('Test match-max constraints between sets', async () => {
      // QTI spec: Associations only between different sets, controlled by match-max
      interaction.response = ['O R', 'O T']; // Othello can have max 2 associations

      await waitFor(() => {
        const othello = canvasElement.querySelector<HTMLElement>('[identifier="O"]')!;
        // After 2 uses, Othello should be disabled
        expect(window.getComputedStyle(othello).pointerEvents).toBe('none');
      });
    });
  }
};
