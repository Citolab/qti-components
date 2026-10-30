import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiPortableCustomInteraction } from '../qti-portable-custom-interaction';
import type { QtiPortableCustomInteractionTest } from '../qti-portable-custom-test-interaction';

import '../qti-portable-custom-test-interaction';

type Story = StoryObj<QtiPortableCustomInteraction>;

/**
 * ## API Stories
 *
 * The response bridge between the item and a PCI for responses that are not a plain string:
 * record cardinality and base-type file.
 */
const meta: Meta<QtiPortableCustomInteraction> = {
  component: 'qti-portable-custom-interaction',
  title: 'Interactions/Portable Custom Interaction/API',
  tags: ['api']
};
export default meta;

const timeInWindow = (field: string) => html`
  <qti-gte>
    <qti-field-value field-identifier=${field}><qti-variable identifier="RESPONSE"></qti-variable></qti-field-value>
    <qti-base-value base-type="float">3.0</qti-base-value>
  </qti-gte>
  <qti-lte>
    <qti-field-value field-identifier=${field}><qti-variable identifier="RESPONSE"></qti-variable></qti-field-value>
    <qti-base-value base-type="float">5.1</qti-base-value>
  </qti-lte>
`;

/**
 * A PCI bound to a `record` response (the "stop the video and click the frame" case).
 *
 * The PCI reports `{ record: [{ name: 'time', base: { float } }, { name: 'point', base: { point } }] }`.
 * The item stores it as the field map `{ time: '4.12', point: '455 250' }`, response processing
 * reads the fields with `qti-field-value`, and on a later construction the PCI gets the record back
 * in `boundTo` typed by the declaration, and the record correct response once it shows a solution.
 */
export const RecordResponse: Story = {
  render: () =>
    html`<qti-assessment-item
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      identifier="pci-record-response"
      title="PCI record response"
      adaptive="false"
      time-dependent="false"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="record">
        <qti-correct-response>
          <qti-value field-identifier="time" base-type="float">4.0</qti-value>
          <qti-value field-identifier="point" base-type="point">460 245</qti-value>
        </qti-correct-response>
      </qti-response-declaration>
      <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value><qti-value>0</qti-value></qti-default-value>
      </qti-outcome-declaration>
      <qti-item-body>
        <qti-portable-custom-interaction-test
          response-identifier="RESPONSE"
          module="recordPci"
          custom-interaction-type-identifier="urn:fdc:qti-components:test:recordPci"
          data-time="4.12"
          data-x="455"
          data-y="250"
          data-base-url="/assets/qti-portable-interaction/record-pci"
        >
          <qti-interaction-modules>
            <qti-interaction-module id="recordPci" primary-path="record-pci.js"></qti-interaction-module>
          </qti-interaction-modules>
          <qti-interaction-markup></qti-interaction-markup>
        </qti-portable-custom-interaction-test>
      </qti-item-body>
      <qti-response-processing>
        <qti-response-condition>
          <qti-response-if>
            <qti-and>
              ${timeInWindow('time')}
              <qti-inside shape="circle" coords="460,245,60">
                <qti-field-value field-identifier="point">
                  <qti-variable identifier="RESPONSE"></qti-variable>
                </qti-field-value>
              </qti-inside>
            </qti-and>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-if>
          <qti-response-else-if>
            <qti-and>${timeInWindow('time')}</qti-and>
            <qti-set-outcome-value identifier="SCORE">
              <qti-base-value base-type="float">0.5</qti-base-value>
            </qti-set-outcome-value>
          </qti-response-else-if>
        </qti-response-condition>
      </qti-response-processing>
    </qti-assessment-item>`,
  play: async ({ canvasElement, step }) => {
    const item = canvasElement.querySelector('qti-assessment-item') as unknown as QtiAssessmentItem;
    const pci = canvasElement.querySelector(
      'qti-portable-custom-interaction-test'
    ) as unknown as QtiPortableCustomInteractionTest;
    // The PCI configuration lives inside the iframe; there is no semantic query for it.
    const configOf = () => (pci.querySelector('iframe')?.contentWindow as any)?.PCIManager?.pciConfig;
    const responseValue = () => item.itemContext.variables.find(v => v.identifier === 'RESPONSE')?.value;

    await pci.waitForReady(10000);

    await step('the PCI reports a record, the item stores its field map', async () => {
      await waitFor(
        async () => {
          await pci.iFrameClickOnElementByText('Answer');
          expect(responseValue()).toEqual({ time: '4.12', point: '455 250' });
        },
        { timeout: 5000 }
      );
      expect(pci.validate()).toBe(true);
    });

    await step('response processing reads the fields and scores 1', async () => {
      item.processResponse();
      expect(+item.getOutcome('SCORE').value).toBe(1);
    });

    await step('a new construction gets the record back in boundTo, typed by the declaration', async () => {
      await pci.recreateIframe();
      await waitFor(
        () =>
          expect(configOf()?.boundTo).toEqual({
            RESPONSE: {
              record: [
                { name: 'time', base: { float: 4.12 } },
                { name: 'point', base: { point: [455, 250] } }
              ]
            }
          }),
        { timeout: 10000, interval: 250 }
      );
    });

    await step('in solution status the PCI gets the record correct response as a field map', async () => {
      pci.status = 'solution';
      await pci.recreateIframe();
      await waitFor(
        () =>
          expect(configOf()?.responseDeclaration).toEqual({
            cardinality: 'record',
            correctResponse: { value: { time: '4.0', point: '460 245' } }
          }),
        { timeout: 10000, interval: 250 }
      );
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};

/** "hello world" as the PCI reports it, and as the item stores it. */
const HELLO_FILE = { data: 'aGVsbG8gd29ybGQ=', mime: 'text/plain' };
const HELLO_DATA_URL = 'data:text/plain;base64,aGVsbG8gd29ybGQ=';

/**
 * A PCI bound to a response with base-type `file` (a recording, a drawing, an upload).
 *
 * The PCI reports `{ base: { file: { data, mime, name } } }`. The item stores it as a data URL, the
 * value `qti-upload-interaction` stores for the same file, and on a later construction the PCI gets
 * `{ data, mime }` back in `boundTo`. Before, the item stored `"[object Object]"` and the file was lost.
 */
export const FileResponse: Story = {
  render: () =>
    html`<qti-assessment-item
      xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
      identifier="pci-file-response"
      title="PCI file response"
      adaptive="false"
      time-dependent="false"
    >
      <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="file"></qti-response-declaration>
      <qti-item-body>
        <qti-portable-custom-interaction-test
          response-identifier="RESPONSE"
          module="filePci"
          custom-interaction-type-identifier="urn:fdc:qti-components:test:filePci"
          data-base-url="/assets/qti-portable-interaction/file-pci"
        >
          <qti-interaction-modules>
            <qti-interaction-module id="filePci" primary-path="file-pci.js"></qti-interaction-module>
          </qti-interaction-modules>
          <qti-interaction-markup></qti-interaction-markup>
        </qti-portable-custom-interaction-test>
      </qti-item-body>
    </qti-assessment-item>`,
  play: async ({ canvasElement, step }) => {
    const item = canvasElement.querySelector('qti-assessment-item') as unknown as QtiAssessmentItem;
    const pci = canvasElement.querySelector(
      'qti-portable-custom-interaction-test'
    ) as unknown as QtiPortableCustomInteractionTest;
    // The PCI configuration lives inside the iframe; there is no semantic query for it.
    const configOf = () => (pci.querySelector('iframe')?.contentWindow as any)?.PCIManager?.pciConfig;
    const responseValue = () => item.itemContext.variables.find(v => v.identifier === 'RESPONSE')?.value;

    await pci.waitForReady(10000);

    await step('the PCI reports a file, the item stores it as a data URL', async () => {
      await waitFor(
        async () => {
          await pci.iFrameClickOnElementByText('Answer');
          expect(responseValue()).toBe(HELLO_DATA_URL);
        },
        { timeout: 5000 }
      );
    });

    await step('a new construction gets the file back in boundTo', async () => {
      await pci.recreateIframe();
      await waitFor(() => expect(configOf()?.boundTo).toEqual({ RESPONSE: { base: { file: HELLO_FILE } } }), {
        timeout: 10000,
        interval: 250
      });
    });

    await step('a data URL as an upload interaction stores it reaches the PCI the same way', async () => {
      // This one without ;base64, which a data URL may also be.
      item.updateResponseVariable('RESPONSE', 'data:text/plain,hello%20world');
      await pci.recreateIframe();
      await waitFor(() => expect(configOf()?.boundTo).toEqual({ RESPONSE: { base: { file: HELLO_FILE } } }), {
        timeout: 10000,
        interval: 250
      });
    });
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
};
