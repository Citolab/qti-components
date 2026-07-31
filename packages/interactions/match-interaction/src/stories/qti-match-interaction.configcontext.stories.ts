import { html } from 'lit';
import { expect } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiMatchInteraction } from '../qti-match-interaction';

type Story = StoryObj<QtiMatchInteraction>;

const meta: Meta<QtiMatchInteraction> = {
  component: 'qti-match-interaction',
  title: '09 Match/Config Context',
  tags: ['configuration', 'specific', 'iol']
};
export default meta;

const settle = async (interaction: QtiMatchInteraction) => {
  await interaction.updateComplete;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

const baseTemplate = (disableAfterMaxReached: boolean) => html`
  <qti-match-interaction
    data-testid="interaction"
    response-identifier="RESPONSE"
    max-associations="1"
    .configContext=${{ disableAfterMaxReached }}
  >
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="A" match-max="0">Alpha</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="B" match-max="0">Beta</qti-simple-associable-choice>
    </qti-simple-match-set>
    <qti-simple-match-set>
      <qti-simple-associable-choice identifier="T1" match-max="2">Target 1</qti-simple-associable-choice>
      <qti-simple-associable-choice identifier="T2" match-max="2">Target 2</qti-simple-associable-choice>
    </qti-simple-match-set>
  </qti-match-interaction>
`;

const getTargets = (canvasElement: HTMLElement) => {
  const target1 = canvasElement.querySelector('qti-simple-associable-choice[identifier="T1"]') as HTMLElement;
  const target2 = canvasElement.querySelector('qti-simple-associable-choice[identifier="T2"]') as HTMLElement;
  return { target1, target2 };
};

const normalizeResponse = (interaction: QtiMatchInteraction): string[] => {
  const raw = interaction.response;
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  return raw.split(',').filter(Boolean);
};

export const DisableAfterMaxReachedEnabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = true',
  render: () => baseTemplate(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiMatchInteraction>('interaction');
    await settle(interaction);

    const alpha = canvas.getByText('Alpha');
    const beta = canvas.getByText('Beta');
    const { target1, target2 } = getTargets(canvasElement);

    await drag(alpha, { to: target1, duration: 300 });
    await settle(interaction);

    // When max-lock is enabled and max-associations is reached, placing into a different target is blocked.
    await drag(beta, { to: target2, duration: 300 });
    await settle(interaction);
    const response = normalizeResponse(interaction);
    expect(response).toContain('A T1');
    expect(response).not.toContain('B T2');
  }
};

export const DisableAfterMaxReachedDisabledViaConfigProvider: Story = {
  name: 'Config Wrapper: disableAfterMaxReached = false',
  render: () => baseTemplate(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByTestId<QtiMatchInteraction>('interaction');
    await settle(interaction);

    const alpha = canvas.getByText('Alpha');
    const beta = canvas.getByText('Beta');
    const { target1, target2 } = getTargets(canvasElement);

    // No semantic query can reach this shadow-root status region directly.
    const validationMessage = interaction.shadowRoot?.querySelector('#validation-message') as HTMLElement | null;

    await drag(alpha, { to: target1, duration: 300 });
    await settle(interaction);

    // When max-lock is disabled, user can continue placing into other targets.
    await drag(beta, { to: target2, duration: 300 });
    await settle(interaction);

    let response = normalizeResponse(interaction);
    expect(response).toContain('A T1');
    expect(response).toContain('B T2');
    expect(interaction.internals.validity.valid).toBe(false);
    expect(validationMessage?.textContent?.trim().length).toBeGreaterThan(0);

    // Restore a valid response and verify the message clears.
    interaction.response = ['A T1'];
    interaction.validate();
    interaction.reportValidity();
    await settle(interaction);

    response = normalizeResponse(interaction);
    expect(response).toContain('A T1');
    expect(response).not.toContain('B T2');
    expect(interaction.internals.validity.valid).toBe(true);
    expect(validationMessage?.textContent).toBe('');
    expect(validationMessage?.style.display).toBe('none');
  }
};
