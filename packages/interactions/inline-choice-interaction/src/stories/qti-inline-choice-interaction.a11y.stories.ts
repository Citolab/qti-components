import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect, waitFor, fireEvent } from 'storybook/test';

import {
  assertInlineChoiceInternals,
  getDeepActiveElement,
  getFocusedInlineChoiceIdentifier
} from './qti-inline-choice-interaction.helpers';

import type { QtiInlineChoiceInteraction } from '../qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { args, template } = getStorybookHelpers('qti-inline-choice-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiInlineChoiceInteraction & typeof args>;

const defaultRender: Story['render'] = args =>
  template(
    args,
    html` <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
      <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
      <qti-inline-choice identifier="Y">York</qti-inline-choice>`
  );

/**
 * ## Accessibility Stories
 *
 * Keyboard navigation and the roles and states of the choices. Each story is also a test.
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: 'Interactions/Inline Choice/Accessibility',
  tags: ['a11y', 'iol']
};
export default meta;

export const KeyboardNavigation: Story = {
  render: defaultRender,
  play: async ({ canvasElement, step }) => {
    const interaction = canvasElement.querySelector<QtiInlineChoiceInteraction>('qti-inline-choice-interaction');
    expect(interaction).toBeTruthy();
    if (!interaction) return;

    await interaction.updateComplete;
    const root = interaction.shadowRoot;
    expect(root).toBeTruthy();
    if (!root) return;

    const trigger = root.querySelector<HTMLButtonElement>('[part~="trigger"]');
    expect(trigger).toBeTruthy();
    if (!trigger) return;

    await step('Open via keyboard and focus prompt option first', async () => {
      trigger.focus();
      await fireEvent.keyDown(trigger, { key: 'Enter' });
      await interaction.updateComplete;

      const promptOption = await waitFor(() => root.querySelector<HTMLElement>('button[part~="prompt"]'));
      await waitFor(() => {
        expect(getDeepActiveElement()).toBe(promptOption);
      });
    });

    const menu = root.querySelector<HTMLElement>('[part="menu"]');
    expect(menu).toBeTruthy();
    if (!menu) return;

    await step('Arrow down navigates prompt -> Gloucester -> Lancaster', async () => {
      await fireEvent.keyDown(menu, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getFocusedInlineChoiceIdentifier()).toBe('G');
      });

      await fireEvent.keyDown(menu, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(getFocusedInlineChoiceIdentifier()).toBe('L');
      });
    });

    await step('Enter selects focused option (Lancaster)', async () => {
      await fireEvent.keyDown(menu, { key: 'Enter' });
      await interaction.updateComplete;
      expect(interaction.response).toBe('L');
    });

    await step('Element internals reflect selected option', async () => {
      assertInlineChoiceInternals(interaction, 'L');
    });
  }
};
