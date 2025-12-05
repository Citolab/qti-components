import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from 'storybook/test';

import drag from '../../../../../tools/testing/drag';

import type { QtiAssociateInteraction } from './qti-associate-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-associate-interaction');

type Story = StoryObj<QtiAssociateInteraction & typeof args>;

/**
 *
 * ### [3.2.12 Associate Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * A block interaction that presents candidates with a number of choices and allows them to create associations between them.
 *
 */
const meta: Meta<QtiAssociateInteraction> = {
  component: 'qti-associate-interaction',
  title: '12 Associate',
  subcomponents: { QtiSimpleAssociableChoice: 'qti-simple-associable-choice' },
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

export const Default: Story = {
  render: args => {
    return html`
      ${withForm(
        template(
          args,
          html` <qti-prompt>
              Hidden in this list of characters from famous Shakespeare plays are three pairs of rivals. Can you match
              each character to his adversary?
            </qti-prompt>
            <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="L">Lysander</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="M">Montague</qti-simple-associable-choice>
            <qti-simple-associable-choice identifier="P">Prospero</qti-simple-associable-choice>`
        )
      )}
    `;
  },
  play: async ({ canvasElement }) => {
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    submit?.click();
    // TODO: Assert validation message presence/absence based on created associations.
  }
};

export const MinAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'min-associations': 2 },
        html` <qti-prompt>Make at least two associations.</qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="0">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="0">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="0">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L" match-max="0">Lysander</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="M" match-max="0">Montague</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="P" match-max="0">Prospero</qti-simple-associable-choice>`
      )
    )}`,
  play: async () => {
    // TODO: simulate two associations and assert validity passes; with only one association, expect validation message.
    // TODO: Click submit to trigger validation.
  }
};

export const MaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'max-associations': 2 },
        html` <qti-prompt>Only two associations are allowed.</qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="0">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="0">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="0">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L" match-max="0">Lysander</qti-simple-associable-choice>`
      )
    )}`,
  play: async () => {
    // TODO: create two associations, then attempt a third and assert it is blocked (validation only on explicit report).
    // TODO: ensure no droppables are disabled globally; only match-max limits per slot apply.
    // TODO: Click submit to trigger validation.
  }
};

export const DragDropBehavior: Story = {
  name: 'Drag Drop Behavior Test',
  render: args =>
    html`${withForm(
      template(
        { ...args, 'max-associations': 3, 'response-identifier': 'RESPONSE', name: 'RESPONSE' },
        html`
          <qti-prompt>Test drag and drop behavior with associate interaction.</qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="2">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L" match-max="0">Lysander</qti-simple-associable-choice>
        `
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiAssociateInteraction>('qti-associate-interaction')!;
    const antonio = canvasElement.querySelector<HTMLElement>('qti-simple-associable-choice[identifier="A"]')!;
    const capulet = canvasElement.querySelector<HTMLElement>('qti-simple-associable-choice[identifier="C"]')!;
    const demetrius = canvasElement.querySelector<HTMLElement>('qti-simple-associable-choice[identifier="D"]')!;
    const lysander = canvasElement.querySelector<HTMLElement>('qti-simple-associable-choice[identifier="L"]')!;

    await interaction.updateComplete;

    await step('Verify all choices initially visible', async () => {
      expect(window.getComputedStyle(antonio).opacity).toBe('1');
      expect(window.getComputedStyle(capulet).opacity).toBe('1');
      expect(window.getComputedStyle(demetrius).opacity).toBe('1');
      expect(window.getComputedStyle(lysander).opacity).toBe('1');
    });

    await step('Test draggable visibility during drag initiation', async () => {
      // Simulate pointer down to start drag
      const pointerDownEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
        isPrimary: true
      });

      antonio.dispatchEvent(pointerDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // During drag, only the dragged item should become invisible
      // All other draggables should remain visible
      expect(window.getComputedStyle(capulet).opacity).toBe('1');
      expect(window.getComputedStyle(demetrius).opacity).toBe('1');
      expect(window.getComputedStyle(lysander).opacity).toBe('1');

      // End the drag
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

    await step('Test QTI spec compliance for associate interaction', async () => {
      // QTI spec: Associate interactions use base-type "pair"
      // Response format should be space-separated pairs: "choice1 choice2"

      // Test reactive response setting
      interaction.response = ['A C']; // Associate Antonio with Capulet

      await waitFor(() => {
        // Should have association reflected in UI
        const response = interaction.response;
        expect(response).toContain('A C');
      });

      // Test match-max constraints
      // Antonio has match-max=2, so should be able to make 2 associations
      // Capulet has match-max=1, so should be disabled after first use
      interaction.response = ['A C', 'A D']; // Two associations for Antonio

      await waitFor(() => {
        const response = interaction.response;
        expect(response).toContain('A C');
        expect(response).toContain('A D');
      });
    });
  }
};

export const QTISpecCompliantAssociate: Story = {
  name: 'QTI 3.0 Spec Compliant Associate',
  render: args =>
    html`${withForm(
      template(
        {
          ...args,
          'max-associations': 3,
          'min-associations': 1,
          'response-identifier': 'RESPONSE',
          name: 'RESPONSE',
          'data-max-associations-message': 'Maximum of 3 associations allowed',
          'data-min-associations-message': 'At least 1 association required'
        },
        html`
          <qti-prompt>
            QTI 3.0 Associate Interaction: Create associations between Shakespeare characters. Each has different
            match-max constraints.
          </qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="1">Antonio (max 1)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="2">Capulet (max 2)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="1">Demetrius (max 1)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L" match-max="0">Lysander (unlimited)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="M" match-max="1">Montague (max 1)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="P" match-max="1">Prospero (max 1)</qti-simple-associable-choice>
        `
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiAssociateInteraction>('qti-associate-interaction')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await step('Test QTI specification requirements', async () => {
      // QTI spec: Associate interaction uses base-type "pair" with multiple cardinality
      expect(interaction.maxAssociations).toBe(3);
      expect(interaction.minAssociations).toBe(1);
    });

    await step('Test pair response format', async () => {
      // Set some associations to test pair format: "identifier1 identifier2"
      interaction.response = ['A C', 'D L'];

      const response = interaction.response;
      expect(Array.isArray(response)).toBe(true);
      expect(response).toContain('A C');
      expect(response).toContain('D L');
    });

    await step('Test match-max constraints per choice', async () => {
      // Test that choices with match-max=1 become unavailable after one use
      // Test that choices with match-max=0 remain available (unlimited)
      // Test that choices with match-max=2 allow two uses

      interaction.response = ['C A', 'C D']; // Capulet (max=2) associated twice

      await waitFor(() => {
        const capulet = canvasElement.querySelector<HTMLElement>('qti-simple-associable-choice[identifier="C"]')!;
        // After 2 uses, Capulet should be disabled (pointer-events: none)
        expect(window.getComputedStyle(capulet).pointerEvents).toBe('none');
      });
    });

    await step('Test validation with custom messages', async () => {
      // Test min-associations validation
      interaction.response = [];
      submit.click();
      interaction.reportValidity();

      const validationElement = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement;
      await waitFor(() => {
        expect(validationElement?.textContent).toContain('At least 1 association required');
      });

      // Test max-associations validation
      interaction.response = ['A C', 'D L', 'M P', 'L A']; // 4 associations (exceeds max=3)
      submit.click();
      interaction.reportValidity();

      await waitFor(() => {
        expect(validationElement?.textContent).toContain('Maximum of 3 associations allowed');
      });
    });
  }
};

export const MinAndMaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, 'min-associations': 1, 'max-associations': 1 },
        html` <qti-prompt>Exactly one association required.</qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L" match-max="1">Lysander</qti-simple-associable-choice>`
      )
    )}`,
  play: async () => {
    // TODO: make one association and assert further drops are prevented; clearing it should allow a new association.
    // TODO: ensure validation error when zero associations, validation passes with one.
    // TODO: Click submit to trigger validation.
  }
};

export const MatchMaxPerChoice: Story = {
  render: args =>
    html`${withForm(
      template(
        args,
        html` <qti-prompt>Some choices can be used once; others multiple times.</qti-prompt>
          <qti-simple-associable-choice identifier="A" match-max="1">Antonio (single use)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C" match-max="2">Capulet (twice)</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D" match-max="0"
            >Demetrius (unlimited)</qti-simple-associable-choice
          >
          <qti-simple-associable-choice identifier="L" match-max="1"
            >Lysander (single use)</qti-simple-associable-choice
          >`
      )
    )}`,
  play: async () => {
    // TODO: use Capulet twice and ensure a third use is blocked; ensure Antonio/Lysander cannot be reused.
    // TODO: ensure Demetrius can be associated multiple times without disabling inventory.
    // TODO: Click submit to trigger validation.
  }
};

export const DisabledMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, disabled: true },
        html` <qti-prompt>Interaction is disabled.</qti-prompt>
          <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L">Lysander</qti-simple-associable-choice>`
      )
    )}`,
  play: async () => {
    // TODO: verify draggables are not movable and drop zones ignore drops; validate state should remain unchanged.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const ReadonlyMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, readonly: true },
        html` <qti-prompt>Interaction is readonly.</qti-prompt>
          <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L">Lysander</qti-simple-associable-choice>`
      )
    )}`,
  play: async () => {
    // TODO: verify existing associations render but cannot be changed; drag attempts should be ignored.
    // TODO: Click submit to confirm no validation changes occur.
  }
};

export const PrefilledValue: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...args, response: ['A droplist0_left', 'C droplist0_right'] },
        html` <qti-prompt>Prefilled associations.</qti-prompt>
          <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
          <qti-simple-associable-choice identifier="L">Lysander</qti-simple-associable-choice>`
      )
    )}`,
  play: async ({ canvasElement }) => {
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    submit?.click();
    // TODO: Assert prefilled associations are rendered in correct droplists and validation reflects existing pairs.
  }
};
