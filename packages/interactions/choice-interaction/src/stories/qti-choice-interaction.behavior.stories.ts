import { html } from 'lit';
import { expect, fireEvent, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import { qtiTransformItem } from '@qti-components/transformers';

import { optionsRender, textOverflowRender } from './qti-choice-interaction.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

type Story = StoryObj<QtiChoiceInteraction>;

const xml = String.raw;

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
  title: 'Interactions/Choice/Behavior',
  tags: ['behavior', 'specific', 'iol']
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
      expect(choices.A.internals.states.has('checked')).toBe(true);
    });

    await step('Select second option - replaces first', async () => {
      await fireEvent.click(choices.B);
      expect(interaction.response).toBe('B');
      expect(choices.A.internals.states.has('checked')).toBe(false);
      expect(choices.B.internals.states.has('checked')).toBe(true);
    });

    await step('Select third option - replaces second', async () => {
      await fireEvent.click(choices.C);
      expect(interaction.response).toBe('C');
      expect(choices.B.internals.states.has('checked')).toBe(false);
      expect(choices.C.internals.states.has('checked')).toBe(true);
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

export const Choice: StoryObj = {
  render: () => {
    const shuffledQti = qtiTransformItem()
      .parse(
        xml`
            <qti-assessment-item>
              <qti-item-body>
                <qti-choice-interaction shuffle="true">
                  <qti-simple-choice identifier="A">Optie A</qti-simple-choice>
                  <qti-simple-choice identifier="B">Optie B</qti-simple-choice>
                  <qti-simple-choice identifier="C">Optie C</qti-simple-choice>
                </qti-choice-interaction>
              </qti-item-body>
            </qti-assessment-item>`
      )
      .shuffleInteractions()
      .html();

    return shuffledQti;
  },
  play: async ({ canvasElement, step }) => {
    await step('Verify simple choice is radio', async () => {
      const canvas = within(canvasElement);
      const ChoiceA = canvas.getByText<QtiSimpleChoice>('Optie A');
      expect(ChoiceA.internals.role).toBe('radio');
    });
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
    expect(choices.A.internals.states.has('checked')).toBe(true);
    expect(choices.B.internals.states.has('checked')).toBe(false);
    expect(choices.C.internals.states.has('checked')).toBe(true);
    expect(choices.D.internals.states.has('checked')).toBe(false);
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
    expect(choices.A.internals.states.has('checked')).toBe(false);
    expect(choices.B.internals.states.has('checked')).toBe(true);
    expect(choices.C.internals.states.has('checked')).toBe(false);
    expect(choices.D.internals.states.has('checked')).toBe(true);
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

// ═══════════════════════════════════════════════════════════════════════════════
// MOVED FROM THE OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════

/** Defaults, ARIA roles and selecting one choice after another, in a single pass. */
export const SelectionAndDefaults: Story = {
  render: optionsRender,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Option C');

    const spy = fn(e => e.detail.response);

    interaction.addEventListener('qti-interaction-response', spy);

    try {
      /* QTI */
      await step('response null', async () => {
        expect(interaction.value).toBe(null);
      });
      await step('default attribute values', async () => {
        expect(interaction.maxChoices).toBe(1);
        expect(interaction.minChoices).toBe(0); // unlimited
        expect(interaction.orientation).toBe('vertical');
        // expect(interaction.shuffle).toBe(false);
      });
      await step('children have default attribute values', async () => {
        expect(choiceA.identifier).not.toBe(null);
        expect(choiceB.identifier).not.toBe(null);
        expect(choiceC.identifier).not.toBe(null);
        expect(choiceA.templateIdentifier).toBe(null);
        expect(choiceA.showHide).toBe('show');
        expect(choiceA.fixed).toBe(false);
      });
      await step('initial state', async () => {
        expect(choiceA.internals.role).toBe('radio');
        expect(choiceB.internals.role).toBe('radio');
        expect(choiceC.internals.role).toBe('radio');
      });
      /* ACCESSIBILITY */
      await step('interaction and childreven have correct accessibility roles', async () => {
        expect(choiceA.internals.role).toBe('radio');
        expect(interaction['_internals'].role).toBe('radiogroup');
      });
      /* INTERACTION */
      await step('interaction', async () => {
        await fireEvent.click(choiceA);
        expect(choiceA.checked).toBeTruthy();
        expect(interaction.value).toBe('A');
        await fireEvent.click(choiceB);
        expect(choiceB.checked).toBeTruthy();
        expect(interaction.value).toBe('B');
        expect(choiceA.checked).toBeFalsy();
      });
      /* INTERNALS */
      await step('event called', async () => {
        expect(spy).toHaveBeenCalled();
      });
      await step('event detail', async () => {
        const receivedEvent = spy.mock.calls.at(0)[0];
        const expectedResponse = 'A';
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
      });
      await step('tab index', async () => {
        choiceA.focus();
        await expect(choiceA).toHaveFocus();
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', spy);
    }
  }
};

/** With `max-choices="2"` two choices can be selected and the response lists both. */
export const TwoChoicesSelected: Story = {
  render: optionsRender,
  args: {
    'response-identifier': 'RESPONSE',
    'min-choices': 1,
    'max-choices': 2
  } as Story['args'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const choiceA = canvas.getByText<QtiSimpleChoice>('Option A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Option B');

    // Set up a spy to check if 'qti-interaction-changed' event is triggered
    const interactionChangedSpy = fn();
    canvasElement.addEventListener('qti-interaction-response', interactionChangedSpy);

    // Simulate clicking choiceB
    await fireEvent.click(choiceA);
    await fireEvent.click(choiceB);

    expect(choiceA.checked).toBeTruthy();
    expect(choiceB.checked).toBeTruthy();

    // Assert that the 'qti-interaction-changed' event was called
    expect(interactionChangedSpy).toHaveBeenCalled();

    // Extract the event data from the spy's second call
    const event = interactionChangedSpy.mock.calls[1][0];

    // Define expected detail data
    const expectedDetail = {
      responseIdentifier: 'RESPONSE', // replace with actual response identifier if available
      response: ['A', 'B'] // assuming "B" is the expected response; adjust as needed
    };

    // Check that the event's detail matches expected data
    expect(event.detail).toEqual(expectedDetail);
  }
};

/** A long option wraps inside a 300px container and can still be selected. */
export const LongTextWraps: Story = {
  render: textOverflowRender,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiChoiceInteraction>('interaction');
    const choiceD = canvas.getByText<QtiSimpleChoice>(/This is a very long option text/);

    // Basic test setup from original test
    const spy = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', spy);

    try {
      // First perform the standard checks
      await step('response null', async () => {
        expect(interaction.value).toBe(null);
      });

      // Add text wrapping test
      await step('long text wrapping', async () => {
        // Get the actual width of the choice element
        const choiceDRect = choiceD.getBoundingClientRect();

        // Get the width of the container
        const containerRect = canvasElement.querySelector('div').getBoundingClientRect();

        // Check that the element's width doesn't exceed the container width
        expect(choiceDRect.width).toBeLessThanOrEqual(containerRect.width);

        // Optional: Check if choiceD element has any computed style that forces text wrapping
        const choiceDStyles = window.getComputedStyle(choiceD);
        expect(choiceDStyles.whiteSpace).not.toBe('nowrap');
      });

      // Test interaction with the long text option
      await step('interaction with long text option', async () => {
        await fireEvent.click(choiceD);
        expect(choiceD.checked).toBeTruthy();
        expect(interaction.value).toBe('D');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', spy);
    }
  }
};
