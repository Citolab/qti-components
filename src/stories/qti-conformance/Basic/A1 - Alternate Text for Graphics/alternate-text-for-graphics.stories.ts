import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { action } from '@storybook/addon-actions';
import { expect } from '@storybook/test';
import { screen } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getItemByUri } from '../../../../lib/qti-loader';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/A1 - Alternate Text for Graphics/alternate-text-for-graphics'
};
export default meta;

export const Default: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
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
        ${unsafeHTML(xml)}
      </div>
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: ({ canvasElement }) => {
    // const canvas = within(canvasElement);

    // const qtiAssessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const image = screen.getByAltText('Here the alt text');
    // Assert if the element is visible
    expect(image).toBeInTheDocument();
    expect(image).toBeVisible();
  },
  loaders: [
    async ({ args }) => ({
      xml: await getItemByUri(`assets/qti-conformance/Basic/A1/alternate-text-for-graphics.xml`)
    })
  ]
};
