import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import { optionsRender, textOverflowRender } from './stories/qti-choice-interaction.fixtures';

import type { InputType } from 'storybook/internal/types';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from './qti-choice-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-choice-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

/**
 *
 * ### [3.2.2 Choice Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b)
 * Presents a set of choices to the candidate. The candidate's task is to select one or more of the choices, up to a maximum number of choices allowed.
 *
 */
const meta: Meta<
  QtiChoiceInteraction & { classLabel: InputType; classLabelSuffix: InputType; classOrientation: InputType }
> = {
  component: 'qti-choice-interaction',
  title: 'Interactions/Choice/Overview',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs', 'iol']
};
export default meta;

export const Default: Story = {
  render: args => {
    return html`
      ${template(
        args,
        html`<qti-prompt>
            <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
          </qti-prompt>
          <qti-simple-choice identifier="A">Option A</qti-simple-choice>
          <qti-simple-choice identifier="B">Option B</qti-simple-choice>
          <qti-simple-choice identifier="C">Option C</qti-simple-choice>
          <qti-simple-choice identifier="D">Option D</qti-simple-choice>`
      )}
    `;
  }
};

export const Disabled: Story = {
  render: optionsRender,
  args: {
    disabled: true
  }
};

export const Readonly: Story = {
  render: optionsRender,
  args: { readonly: true }
};

/** Pick up to two: `max-choices="2"` turns the radios into checkboxes. */
export const Multiple: Story = {
  render: optionsRender,
  args: {
    'response-identifier': 'RESPONSE',
    'min-choices': 1,
    'max-choices': 2
  }
};

/** A long option wraps inside its container instead of overflowing it. */
export const TextOverflow: Story = {
  render: textOverflowRender
};
