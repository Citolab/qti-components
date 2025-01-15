import { html } from 'lit';
import type { QtiMediaInteraction } from './qti-media-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-media-interaction');

type Story = StoryObj<QtiMediaInteraction & typeof args>;

const meta: Meta<QtiMediaInteraction> = {
  component: 'qti-media-interaction',
  title: 'components/qti-media-interaction',

  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
  // tags: ['autodocs', 'no-tests']
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

  args: {},
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
