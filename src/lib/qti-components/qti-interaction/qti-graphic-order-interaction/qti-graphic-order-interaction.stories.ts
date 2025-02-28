import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { QtiGraphicOrderInteraction } from './qti-graphic-order-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-graphic-order-interaction');

type Story = StoryObj<QtiGraphicOrderInteraction & typeof args>;

/**
 *
 * ### [3.2.11 Graphic Order Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.973pocg92wxf)
 * A graphic order interaction is a graphic interaction with a corresponding set of hotspot choices that are defined as areas of the graphic image. The candidate's task is to impose an ordering on the areas (hotspots).
 *
 */
const meta: Meta<QtiGraphicOrderInteraction> = {
  component: 'qti-graphic-order-interaction',
  title: '3.2 interaction types/3.2.11 Graphic Order Interaction',
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

export const MultipleShapes: Story = {
  render: () =>
    template(
      args,
      html`
        <img src="qti-graphic-order-interaction/map-us.png" alt="" width="795" height="492" />
        <qti-hotspot-choice
          identifier="hotspot_1"
          fixed="false"
          shape="rect"
          coords="74,101,234,194"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="hotspot_2"
          fixed="false"
          shape="ellipse"
          coords="338,259,77,73"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="hotspot_3"
          fixed="false"
          shape="ellipse"
          coords="362,143,70,25"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="hotspot_4"
          fixed="false"
          shape="poly"
          coords="114,269,146,295,181,271,154,249"
        ></qti-hotspot-choice>
      `
    )
};
