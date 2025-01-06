import { html } from 'lit';
import { QtiGraphicOrderInteraction } from './qti-graphic-order-interaction';
import { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-graphic-order-interaction');

type Story = StoryObj<QtiGraphicOrderInteraction & typeof args>;

const meta: Meta<QtiGraphicOrderInteraction> = {
  component: 'qti-graphic-order-interaction',
  title: 'components/qti-graphic-order-interaction',
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
  render: () =>
    template(
      args,
      html`
        <img src="qti-graphic-order-interaction/uk.png" height="280" width="206" />
        <qti-hotspot-choice coords="78,102,8" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="117,171,8" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="166,227,8" identifier="C" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="100,102,8" identifier="D" shape="circle"></qti-hotspot-choice>
      `
    )
};
