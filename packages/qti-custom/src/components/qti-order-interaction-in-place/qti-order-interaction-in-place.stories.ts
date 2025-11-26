import { html } from 'lit';
import { expect, fireEvent, fn, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { getAssessmentItemFromItemContainer } from 'tools/testing/test-utils';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { drag } from './drag';
import './qti-order-interaction-in-place.css';
import styles from './qti-order-interaction-in-place.css?inline';

import type { Interaction } from '@qti-components/base';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiOrderInteractionInPlace } from './qti-order-interaction-in-place';
import type { QtiSimpleChoice } from '@qti-components/interactions';

import './qti-order-interaction-in-place';

const { events, args, argTypes, template } = getStorybookHelpers('qti-order-interaction-in-place', {
  excludeCategories: ['cssParts', 'cssProps', 'cssStates', 'events', 'properties', 'slots', 'methods']
});

type Story = StoryObj<QtiOrderInteractionInPlace & typeof args>;

const meta: Meta = {
  component: 'qti-order-interaction-in-place',
  argTypes: argTypes,
  args: {
    'data-choices-container-width': '200'
  }
};

export default meta;

export const OrderTemplate = args =>
  template(
    args,
    html` <qti-prompt> Arrange the planets in alphabetic order: </qti-prompt>
      <qti-simple-choice identifier="earth">Earth</qti-simple-choice>
      <qti-simple-choice identifier="mars">Mars</qti-simple-choice>
      <qti-simple-choice identifier="mercury">Mercury</qti-simple-choice>
      <qti-simple-choice identifier="venus">Venus</qti-simple-choice>`
  );

export const Playground: Story = {
  render: args => OrderTemplate(args)
};

export const Vertical: Story = {
  render: Playground.render,
  args: { orientation: 'vertical' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const EarthChoice = canvas.getByText<QtiSimpleChoice>('Earth');
    const MarsChoice = canvas.getByText<QtiSimpleChoice>('Mars');
    expect(EarthChoice).toBePositionedRelativeTo(MarsChoice, 'above');
  }
};

export const Horizontal: Story = {
  render: Playground.render,
  args: { orientation: 'horizontal' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const EarthChoice = canvas.getByText<QtiSimpleChoice>('Earth');
    const MarsChoice = canvas.getByText<QtiSimpleChoice>('Mars');
    expect(EarthChoice).toBePositionedRelativeTo(MarsChoice, 'left');
  }
};

export const Readonly: Story = {
  render: Playground.render,
  args: { readonly: true }
};

export const Disabled: Story = {
  render: Playground.render,
  args: {
    disabled: true
  }
};

const formTemplate = (args, context) => html`
  <form role="form" @submit=${e => e.preventDefault()}>
    ${Playground.render(args, context)}
    <input type="submit" value="submit" />
  </form>
`;

export const Form: Story = {
  render: formTemplate,
  args: {
    name: 'RESPONSE',
    'data-testid': 'interaction'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form');
    const interaction = await canvas.findByTestId<Interaction>('interaction');
    const choiceA = canvas.getByText<QtiSimpleChoice>('Earth');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Mars');

    // console.log(interaction.value);
    // console.log(interaction.response);

    const formData = new FormData(form);

    await step('event', async () => {
      await drag(choiceA)
        .fromCenter()
        .pointerDown()
        .wait(200)
        .moveToElementCenter(choiceB)
        .wait(200)
        .pointerUpDocument()
        .run();

      await fireEvent.submit(form);

      await new Promise(resolve => requestAnimationFrame(resolve));

      console.log(formData.get('RESPONSE'));
      console.log(interaction.value);
      console.log(interaction.response);

      // const submittedValuesArray: string[] = (formData.get('RESPONSE') as string).split(',');
      // const expectedValues = ['A', 'B'];

      // expect(submittedValuesArray).toEqual(expect.arrayContaining(expectedValues));
    });
  }
};

export const LayoutHorizontal: Story = {
  args: {
    orientation: 'horizontal' as const
  },
  render: args => html`
    <qti-order-interaction-in-place response-identifier="RESPONSE" orientation=${args.orientation}>
      <qti-prompt> Arrange the planets in order from the Sun: </qti-prompt>
      <qti-simple-choice identifier="earth">Earth</qti-simple-choice>
      <qti-simple-choice identifier="mars">Mars</qti-simple-choice>
      <qti-simple-choice identifier="mercury">Mercury</qti-simple-choice>
      <qti-simple-choice identifier="venus">Venus</qti-simple-choice>
    </qti-order-interaction-in-place>
  `
};

export const WithManyItems: Story = {
  args: {
    orientation: 'vertical' as const
  },
  render: args => html`
    <qti-order-interaction-in-place response-identifier="RESPONSE" orientation=${args.orientation}>
      <qti-prompt> Arrange the numbers in ascending order: </qti-prompt>
      <qti-simple-choice identifier="seven">7</qti-simple-choice>
      <qti-simple-choice identifier="three">3</qti-simple-choice>
      <qti-simple-choice identifier="nine">9</qti-simple-choice>
      <qti-simple-choice identifier="one">1</qti-simple-choice>
      <qti-simple-choice identifier="five">5</qti-simple-choice>
      <qti-simple-choice identifier="eight">8</qti-simple-choice>
      <qti-simple-choice identifier="two">2</qti-simple-choice>
      <qti-simple-choice identifier="six">6</qti-simple-choice>
      <qti-simple-choice identifier="four">4</qti-simple-choice>
    </qti-order-interaction-in-place>
  `
};

export const InteractiveTest: Story = {
  args: {
    orientation: 'vertical' as const
  },
  render: args => html`
    <qti-order-interaction-in-place
      data-testid="order-in-place-interaction"
      response-identifier="RESPONSE"
      orientation=${args.orientation}
      disable-animations
    >
      <qti-prompt>Arrange the following historical events in chronological order (earliest first):</qti-prompt>
      <qti-simple-choice identifier="EventA">World War I begins (1914)</qti-simple-choice>
      <qti-simple-choice identifier="EventB">Titanic sinks (1912)</qti-simple-choice>
      <qti-simple-choice identifier="EventC">World War II begins (1939)</qti-simple-choice>
      <qti-simple-choice identifier="EventD">Moon landing (1969)</qti-simple-choice>
    </qti-order-interaction-in-place>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = await canvas.findByTestId<QtiOrderInteractionInPlace>('order-in-place-interaction');

    // Wait for component initialization
    await interaction.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Verify initial order', async () => {
        const initialResponse = interaction.response;
        expect(initialResponse).toEqual(['EventA', 'EventB', 'EventC', 'EventD']);
      });

      await step('Drag items to reorder them', async () => {
        const choiceA = canvas.getByText<QtiSimpleChoice>('World War I begins (1914)');
        const choiceC = canvas.getByText<QtiSimpleChoice>('World War II begins (1939)');
        const initialResponse = [...interaction.response];

        // Clear callback to track this specific drag
        callback.mockClear();

        // Drag EventA to the position of EventC
        await drag(choiceA)
          .fromCenter()
          .pointerDown()
          .wait(50)
          .moveToElementCenter(choiceC)
          .wait(50)
          .pointerUpDocument()
          .run();

        const newResponse = interaction.response;

        // Verify the order changed
        expect(newResponse).not.toEqual(initialResponse);
        expect(newResponse.length).toBe(4);

        // Verify all events are still in the response
        expect(newResponse).toContain('EventA');
        expect(newResponse).toContain('EventB');
        expect(newResponse).toContain('EventC');
        expect(newResponse).toContain('EventD');

        // EventA should no longer be first
        expect(newResponse[0]).not.toBe('EventA');

        // Verify event was emitted during drag
        expect(callback).toHaveBeenCalled();
      });

      await step('Test manual response setting', async () => {
        // Test that we can manually set the response
        const testResponse = ['EventC', 'EventA', 'EventD', 'EventB'];
        interaction.response = testResponse;

        const newResponse = interaction.response;
        expect(newResponse).toEqual(testResponse);

        // Verify DOM was reordered to match
        const choices = Array.from(interaction.querySelectorAll('qti-simple-choice'));
        const domOrder = choices.map(c => c.getAttribute('identifier'));
        expect(domOrder).toEqual(testResponse);
      });

      await step('Test validation', async () => {
        const isValid = interaction.validate();
        expect(typeof isValid).toBe('boolean');
        expect(isValid).toBe(true); // Should be valid when choices are present
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

export const TouchDeviceTest: Story = {
  args: {
    orientation: 'horizontal' as const
  },
  render: args => html`
    <qti-order-interaction-in-place
      data-testid="touch-order-interaction"
      response-identifier="RESPONSE"
      orientation=${args.orientation}
      disable-animations
    >
      <qti-prompt>Test touch-specific styling and properties:</qti-prompt>
      <qti-simple-choice identifier="A">First</qti-simple-choice>
      <qti-simple-choice identifier="B">Second</qti-simple-choice>
      <qti-simple-choice identifier="C">Third</qti-simple-choice>
    </qti-order-interaction-in-place>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = await canvas.findByTestId<QtiOrderInteractionInPlace>('touch-order-interaction');

    // Wait for component initialization to complete
    await interaction.updateComplete;

    // Wait for drag-drop setup to complete and response to be initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    const choices = Array.from(interaction.querySelectorAll('qti-simple-choice'));

    await step('Verify touch-specific properties are configured', async () => {
      // Verify component is initialized
      expect(choices.length).toBe(3);
      expect(interaction.getAttribute('orientation')).toBe('horizontal');

      // Verify initial order
      const initialResponse = interaction.response;
      expect(initialResponse).toEqual(['A', 'B', 'C']);

      // Verify touch-specific CSS properties are set to prevent default touch behaviors
      choices.forEach(choice => {
        const computedStyle = window.getComputedStyle(choice);

        // Touch action should be disabled to prevent scrolling/zooming during drag
        expect(computedStyle.touchAction).toBe('none');

        // User select should be disabled to prevent text selection on touch
        expect(computedStyle.userSelect).toBe('none');

        // Should have grab cursor for visual feedback
        expect(computedStyle.cursor).toContain('grab');

        // Should be focusable for accessibility
        expect(choice.getAttribute('tabindex')).toBe('0');
        expect(choice.getAttribute('qti-draggable')).toBe('true');
      });
    });

    await step('Test drag and drop reordering', async () => {
      // Get fresh references to choices
      const choiceA = choices[0];
      const choiceC = choices[2];

      // Verify initial order
      expect(interaction.response).toEqual(['A', 'B', 'C']);

      // Drag first choice (A) to the position of third choice (C)
      await drag(choiceA)
        .fromCenter()
        .pointerDown()
        .wait(50)
        .moveToElementCenter(choiceC)
        .wait(50)
        .pointerUpDocument()
        .run();

      // Wait for any updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the order has changed
      const newResponse = interaction.response;
      expect(newResponse).not.toEqual(['A', 'B', 'C']);

      // A should have moved to the right, expected order: ['B', 'C', 'A'] or ['B', 'A', 'C']
      expect(newResponse[0]).not.toBe('A'); // A should no longer be first
      expect(newResponse).toContain('A');
      expect(newResponse).toContain('B');
      expect(newResponse).toContain('C');
    });
  }
};

export const KeyboardAccessibilityTest: Story = {
  args: {
    orientation: 'vertical' as const
  },
  render: args => html`
    <qti-order-interaction-in-place
      data-testid="keyboard-order-interaction"
      response-identifier="RESPONSE"
      orientation=${args.orientation}
      disable-animations
    >
      <qti-prompt>Test keyboard accessibility:</qti-prompt>
      <qti-simple-choice identifier="K1">First Item</qti-simple-choice>
      <qti-simple-choice identifier="K2">Second Item</qti-simple-choice>
      <qti-simple-choice identifier="K3">Third Item</qti-simple-choice>
      <qti-simple-choice identifier="K4">Fourth Item</qti-simple-choice>
    </qti-order-interaction-in-place>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = await canvas.findByTestId<QtiOrderInteractionInPlace>('keyboard-order-interaction');

    // Wait for initialization
    await interaction.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const choices = Array.from(interaction.querySelectorAll('qti-simple-choice'));

    await step('Verify keyboard navigation setup', async () => {
      // Check that choices are present and have basic interactive properties
      expect(choices.length).toBe(4);

      choices.forEach(choice => {
        // Should have text content for identification
        expect(choice.textContent).toBeTruthy();

        // Should have identifier for tracking
        expect(choice.getAttribute('identifier')).toBeTruthy();

        // Should be a valid HTML element that can potentially receive focus
        expect(choice instanceof HTMLElement).toBe(true);
      });
    });

    await step('Test keyboard drag and drop functionality', async () => {
      // Check initial order
      const initialResponse = interaction.response;
      expect(initialResponse).toEqual(['K1', 'K2', 'K3', 'K4']);

      // Tab to the first choice and focus it
      const firstChoice = choices[0];
      firstChoice.focus();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify it's focused
      expect(document.activeElement).toBe(firstChoice);

      // Create a KeyboardEvent for Space key
      const spaceDownEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        composed: true,
        cancelable: true
      });

      // Press Space to start dragging
      firstChoice.dispatchEvent(spaceDownEvent);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the element has keyboard dragging state
      expect(firstChoice.hasAttribute('data-keyboard-dragging')).toBe(true);

      // Press ArrowDown to move to next drop position
      const arrowDownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        bubbles: true,
        composed: true,
        cancelable: true
      });
      firstChoice.dispatchEvent(arrowDownEvent);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Press Space/Enter to drop
      const spaceUpEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        composed: true,
        cancelable: true
      });
      firstChoice.dispatchEvent(spaceUpEvent);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify the dragging state is removed
      expect(firstChoice.hasAttribute('data-keyboard-dragging')).toBe(false);

      // Verify the order changed - first item should now be in second position
      const newResponse = interaction.response;
      expect(newResponse).not.toEqual(initialResponse);
      expect(newResponse[1]).toBe('K1'); // First item moved to second position
    });

    await step('Test keyboard focus management', async () => {
      // Test that we can focus on choices
      const firstChoice = choices[0];

      // Focus the first choice
      firstChoice.focus();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify it's focused
      expect(document.activeElement).toBe(firstChoice);

      // Test that programmatic response setting still works with keyboard setup
      const testOrder = ['K3', 'K1', 'K4', 'K2'];
      interaction.response = testOrder;

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(interaction.response).toEqual(testOrder);
    });

    await step('Verify content accessibility for screen readers', async () => {
      // Check that the interaction has a prompt for context
      const prompt = interaction.querySelector('qti-prompt');
      expect(prompt).toBeTruthy();
      expect(prompt?.textContent).toBeTruthy();

      // Choices should have clear text content for screen readers
      choices.forEach(choice => {
        expect(choice.textContent?.trim()).toBeTruthy();
        expect(choice.getAttribute('identifier')).toBeTruthy();
      });

      // Interaction should have a response identifier for form association
      expect(interaction.getAttribute('response-identifier')).toBeTruthy();
    });

    await step('Test disabled state accessibility', async () => {
      // Test that disabled state affects interaction behavior
      const initialResponse = [...interaction.response];

      interaction.disabled = true;
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify disabled property is set
      expect(interaction.disabled).toBe(true);

      // Response should still be accessible in disabled state
      expect(interaction.response).toEqual(initialResponse);

      // Re-enable for cleanup
      interaction.disabled = false;
      expect(interaction.disabled).toBe(false);
    });
  }
};

const mytemplate = `
<template>
  <style>
    ${styles}
/*
    qti-assessment-item {
      padding: 1rem;
      display: block;
      aspect-ratio: 4 / 3;
      width: 800px;

      border: 2px solid blue;
      transform: scale(0.5);
      transform-origin: top left;
    }

    /* Fix drag overlay positioning for scaled content */
    [data-dnd-overlay],
    .dnd-kit-overlay,
    [data-dnd-dragging-overlay] {
      transform: scale(0.5) !important;
      transform-origin: top left !important;
    }

    /* Alternative approach: hide overlay entirely if positioning can't be fixed */
    body > [data-dnd-overlay],
    body > .dnd-kit-overlay {
      display: none !important;
    }
*/
  </style>
</template>
`;

export const OrderInPlace: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/order_in_place.xml'
  },
  render: args =>
    html` <qti-item>
      <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
        ${unsafeHTML(mytemplate)}
      </item-container>
      <item-show-candidate-correction></item-show-candidate-correction>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = await getAssessmentItemFromItemContainer(canvasElement);

    const showCorrectButton = await canvas.findByShadowText(/Show candidate correction/i);

    const orderInteraction: QtiOrderInteractionInPlace = await waitFor(
      () => {
        const interaction = item.querySelector('qti-order-interaction-in-place') as QtiOrderInteractionInPlace;
        if (!interaction) throw new Error('Order interaction not found');
        return interaction;
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        // Check if the component has been properly set up by looking for choices
        const choices = orderInteraction.querySelectorAll('qti-simple-choice');
        if (choices.length === 0) throw new Error('Choices not ready');

        return choices;
      },
      { timeout: 5000 }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    const choices = Array.from(orderInteraction.querySelectorAll('qti-simple-choice'));

    await step('Reorder items by dragging', async () => {
      if (choices.length >= 2) {
        // Simulate dragging the first choice to change order
        await drag(choices[0])
          .fromCenter()
          .pointerDown()
          .wait(200)
          .moveToElementCenter(choices[1])
          .wait(200)
          .pointerUpDocument()
          .run();

        await new Promise(resolve => setTimeout(resolve, 300));
        await showCorrectButton.click();

        // const newChoices = Array.from(orderInteraction.querySelectorAll('qti-simple-choice'));
      }
    });

    // await step('Click on the Show Candidate Correction button', async () => {
    //   await showCorrectButton.click();

    //   // Wait a bit for the correction to be applied
    //   await new Promise(resolve => setTimeout(resolve, 200));

    //   await step('Verify candidate correction state is applied to order choices', async () => {
    //     // Get updated choices after potential reordering
    //     const updatedChoices = Array.from(orderInteraction.querySelectorAll('qti-simple-choice'));

    //     const hasCorrectStates = updatedChoices.some(
    //       choice =>
    //         choice.internals.states.has('candidate-correct') || choice.internals.states.has('candidate-incorrect')
    //     );

    //     expect(hasCorrectStates).toBe(true);

    //     updatedChoices.forEach(choice => {
    //       const hasState =
    //         choice.internals.states.has('candidate-correct') || choice.internals.states.has('candidate-incorrect');
    //       expect(hasState).toBe(true);
    //     });
    //   });
    // });
  }
};

export const OrderInPlaceComplete: Story = {
  args: {
    'item-url': 'assets/qti-test-package/items/order_in_place.xml'
  },
  render: args =>
    html` <qti-item>
      <div>
        <item-container style="display: block;width: 400px; height: 350px;" item-url=${args['item-url'] as string}>
          ${unsafeHTML(mytemplate)}
        </item-container>
        <item-show-correct-response></item-show-correct-response>
      </div>
    </qti-item>`,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const item = await getAssessmentItemFromItemContainer(canvasElement);

    const showCorrectButton = await canvas.findByShadowText(/Show correct response/i);

    const orderInteraction: QtiOrderInteractionInPlace = await waitFor(
      () => {
        const interaction = item.querySelector('qti-order-interaction-in-place') as QtiOrderInteractionInPlace;
        if (!interaction) throw new Error('Order interaction not found');
        return interaction;
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        // Check if the component has been properly set up by looking for choices
        const choices = orderInteraction.querySelectorAll('qti-simple-choice');
        if (choices.length === 0) throw new Error('Choices not ready');

        return choices;
      },
      { timeout: 5000 }
    );

    // Additional wait for the sortable system to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 1000));

    const choices = Array.from(orderInteraction.querySelectorAll('qti-simple-choice'));

    await step('Reorder items by dragging', async () => {
      if (choices.length >= 2) {
        await drag(choices[0])
          .fromCenter()
          .pointerDown()
          .wait(200)
          .moveToElementCenter(choices[1])
          .wait(200)
          .pointerUpDocument()
          .run();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    await step('Click on the Show Correct Response button', async () => {
      await showCorrectButton.click();

      await new Promise(resolve => setTimeout(resolve, 200));

      await step('Verify correct response is shown', async () => {
        // Check for the new correct order display
        const correctDisplay = orderInteraction.querySelector('.correct-order-display');
        expect(correctDisplay).toBeTruthy();

        // Check for the correct choice displays within the correct order display
        const correctChoiceDisplays = correctDisplay?.querySelectorAll('.correct-choice-display');
        expect(correctChoiceDisplays?.length).toBe(4);

        // Verify the order is correct by checking the text content
        // The correct order should be: EventA, EventB, EventC, EventD (based on the XML)
        const expectedTexts = [
          "The Wright brothers' first flight (1903)",
          'The first man on the moon (1969)',
          'The invention of the internet (1989)',
          'The launch of the first smartphone (2007)'
        ];

        correctChoiceDisplays?.forEach((display, index) => {
          const textContent = display.textContent?.trim();
          // Remove the order number (1, 2, 3, 4) from the beginning
          const choiceText = textContent?.replace(/^\d+/, '').trim();
          expect(choiceText).toBe(expectedTexts[index]);
        });
      });
    });
  }
};

export const CorrectOrderInline: Story = {
  render: args => OrderTemplate(args),
  args: {
    value: '["mars","venus","earth","mercury"]',
    'correct-response': '["earth", "mars", "mercury", "venus"]',
    'correct-inline': false,
    'correct-complete': false
  }
};
