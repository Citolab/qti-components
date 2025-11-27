import { getItemByUri } from '@citolab/qti-components/qti-loader';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { action } from 'storybook/actions';
import { expect, fireEvent } from 'storybook/test';
import drag from 'tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type { QtiAssessmentItem, QtiGap, QtiGapMatchInteraction, QtiGapText } from '@citolab/qti-components';

type Story = StoryObj;

// Compare the RGB values
const rgbIsEqual = (color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }) =>
  color1 && color2 && color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;

// Utility function to convert hex color to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

// Utility function to convert RGB string to RGB object
function rgbStringToRgb(rgbString) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgbString);
  return result
    ? {
        r: parseInt(result[1], 10),
        g: parseInt(result[2], 10),
        b: parseInt(result[3], 10)
      }
    : null;
}

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Q8_L2_D108: Story = {
  tags: ['skip-test'],
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
    // --qti-light-bg-active: #f0f0f0; /* Light gray */
    // --qti-light-border-active: #d0d0d0; /* Medium gray */

    // /* Dark theme colors */
    // --qti-dark-bg-active: #1f2937; /* Dark gray */
    // --qti-dark-border-active: #64748b; /* Medium gray */

    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const rootElement = document.documentElement;
    const rootStyles = window.getComputedStyle(rootElement);
    const qtiLightBgActive = rootStyles.getPropertyValue('--qti-light-bg-active').trim();
    const qtiLightBorderActive = rootStyles.getPropertyValue('--qti-light-border-active').trim();
    const qtiDarkBgActive = rootStyles.getPropertyValue('--qti-dark-bg-active').trim();
    const qtiDarkBorderActive = rootStyles.getPropertyValue('--qti-dark-border-active').trim();

    const qtiLightBgActiveRgb = rgbStringToRgb(qtiLightBgActive) || hexToRgb(qtiLightBgActive);
    const qtiLightBorderActiveRgb = rgbStringToRgb(qtiLightBorderActive) || hexToRgb(qtiLightBorderActive);
    const qtiDarkBgActiveRgb = rgbStringToRgb(qtiDarkBgActive) || hexToRgb(qtiDarkBgActive);
    const qtiDarkBorderActiveRgb = rgbStringToRgb(qtiDarkBorderActive) || hexToRgb(qtiDarkBorderActive);

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

    // Test for dark hotspot selections on light background
    await step('Check that response areas use dark hotspot selections', async () => {
      await drag(gapChoices[1], { to: responseHotspots[2], duration: 300 }).then(() => {
        const computedStyle = getComputedStyle(responseHotspots[2]);

        const backgroundColor =
          rgbStringToRgb(computedStyle.backgroundColor) || hexToRgb(computedStyle.backgroundColor);
        const borderColor = rgbStringToRgb(computedStyle.borderColor) || hexToRgb(computedStyle.borderColor);

        expect(rgbIsEqual(backgroundColor, qtiDarkBgActiveRgb)).toBe(true); // Ensure dark background
        expect(rgbIsEqual(borderColor, qtiDarkBorderActiveRgb)).toBe(true); // Ensure dark border
      });
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
      await drag(gapChoicesLight[1], { to: responseHotspotsLight[2], duration: 300 }).then(() => {
        const computedStyle = getComputedStyle(responseHotspotsLight[2]);

        const backgroundColor =
          rgbStringToRgb(computedStyle.backgroundColor) || hexToRgb(computedStyle.backgroundColor);
        const borderColor = rgbStringToRgb(computedStyle.borderColor) || hexToRgb(computedStyle.borderColor);

        expect(rgbIsEqual(backgroundColor, qtiLightBgActiveRgb)).toBe(true); // Ensure light background
        expect(rgbIsEqual(borderColor, qtiLightBorderActiveRgb)).toBe(true); // Ensure light border
      });
      action('Light hotspot selections validated')();
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-4.xml`)
    })
  ]
};
