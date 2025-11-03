import { action } from 'storybook/actions';
import { expect, within } from 'storybook/test';
import { html } from 'lit';

import { getItemByUri } from '@qti-components/loader';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ArgTypes, Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  title: 'qti-conformance/basic/A1 - Alternate Text for Graphics/alternate-text-for-graphics/A1-L1-D1'
};
export default meta;

export const A1L1D1: Story = {
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
      <button @click=${() => item?.processResponse()}>Submit</button>
    `;
  },
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // const qtiAssessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const image = canvas.getByAltText('Here the alt text');
    // Assert if the element is visible
    expect(image).toBeInTheDocument();
    expect(image).toBeVisible();
  },
  loaders: [
    async () => ({
      xml: await getItemByUri(`/assets/qti-conformance/Basic/A1/alternate-text-for-graphics.xml`)
    })
  ]
};
