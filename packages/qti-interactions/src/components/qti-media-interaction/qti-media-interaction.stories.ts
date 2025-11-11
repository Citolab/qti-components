import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiMediaInteraction } from './qti-media-interaction';
import type { StoryObj, Meta } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('qti-media-interaction');

type Story = StoryObj<QtiMediaInteraction & typeof args>;

/**
 *
 * ### [3.2.15 Media Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.u9utgghwf8ck)
 * allows more control over the way the candidate interacts with a time-based media object and allows the number of times the media object was experienced to be reported in the value of the associated response variable.
 *
 */
const meta: Meta<QtiMediaInteraction> = {
  component: 'qti-media-interaction',
  title: '15 Media',
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
      html`
        <qti-prompt>Play this video.</qti-prompt>
        <video width="320" height="240" controls>
          <source src="qti-media-interaction/earth.mp4" type="video/mp4" />
          Your browser does not support the video tag
        </video>
      `
    ),

  args: {}
};
