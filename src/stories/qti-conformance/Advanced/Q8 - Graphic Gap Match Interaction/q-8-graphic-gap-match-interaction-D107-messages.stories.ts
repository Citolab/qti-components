import { QtiAssessmentItem, QtiGapText, QtiGraphicGapMatchInteraction } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, within } from '@storybook/test';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { getItemByUri } from '../../../../lib/qti-loader';
import drag from 'src/testing/drag';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/advanced/Q-8 Graphic Gap Match Interaction'
};
export default meta;

export const Q8_L2_D107: Story = {
  name: 'Q8-L2-D107',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', {
      name: 'Submit'
    });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const qtiGapMatchInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[response-identifier="RESPONSE1"]'
    ) as HTMLElement;
    const dataMaxSelectionsMessage = qtiGapMatchInteraction.getAttribute('data-max-selections-message');
    const dataMinSelectionsMessage = qtiGapMatchInteraction.getAttribute('data-min-selections-message');

    const validationMessageElement = qtiGapMatchInteraction.shadowRoot.querySelector(
      '#validationMessage'
    ) as HTMLElement;

    const gapChoices = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-gap-img'));
    const responseHotspots = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(qtiGapMatchInteraction).not.toBeNull();
    expect(validationMessageElement).not.toBeNull();
    expect(gapChoices.length).toBeGreaterThan(0);
    expect(responseHotspots.length).toBeGreaterThan(0);

    // Test for exceeding max selections
    await step('Attempt to make more than 2 associations', async () => {
      // Drag and drop to make 3 associations
      await drag(gapChoices[0], { to: responseHotspots[0], duration: 300 });
      await drag(gapChoices[1], { to: responseHotspots[1], duration: 300 });
      await drag(gapChoices[2], { to: responseHotspots[2], duration: 300 });

      // Check validation message for exceeding max selections
      expect(validationMessageElement.textContent).toContain(dataMaxSelectionsMessage);
      expect(validationMessageElement).toBeVisible();

      action('Displayed max selections message')();
    });

    // Test for submitting with zero associations
    await step('Submit item with zero associations', async () => {
      // Reset all associations
      await drag(gapChoices[0], { to: qtiGapMatchInteraction, duration: 300 });
      await drag(gapChoices[1], { to: qtiGapMatchInteraction, duration: 300 });
      await drag(gapChoices[2], { to: qtiGapMatchInteraction, duration: 300 });

      // Submit the item
      await fireEvent.click(submitButton);

      // Check validation message for zero associations
      expect(validationMessageElement.textContent).toContain(dataMinSelectionsMessage);
      expect(validationMessageElement).toBeVisible();

      action('Displayed min selections message')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-3.xml`)
    })
  ]
};

export const Q8_L2_D110: Story = {
  name: 'Q8-L2-D110',
  render: (args, { argTypes, loaded: { xml } }: { argTypes: ArgTypes; loaded: Record<'xml', Element> }) => {
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
    const canvas = within(canvasElement);
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    const qtiGapMatchInteraction = assessmentItem.querySelector(
      'qti-graphic-gap-match-interaction[response-identifier="RESPONSE2"]'
    ) as HTMLElement;

    const validationMessageElement = qtiGapMatchInteraction.shadowRoot.querySelector(
      '#validationMessage'
    ) as HTMLElement;

    const gapChoices = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-gap-img'));
    const responseHotspots = Array.from(qtiGapMatchInteraction.querySelectorAll('qti-associable-hotspot'));

    // Ensure elements exist
    expect(qtiGapMatchInteraction).not.toBeNull();
    expect(validationMessageElement).not.toBeNull();
    expect(gapChoices.length).toBeGreaterThan(0);
    expect(responseHotspots.length).toBeGreaterThan(1);

    // Test for exceeding max associations
    await step('Attempt to make more than 1 association', async () => {
      // TODO. check why the first time it's not working so drag twice
      await drag(gapChoices[1], { to: responseHotspots[2], duration: 300 });
      await drag(gapChoices[1], { to: qtiGapMatchInteraction, duration: 300 });

      // Drag and drop to make 2 associations
      await drag(gapChoices[1], { to: responseHotspots[2], duration: 300 });
      await drag(gapChoices[2], { to: responseHotspots[3], duration: 300 });

      // Check validation message for exceeding max selections
      expect(validationMessageElement.textContent).toContain(
        `You've selected too many associations. Maximum allowed is 1.`
      );
      expect(validationMessageElement).toBeVisible();

      action('Displayed platform default max selections message')();
    });
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Advanced/Q8/graphic-gap-match-sv-3.xml`)
    })
  ]
};
