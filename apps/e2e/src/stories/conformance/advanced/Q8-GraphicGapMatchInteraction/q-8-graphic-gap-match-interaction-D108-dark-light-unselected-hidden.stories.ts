import { getItemByUri } from '@citolab/qti-components';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { action } from 'storybook/actions';
import { expect, fireEvent } from 'storybook/test';

import drag from '../../../../../../../tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGap } from '@citolab/qti-components';

type Story = StoryObj;

// Compare the RGB values
const rgbIsEqual = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) =>
  Boolean(color1 && color2 && color1.r === color2.r && color1.g === color2.g && color1.b === color2.b);

// Any CSS colour (hex, rgb(), oklch(), …) as 8-bit sRGB, by painting it on a canvas. The theme
// writes its colours in oklch, so a computed value is no longer an rgb() string to parse.
const colorCanvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
function toRgb(color: string) {
  if (!color) return null;
  colorCanvas.clearRect(0, 0, 1, 1);
  colorCanvas.fillStyle = color;
  colorCanvas.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorCanvas.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}

const wait = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const meta: Meta<QtiAssessmentItem> = {
  title: 'Testing/Conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Q8_L2_D108: Story = {
  name: 'Q8-L2-D108',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected')();
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemFirstUpdated}
      >
        ${xml}
      </div>
      <button
        @click=${() => {
          item?.processResponse();
        }}
      >
        Submit
      </button>
    `;
  },
  args: {},
  play: async ({ canvasElement, step }) => {
    //     /* Light theme colors */
    // --qti-selections-light-bg: #f0f0f0; /* Light gray */
    // --qti-selections-light-border: #d0d0d0; /* Medium gray */

    // /* Dark theme colors */
    // --qti-selections-dark-bg: #1f2937; /* Dark gray */
    // --qti-selections-dark-border: #64748b; /* Medium gray */

    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const rootElement = document.documentElement;
    const rootStyles = window.getComputedStyle(rootElement);
    const qtiLightBgActive = rootStyles.getPropertyValue('--qti-selections-light-bg').trim();
    const qtiLightBorderActive = rootStyles.getPropertyValue('--qti-selections-light-border').trim();
    const qtiDarkBgActive = rootStyles.getPropertyValue('--qti-selections-dark-bg').trim();
    const qtiDarkBorderActive = rootStyles.getPropertyValue('--qti-selections-dark-border').trim();

    const qtiLightBgActiveRgb = toRgb(qtiLightBgActive);
    const qtiLightBorderActiveRgb = toRgb(qtiLightBorderActive);
    const qtiDarkBgActiveRgb = toRgb(qtiDarkBgActive);
    const qtiDarkBorderActiveRgb = toRgb(qtiDarkBorderActive);

    // Disable animations for all graphic-gap-match-interaction elements to avoid timing issues
    const allInteractions = assessmentItem.querySelectorAll('qti-graphic-gap-match-interaction');
    allInteractions.forEach((interaction: any) => {
      interaction.setAttribute('disable-animations', '');
    });

    const qtiGapMatchInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-top qti-selections-dark"]'
    ) as HTMLElement;

    const dragSlot = qtiGapMatchInteraction.shadowRoot.querySelector('slot[part="drags"]');
    const responseArea = qtiGapMatchInteraction.shadowRoot.querySelector('slot[part="image"]');
    const gapChoices = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-gap-img'));
    const responseHotspots = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(qtiGapMatchInteraction).not.toBeNull();
    expect(dragSlot).not.toBeNull();
    expect(responseArea).not.toBeNull();
    expect(gapChoices.length).toBeGreaterThan(0);
    expect(responseHotspots.length).toBeGreaterThan(0);

    /*
     * TODO got stuck on this test, there is something wrong with the disabled state being set after first drop.
     * drag once - disabled
     * drop in the same spot again, enabled
     * move to different spot - disabled
     * this means the background and border colors don't match the expected values
     */
    // Test for dark hotspot selections on light background
    await step('Check that response areas use dark hotspot selections', async () => {
      await drag(gapChoices[1], { to: responseHotspots[2], duration: 300 });
      await wait(300);
      const computedStyle = getComputedStyle(responseHotspots[2]);

      const backgroundColor = toRgb(computedStyle.backgroundColor);
      const borderColor = toRgb(computedStyle.borderColor);

      expect(rgbIsEqual(backgroundColor, qtiDarkBgActiveRgb)).toBe(true); // Ensure dark background
      expect(rgbIsEqual(borderColor, qtiDarkBorderActiveRgb)).toBe(true); // Ensure dark border
      action('Dark hotspot selections validated')();
    });

    const qtiGapMatchInteractionLight = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[class="qti-choices-top qti-selections-light"]'
    ) as HTMLElement;

    const dragSlotLight = qtiGapMatchInteractionLight.shadowRoot.querySelector('slot[part="drags"]');
    const responseAreaLight = qtiGapMatchInteractionLight.shadowRoot.querySelector('slot[part="image"]');
    const gapChoicesLight = Array.from(qtiGapMatchInteractionLight.querySelectorAll('qti-gap-img'));
    const responseHotspotsLight = Array.from(qtiGapMatchInteractionLight.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(qtiGapMatchInteractionLight).not.toBeNull();
    expect(dragSlotLight).not.toBeNull();
    expect(responseAreaLight).not.toBeNull();
    expect(gapChoicesLight.length).toBeGreaterThan(0);
    expect(responseHotspotsLight.length).toBeGreaterThan(0);

    // Test for dark hotspot selections on light background
    await step('Check that response areas use light hotspot selections', async () => {
      await drag(gapChoicesLight[1], { to: responseHotspotsLight[2], duration: 300 });
      await drag(gapChoicesLight[1], { to: qtiGapMatchInteractionLight, duration: 300 });
      await drag(gapChoicesLight[1], { to: responseHotspotsLight[2], duration: 300 });
      await wait(300);
      const computedStyle = getComputedStyle(responseHotspotsLight[2]);

      const backgroundColor = toRgb(computedStyle.backgroundColor);
      const borderColor = toRgb(computedStyle.borderColor);

      expect(rgbIsEqual(backgroundColor, qtiLightBgActiveRgb)).toBe(true); // Ensure light background
      expect(rgbIsEqual(borderColor, qtiLightBorderActiveRgb)).toBe(true); // Ensure light border
      action('Light hotspot selections validated')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-4.xml`)
    })
  ]
};
