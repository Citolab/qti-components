import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiSimpleChoice } from '@qti-components/interactions-core/elements/qti-simple-choice';
import type { QtiOrderInteraction } from '../qti-order-interaction';

type Story = StoryObj<QtiOrderInteraction>;

const meta: Meta<QtiOrderInteraction> = {
  component: 'qti-order-interaction',
  title: '10 Order/Config Context',
  tags: ['configuration', 'specific', 'iol']
};
export default meta;

const settle = async (interaction: QtiOrderInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

export const DisableAfterMaxReachedEnabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = true',
  render: () => html`
    <qti-order-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      max-associations="2"
      .configContext=${{ disableAfterMaxReached: true }}
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    await drag(choiceA, { to: drops[0], duration: 300 });
    await settle(interaction);
    await drag(choiceB, { to: drops[1], duration: 300 });
    await settle(interaction);

    expect(drops[2].hasAttribute('disabled')).toBe(true);
  }
};

export const DisableAfterMaxReachedDisabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = false',
  render: () => html`
    <qti-order-interaction
      data-testid="interaction"
      response-identifier="RESPONSE"
      max-associations="2"
      .configContext=${{ disableAfterMaxReached: false }}
    >
      <qti-simple-choice identifier="A">Choice A</qti-simple-choice>
      <qti-simple-choice identifier="B">Choice B</qti-simple-choice>
      <qti-simple-choice identifier="C">Choice C</qti-simple-choice>
    </qti-order-interaction>
  `,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiOrderInteraction>('interaction');
    await settle(interaction);

    const choiceA = canvas.getByText<QtiSimpleChoice>('Choice A');
    const choiceB = canvas.getByText<QtiSimpleChoice>('Choice B');
    const drops = canvas.queryAllByShadowRole('region');

    await drag(choiceA, { to: drops[0], duration: 300 });
    await settle(interaction);
    await drag(choiceB, { to: drops[1], duration: 300 });
    await settle(interaction);

    expect(drops[2].hasAttribute('disabled')).toBe(false);
  }
};
