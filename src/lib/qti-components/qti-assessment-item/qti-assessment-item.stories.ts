import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
// import { getWcStorybookHelpers } from 'wc-storybook-helpers';
import './item-print-variables';

// const { events, args, argTypes, template } = getWcStorybookHelpers('qti-assessment-item');

type Story = StoryObj<typeof QtiAssessmentItem>;

const meta: Meta<QtiAssessmentItem> = {
  component: 'qti-assessment-item'
  // args,
  // argTypes,
  // parameters: {
  //   actions: {
  //     handles: events
  //   }
  // },
  // decorators: [withActions]
};
export default meta;

const QtiAssessmentItemTemplate = (args: any) => html` <div>hoi</div> `;

export const Popover: Story = {
  render: args =>
    html`<qti-assessment-item
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd
                                                http://www.duo.nl/schema/dep_extension ../dep_extension.xsd"
      title="32gbg6"
      identifier="ITM-32gbg6"
      time-dependent="false"
      label="32gbg6"
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      xmlns:dep="http://www.duo.nl/schema/dep_extension"
    >
      <qti-item-body class="defaultBody" xml:lang="nl-NL">
        <div class="content">
          <div class="qti-layout-row">
            <div class="qti-layout-col6">
              <div id="leftbody">
                <p>
                  <span>&#xbb; Klik op de kaart voor een vergroting.</span>
                </p>
                <p>
                  <span>Neerslag in het stroomgebied van de Rijn en de Maas</span>
                </p>
                <button popovertarget="WIN_d579fd6a-c46d-409a-a9f6-df7bbabcb8e3">
                  <div class="dep-dialogTrigger" data-stimulus-idref="WIN_d579fd6a-c46d-409a-a9f6-df7bbabcb8e3">
                    <img
                      src="/qti-assessment-stimulus-ref/images/AKbb201cbt-12ag.gif"
                      alt=""
                      width="344"
                      height="331"
                      id="Id-IMG-d3288d98-4e63-453f-b241-e4e5760d1768"
                    />
                  </div>
                </button>
                <div
                  id="WIN_d579fd6a-c46d-409a-a9f6-df7bbabcb8e3"
                  class="dep-dialog hide-dialog"
                  data-dep-dialog-caption="Neerslag in het stroomgebied van de Rijn en de Maas"
                  data-dep-dialog-width="548"
                  data-dep-dialog-height="558"
                  data-dep-dialog-resizemode="fixed"
                  data-dep-dialog-modal="false"
                  data-dep-dialog-open="true"
                  popover="WIN_d579fd6a-c46d-409a-a9f6-df7bbabcb8e3"
                >
                  <img
                    src="/qti-assessment-stimulus-ref/images/AKbb201cbt-12ag.gif"
                    width="513"
                    height="493"
                    alt=""
                    id="Id-IMG-a82f4c43-80a8-4020-86d2-9abb9eb4e719"
                  />
                </div>
              </div>
            </div>
            <div class="qti-layout-col6">
              <div></div>
            </div>
          </div>
        </div>
      </qti-item-body>
    </qti-assessment-item>`
};

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

// ${template(
//   args,
//   html`
//     <qti-outcome-declaration
//       identifier="RAW_SCORE"
//       cardinality="single"
//       base-type="integer"
//     ></qti-outcome-declaration>
//     <qti-response-declaration
//       identifier="RESPONSE"
//       cardinality="single"
//       base-type="boolean"
//     ></qti-response-declaration>
//     <item-print-variables></item-print-variables> -->

// )}
