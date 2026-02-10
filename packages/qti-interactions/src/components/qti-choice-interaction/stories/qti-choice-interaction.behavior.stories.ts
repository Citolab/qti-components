import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '../../../elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

/**
 * ## Behavior Stories
 *
 * Tests for user interaction behavior: selection, deselection, events, and interaction logic.
 * These tests verify how the component responds to user actions.
 *
 * These tests are mostly SPECIFIC to qti-choice-interaction.
 */
const meta: Meta<QtiChoiceInteraction> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/Behavior',
  tags: ['behavior', 'specific']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const baseTemplate = (args: Partial<QtiChoiceInteraction> = {}) => html`
  <qti-choice-interaction
    name="RESPONSE"
    max-choices=${args.maxChoices ?? 4}
    min-choices=${args.minChoices ?? 0}
    data-testid="interaction"
  >
    <qti-prompt><p>Select options</p></qti-prompt>
    <qti-simple-choice identifier="A">Option A</qti-simple-choice>
    <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    <qti-simple-choice identifier="D">Option D</qti-simple-choice>
  </qti-choice-interaction>
`;

const getElements = (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
  const choiceA = canvas.queryByText<QtiSimpleChoice>('Option A');
  const choiceB = canvas.queryByText<QtiSimpleChoice>('Option B');
  const choiceC = canvas.queryByText<QtiSimpleChoice>('Option C');
  const choiceD = canvas.queryByText<QtiSimpleChoice>('Option D');
  const choices = {
    A: choiceA!,
    B: choiceB!,
    C: choiceC,
    D: choiceD
  };
  return { canvas, interaction, choices };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE SELECTION (Radio Behavior)
// ═══════════════════════════════════════════════════════════════════════════════

export const SingleSelection: Story = {
  name: 'Single Selection (max-choices=1)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const { interaction, choices } = getElements(canvasElement);

    await step('Select first option', async () => {
      await fireEvent.click(choices.A);
      expect(interaction.response).toBe('A');
      expect(choices.A.internals.states.has('--checked')).toBe(true);
    });

    await step('Select second option - replaces first', async () => {
      await fireEvent.click(choices.B);
      expect(interaction.response).toBe('B');
      expect(choices.A.internals.states.has('--checked')).toBe(false);
      expect(choices.B.internals.states.has('--checked')).toBe(true);
    });

    await step('Select third option - replaces second', async () => {
      await fireEvent.click(choices.C);
      expect(interaction.response).toBe('C');
      expect(choices.B.internals.states.has('--checked')).toBe(false);
      expect(choices.C.internals.states.has('--checked')).toBe(true);
    });
  }
};

export const SingleSelectionDeselect: Story = {
  name: 'Single Selection - Deselect',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Select
    await fireEvent.click(choices.A);
    expect(interaction.response).toBe('A');

    // Click same choice to deselect
    await fireEvent.click(choices.A);
    expect(interaction.response).toBe('');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MULTIPLE SELECTION (Checkbox Behavior)
// ═══════════════════════════════════════════════════════════════════════════════

export const MultipleSelection: Story = {
  name: 'Multiple Selection (max-choices > 1)',
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement, step }) => {
    const { interaction, choices } = getElements(canvasElement);

    await step('Select first option', async () => {
      await fireEvent.click(choices.A);
      expect(interaction.response).toContain('A');
    });

    await step('Select second option - adds to selection', async () => {
      await fireEvent.click(choices.B);
      expect(interaction.response).toContain('A');
      expect(interaction.response).toContain('B');
    });

    await step('Deselect first option', async () => {
      await fireEvent.click(choices.A);
      expect(interaction.response).not.toContain('A');
      expect(interaction.response).toContain('B');
    });
  }
};

export const MultipleSelectionUnlimited: Story = {
  name: 'Multiple Selection - Unlimited (max-choices=0)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="0" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Select all
    await fireEvent.click(choices.A);
    await fireEvent.click(choices.B);
    await fireEvent.click(choices.C);
    await fireEvent.click(choices.D);

    expect(interaction.response).toContain('A');
    expect(interaction.response).toContain('B');
    expect(interaction.response).toContain('C');
    expect(interaction.response).toContain('D');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE CHANGES
// ═══════════════════════════════════════════════════════════════════════════════

export const RoleRadioGroupDefault: Story = {
  name: 'Role: radiogroup (no max-choices attribute)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    expect(interaction.internals.role).toBe('radiogroup');
    expect(choices.A.internals.role).toBe('radio');
    expect(choices.B.internals.role).toBe('radio');
  }
};

export const RoleRadioGroup: Story = {
  name: 'Role: radiogroup (max-choices=1)',
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    expect(interaction.internals.role).toBe('radiogroup');
    expect(choices.A.internals.role).toBe('radio');
    expect(choices.B.internals.role).toBe('radio');
  }
};

export const RoleCheckboxGroup: Story = {
  name: 'Role: group (max-choices > 1)',
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // When max-choices > 1, choices should be checkboxes
    expect(choices.A.internals.role).toBe('checkbox');
    expect(choices.B.internals.role).toBe('checkbox');
  }
};

export const RoleChangesDynamically: Story = {
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="1" data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Initially radio
    expect(choices.A.internals.role).toBe('radio');

    // Change to multiple
    interaction.maxChoices = 4;
    await interaction.updateComplete;

    // Now checkbox
    expect(choices.A.internals.role).toBe('checkbox');

    // Change back to single
    interaction.maxChoices = 1;
    await interaction.updateComplete;

    // Back to radio
    expect(choices.A.internals.role).toBe('radio');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT DISPATCHING
// ═══════════════════════════════════════════════════════════════════════════════

export const EventOnEachSelection: Story = {
  name: 'Event Fires on Each Selection',
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    const spy = fn();
    interaction.addEventListener('qti-interaction-response', spy);

    await fireEvent.click(choices.A);
    expect(spy).toHaveBeenCalledTimes(1);

    await fireEvent.click(choices.B);
    expect(spy).toHaveBeenCalledTimes(2);

    await fireEvent.click(choices.A); // Deselect
    expect(spy).toHaveBeenCalledTimes(3);
  }
};

export const EventDetail: Story = {
  name: 'Event Detail Content',
  tags: ['behavior', 'specific', 'xfail'],
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    let lastEvent: CustomEvent | null = null;
    interaction.addEventListener('qti-interaction-response', e => {
      lastEvent = e as CustomEvent;
    });

    await fireEvent.click(choices.A);
    expect(lastEvent?.detail.responseIdentifier).toBeDefined();
    expect(lastEvent?.detail.response).toContain('A');

    await fireEvent.click(choices.B);
    expect(lastEvent?.detail.response).toContain('A');
    expect(lastEvent?.detail.response).toContain('B');
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAMMATIC SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

export const ProgrammaticSelection: Story = {
  name: 'Programmatic Selection via response',
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Set response programmatically
    interaction.response = ['A', 'C'];
    await interaction.updateComplete;

    // Check visual state
    expect(choices.A.internals.states.has('--checked')).toBe(true);
    expect(choices.B.internals.states.has('--checked')).toBe(false);
    expect(choices.C.internals.states.has('--checked')).toBe(true);
    expect(choices.D.internals.states.has('--checked')).toBe(false);
  }
};

export const ProgrammaticSelectionViaValue: Story = {
  name: 'Programmatic Selection via value',
  render: () => baseTemplate({ maxChoices: 4 }),
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Set value programmatically (comma-separated)
    interaction.value = 'B,D';
    await interaction.updateComplete;

    // Check visual state
    expect(choices.A.internals.states.has('--checked')).toBe(false);
    expect(choices.B.internals.states.has('--checked')).toBe(true);
    expect(choices.C.internals.states.has('--checked')).toBe(false);
    expect(choices.D.internals.states.has('--checked')).toBe(true);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DISABLED CHOICES
// ═══════════════════════════════════════════════════════════════════════════════

export const DisabledInteraction: Story = {
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" disabled data-testid="interaction">
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    expect(interaction.disabled).toBe(true);

    // Click should not work
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe(null);
  }
};

export const DisabledChoice: Story = {
  name: 'Disabled Individual Choice',
  tags: ['behavior', 'specific', 'xfail'],
  render: () => html`
    <qti-choice-interaction name="RESPONSE" max-choices="4" data-testid="interaction">
      <qti-simple-choice identifier="A" disabled>Option A (disabled)</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    </qti-choice-interaction>
  `,
  play: async ({ canvasElement }) => {
    const { interaction, choices } = getElements(canvasElement);

    // Click disabled choice - should not work
    await fireEvent.click(choices.A);
    expect(interaction.value).toBe(null);

    // Click enabled choice - should work
    await fireEvent.click(choices.B);
    expect(interaction.value).toBe('B');
  }
};
