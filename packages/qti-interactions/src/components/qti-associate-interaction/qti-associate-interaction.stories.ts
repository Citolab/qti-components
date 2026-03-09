import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, fn } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

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
  }
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`
      ${template(
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
      )}
    `;
  }
};

const settle = async (interaction: QtiAssociateInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const getDropZone = (interaction: QtiAssociateInteraction, identifier: string) => {
  // No semantic role/test-id exists for these internal drop zones.
  return interaction.shadowRoot?.querySelector(`.dl[identifier="${identifier}"]`) as HTMLElement;
};

export const Test: Story = {
  name: 'Test: response and pairing behavior',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-prompt>Match each character to their rival.</qti-prompt>
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const brutus = canvas.getByText('Brutus');
    const capulet = canvas.getByText('Capulet');
    const demetrius = canvas.getByText('Demetrius');

    const left0 = getDropZone(interaction, 'droplist0_left');
    const right0 = getDropZone(interaction, 'droplist0_right');
    const left1 = getDropZone(interaction, 'droplist1_left');
    const right1 = getDropZone(interaction, 'droplist1_right');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Drag A and B into pair 0', async () => {
        await drag(antonio, { to: left0, duration: 300 });
        await settle(interaction);
        await drag(brutus, { to: right0, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Antonio');
        expect(right0).toHaveTextContent('Brutus');
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A B']);
        expect(interaction.response).toEqual('A B');
      });

      await step('Drag C and D into pair 1', async () => {
        await drag(capulet, { to: left1, duration: 300 });
        await settle(interaction);
        await drag(demetrius, { to: right1, duration: 300 });
        await settle(interaction);

        expect(left1).toHaveTextContent('Capulet');
        expect(right1).toHaveTextContent('Demetrius');
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A B', 'C D']);
        expect(interaction.response).toEqual('A B,C D');
      });

      await step('Reset clears all pairings', async () => {
        interaction.reset();
        await settle(interaction);
        expect(left0).not.toHaveTextContent('Antonio');
        expect(right0).not.toHaveTextContent('Brutus');
        expect(left1).not.toHaveTextContent('Capulet');
        expect(right1).not.toHaveTextContent('Demetrius');
      });

      await step('Setting response programmatically rebuilds pair 0', async () => {
        interaction.response = ['A B'];
        await settle(interaction);
        expect(left0).toHaveTextContent('Antonio');
        expect(right0).toHaveTextContent('Brutus');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

/**
 * Sortable behavior with partial placement:
 * one complete pair and one incomplete row should still allow cross-row swap,
 * while response only includes complete pairs.
 */
export const SortableCrossRowSwapPartial: Story = {
  name: 'Behavior: sortable swap with partial placement',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const brutus = canvas.getByText('Brutus');
    const capulet = canvas.getByText('Capulet');

    const left0 = getDropZone(interaction, 'droplist0_left');
    const right0 = getDropZone(interaction, 'droplist0_right');
    const left1 = getDropZone(interaction, 'droplist1_left');
    const right1 = getDropZone(interaction, 'droplist1_right');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Create one complete pair (A-B) and one partial row (C in left1 only)', async () => {
        await drag(antonio, { to: left0, duration: 300 });
        await settle(interaction);
        await drag(brutus, { to: right0, duration: 300 });
        await settle(interaction);
        await drag(capulet, { to: left1, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Antonio');
        expect(right0).toHaveTextContent('Brutus');
        expect(left1).toHaveTextContent('Capulet');
        expect(right1).not.toHaveTextContent('Demetrius');

        // Only complete pairs are emitted
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A B']);
        expect(interaction.response).toEqual('A B');
      });

      await step('Drag placed A onto occupied left1 to swap with C', async () => {
        const placedA = getDropZone(interaction, 'droplist0_left').querySelector('[identifier="A"]') as HTMLElement;
        await drag(placedA, { to: left1, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Capulet');
        expect(right0).toHaveTextContent('Brutus');
        expect(left1).toHaveTextContent('Antonio');
        expect(right1).not.toHaveTextContent('Demetrius');
      });

      await step('Response still contains only the now-complete pair in row 0 (C-B)', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['C B']);
        expect(interaction.response).toEqual('C B');
      });

      await step('Association completeness is recalculated after sortable swap', async () => {
        expect(left0.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(right0.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(left1.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(right1.querySelectorAll('[qti-draggable="true"]').length).toBe(0);
        const response = Array.isArray(interaction.response) ? interaction.response : interaction.response.split(',');
        expect(response).toEqual(['C B']);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

/**
 * Sortable behavior for slotted-associate should support swapping placed items
 * across different pair rows (left column in this case) while preserving valid pairs.
 */
export const SortableCrossRowSwap: Story = {
  name: 'Behavior: sortable swap across pair rows (left column)',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const brutus = canvas.getByText('Brutus');
    const capulet = canvas.getByText('Capulet');
    const demetrius = canvas.getByText('Demetrius');

    const left0 = getDropZone(interaction, 'droplist0_left');
    const right0 = getDropZone(interaction, 'droplist0_right');
    const left1 = getDropZone(interaction, 'droplist1_left');
    const right1 = getDropZone(interaction, 'droplist1_right');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Build baseline pairs A-B and C-D', async () => {
        await drag(antonio, { to: left0, duration: 300 });
        await settle(interaction);
        await drag(brutus, { to: right0, duration: 300 });
        await settle(interaction);
        await drag(capulet, { to: left1, duration: 300 });
        await settle(interaction);
        await drag(demetrius, { to: right1, duration: 300 });
        await settle(interaction);

        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['A B', 'C D']);
      });

      await step('Drag placed A onto occupied left1 to swap with C', async () => {
        const placedA = getDropZone(interaction, 'droplist0_left').querySelector('[identifier="A"]') as HTMLElement;
        await drag(placedA, { to: left1, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Capulet');
        expect(right0).toHaveTextContent('Brutus');
        expect(left1).toHaveTextContent('Antonio');
        expect(right1).toHaveTextContent('Demetrius');
      });

      await step('Response reflects swapped pairs C-B and A-D', async () => {
        const lastResponse = callback.mock.calls.at(-1)?.[0].detail.response;
        expect(lastResponse).toEqual(['C B', 'A D']);
        expect(interaction.response).toEqual('C B,A D');
      });

      await step('Associations remain complete after sortable swap', async () => {
        expect(left0.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(right0.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(left1.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        expect(right1.querySelectorAll('[qti-draggable="true"]').length).toBe(1);
        const response = Array.isArray(interaction.response) ? interaction.response : interaction.response.split(',');
        expect(response.length).toBe(2);
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableCrossRowSwapRightColumn: Story = {
  name: 'Behavior: sortable swap across pair rows (right column)',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const brutus = canvas.getByText('Brutus');
    const capulet = canvas.getByText('Capulet');
    const demetrius = canvas.getByText('Demetrius');

    const left0 = getDropZone(interaction, 'droplist0_left');
    const right0 = getDropZone(interaction, 'droplist0_right');
    const left1 = getDropZone(interaction, 'droplist1_left');
    const right1 = getDropZone(interaction, 'droplist1_right');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Build baseline pairs A-B and C-D', async () => {
        await drag(antonio, { to: left0, duration: 300 });
        await settle(interaction);
        await drag(brutus, { to: right0, duration: 300 });
        await settle(interaction);
        await drag(capulet, { to: left1, duration: 300 });
        await settle(interaction);
        await drag(demetrius, { to: right1, duration: 300 });
        await settle(interaction);

        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A B', 'C D']);
      });

      await step('Drag placed B onto occupied right1 to swap with D', async () => {
        const placedB = getDropZone(interaction, 'droplist0_right').querySelector('[identifier="B"]') as HTMLElement;
        await drag(placedB, { to: right1, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Antonio');
        expect(right0).toHaveTextContent('Demetrius');
        expect(left1).toHaveTextContent('Capulet');
        expect(right1).toHaveTextContent('Brutus');
      });

      await step('Response reflects right-column sortable swap', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A D', 'C B']);
        expect(interaction.response).toEqual('A D,C B');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const SortableCrossColumnSwapLeftToRight: Story = {
  name: 'Behavior: sortable swap between columns (left to right)',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const brutus = canvas.getByText('Brutus');
    const capulet = canvas.getByText('Capulet');
    const demetrius = canvas.getByText('Demetrius');

    const left0 = getDropZone(interaction, 'droplist0_left');
    const right0 = getDropZone(interaction, 'droplist0_right');
    const left1 = getDropZone(interaction, 'droplist1_left');
    const right1 = getDropZone(interaction, 'droplist1_right');

    const callback = fn((event: CustomEvent<{ response: string[] }>) => event.detail.response);
    interaction.addEventListener('qti-interaction-response', callback as EventListener);

    try {
      await step('Build baseline pairs A-B and C-D', async () => {
        await drag(antonio, { to: left0, duration: 300 });
        await settle(interaction);
        await drag(brutus, { to: right0, duration: 300 });
        await settle(interaction);
        await drag(capulet, { to: left1, duration: 300 });
        await settle(interaction);
        await drag(demetrius, { to: right1, duration: 300 });
        await settle(interaction);

        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['A B', 'C D']);
      });

      await step('Drag placed A from left0 onto occupied right0 to swap between columns', async () => {
        const placedA = getDropZone(interaction, 'droplist0_left').querySelector('[identifier="A"]') as HTMLElement;
        await drag(placedA, { to: right0, duration: 300 });
        await settle(interaction);

        expect(left0).toHaveTextContent('Brutus');
        expect(right0).toHaveTextContent('Antonio');
        expect(left1).toHaveTextContent('Capulet');
        expect(right1).toHaveTextContent('Demetrius');
      });

      await step('Response reflects cross-column sortable swap', async () => {
        expect(callback.mock.calls.at(-1)?.[0].detail.response).toEqual(['B A', 'C D']);
        expect(interaction.response).toEqual('B A,C D');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', callback as EventListener);
    }
  }
};

export const IncompletePair: Story = {
  name: 'Response: incomplete pair does not emit association',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE">
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const left0 = getDropZone(interaction, 'droplist0_left');

    await step('Dropping only one side keeps response empty', async () => {
      await drag(antonio, { to: left0, duration: 300 });
      await settle(interaction);
      expect(left0).toHaveTextContent('Antonio');
      expect(interaction.response).toEqual('');
    });
  }
};

export const DisabledBlocksDrag: Story = {
  name: 'State: disabled blocks dragging',
  render: () => html`
    <qti-associate-interaction data-testid="associate-interaction" response-identifier="RESPONSE" disabled>
      <qti-simple-associable-choice identifier="A">Antonio</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B">Brutus</qti-simple-associable-choice>
    </qti-associate-interaction>
  `,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiAssociateInteraction>('associate-interaction');
    await settle(interaction);

    const antonio = canvas.getByText('Antonio');
    const left0 = getDropZone(interaction, 'droplist0_left');

    await step('Disabled interaction keeps pair slots empty', async () => {
      await drag(antonio, { to: left0, duration: 300 });
      await settle(interaction);
      expect(left0).not.toHaveTextContent('Antonio');
      expect(interaction.response).toEqual('');
    });
  }
};
