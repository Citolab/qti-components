import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiAssociateInteraction } from './qti-associate-interaction';
import type { Meta, StoryObj } from '@storybook/web-components';

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
  title: '3.2 interaction types/3.2.12 Associate Interaction',
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
