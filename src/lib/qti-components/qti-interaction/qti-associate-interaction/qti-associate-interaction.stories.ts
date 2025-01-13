import { html } from 'lit';
import type { QtiAssociateInteraction } from './qti-associate-interaction';
import type { Meta, StoryObj } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-associate-interaction');

type Story = StoryObj<QtiAssociateInteraction & typeof args>;

const meta: Meta<QtiAssociateInteraction> = {
  component: 'qti-associate-interaction',
  title: 'components/qti-associate-interaction',
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
