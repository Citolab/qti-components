import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGapMatchInteraction } from './qti-gap-match-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-gap-match-interaction');

type Story = StoryObj<QtiGapMatchInteraction & typeof args>;

const baseStoryArgs = { 'response-identifier': 'RESPONSE', name: 'RESPONSE' };

/**
 *
 * ### [3.2.5 Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7sroqk3xl8e1)
 * Block interaction where gaps are filled from an associated set of choices.
 *
 */
const meta: Meta<QtiGapMatchInteraction> = {
  component: 'qti-gap-match-interaction',
  title: '05 Gap Match',
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

const baseChoices = html`
  <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
  <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
  <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
  <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
`;

const baseGaps = html`
  <blockquote>
    <p>
      Now is the <qti-gap class="qti-input-width-6" identifier="G1" match-max="1"></qti-gap> of our discontent<br />
      Made glorious <qti-gap class="qti-input-width-6" identifier="G2" match-max="1"></qti-gap> by this sun of York;<br />
      And all the clouds that lour'd upon our house<br />
      In the deep bosom of the ocean buried.
    </p>
  </blockquote>
`;

export const Playground: Story = {
  name: 'Playground with controls',
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'max-associations': '0' },
        html`<qti-prompt>Fill each gap with a single choice.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`
};

export const SingleUseGaps: Story = {
  name: 'Single-use gaps (default)',
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'max-associations': '0' },
        html`<qti-prompt>Fill each gap with a single choice.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    // Drag each choice into a different gap; assert only one choice per gap and re-dropping replaces the prior choice.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction');
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const autumn = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="A"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    const reset = canvasElement.querySelector<HTMLButtonElement>('button[type="reset"]');

    await interaction?.updateComplete;

    await step('Fill both gaps and replace first gap', async () => {
      await drag(winter, { to: gap1 });
      await drag(spring, { to: gap2 });

      await waitFor(() => {
        expect(gap1.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(gap2.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(gap1.querySelector('[identifier="W"]')).toBeTruthy();
        expect(gap2.querySelector('[identifier="Sp"]')).toBeTruthy();
      });

      // Re-enable the filled gap to allow replacement (per-gap match-max enforcement adds a disabled attr when occupied).
      gap1.removeAttribute('disabled');

      await drag(autumn, { to: gap1 });

      await waitFor(() => {
        expect(gap1.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(gap1.querySelector('[identifier="A"]')).toBeTruthy();
        expect(gap1.querySelector('[identifier="W"]')).toBeNull();
        expect(gap2.querySelector('[identifier="Sp"]')).toBeTruthy();
      });
    });

    await step('Submit and verify response', async () => {
      submit?.click();
      const expected = expect.arrayContaining(['A G1', 'Sp G2']);
      await waitFor(() => {
        expect(interaction?.response ?? []).toEqual(expected);
      });
    });

    await step('Reset and verify cleared state', async () => {
      reset?.click();
      await waitFor(() => {
        expect(interaction?.response ?? []).toEqual([]);
        expect(gap1.querySelector('[qti-draggable="true"]')).toBeNull();
        expect(gap2.querySelector('[qti-draggable="true"]')).toBeNull();
      });
    });

    await step('Drag again after reset', async () => {
      const freshWinter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
      await interaction?.updateComplete;

      await drag(freshWinter, { to: gap1 });
      await waitFor(() => {
        expect(gap1.querySelector('[identifier="W"]')).toBeTruthy();
        expect(interaction?.response ?? []).toEqual(expect.arrayContaining(['W G1']));
      });
    });
  }
};

export const MinAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'min-associations': 2, 'max-associations': '0', 'validation-display': 'custom' },
        html`<qti-prompt>Require at least two gaps to be filled.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // With fewer than 2 filled gaps, expect validation failure; with 2+ filled, expect validation pass on validate/report.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await step('Initial validation', async () => {
      expect(interaction.validate()).toBe(false);
    });

    await step('Initial validation', async () => {
      await drag(winter, { to: gap1 });
      await waitFor(() => expect(interaction.validate()).toBe(false));
    });

    await step('Shows validation message', async () => {
      submit.click();
      interaction.reportValidity();
      const validationMessageElement =
        interaction.shadowRoot.querySelector<QtiGapMatchInteraction>('#validation-message')!;

      // const validationMessageElement = canvas.getByRole('alert');

      await waitFor(() => {
        expect(validationMessageElement?.textContent ?? '').toContain(
          `Please create at least ${interaction.minAssociations}`
        );
        expect(getComputedStyle(validationMessageElement).display).not.toBe('none');
      });
    });

    await step('Fill second gap and validate', async () => {
      await drag(spring, { to: gap2 });
      await waitFor(() => expect(interaction.validate()).toBe(true));

      interaction.reportValidity();
      const validationMessageElement = interaction.shadowRoot.querySelector<HTMLElement>('#validation-message')!;
      await waitFor(() => {
        expect(validationMessageElement?.textContent ?? '').toBe('');
        expect(getComputedStyle(validationMessageElement).display).toBe('none');
      });
    });

    submit.click();
  }
};

export const MaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'max-associations': 2 },
        html`<qti-prompt>Only two gaps may be filled.</qti-prompt>
          ${baseChoices}
          <blockquote>
            <p>
              Gap one: <qti-gap class="qti-input-width-6" identifier="G1"></qti-gap><br />
              Gap two: <qti-gap class="qti-input-width-6" identifier="G2"></qti-gap><br />
              Gap three: <qti-gap class="qti-input-width-6" identifier="G3"></qti-gap>
            </p>
          </blockquote>`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // Fill two gaps, then attempt a third; expect the third to be rejected or flagged on validation (no auto-disabling globally).
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const gap3 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G3"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const summer = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Su"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await drag(winter, { to: gap1 });
    await drag(spring, { to: gap2 });
    await waitFor(() => expect(interaction.validate()).toBe(true));

    await drag(summer, { to: gap3 });
    await waitFor(() => expect(interaction.validate()).toBe(false));

    submit.click();
  }
};

export const MinAndMaxAssociations: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'min-associations': 1, 'max-associations': 1 },
        html`<qti-prompt>Exactly one gap must be filled.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // With zero gaps filled, expect validation error; with one filled, expect pass; ensure adding a second is blocked/flagged on validate.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    expect(interaction.validate()).toBe(false);

    await drag(winter, { to: gap1 });
    await waitFor(() => expect(interaction.validate()).toBe(true));

    await drag(spring, { to: gap2 });
    await waitFor(() => expect(interaction.validate()).toBe(false));

    submit.click();
  }
};

export const MixedMatchMaxChoices: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args },
        html`<qti-prompt>Some choices can be reused; others cannot.</qti-prompt>
          <qti-gap-text identifier="W" match-max="1">winter (single-use)</qti-gap-text>
          <qti-gap-text identifier="Sp" match-max="2">spring (twice)</qti-gap-text>
          <qti-gap-text identifier="Su" match-max="0">summer (unlimited)</qti-gap-text>
          <qti-gap-text identifier="A" match-max="1">autumn (single-use)</qti-gap-text>
          ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // Use spring twice and ensure a third use is disallowed; ensure winter/autumn cannot be reused; summer can fill multiple gaps.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const summer = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Su"]')!;
    const autumn = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="A"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await drag(spring, { to: gap1 });
    await drag(spring, { to: gap2 });

    await waitFor(() => {
      expect(getComputedStyle(spring).pointerEvents).toBe('none');
      expect(gap1.querySelector('[identifier="Sp"]')).toBeTruthy();
      expect(gap2.querySelector('[identifier="Sp"]')).toBeTruthy();
    });

    await drag(winter, { to: gap1 });
    await waitFor(() => expect(getComputedStyle(winter).pointerEvents).toBe('none'));

    await drag(autumn, { to: gap2 });
    await waitFor(() => expect(getComputedStyle(autumn).pointerEvents).toBe('none'));

    await drag(summer, { to: gap1 });
    await drag(summer, { to: gap2 });
    await waitFor(() => expect(getComputedStyle(summer).pointerEvents).toBe('auto'));

    submit.click();
  }
};

export const DisabledMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, disabled: true },
        html`<qti-prompt>Interaction is disabled.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // Verify drags are ignored and gaps remain unchanged; validate/report should not change state.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await drag(winter, { to: gap1 });
    expect(gap1.querySelector('[qti-draggable="true"]')).toBeNull();
    expect(interaction.response).toEqual([]);

    submit.click();
    expect(gap1.querySelector('[qti-draggable="true"]')).toBeNull();
  }
};

export const ReadonlyMode: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, readonly: true },
        html`<qti-prompt>Interaction is readonly.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // Pre-fill a gap (via args/initial setup) and assert it renders but cannot be changed; drag attempts are ignored.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    interaction.value = '["W G1"]';

    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;
    await waitFor(() => expect(gap1.querySelector('[identifier="W"]')).toBeTruthy());

    await drag(spring, { to: gap1 });
    expect(gap1.querySelector('[identifier="W"]')).toBeTruthy();
    expect(gap1.querySelector('[identifier="Sp"]')).toBeNull();

    submit.click();
  }
};

export const PrefilledValue: Story = {
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, value: '["W G1", "Sp G2"]', 'max-choices': '0' },
        html`<qti-prompt>Prefilled gaps.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement }) => {
    // Assert prefilled choices appear in the correct gaps and validation reflects filled state.
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await waitFor(() => {
      expect(gap1.querySelector('[identifier="W"]')).toBeTruthy();
      expect(gap2.querySelector('[identifier="Sp"]')).toBeTruthy();
    });

    expect(interaction.validate()).toBe(true);
    submit.click();
  }
};

export const DragOutsideReturnsToInventory: Story = {
  name: 'Drag outside returns to inventory',
  render: args =>
    html`${withForm(
      template(
        { ...baseStoryArgs, ...args, 'max-associations': '0' },
        html`<qti-prompt>Drag items outside to test return behavior.</qti-prompt> ${baseChoices} ${baseGaps}`
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const autumn = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="A"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const summer = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Su"]')!;

    await interaction.updateComplete;

    await step('Verify all draggables initially visible in inventory', async () => {
      const autumnOpacity = window.getComputedStyle(autumn).opacity;
      const winterOpacity = window.getComputedStyle(winter).opacity;
      const springOpacity = window.getComputedStyle(spring).opacity;
      const summerOpacity = window.getComputedStyle(summer).opacity;

      expect(autumnOpacity).toBe('1');
      expect(winterOpacity).toBe('1');
      expect(springOpacity).toBe('1');
      expect(summerOpacity).toBe('1');
      expect(interaction.response).toEqual([]);
    });

    await step('Test draggable visibility during drag initiation', async () => {
      // Simulate mouse down to start drag
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true
      });

      // Add a small delay to allow for drag initiation
      autumn.dispatchEvent(mouseDownEvent);
      await new Promise(resolve => setTimeout(resolve, 50));

      // During drag, only the dragged item should become invisible
      // All other draggables should remain visible
      const autumnOpacity = window.getComputedStyle(autumn).opacity;
      const winterOpacity = window.getComputedStyle(winter).opacity;
      const springOpacity = window.getComputedStyle(spring).opacity;
      const summerOpacity = window.getComputedStyle(summer).opacity;

      expect(winterOpacity).toBe('1'); // Should remain visible
      expect(springOpacity).toBe('1'); // Should remain visible
      expect(summerOpacity).toBe('1'); // Should remain visible

      // End the drag by dispatching mouse up
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 200,
        clientY: 200,
        button: 0,
        bubbles: true
      });
      document.dispatchEvent(mouseUpEvent);

      // After drag end, all items should be visible again
      await new Promise(resolve => setTimeout(resolve, 50));
      const finalAutumnOpacity = window.getComputedStyle(autumn).opacity;
      expect(finalAutumnOpacity).toBe('1');
    });

    await step('Test reactive state-based approach', async () => {
      // Test that the reactive sync works by manipulating response directly
      interaction.response = ['A G1']; // Put autumn in gap 1

      await waitFor(() => {
        // Should have one gap filled
        const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
        expect(gap1.querySelector('[identifier="A"]')).toBeTruthy();
      });

      // Clear the response - autumn should return to inventory
      interaction.response = [];

      await waitFor(() => {
        // Gap should be empty and autumn should be visible in inventory
        const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
        expect(gap1.querySelector('[identifier="A"]')).toBeNull();

        const inventoryAutumn = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="A"]')!;
        expect(window.getComputedStyle(inventoryAutumn).opacity).toBe('1');
      });
    });
  }
};

export const QTISpecCompliance: Story = {
  name: 'QTI 3.0 Specification Compliance',
  render: args =>
    html`${withForm(
      template(
        {
          ...baseStoryArgs,
          ...args,
          'max-associations': 2,
          'min-associations': 1,
          'data-max-associations-message': 'Custom max message: Only 2 associations allowed',
          'data-min-associations-message': 'Custom min message: At least 1 association required'
        },
        html`
          <qti-prompt>QTI 3.0 Spec Compliance Test: Gap Match with match-max constraints</qti-prompt>
          <qti-gap-text identifier="W" match-max="1">winter (match-max=1)</qti-gap-text>
          <qti-gap-text identifier="Sp" match-max="2">spring (match-max=2)</qti-gap-text>
          <qti-gap-text identifier="Su" match-max="0">summer (match-max=0, unlimited)</qti-gap-text>
          <qti-gap-text identifier="A" match-max="1">autumn (match-max=1)</qti-gap-text>
          <blockquote>
            <p>
              Gap 1: <qti-gap class="qti-input-width-6" identifier="G1" match-max="1"></qti-gap><br />
              Gap 2: <qti-gap class="qti-input-width-6" identifier="G2" match-max="1"></qti-gap><br />
              Gap 3: <qti-gap class="qti-input-width-6" identifier="G3" match-max="1"></qti-gap>
            </p>
          </blockquote>
        `
      )
    )}`,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiGapMatchInteraction>('qti-gap-match-interaction')!;
    const gap1 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G1"]')!;
    const gap2 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G2"]')!;
    const gap3 = canvasElement.querySelector<HTMLElement>('qti-gap[identifier="G3"]')!;
    const winter = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="W"]')!;
    const spring = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Sp"]')!;
    const summer = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="Su"]')!;
    const autumn = canvasElement.querySelector<HTMLElement>('qti-gap-text[identifier="A"]')!;
    const submit = canvasElement.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    await interaction.updateComplete;

    await step('Test QTI spec default max-associations=1 for gap-match', async () => {
      // QTI spec: gap-match interactions default to max-associations=1 if not specified
      // But this story explicitly sets max-associations=2
      expect(interaction.maxAssociations).toBe(2);
      expect(interaction.minAssociations).toBe(1);
    });

    await step('Test match-max constraints on gap-text elements', async () => {
      // Per QTI spec: match-max controls maximum usage of each choice
      await drag(spring, { to: gap1 }); // First use of spring
      await drag(spring, { to: gap2 }); // Second use of spring (should be allowed)

      await waitFor(() => {
        expect(gap1.querySelector('[identifier="Sp"]')).toBeTruthy();
        expect(gap2.querySelector('[identifier="Sp"]')).toBeTruthy();
        // Spring should now be disabled (match-max=2 reached)
        expect(window.getComputedStyle(spring).pointerEvents).toBe('none');
      });
    });

    await step('Test match-max=0 (unlimited) behavior', async () => {
      // Summer has match-max=0 which means unlimited usage per QTI spec
      await drag(summer, { to: gap3 });
      await waitFor(() => {
        expect(gap3.querySelector('[identifier="Su"]')).toBeTruthy();
        // Summer should still be available for more uses
        expect(window.getComputedStyle(summer).pointerEvents).toBe('auto');
      });
    });

    await step('Test directedPair response format', async () => {
      // QTI spec: gap-match responses are directedPair format "choice_id target_id"
      const response = interaction.response;
      expect(response).toContain('Sp G1');
      expect(response).toContain('Sp G2');
      expect(response).toContain('Su G3');
      expect(response.length).toBe(3);
    });

    await step('Test max-associations validation with custom message', async () => {
      // Try to exceed max-associations by adding one more
      gap1.removeAttribute('disabled'); // Allow replacement
      await drag(autumn, { to: gap1 }); // This should trigger max exceeded

      submit.click();
      interaction.reportValidity();

      const validationElement = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement;
      await waitFor(() => {
        expect(validationElement?.textContent).toContain('Custom max message');
      });
    });
  }
};
