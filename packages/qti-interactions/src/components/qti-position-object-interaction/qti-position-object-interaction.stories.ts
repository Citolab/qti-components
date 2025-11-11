import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiPositionObjectInteraction } from './qti-position-object-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-position-object-interaction');

type Story = StoryObj<QtiPositionObjectInteraction & typeof args>;

/**
 *
 * ### [3.2.16 Position Object Interaction (PCI)](https://www.imsglobal.org/spec/qti/v3p0/impl#h.98xaka8g51za)
 * consists of a single image which must be positioned on another graphic image (the stage) by the candidate.
 *
 */
const meta: Meta<QtiPositionObjectInteraction> = {
  component: 'qti-position-object-interaction',
  title: '16 Position Object',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs']
};
export default meta;

export const Default: Story = {
  render: args =>
    html`<qti-position-object-stage>
      <img src="https://qti-convert.web.app/images/uk.png" width="206" height="280" />
      ${template(args, html`<img src="https://qti-convert.web.app/images/airport.png" alt="Drop Zone" />`)}
      </qti-position-object-interaction>
    </qti-position-object-stage>`
};
