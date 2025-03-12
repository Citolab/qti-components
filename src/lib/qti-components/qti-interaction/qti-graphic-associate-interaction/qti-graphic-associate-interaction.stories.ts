import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiGraphicAssociateInteraction } from './qti-graphic-associate-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getStorybookHelpers('qti-graphic-associate-interaction');

type Story = StoryObj<QtiGraphicAssociateInteraction & typeof args>;

/**
 *
 * ### [3.2.13 Graphic Associate Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * A graphic interaction with a corresponding set of choices that are defined as areas of the graphic image. The candidate's task is to associate the areas (hotspots) with each other.
 *
 */
const meta: Meta<QtiGraphicAssociateInteraction> = {
  component: 'qti-graphic-associate-interaction',
  title: '3.2 interaction types/13 Graphic Associate',
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
