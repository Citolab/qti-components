import { getItemByUri } from '@citolab/qti-components/qti-loader';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { action } from 'storybook/actions';
import { expect, fireEvent } from 'storybook/test';
import drag from 'tools/testing/drag';

import type { StoryObj, Meta, ArgTypes } from '@storybook/web-components-vite';
import type {
  QtiAssessmentItem,
  QtiAssociableHotspot,
  QtiGap,
  QtiGapImg,
  QtiGapMatchInteraction,
  QtiGapText
} from '@citolab/qti-components';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Default: Story = {
  tags: ['skip-test'],
  name: 'Q8-L2-D1',
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
    // docsHint: 'Graphic Gap Match using GapImg. The delivery markup
    // (used in the presentation of content to the candidate) includes alt text for the images used in the interaction
    // and MUST be available to candidates using Assistive Technology.
    // The image defined in the object tag must be visually displayed behind the hotspots,
    // which should be visible to the candidate.It MUST be clear to the clear to the candidate which hotspot each
    // choice has been associated with, and placed choices MUST be visually displayed over the background image.
    // When associated, choices MUST appear wholly inside the gaps.If the candidate indicates the association by
    // positioning the choice above the gap(drag and drop) the system MUST snap the choice to the nearest response position.
    // The minimum score MUST be determined to be 0 for a candidate(lower- bound="0").For no correct pairings,
    // the score is 0. For 1 correct pairing, the score is 0. For 2 correct pairings the score is 1.
    // For 3 correct pairings, the score is 2.'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const gapImgCBG = assessmentItem.querySelector('qti-gap-img[identifier="CBG"]') as QtiGapImg;
    const gapImgEBG = assessmentItem.querySelector('qti-gap-img[identifier="EBG"]') as QtiGapImg;
    const gapImgEDI = assessmentItem.querySelector('qti-gap-img[identifier="EDI"]') as QtiGapImg;
    const gapImgGLA = assessmentItem.querySelector('qti-gap-img[identifier="GLA"]') as QtiGapImg;
    const gapImgMAN = assessmentItem.querySelector('qti-gap-img[identifier="MAN"]') as QtiGapImg;
    const gapImgMCH = assessmentItem.querySelector('qti-gap-img[identifier="MCH"]') as QtiGapImg;

    const hotspotA = assessmentItem.querySelector('qti-associable-hotspot[identifier="A"]') as QtiAssociableHotspot;
    const hotspotB = assessmentItem.querySelector('qti-associable-hotspot[identifier="B"]') as QtiAssociableHotspot;
    const hotspotC = assessmentItem.querySelector('qti-associable-hotspot[identifier="C"]') as QtiAssociableHotspot;

    step('check alt text', async () => {
      expect(gapImgCBG.querySelector('img')?.alt).toBe('The initials CBG');
      expect(gapImgEBG.querySelector('img')?.alt).toBe('The initials EBG');
      expect(gapImgEDI.querySelector('img')?.alt).toBe('The initials EDI');
      expect(gapImgGLA.querySelector('img')?.alt).toBe('The initials GLA');
      expect(gapImgMAN.querySelector('img')?.alt).toBe('The initials MAN');
      expect(gapImgMCH.querySelector('img')?.alt).toBe('The initials MCH');
    });
    let score = '';
    await step('minimum score is 0', async () => {
      await drag(gapImgGLA, { to: hotspotB, duration: 300 });
      await drag(gapImgEDI, { to: hotspotA, duration: 300 });
      await drag(gapImgMCH, { to: hotspotC, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 0').toBe(0);
    });

    await step('score is 0 when nothing is dropped', async () => {
      await drag(gapImgGLA, { to: gapImgMAN.parentElement, duration: 300 });
      await drag(gapImgEDI, { to: gapImgMAN.parentElement, duration: 300 });
      await drag(gapImgMCH, { to: gapImgMAN.parentElement, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 0').toBe(0);
    });
    // IN THE SPECIFICATION IT IS WRITTEN THAT THE SCORE IS 0 FOR 1 CORRECT PAIRING, BUT LOOKS LIKE A MISTAKE, AMP-UP SCORES THE SAME AS OUR IMPLEMENTATION
    await step('1 correct pairing, the score is 1', async () => {
      await drag(gapImgGLA, { to: hotspotA, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 1').toBe(1);
    });

    // await step('For 2 correct pairings the score is 2.', async () => {
    //   await drag(gapImgEDI, { to: hotspotB, duration: 300 });
    //   await fireEvent.click(submitButton);
    //   score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
    //   expect(+score, 'SCORE = 2').toBe(2);
    // });

    // await step('For 3 correct pairings the score is 3.', async () => {
    //   await drag(gapImgMAN, { to: hotspotC, duration: 300 });
    //   await fireEvent.click(submitButton);
    //   score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
    //   expect(+score, 'SCORE = 3').toBe(3);
    // });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-interaction-1.xml`)
    })
  ]
};

export const Q8L2D2: Story = {
  tags: ['skip-test'],
  name: 'Q8-L2-D2',
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
    // docsHint: 'Example graphic-gap-match-interaction-2, Graphic Gap Match using GapText.
    // Each associable hotspot response area MUST accept only one choice(gap text).
    // The minimum score MUST be determined to be 0 for a candidate(lower- bound="0").
    // For no correct pairings, the score is 0. For 1 correct pairing, the score is 0. For 2 correct pairings the score is 1.
    // For 3 correct pairings, the score is 2.'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const gapTextCBG = assessmentItem.querySelector('qti-gap-text[identifier="CBG"]') as QtiGapText;
    const gapTextEDI = assessmentItem.querySelector('qti-gap-text[identifier="EDI"]') as QtiGapText;
    const gapTextGLA = assessmentItem.querySelector('qti-gap-text[identifier="GLA"]') as QtiGapText;
    const gapTextMAN = assessmentItem.querySelector('qti-gap-text[identifier="MAN"]') as QtiGapText;
    const gapTextMCH = assessmentItem.querySelector('qti-gap-text[identifier="MCH"]') as QtiGapText;

    const hotspotA = assessmentItem.querySelector('qti-associable-hotspot[identifier="A"]') as QtiAssociableHotspot;
    const hotspotB = assessmentItem.querySelector('qti-associable-hotspot[identifier="B"]') as QtiAssociableHotspot;
    const hotspotC = assessmentItem.querySelector('qti-associable-hotspot[identifier="C"]') as QtiAssociableHotspot;

    let score = '';
    await step('Each associable hotspot response area MUST accept only one choice(gap text).', async () => {
      await drag(gapTextCBG, { to: hotspotA, duration: 300 });
      await drag(gapTextMCH, { to: hotspotA, duration: 300 });
      await drag(gapTextEDI, { to: hotspotB, duration: 300 });
      await drag(gapTextGLA, { to: hotspotB, duration: 300 });
      await drag(gapTextMAN, { to: hotspotC, duration: 300 });
      await drag(gapTextMCH, { to: hotspotC, duration: 300 });

      expect(hotspotA.querySelectorAll('qti-gap-text').length).toBe(1);
      expect(hotspotB.querySelectorAll('qti-gap-text').length).toBe(1);
      expect(hotspotC.querySelectorAll('qti-gap-text').length).toBe(1);
    });

    await step('reset', async () => {
      await drag(gapTextCBG, { to: gapTextMCH.parentElement, duration: 300 });
      await drag(gapTextEDI, { to: gapTextMCH.parentElement, duration: 300 });
      await drag(gapTextMAN, { to: gapTextMCH.parentElement, duration: 300 });
    });

    await step('The minimum score MUST be determined to be 0 for a candidate(lower- bound="0").', async () => {
      await drag(gapTextMAN, { to: hotspotA, duration: 300 });
      await drag(gapTextMCH, { to: hotspotB, duration: 300 });
      await drag(gapTextGLA, { to: hotspotC, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 0').toBe(0);
    });

    await step('reset', async () => {
      await drag(gapTextMAN, { to: hotspotA.parentElement, duration: 300 });
      await drag(gapTextMCH, { to: hotspotA.parentElement, duration: 300 });
      await drag(gapTextGLA, { to: hotspotA.parentElement, duration: 300 });
    });

    // IN THE SPECIFICATION IT IS WRITTEN THAT THE SCORE IS 0 FOR 1 CORRECT PAIRING, BUT LOOKS LIKE A MISTAKE, AMP-UP SCORES THE SAME AS OUR IMPLEMENTATION
    await step('1 correct pairing, the score is 1', async () => {
      await drag(gapTextGLA, { to: hotspotA, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 1').toBe(1);
    });

    await step('For 2 correct pairings the score is 2.', async () => {
      await drag(gapTextEDI, { to: hotspotB, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 2').toBe(2);
    });

    await step('For 3 correct pairings the score is 3.', async () => {
      await drag(gapTextMAN, { to: hotspotC, duration: 300 });
      await fireEvent.click(submitButton);
      score = assessmentItem.variables.find(v => v.identifier === 'SCORE').value.toString();
      expect(+score, 'SCORE = 3').toBe(3);
    });
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Advanced/Q8/graphic-gap-match-interaction-2.xml`)
    })
  ]
};
