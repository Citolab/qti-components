import {
  QtiAssessmentItem,
  QtiExtendedTextInteraction,
  QtiSimpleChoice,
  QtiTextEntryInteraction
} from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { fireEvent, screen, userEvent } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemByUri } from '../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/Q5 - Extended Text Interaction/baseType-string',
  beforeEach: async ({ args }) => {}
};
export default meta;

export const Q5_L1_D1: Story = {
  name: 'Q5_L1_D1',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: async ({ canvasElement }) => {
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const extendedTextInteraction = assessmentItem.querySelector(
      'qti-extended-text-interaction'
    ) as QtiExtendedTextInteraction;
    const textarea = extendedTextInteraction.shadowRoot.querySelector('textarea');
    // Add a space to the input field
    await userEvent.type(textarea, 'T');
    // Remove the space
    await userEvent.keyboard('{backspace}');

    const classes = textarea.classList;
    const containsHeightClass = !!Array.from(classes).find(c => c.startsWith('qti-height-lines-'));
    expect(containsHeightClass).toBeFalsy();

    fireEvent.click(submitButton);

    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe('');
  },
  loaders: [
    async ({ args }) => {
      try {
        const xml = await getItemByUri('assets/qti-conformance/Basic/Q5/base-type-string.xml');
        return { xml };
      } catch (error) {
        console.error('XML validation exception caught during loading:', error.message);
        return { xml: `<p>XML validation error</p>` };
      }
    }
  ]
};

export const Q5_L1_D2: Story = {
  name: 'Q20-L1-D2',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: async ({ canvasElement }) => {
    const lorem = `Leaves fall, softly gold,
Wind whispers through empty trees,
Autumn’s quiet song.`;
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const extendedTextInteraction = assessmentItem.querySelector(
      'qti-extended-text-interaction'
    ) as QtiExtendedTextInteraction;
    const textarea = extendedTextInteraction.shadowRoot.querySelector('textarea');
    // Add a space to the input field
    await userEvent.type(textarea, lorem);
    fireEvent.click(submitButton);

    expect(textarea.rows).toBe(3);
    expect(extendedTextInteraction.classList.contains('qti-height-lines-3')).toBeTruthy();
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe(lorem);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q5/extended-text-sv-2a.xml')
    })
  ]
};

export const Q5_L1_D3: Story = {
  name: 'Q20-L1-D3',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: async ({ canvasElement }) => {
    const lorem = `Thank you for the card!
My town is small, peaceful too.
The nicest part? The lake.
In the evenings, I stroll there,
Watching sunsets paint the sky.
Wish you could see it too!`;
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const extendedTextInteraction = assessmentItem.querySelector(
      'qti-extended-text-interaction'
    ) as QtiExtendedTextInteraction;
    const textarea = extendedTextInteraction.shadowRoot.querySelector('textarea');
    // Add a space to the input field
    await userEvent.type(textarea, lorem);
    fireEvent.click(submitButton);
    expect(textarea.rows).toBe(6);
    //
    expect(extendedTextInteraction.classList.contains('qti-height-lines-6')).toBeTruthy();
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe(lorem);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q5/extended-text-sv-2b.xml')
    })
  ]
};

export const Q5_L1_D4: Story = {
  name: 'Q20-L1-D4',
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    let item: QtiAssessmentItem;
    const onInteractionChangedAction = action('qti-interaction-changed');
    const onOutcomeChangedAction = action('qti-outcome-changed');
    const onItemConnected = ({ detail: qtiAssessmentItem }) => {
      item = qtiAssessmentItem;
      action('qti-assessment-item-connected');
    };

    return html`
      <div
        class="item"
        @qti-interaction-changed=${onInteractionChangedAction}
        @qti-outcome-changed=${onOutcomeChangedAction}
        @qti-assessment-item-connected=${onItemConnected}
      >
        ${xml}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  play: async ({ canvasElement }) => {
    const lorem = `Thanks so much for the postcard!
It’s lovely to see a glimpse of your town,
A reminder of places I’ve yet to visit.
Mine is a small, cozy place
With winding streets and friendly faces.
The nicest part, I’d say, is the lake,
Where sunsets turn the water gold.
On evenings, I often stroll along the shore,
Listening to the gentle waves lap the sand.
Sometimes, there’s music in the park,
And people gather, laughter filling the air.
In winter, lights hang from every tree,
Making even the darkest nights feel warm.
I hope someday you can visit,
So I can show you around myself!`;
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const extendedTextInteraction = assessmentItem.querySelector(
      'qti-extended-text-interaction'
    ) as QtiExtendedTextInteraction;
    const textarea = extendedTextInteraction.shadowRoot.querySelector('textarea');
    // Add a space to the input field
    await userEvent.type(textarea, lorem);
    fireEvent.click(submitButton);

    expect(textarea.rows).toBe(15);

    //
    expect(extendedTextInteraction.classList.contains('qti-height-lines-15')).toBeTruthy();
    const response = assessmentItem.variables.find(v => v.identifier === 'RESPONSE');
    expect(response.value).toBe(lorem);
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri('assets/qti-conformance/Basic/Q5/extended-text-sv-2c.xml')
    })
  ]
};

// Q5-L1-D103: File extended-text-entry-sv-2b.xml uses the class qti-height-lines-6 in the qti-text-entry-interaction element. When the example is visually presented it MUST display the text input area at least 6 lines high.

// Q5-L1-D104: File extended-text-entry-sv-2c.xml uses the class qti-height-lines-15 in the qti-text-entry-interaction element. When the example is visually presented it MUST display the text input area at least 15 lines high.