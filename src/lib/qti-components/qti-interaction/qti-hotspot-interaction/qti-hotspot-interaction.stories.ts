import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { StoryObj, Meta } from '@storybook/web-components';
import type { QtiHotspotInteraction } from './qti-hotspot-interaction';

const { events, args, argTypes, template } = getStorybookHelpers('qti-hotspot-interaction');

type Story = StoryObj<QtiHotspotInteraction & typeof args>;

/**
 *
 * ### [3.2.6 Hotspot Interaction](https://www.imsglobal.org/spec/qti/v3p0/impl#h.y2th8rh73267)
 * a graphical interaction with a corresponding set of choices that are defined as areas of the graphic image. The candidate's task is to select one or more of the areas (hotspots).
 *
 */
const meta: Meta<QtiHotspotInteraction> = {
  component: 'qti-hotspot-interaction',
  title: '3.2 interaction types/3.2.6 Hotspot Interaction',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Circle: Story = {
  render: () =>
    template(
      args,
      html`
        <img src="qti-hotspot-interaction/uk.png" height="280" width="206" />
        <qti-hotspot-choice coords="77,115,10" identifier="A" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="118,184,10" identifier="B" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="150,235,10" identifier="C" shape="circle"></qti-hotspot-choice>
        <qti-hotspot-choice coords="96,114,10" identifier="D" shape="circle"></qti-hotspot-choice>
      `
    )
};

export const Rect = {
  render: () =>
    template(
      args,
      html`
        <qti-prompt>
          <strong>Cliquer sur le nom des organes où passent les aliments.</strong>
        </qti-prompt>
        <img src="/qti-hotspot-interaction/hotspot.PNG" width="688" height="558" />
        <qti-hotspot-choice identifier="hotspot_1" shape="rect" coords="484,68,655,112"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_2" shape="rect" coords="18,67,190,112"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_3" shape="rect" coords="19,178,191,221"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_4" shape="rect" coords="19,281,191,327"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_5" shape="rect" coords="18,380,191,426"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_6" shape="rect" coords="482,144,656,191"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_7" shape="rect" coords="483,224,657,269"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_8" shape="rect" coords="482,303,657,348"></qti-hotspot-choice>
        <qti-hotspot-choice identifier="hotspot_9" shape="rect" coords="484,380,656,425"></qti-hotspot-choice>
      `
    )
};

export const Poly = {
  render: () =>
    template(
      args,
      html`
        <img src="/qti-hotspot-interaction/VH5BG1e_v2.png" width="602" height="452" />
        <qti-hotspot-choice
          identifier="A"
          coords="288,219,251,183,215,147,179,110,142,74,129,89,117,105,106,122,97,140,145,160,192,180,240,200,288,219"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="B"
          coords="306,227,354,247,402,267,450,286,498,306,504,287,509,268,512,248,513,227,461,227,409,227,358,227,306,227"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="C"
          coords="304,230,341,267,378,304,415,341,451,378,465,362,477,346,487,328,496,310,448,290,400,270,352,250,304,230"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="D"
          coords="306,223,358,223,409,223,461,223,513,223,511,202,508,182,503,163,496,144,449,164,401,183,354,203,306,223"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="E"
          coords="290,233,254,270,217,307,180,344,143,380,158,394,175,406,192,417,211,426,231,378,251,330,270,281,290,233"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="F"
          coords="302,233,322,281,341,330,361,378,381,426,400,417,417,406,434,394,449,380,412,344,375,307,338,270,302,233"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="G"
          coords="294,235,274,283,254,331,234,379,214,427,233,434,253,439,273,442,294,443,294,391,294,339,294,287,294,235"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="H"
          coords="298,235,298,287,298,339,298,391,298,443,319,442,339,439,359,434,378,427,358,379,338,331,318,283,298,235"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="I"
          coords="286,227,234,227,183,227,131,227,79,227,80,248,83,268,88,287,94,306,142,286,190,267,238,247,286,227"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="J"
          coords="286,223,238,203,191,183,143,164,96,144,89,163,84,182,81,202,79,223,131,223,183,223,234,223,286,223"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="K"
          coords="294,10,273,11,253,14,234,19,215,25,235,73,255,120,274,168,294,215,294,164,294,112,294,61,294,10"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="L"
          coords="495,140,486,122,475,105,463,89,450,74,413,110,377,147,341,183,304,219,352,200,400,180,447,160,495,140"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="M"
          coords="302,216,338,180,374,144,411,107,447,71,432,58,416,46,399,35,380,27,361,74,341,122,321,169,302,216"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="N"
          coords="298,215,318,168,337,120,357,73,377,25,358,19,339,14,319,11,298,10,298,61,298,112,298,164,298,215"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="O"
          coords="290,216,271,169,251,122,231,74,212,27,193,35,176,46,160,58,145,71,181,107,218,144,254,180,290,216"
          shape="poly"
        ></qti-hotspot-choice>
        <qti-hotspot-choice
          identifier="P"
          coords="288,230,240,250,192,270,144,290,96,310,105,328,115,346,127,362,141,378,177,341,214,304,251,267,288,230"
          shape="poly"
        ></qti-hotspot-choice>
      `
    )
};
