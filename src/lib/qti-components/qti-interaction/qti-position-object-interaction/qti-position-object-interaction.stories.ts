import { html } from 'lit';
import type { QtiPositionObjectInteraction } from './qti-position-object-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-position-object-interaction');

type Story = StoryObj<QtiPositionObjectInteraction & typeof args>;

const meta: Meta<QtiPositionObjectInteraction> = {
  component: 'qti-position-object-interaction',
  title: 'components/qti-position-object-interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  tags: ['autodocs']
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
