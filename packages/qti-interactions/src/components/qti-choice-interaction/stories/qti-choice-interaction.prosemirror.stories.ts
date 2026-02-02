import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { InputType } from 'storybook/internal/types';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from '../qti-choice-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-choice-interaction', {
  // excludeCategories: ['cssParts', 'cssProps', 'cssStates', 'events', 'properties', 'slots', 'methods']
});

type Story = StoryObj<QtiChoiceInteraction & typeof args>;

const meta: Meta<
  QtiChoiceInteraction & { classLabel: InputType; classLabelSuffix: InputType; classOrientation: InputType }
> = {
  component: 'qti-choice-interaction',
  title: '01 Choice Interaction/Prosemirror',
  // args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
};
export default meta;

const Test: Story = {
  render: () => {
    return html` <qti-choice-interaction readonly>
      <qti-prompt>
        <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
      </qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>`;
  }
};

export const ContentEditable = {
  render: (args, context) => {
    return html`
      <style>
        qti-simple-choice {
          user-select: unset;
          cursor: unset;
        }
      </style>

      <div contenteditable="true">${Test.render(args, context)}</div>
    `;
  }
};
