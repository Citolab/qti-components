import { html } from 'lit';
import { getWcStorybookHelpers } from 'wc-storybook-helpers';

import type { QtiGraphicGapMatchInteraction } from './qti-graphic-gap-match-interaction';
import type { StoryObj, Meta } from '@storybook/web-components';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-graphic-gap-match-interaction');

type Story = StoryObj<QtiGraphicGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.14 Graphic Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * a graphical interaction with a set of gaps that are defined as areas (hotspots) of the graphic image and an additional set of gap choices that are defined outside the image. The candidate must associate the gap choices with the gaps in the image and be able to review the image with the gaps filled in context, as indicated by their choices.
 *
 */
const meta: Meta<QtiGraphicGapMatchInteraction> = {
  component: 'qti-graphic-gap-match-interaction',
  title: '3.2 interaction types/3.2.14 Graphic Gap Match Interaction',
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
  render: args => html`
    ${template(
      args,
      html`
        <qti-prompt>
          <p>
            Some of the labels on the following diagram are missing: can you identify the correct three-letter codes for
            the unlabelled airports?
          </p>
        </qti-prompt>

        <img
          alt="timeline from 1939 to 1991"
          src="qti-graphic-gap-match-interaction/timeline-558.png"
          height="326"
          width="558"
        />
        <qti-gap-img identifier="DraggerA" match-max="2">
          <img
            src="qti-graphic-gap-match-interaction/a-cw.png"
            alt="Choice A, The Cold War Ends"
            height="63"
            width="78"
          />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerB" match-max="1">
          <img
            src="qti-graphic-gap-match-interaction/b-ww2.png"
            alt="Choice B, World War 2 Ends"
            height="63"
            width="78"
          />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerC" match-max="1">
          <img
            src="qti-graphic-gap-match-interaction/c-vietnam.png"
            alt="Choice C, Vietnam Conflict Ends"
            height="63"
            width="78"
          />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerD" match-max="1">
          <img src="qti-graphic-gap-match-interaction/d-bay.png" alt="Choice D, Bay of Pigs" height="63" width="78" />
        </qti-gap-img>
        <qti-associable-hotspot
          coords="55,256,133,319"
          identifier="A"
          match-max="2"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="190,256,268,319"
          identifier="B"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="309,256,387,319"
          identifier="C"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
        <qti-associable-hotspot
          coords="450,256,528,319"
          identifier="D"
          match-max="1"
          shape="rect"
        ></qti-associable-hotspot>
      `
    )}
  `
};
