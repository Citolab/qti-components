import '@citolab/qti-components/qti-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { withActions } from '@storybook/addon-actions/decorator';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './item-print-variables';

import { getWcStorybookHelpers } from 'wc-storybook-helpers';

const { events, args, argTypes, template } = getWcStorybookHelpers('qti-assessment-item');

type Story = StoryObj<typeof QtiAssessmentItem>;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-assessment-item',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  },
  decorators: [withActions]
};
export default meta;

const QtiAssessmentItemTemplate = (args: any) => html`
  ${template(
    args,
    html`
      <qti-outcome-declaration
        identifier="RAW_SCORE"
        cardinality="single"
        base-type="integer"
      ></qti-outcome-declaration>
      <qti-response-declaration
        identifier="RESPONSE"
        cardinality="single"
        base-type="boolean"
      ></qti-response-declaration>
      <item-print-variables></item-print-variables>
    `
  )}
`;

export const Default: Story = {
  render: args => QtiAssessmentItemTemplate.bind({})(args),
  args: {
    // docsHint: 'Some other value than the default'
  },
  play: ({ canvasElement }) => {
    // const canvas = within(canvasElement);

    const qtiAssessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;

    // qtiAssessmentItem.variables = [
    //   {
    //     identifier: 'RAW_SCORE',
    //     value: '3',
    //     type: 'outcome'
    //   },
    //   {
    //     identifier: 'RESPONSE',
    //     value: 'true',
    //     type: 'response'
    //   }
    // ];

    // expect(qtiAssessmentItem.variables).toBeTruthy();
  }
};
