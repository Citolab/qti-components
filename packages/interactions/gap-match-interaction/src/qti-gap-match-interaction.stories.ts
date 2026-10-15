import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiGapMatchInteraction } from './qti-gap-match-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-gap-match-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.5 Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7sroqk3xl8e1)
 * a block interaction that contains a number of gaps that the candidate can fill from an associated set of choices.
 *
 */
const meta: Meta<QtiGapMatchInteraction> = {
  component: 'qti-gap-match-interaction',
  title: 'Interactions/Gap Match/Overview',
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
  name: 'qti-gap-match-interaction',
  render: args => {
    return html`
      ${template(
        args,
        html`<qti-prompt>Identify the missing words in this famous quote from Shakespeare's Richard III.</qti-prompt>
          <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text>
          <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text>
          <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text>
          <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text>
          <blockquote>
            <p>
              Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
              Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
              And all the clouds that lour'd upon our house<br />
              In the deep bosom of the ocean buried.
            </p>
          </blockquote>`
      )}
    `;
  }
};
