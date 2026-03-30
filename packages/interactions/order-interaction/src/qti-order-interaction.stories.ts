import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../tools/testing/drag';

import type { InputType } from 'storybook/internal/types';
import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiOrderInteraction } from './qti-order-interaction';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';

const getDropZone = (interaction: QtiOrderInteraction, index: number) =>
  interaction.shadowRoot?.querySelector(`drop-list[identifier="droplist${index}"]`) as HTMLElement;

type DragOptions = {
  to?: Element | { x: number; y: number };
  delta?: { x: number; y: number };
  steps?: number;
  duration?: number;
  offset?: { x: number; y: number };
};

type TouchCoords = {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
};

const dispatchTouchSequence = (
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  touches: TouchCoords[],
  changedTouches: TouchCoords[]
) => {
  const supportsNativeTouch = typeof Touch === 'function' && typeof TouchEvent === 'function';

  if (supportsNativeTouch) {
    const touchTarget = target instanceof Element ? target : document.body;
    const toTouch = (coords: TouchCoords, index: number) =>
      new Touch({
        identifier: index + 1,
        target: touchTarget,
        clientX: coords.clientX,
        clientY: coords.clientY,
        pageX: coords.pageX,
        pageY: coords.pageY,
        radiusX: 1,
        radiusY: 1,
        rotationAngle: 0,
        force: 0.5
      });

    const nativeTouches = touches.map(toTouch);
    const nativeChangedTouches = changedTouches.map(toTouch);
    const event = new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      touches: type === 'touchend' ? [] : nativeTouches,
      targetTouches: type === 'touchend' ? [] : nativeTouches,
      changedTouches: nativeChangedTouches
    });
    target.dispatchEvent(event);
    return;
  }

  // Fallback for runtimes without native Touch constructor support.
  const event = new Event(type, { bubbles: true, cancelable: true, composed: true }) as Event & {
    touches: TouchCoords[];
    targetTouches: TouchCoords[];
    changedTouches: TouchCoords[];
  };
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : touches });
  Object.defineProperty(event, 'targetTouches', { value: type === 'touchend' ? [] : touches });
  Object.defineProperty(event, 'changedTouches', { value: changedTouches });
  target.dispatchEvent(event);
};

const waitForNextResponse = (interaction: QtiOrderInteraction, timeoutMs = 1500) =>
  new Promise<string[]>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
      reject(new Error('Timed out waiting for qti-interaction-response'));
    }, timeoutMs);

    const onResponse = (event: CustomEvent<{ response: string[] }>) => {
      clearTimeout(timeout);
      resolve(event.detail.response);
    };
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener, { once: true });
  });

const settleInteraction = async (interaction: QtiOrderInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const dragAndWait = async (
  interaction: QtiOrderInteraction,
  element: Element,
  options: DragOptions,
  expectResponse = true
) => {
  const responsePromise = expectResponse ? waitForNextResponse(interaction) : Promise.resolve(null);
  await drag(element, { steps: 30, duration: 350, ...options });
  await responsePromise;
  await settleInteraction(interaction);
};

const { events, args, argTypes, template } = getStorybookHelpers('qti-order-interaction');

type Story = StoryObj<QtiOrderInteraction & typeof args>;

/**
 *
 * ### [3.2.10 Order Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.4n8gips6tlv4)
 * the candidate's task is to reorder the choices, the order in which the choices are displayed initially is significant.
 *
 */
const meta: Meta<QtiOrderInteraction & { class: InputType }> = {
  component: 'qti-order-interaction',
  title: '10 Order',
  args,
  argTypes: {
    ...argTypes,
    class: {
      options: ['qti-choices-top', 'qti-choices-bottom', 'qti-choices-left', 'qti-choices-right', 'qti-match-tabular'],
      control: { type: 'select' },
      table: { category: 'Styling' }
    }
  },
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'no-tests']
};
export default meta;

export const Default: Story = {
  render: args =>
    template(
      args,
      html`
        <qti-prompt
          >The following F1 drivers finished on the podium in the first ever Grand Prix of Bahrain. Can you rearrange
          them into the correct finishing order?</qti-prompt
        >
        <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice>
        <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice>
        <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice>
      `
    )
};

export const Test: Story = {
  render: () => {
    return html` <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
    >
      <qti-prompt>
        <p>Rearrange them into the correct finishing order.</p>
      </qti-prompt>
      <qti-simple-choice identifier="DriverA">Rubens Barrichello</qti-simple-choice>
      <qti-simple-choice identifier="DriverB">Jenson Button</qti-simple-choice>
      <qti-simple-choice identifier="DriverC">Michael Schumacher</qti-simple-choice>
    </qti-order-interaction>`;
  },
  args: {
    'min-choices': 1,
    'max-choices': 2
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    const dragA = canvas.getByText<QtiSimpleChoice>('Rubens Barrichello');
    const dragB = canvas.getByText<QtiSimpleChoice>('Jenson Button');
    const dragC = canvas.getByText<QtiSimpleChoice>('Michael Schumacher');

    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);

    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Drag 1 to drop and test response', async () => {
        await drag(dragA, { to: drops[0], duration: 500 });
        await drag(dragB, { to: drops[1], duration: 500 });
        await drag(dragC, { to: drops[2], duration: 500 });
        const receivedEvent = callback.mock.calls.at(-1)?.[0];
        const expectedResponse = ['DriverA', 'DriverB', 'DriverC'];
        expect(interaction.response).toEqual(expectedResponse.join(','));
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('reset interaction', async () => {
        interaction.reset();
        const receivedEvent = callback.mock.calls.at(-1)?.[0];
        const expectedResponse = ['', '', ''];
        expect(receivedEvent.detail.response).toEqual(expectedResponse);
        expect(interaction.response).toEqual(expectedResponse.join(','));
      });
      await step('set value of interaction', async () => {
        interaction.response = ['DriverA', 'DriverB', 'DriverC'];
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('disabled', async () => {
        interaction.disabled = true;
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
      await step('readonly', async () => {
        interaction.readonly = true;
        expect(drops[0]).toHaveTextContent('Rubens Barrichello');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Dragging a choice to a position slightly off-center of a dropzone should still activate it.
 * The mixin uses overlap-area detection (`findClosestDropzone`) — any non-zero overlap
 * with a dropzone rect triggers activation, so a 20px horizontal offset still lands correctly.
 */
export const DragOffCenter: Story = {
  name: 'Drag: off-center drag still activates nearest dropzone',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Drag 20px off-center from dropzone still lands in it', async () => {
      await drag(choiceA, { to: drops[0], duration: 300, offset: { x: 20, y: 0 } });
      expect(drops[0]).toHaveTextContent('Choice A');
    });
  }
};

/**
 * A drag movement smaller than MIN_DRAG_DISTANCE (5px) should not trigger a drop.
 * The mixin guards: `if (calculateDragDistance >= 5) isDragging = true` and returns
 * early from processDragMove without finding a closest dropzone if isDragging is false.
 */
export const MicroDragNoEffect: Story = {
  name: 'Drag: micro-movement below 5px threshold does not trigger drop',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Move 2px (Manhattan distance 4 < threshold 5) — no drop occurs', async () => {
      await drag(choiceA, { delta: { x: 2, y: 2 }, steps: 1, duration: 50 });
      expect(drops[0]).not.toHaveTextContent('Choice A');
      expect(drops[1]).not.toHaveTextContent('Choice A');
      expect(drops[2]).not.toHaveTextContent('Choice A');
    });
  }
};

/**
 * An item placed in a dropzone can be dragged back to the source area (drag container).
 * The mixin detects `draggedFromDropzone`, removes the clone, and restores the original
 * when the drop target is within the drag containers.
 */
export const DragAndReturn: Story = {
  name: 'Drag: item dragged from dropzone back to source area',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Drag Choice A to dropzone 0', async () => {
      await dragAndWait(interaction, choiceA, { to: drops[0] });
      expect(drops[0]).toHaveTextContent('Choice A');
    });

    await step('Drag Choice A back from dropzone 0 to source area', async () => {
      const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
      // Drag the placed clone back toward choiceA's position in the source slot
      await dragAndWait(interaction, placedA, { to: choiceA });
      expect(drops[0]).not.toHaveTextContent('Choice A');
    });
  }
};

/**
 * When only some choices are placed, the response array still has one entry per slot —
 * empty strings for unoccupied slots. This tests the ordered cardinality partial-response format.
 */
export const PartialOrder: Story = {
  name: 'Response: partial ordering returns empty string for unplaced slots',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Place A and B, leave C in source', async () => {
        await drag(choiceA, { to: drops[0], duration: 300 });
        await drag(choiceB, { to: drops[1], duration: 300 });
        expect(drops[0]).toHaveTextContent('Choice A');
        expect(drops[1]).toHaveTextContent('Choice B');
        expect(drops[2]).not.toHaveTextContent('Choice C');
      });

      await step('Response event carries partial array with empty string for unplaced slot', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A', 'B', '']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Compound: drag a choice to a slot, pick it up again and drop it in a different slot —
 * without returning to inventory. Tests that drag-from-dropzone removes the clone from
 * the source slot and the item lands cleanly in the new slot.
 */
export const MoveToAnotherSlot: Story = {
  name: 'Drag: pick up from dropzone and move to different slot',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Drag A to slot 0', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        expect(drops[0]).toHaveTextContent('Choice A');
      });

      await step('Pick up A from slot 0 and drop in slot 2', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: drops[2] });
        expect(drops[0]).not.toHaveTextContent('Choice A');
        expect(drops[2]).toHaveTextContent('Choice A');
      });

      await step('Response reflects new slot assignment', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['', '', 'A']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Compound: drag to a slot, pick up from that slot and drop it back in the same slot.
 * Tests that re-dropping in the same zone produces no duplicates and the response is stable.
 */
export const DropInSameSlot: Story = {
  name: 'Drag: pick up from slot and drop back in the same slot',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Drag A to slot 0', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        expect(drops[0]).toHaveTextContent('Choice A');
      });

      await step('Pick up A from slot 0 and drop back in slot 0', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: drops[0] });
        expect(drops[0]).toHaveTextContent('Choice A');
        // Exactly one copy of A — no duplicates
        expect(getDropZone(interaction, 0).querySelectorAll('[identifier="A"]').length).toBe(1);
      });

      await step('Response is unchanged — still A in slot 0', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A', '', '']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Compound: place → return to inventory → place in a different slot.
 * Tests the full inventory round-trip: after returning, the item is draggable again
 * and can be re-placed in any slot.
 */
export const InventoryRoundTrip: Story = {
  name: 'Drag: place → return to inventory → place in new slot',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Drag A to slot 0', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        expect(drops[0]).toHaveTextContent('Choice A');
      });

      await step('Drag A back from slot 0 to inventory', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: choiceA });
        expect(drops[0]).not.toHaveTextContent('Choice A');
      });

      await step('Drag A from inventory to slot 2', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[2] });
        expect(drops[0]).not.toHaveTextContent('Choice A');
        expect(drops[2]).toHaveTextContent('Choice A');
      });

      await step('Response reflects final slot assignment', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['', '', 'A']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Compound: fill all slots, return two items to inventory, then re-place them in swapped positions.
 * Tests the complete lifecycle: full placement → partial dismantling → re-ordering.
 * The expected final response is ['B', 'A', 'C'] after swapping A and B.
 */
export const FullReorderSequence: Story = {
  name: 'Drag: place all → return two → re-place in swapped positions',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Choice C');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Place A→slot0, B→slot1, C→slot2', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        await dragAndWait(interaction, choiceC, { to: drops[2] });
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A', 'B', 'C']);
      });

      await step('Return A from slot 0 to inventory', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: choiceA });
        expect(drops[0]).not.toHaveTextContent('Choice A');
      });

      await step('Return B from slot 1 to inventory', async () => {
        const placedB = getDropZone(interaction, 1).querySelector('[identifier="B"]') as HTMLElement;
        await dragAndWait(interaction, placedB, { to: choiceB });
        expect(drops[1]).not.toHaveTextContent('Choice B');
      });

      await step('Re-place B in slot 0 and A in slot 1 (swap positions)', async () => {
        await dragAndWait(interaction, choiceB, { to: drops[0] });
        await dragAndWait(interaction, choiceA, { to: drops[1] });
        expect(drops[0]).toHaveTextContent('Choice B');
        expect(drops[1]).toHaveTextContent('Choice A');
        expect(drops[2]).toHaveTextContent('Choice C');
      });

      await step('Final response is B, A, C', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['B', 'A', 'C']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * When fewer choices are placed than `min-associations`, `validate()` should return false.
 * The mixin compares `getValidAssociations()` count against `minAssociations`.
 */
export const MinAssociationsValidation: Story = {
  name: 'Validation: fewer placed choices than min-associations fails',
  render: () => html`
    <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
      min-associations="3"
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Place only 1 choice (below min-associations of 3)', async () => {
      await drag(choiceA, { to: drops[0], duration: 300 });
    });

    await step('validate() returns false when fewer than min-associations choices placed', async () => {
      expect(interaction.validate()).toBe(false);
    });
  }
};

/**
 * Once disabled, interaction should not accept new drags.
 */
export const DisabledBlocksDrag: Story = {
  name: 'State: disabled blocks dragging',
  render: () => html`
    <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
      disabled
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Attempt drag while disabled does not place choice', async () => {
      await drag(choiceA, { to: drops[0], duration: 300 });
      expect(drops[0]).not.toHaveTextContent('Choice A');
      expect(interaction.response).toEqual(',,');
    });
  }
};

/**
 * Readonly should block modifications.
 */
export const ReadonlyBlocksDrag: Story = {
  name: 'State: readonly blocks dragging',
  render: () => html`
    <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
      readonly
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Attempt drag while readonly does not place choice', async () => {
      await drag(choiceA, { to: drops[0], duration: 300 });
      expect(drops[0]).not.toHaveTextContent('Choice A');
      expect(interaction.response).toEqual(',,');
    });
  }
};

/**
 * With max-associations=1, only one total placement is allowed.
 */
export const MaxAssociationsEnforced: Story = {
  name: 'Validation: max-associations caps total placements',
  render: () => html`
    <qti-order-interaction
      data-testid="order-interaction"
      response-identifier="RESPONSE"
      orientation="horizontal"
      max-associations="1"
      data-max-selections-message="Max 1 placement allowed"
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    await step('Place first choice', async () => {
      await drag(choiceA, { to: drops[0], duration: 300 });
      expect(drops[0]).toHaveTextContent('Choice A');
    });

    await step('Second placement is blocked by max-associations', async () => {
      await drag(choiceB, { to: drops[1], duration: 300 });
      expect(drops[1]).not.toHaveTextContent('Choice B');
      expect(interaction.response).toEqual('A,,');
    });

    await step('validate() remains true when associations equal max-associations', async () => {
      expect(interaction.validate()).toBe(true);
      expect(interaction.internals.validationMessage).toBe('');
      expect(interaction.reportValidity()).toBe(true);
    });
  }
};

/**
 * `response` setter supports empty placeholders for unfilled slots.
 */
export const ResponseSetterWithEmptyPlaceholders: Story = {
  name: 'Response: setter handles empty placeholders',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    const drops = canvas.queryAllByShadowRole('region');

    await step('Set response with middle slot empty', async () => {
      interaction.response = ['A', '', 'C'];
      expect(drops[0]).toHaveTextContent('Choice A');
      expect(drops[1]).not.toHaveTextContent('Choice B');
      expect(drops[2]).toHaveTextContent('Choice C');
      expect(interaction.response).toEqual('A,,C');
    });
  }
};

/**
 * Order interaction custom correct response rendering should show and hide annotations.
 */
export const ToggleCorrectResponseRendersLabels: Story = {
  name: 'Correct response: toggle renders order labels',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    Object.defineProperty(interaction, 'responseVariable', {
      configurable: true,
      value: {
        correctResponse: ['A droplist0', 'B droplist1', 'C droplist2']
      }
    });

    await step('Show custom correct-response labels', async () => {
      interaction.toggleCorrectResponse(true);
      const labels = interaction.shadowRoot?.querySelectorAll('.correct-option') ?? [];
      expect(labels.length).toBe(3);
      expect(labels[0]).toHaveTextContent('Choice A');
      expect(labels[1]).toHaveTextContent('Choice B');
      expect(labels[2]).toHaveTextContent('Choice C');
    });

    await step('Hide labels again', async () => {
      interaction.toggleCorrectResponse(false);
      const labels = interaction.shadowRoot?.querySelectorAll('.correct-option') ?? [];
      expect(labels.length).toBe(0);
    });
  }
};

/**
 * Touch events should be able to trigger the same drag lifecycle as mouse events.
 */
export const TouchDragPath: Story = {
  name: 'Touch: touchstart/move/end places choice',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const drop0 = canvas.queryAllByShadowRole('region')[0];
    const startRect = choiceA.getBoundingClientRect();
    const endRect = drop0.getBoundingClientRect();

    const start = {
      clientX: startRect.left + startRect.width / 2,
      clientY: startRect.top + startRect.height / 2,
      pageX: startRect.left + startRect.width / 2,
      pageY: startRect.top + startRect.height / 2
    };

    const end = {
      clientX: endRect.left + endRect.width / 2,
      clientY: endRect.top + endRect.height / 2,
      pageX: endRect.left + endRect.width / 2,
      pageY: endRect.top + endRect.height / 2
    };

    await step('Dispatch touch sequence from choice to slot 0', async () => {
      dispatchTouchSequence(choiceA, 'touchstart', [start], [start]);
      dispatchTouchSequence(document, 'touchmove', [end], [end]);
      dispatchTouchSequence(document, 'touchend', [], [end]);
      expect(drop0).toHaveTextContent('Choice A');
      expect(interaction.response).toEqual('A,,');
    });
  }
};

export const VerticalBasicPlacement: Story = {
  name: 'Behavior: vertical basic placement',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="vertical">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await settleInteraction(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Choice C');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place all choices in vertical mode', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        await dragAndWait(interaction, choiceC, { to: drops[2] });
        expect(drops[0]).toHaveTextContent('Choice A');
        expect(drops[1]).toHaveTextContent('Choice B');
        expect(drops[2]).toHaveTextContent('Choice C');
      });

      await step('Response reflects vertical placement order', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A', 'B', 'C']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const VerticalInSlotReordering: Story = {
  name: 'Behavior: vertical sortable swap across occupied slots',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="vertical">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await settleInteraction(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Choice C');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place all choices first (vertical baseline)', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        await dragAndWait(interaction, choiceC, { to: drops[2] });
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A', 'B', 'C']);
      });

      await step('Drag placed A from slot0 onto occupied slot1 to sortable-swap', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: drops[1] });
        expect(drops[0]).toHaveTextContent('Choice B');
        expect(drops[1]).toHaveTextContent('Choice A');
        expect(drops[2]).toHaveTextContent('Choice C');
      });

      await step('Response reflects vertical sortable swap', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['B', 'A', 'C']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

/**
 * Tests the in-slot reordering capability provided by DragDropSlottedSortableMixin.
 * When an item is dragged from within a drop slot, it uses sortable mode which enables
 * reordering within that slot (or moving to another slot in sortable mode).
 *
 * This story demonstrates:
 * - Placing items into slots (slotted mode)
 * - Dragging a placed item triggers sortable mode (currentDragMode = 'sortable')
 * - The allowReorder property can disable in-slot sorting
 */
export const InSlotReordering: Story = {
  name: 'Behavior: sortable swap across occupied slots',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;

    // Additional wait for caching to complete
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Choice C');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn(e => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback);

    try {
      await step('Place all choices in slots (baseline)', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        await dragAndWait(interaction, choiceC, { to: drops[2] });
        expect(drops[0]).toHaveTextContent('Choice A');
        expect(drops[1]).toHaveTextContent('Choice B');
        expect(drops[2]).toHaveTextContent('Choice C');
      });

      await step('Baseline response reflects positions', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A', 'B', 'C']);
      });

      await step('Drag placed A from slot0 onto occupied slot1 to trigger sortable swap', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: drops[1] });
        expect(drops[0]).toHaveTextContent('Choice B');
        expect(drops[1]).toHaveTextContent('Choice A');
        expect(drops[2]).toHaveTextContent('Choice C');
      });

      await step('Response updates after sortable swap', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['B', 'A', 'C']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback);
    }
  }
};

/**
 * Sortable behavior should still work when not all slots are filled.
 * This specifically validates swap/reorder while one choice remains in inventory.
 */
export const InSlotReorderingPartial: Story = {
  name: 'Behavior: sortable swap with one item still in inventory',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction');
    await interaction.updateComplete;
    await settleInteraction(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place only A and B; keep C in inventory', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        expect(drops[0]).toHaveTextContent('Choice A');
        expect(drops[1]).toHaveTextContent('Choice B');
        expect(drops[2]).not.toHaveTextContent('Choice C');
      });

      await step('Partial baseline response contains empty last slot', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A', 'B', '']);
      });

      await step('Swap A and B by dragging placed A onto occupied slot1', async () => {
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await dragAndWait(interaction, placedA, { to: drops[1] });
        expect(drops[0]).toHaveTextContent('Choice B');
        expect(drops[1]).toHaveTextContent('Choice A');
        expect(drops[2]).not.toHaveTextContent('Choice C');
      });

      await step('Response reflects sortable swap with unfilled trailing slot', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['B', 'A', '']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const InSlotReorderingDisabled: Story = {
  name: 'Behavior: allowReorder=false blocks sortable swap for slot-origin drag',
  render: () => html`
    <qti-order-interaction data-testid="order-interaction" response-identifier="RESPONSE" orientation="horizontal">
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('order-interaction') as QtiOrderInteraction & {
      allowReorder: boolean;
    };
    await settleInteraction(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const choiceC = canvas.getByText<QtiSimpleChoice>('Choice C');
    const drops = canvas.queryAllByShadowRole('region');

    const callback = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Place all choices in slots first', async () => {
        await dragAndWait(interaction, choiceA, { to: drops[0] });
        await dragAndWait(interaction, choiceB, { to: drops[1] });
        await dragAndWait(interaction, choiceC, { to: drops[2] });
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A', 'B', 'C']);
      });

      await step('Disable sortable mode and attempt occupied-slot reorder', async () => {
        interaction.allowReorder = false;
        const placedA = getDropZone(interaction, 0).querySelector('[identifier="A"]') as HTMLElement;
        await drag(placedA, { to: drops[1], steps: 30, duration: 350 });
        await settleInteraction(interaction);
      });

      await step('Order remains unchanged when allowReorder is false', async () => {
        expect(drops[0]).toHaveTextContent('Choice A');
        expect(drops[1]).toHaveTextContent('Choice B');
        expect(drops[2]).toHaveTextContent('Choice C');
        expect(interaction.response).toEqual('A,B,C');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};
