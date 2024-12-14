import { QtiAssessmentItem, QtiGap, QtiGapText } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from '../../../../testing/drag';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-match-interaction'
};
export default meta;

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

export const Default = {
  name: 'Not-Allowed-To-Drop-In-Other-Interaction',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
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
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      Don't allow to drop a Gap from interaction 1 to interaction 2.
      
      ${assessmentItem.querySelector('qti-prompt').textContent}
    `;
    const interaction1 = assessmentItem.querySelector(`qti-gap-match-interaction[response-identifier='RESPONSE1'`);
    const dragContainerInteraction1 = interaction1.shadowRoot.querySelector('slot[part="drags"]') as HTMLSlotElement;

    const interaction2 = assessmentItem.querySelector(`qti-gap-match-interaction[response-identifier='RESPONSE2'`);
    const gapTextWinter1 = interaction1.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    const dropInteraction1 = interaction1.querySelector('qti-gap[identifier="G2"]') as QtiGapText;

    const dropInteraction2 = interaction2.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    await step('drag a Gap from interaction 1 to interaction 2', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter1, { to: dropInteraction2, duration: 300 });
    });

    await timeoutPromise(300);
    // check if the first dragged value is in the gap
    expect(dropInteraction2.textContent).toBe('');
    // check if the second dragged value is in the gap
    expect(
      dropInteraction2.shadowRoot.querySelector('qti-gap-text') ||
        dropInteraction2.shadowRoot?.querySelector('qti-gap-text')
    ).toBeFalsy();

    expect(
      dropInteraction1.querySelector('qti-gap-text') || dropInteraction1.shadowRoot?.querySelector('qti-gap-text')
    ).toBeDefined();
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-sv-1.xml`)
    })
  ]
};

export const CanRedrop: Story = {
  name: 'Can-Redrop-In-Same-Gap',
  render: (_args, { loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
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
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      For gap-match-example-1.xml, each Gap can have at most one choice associated with it.`;

    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    // const gapTextSpring = assessmentItem.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    // const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    // const gapTextAutumn = assessmentItem.querySelector('qti-gap-text[identifier="A"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;
    // const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;
    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation
      await drag(gapTextWinter, { to: gapG1, duration: 300 });
    });

    await step('drag Winter to G1 again', async () => {
      // Second drag: Pick up and drag within the target
      // Ensure at least 1 pixel of movement
      await drag(gapTextWinter, { delta: { x: 1, y: 1 } });
    });

    // check if the first dragged value is in the gap
    expect(gapG1.textContent).toBe('winter');
    expect(gapG1.hasAttribute('disabled')).toBe(true);
    expect(gapG1.hasAttribute('enable')).toBe(false);
    expect(gapG1.hasAttribute('dropzone')).toBe(false);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-1.xml`)
    })
  ]
};

export const DraggableContainerHasDropInDication: Story = {
  name: 'Dropzone-has-drop-indication',
  render: (_args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
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
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.querySelector('qti-prompt').innerHTML = `
      When a draggable is dragged, the dragzone should indicate that it can be dropped`;
    const rootElement = document.documentElement;
    const rootStyles = window.getComputedStyle(rootElement);
    const qtiBorderActive = rootStyles.getPropertyValue('--qti-border-active').trim();
    const gapTextWinter = assessmentItem.querySelector('qti-gap-text[identifier="W"]') as QtiGapText;
    // const gapTextSpring = assessmentItem.querySelector('qti-gap-text[identifier="Sp"]') as QtiGapText;
    // const gapTextSummer = assessmentItem.querySelector('qti-gap-text[identifier="Su"]') as QtiGapText;
    // const gapTextAutumn = assessmentItem.querySelector('qti-gap-text[identifier="A"]') as QtiGapText;

    const gapG1 = assessmentItem.querySelector('qti-gap[identifier="G1"]') as QtiGapText;

    // const gapG2 = assessmentItem.querySelector('qti-gap[identifier="G2"]') as QtiGapText;
    await step('drag Winter to G1', async () => {
      // Simulate the drag and drop operation

      const qtiGapMatchInteraction = assessmentItem.querySelector('qti-gap-match-interaction');
      const slots = qtiGapMatchInteraction.shadowRoot.querySelectorAll('slot');
      const dragsPart = Array.from(slots).find(slot => slot.getAttribute('part') === 'drags');
      // Convert both colors to RGB
      const dragStyles = window.getComputedStyle(dragsPart);
      const borderColorOrg = dragStyles.getPropertyValue('border-color').trim();
      const qtiBorderActiveRgb = rgbStringToRgb(qtiBorderActive) || hexToRgb(qtiBorderActive);

      drag(gapTextWinter, { to: gapG1, duration: 300 }).then(async () => {
        const computedStylesGap1 = window.getComputedStyle(gapG1);
        const borderColorGap1 = computedStylesGap1.getPropertyValue('border-color').trim();
        const borderColorGap1Rgb = rgbStringToRgb(borderColorGap1) || hexToRgb(borderColorGap1);
        expect(rgbIsEqual(qtiBorderActiveRgb, borderColorGap1Rgb)).toBe(true);
        await timeoutPromise(50);

        // Convert both colors to RGB
        const computedStyles = window.getComputedStyle(dragsPart);
        const borderColor = computedStyles.getPropertyValue('border-color').trim();
        expect(borderColor).toBe(borderColorOrg);
      });
      await timeoutPromise(50);
      // Convert both colors to RGB
      const computedStyles = window.getComputedStyle(dragsPart);
      const borderColor = computedStyles.getPropertyValue('border-color').trim();
      const borderColorRgb = rgbStringToRgb(borderColor) || hexToRgb(borderColor);
      expect(rgbIsEqual(qtiBorderActiveRgb, borderColorRgb)).toBe(true);
    });

    // --qti-border-active
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q6/gap-match-example-1-removed.xml`)
    })
  ]
};

const timeoutPromise = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
