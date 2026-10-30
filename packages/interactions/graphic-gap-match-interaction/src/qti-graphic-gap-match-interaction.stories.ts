import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import aCwPng from './fixtures/a-cw.png';
import bWw2Png from './fixtures/b-ww2.png';
import cVietnamPng from './fixtures/c-vietnam.png';
import dBayPng from './fixtures/d-bay.png';
import timeline558Png from './fixtures/timeline-558.png';

import type { StoryObj, Meta } from '@storybook/web-components-vite';
import type { QtiGraphicGapMatchInteraction } from './qti-graphic-gap-match-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-graphic-gap-match-interaction', {
  excludeCategories: ['methods', 'events', 'properties']
});

type Story = StoryObj<QtiGraphicGapMatchInteraction & typeof args>;

/**
 *
 * ### [3.2.14 Graphic Gap Match Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.7cs7637r54vv)
 * a graphical interaction with a set of gaps that are defined as areas (hotspots) of the graphic image and an additional set of gap choices that are defined outside the image. The candidate must associate the gap choices with the gaps in the image and be able to review the image with the gaps filled in context, as indicated by their choices.
 *
 */
const meta: Meta<QtiGraphicGapMatchInteraction> = {
  component: 'qti-graphic-gap-match-interaction',
  title: 'Interactions/Graphic Gap Match/Overview',
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
            Some labels on this Cold War timeline are missing. Drag each event tile to the correct highlighted hotspot.
          </p>
        </qti-prompt>

        <img alt="timeline from 1939 to 1991" src=${timeline558Png} height="326" width="558" />
        <qti-gap-img identifier="DraggerA" match-max="2">
          <img src=${aCwPng} alt="Choice A, The Cold War Ends" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerB" match-max="1">
          <img src=${bWw2Png} alt="Choice B, World War 2 Ends" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerC" match-max="1">
          <img src=${cVietnamPng} alt="Choice C, Vietnam Conflict Ends" height="63" width="78" />
        </qti-gap-img>
        <qti-gap-img identifier="DraggerD" match-max="1">
          <img src=${dBayPng} alt="Choice D, Bay of Pigs" height="63" width="78" />
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
