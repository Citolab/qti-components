import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { expect } from 'storybook/test';

import type { QtiInlineChoiceInteraction } from './qti-inline-choice-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-inline-choice-interaction');

type Story = StoryObj<QtiInlineChoiceInteraction & typeof args>;

/**
 *
 * ### [3.2.8 Inline Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.y2th8rh73267)
 * an inline interaction that presents the user with a set of choices, each of which is an answer option (usually text). The candidate's task is to select one of the choices.
 *
 */
const meta: Meta<QtiInlineChoiceInteraction> = {
  component: 'qti-inline-choice-interaction',
  title: '08 Inline Choice',
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
  render: args =>
    template(
      args,
      html` <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
        <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        <qti-inline-choice identifier="Y">York</qti-inline-choice>`
    )
};

export const DataPrompt: Story = {
  render: Default.render,
  args: {
    dataPrompt: 'Select the correct answer'
  }
};

export const WithConfigContext: Story = {
  render: args => html`
    <qti-item>
      ${template(
        args,
        html`
          <qti-inline-choice identifier="G">Gloucester</qti-inline-choice>
          <qti-inline-choice identifier="L">Lancaster</qti-inline-choice>
        `
      )}
    </qti-item>
  `,
  args: {},
  play: async ({ canvasElement, step }) => {
    const item = canvasElement.querySelector('qti-item')!;
    item.configContext = {
      inlineChoicePrompt: 'Select city'
    };

    const interaction = item.querySelector('qti-inline-choice-interaction')!;
    await interaction.updateComplete;

    await step('Prompt from configContext is displayed', async () => {
      const select = interaction.shadowRoot!.querySelector('select')!;
      const firstOption = select.options[0];

      expect(firstOption).toBeDefined();
      expect(firstOption.textContent?.trim()).toBe('Select city');
    });
  }
};
