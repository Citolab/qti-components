import { html, nothing } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import uk from '../fixtures/uk.png';
import airport from '../fixtures/airport.svg';

import type { QtiPositionObjectInteraction } from '../qti-position-object-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj<QtiPositionObjectInteraction>;

/**
 * ## Behavior Stories
 *
 * Tests for how the position object interaction places copies of its object on the stage: with
 * the keyboard, by clicking the object and then the stage, by dragging, up to `max-choices`, with
 * a `center-point`, on a stage image shown larger than its own size, and restored from a
 * `response`. The stage image is 206x280, the object 30x30. Each story is also a test.
 */
const meta: Meta<QtiPositionObjectInteraction> = {
  component: 'qti-position-object-interaction',
  title: 'Interactions/Position Object/Behavior',
  tags: ['behavior', 'specific', 'iol']
};
export default meta;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const STAGE_ALT = 'Map of the United Kingdom';

const stageTemplate = (
  attributes: { maxChoices?: number; centerPoint?: string; response?: string; stageStyle?: string } = {}
) => html`
  <qti-position-object-stage>
    <img src=${uk} alt=${STAGE_ALT} width="206" height="280" style=${attributes.stageStyle ?? nothing} />
    <qti-position-object-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      max-choices=${attributes.maxChoices ?? 1}
      center-point=${attributes.centerPoint ?? nothing}
      response=${attributes.response ?? nothing}
    >
      <img src=${airport} alt="Airport" width="30" height="30" />
    </qti-position-object-interaction>
  </qti-position-object-stage>
`;

const settle = async (interaction: QtiPositionObjectInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await interaction.updateComplete;
};

const pointer = (type: string, target: EventTarget, client: { x: number; y: number }) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      button: 0,
      pointerId: 1,
      isPrimary: true,
      clientX: client.x,
      clientY: client.y
    })
  );

const centreOf = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const getElements = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const interaction = canvas.getByTestId<QtiPositionObjectInteraction>('interaction');
  const stageImage = canvas.getByRole<HTMLImageElement>('img', { name: STAGE_ALT });
  await stageImage.decode();
  await settle(interaction);
  const object = () => within(interaction).getByShadowRole('button', { name: 'Place Airport' });
  const copies = () => within(interaction).queryAllByShadowRole('button', { name: /^Airport at / });
  /** A client position at an offset from the stage image's top-left, in CSS pixels. */
  const onStage = (x: number, y: number) => {
    const rect = stageImage.getBoundingClientRect();
    return { x: rect.left + x, y: rect.top + y };
  };
  return { interaction, stageImage, object, copies, onStage };
};

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export const Keyboard: Story = {
  name: 'Keyboard - Enter places at the centre, arrows move, Delete removes',
  render: () => stageTemplate(),
  play: async ({ canvasElement, step }) => {
    const { interaction, object, copies } = await getElements(canvasElement);

    await step('Enter on the object places a copy at the stage centre', async () => {
      object().focus();
      await userEvent.keyboard('{Enter}');
      await settle(interaction);
      expect(interaction.response).toEqual(['103 140']);
      expect(copies()).toHaveLength(1);
      expect(interaction.shadowRoot!.activeElement).toBe(copies()[0]);
    });

    await step('Shift+ArrowRight moves the copy ten', async () => {
      await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
      await settle(interaction);
      expect(interaction.response).toEqual(['113 140']);
    });

    await step('Delete removes it and focus returns to the object', async () => {
      copies()[0].focus();
      await userEvent.keyboard('{Delete}');
      await settle(interaction);
      expect(interaction.response).toEqual([]);
      expect(copies()).toHaveLength(0);
      expect(interaction.shadowRoot!.activeElement).toBe(object());
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLICK AND DRAG
// ═══════════════════════════════════════════════════════════════════════════════

export const ClickToPlace: Story = {
  name: 'Click - the object, then the stage',
  render: () => stageTemplate(),
  play: async ({ canvasElement, step }) => {
    const { interaction, stageImage, object, onStage } = await getElements(canvasElement);

    await step('a click on the object selects it', async () => {
      const at = centreOf(object());
      pointer('pointerdown', object(), at);
      pointer('pointerup', object(), at);
      await settle(interaction);
      expect(object().getAttribute('part')?.split(' ')).toContain('selected');
      expect(object()).toHaveAttribute('aria-pressed', 'true');
    });

    await step('a click on the stage places it there', async () => {
      const at = onStage(50, 60);
      stageImage.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, clientX: at.x, clientY: at.y })
      );
      await settle(interaction);
      expect(interaction.response).toEqual(['50 60']);
      expect(object().getAttribute('part')?.split(' ')).not.toContain('selected');
      expect(object()).toHaveAttribute('aria-pressed', 'false');
    });
  }
};

export const Drag: Story = {
  name: 'Drag - onto the stage places, off the stage removes',
  render: () => stageTemplate(),
  play: async ({ canvasElement, step }) => {
    const { interaction, object, copies, onStage } = await getElements(canvasElement);

    await step('dragging the object onto the stage places a copy at the pointer', async () => {
      pointer('pointerdown', object(), centreOf(object()));
      pointer('pointermove', window, onStage(40, 50));
      pointer('pointermove', window, onStage(80, 100));
      pointer('pointerup', window, onStage(80, 100));
      await settle(interaction);
      expect(interaction.response).toEqual(['80 100']);
      expect(copies()).toHaveLength(1);
    });

    await step('dragging the copy off the stage removes it', async () => {
      const copy = copies()[0];
      pointer('pointerdown', copy, centreOf(copy));
      pointer('pointermove', window, onStage(150, 100));
      pointer('pointermove', window, onStage(400, 100));
      pointer('pointerup', window, onStage(400, 100));
      await settle(interaction);
      expect(interaction.response).toEqual([]);
      expect(copies()).toHaveLength(0);
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const MaxChoices: Story = {
  name: 'max-choices - at two copies the object is used',
  render: () => stageTemplate({ maxChoices: 2 }),
  play: async ({ canvasElement }) => {
    const { interaction, object, copies } = await getElements(canvasElement);

    for (let i = 0; i < 2; i++) {
      object().focus();
      await userEvent.keyboard('{Enter}');
      await settle(interaction);
    }
    expect(interaction.response).toHaveLength(2);
    expect(interaction.internals.states.has('used')).toBe(true);
    expect(object().getAttribute('part')?.split(' ')).toContain('used');

    object().focus();
    await userEvent.keyboard('{Enter}');
    await settle(interaction);
    expect(interaction.response).toHaveLength(2);
    expect(copies()).toHaveLength(2);
  }
};

export const CenterPoint: Story = {
  name: 'center-point - "0 0" puts the top-left of a copy on the point',
  render: () => stageTemplate({ centerPoint: '0 0' }),
  play: async ({ canvasElement }) => {
    const { interaction, stageImage, object, copies } = await getElements(canvasElement);

    object().focus();
    await userEvent.keyboard('{Enter}');
    await settle(interaction);
    expect(interaction.response).toEqual(['103 140']);

    const stage = stageImage.getBoundingClientRect();
    const copy = copies()[0].getBoundingClientRect();
    expect(copy.left).toBeCloseTo(stage.left + 103, 0);
    expect(copy.top).toBeCloseTo(stage.top + 140, 0);
  }
};

export const ScaledStage: Story = {
  name: 'Scaling - a stage shown at twice its size answers in its own pixels',
  render: () => stageTemplate({ stageStyle: 'width:412px' }),
  play: async ({ canvasElement }) => {
    const { interaction, stageImage, object, onStage } = await getElements(canvasElement);
    await waitFor(() => expect(stageImage.getBoundingClientRect().width).toBeCloseTo(412, 0));

    const at = centreOf(object());
    pointer('pointerdown', object(), at);
    pointer('pointerup', object(), at);
    await settle(interaction);

    const click = onStage(100, 120);
    stageImage.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, clientX: click.x, clientY: click.y })
    );
    await settle(interaction);
    expect(interaction.response).toEqual(['50 60']);
  }
};

export const RestoreResponse: Story = {
  name: 'Restore - a response attribute renders its copies',
  render: () => stageTemplate({ maxChoices: 3, response: '20 30,40 50' }),
  play: async ({ canvasElement }) => {
    const { interaction, copies } = await getElements(canvasElement);

    expect(interaction.response).toEqual(['20 30', '40 50']);
    expect(copies()).toHaveLength(2);
    expect(within(interaction).getByShadowRole('button', { name: 'Airport at 20, 30' })).toBeTruthy();
    expect(within(interaction).getByShadowRole('button', { name: 'Airport at 40, 50' })).toBeTruthy();
  }
};
