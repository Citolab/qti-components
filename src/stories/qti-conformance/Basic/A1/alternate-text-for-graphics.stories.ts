import { expect } from '@storybook/test';
import { screen, userEvent } from '@storybook/testing-library';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { html } from 'lit';
import { fetchItem } from 'src/stories/fetch-item';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

type Story = StoryObj;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-conformance/basic/a1/alternate-text-for-graphics'
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
      xml: await fetchItem(`assets/qti-conformance/Basic/A1/alternate-text-for-graphics.xml`)
    })
  ]
};

// export const MyComponentStory: Story = () => html`${xml}`;

// MyComponentStory.play = async () => {
//   // Query elements using Testing Library
//   const image = screen.getByAltText('expected-alt-text');

//   // Assert if the element is visible
//   expect(image).toBeInTheDocument();
//   expect(image).toBeVisible();

//   // Simulate interactions if necessary
//   await userEvent.click(screen.getByRole('button'));
// };