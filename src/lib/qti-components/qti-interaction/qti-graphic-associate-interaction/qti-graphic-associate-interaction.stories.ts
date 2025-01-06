import { html } from 'lit';
import { QtiGraphicAssociateInteraction } from './qti-graphic-associate-interaction';
import { StoryObj, Meta } from '@storybook/web-components';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-graphic-associate-interaction');

type Story = StoryObj<QtiGraphicAssociateInteraction & typeof args>;

const meta: Meta<QtiGraphicAssociateInteraction> = {
  component: 'qti-graphic-associate-interaction',
  title: 'components/qti-graphic-associate-interaction',
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
  render: () => html`
    ${template(
      args,
      html`
        <qti-prompt> Mark the airline's new routes on the airport map: </qti-prompt>
        <img
          src="qti-graphic-associate-interaction/uk.png"
          alt="Map of United Kingdom airports"
          width="206"
          height="280"
        />
        <qti-associable-hotspot shape="circle" coords="78,102,8" identifier="A" match-max="3"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="117,171,8" identifier="B" match-max="3"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="166,227,8" identifier="C" match-max="3"></qti-associable-hotspot>
        <qti-associable-hotspot shape="circle" coords="100,102,8" identifier="D" match-max="3"></qti-associable-hotspot>
      `
    )}
  `
};
