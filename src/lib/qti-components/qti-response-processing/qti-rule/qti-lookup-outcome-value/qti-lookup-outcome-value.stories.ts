import '@citolab/qti-components/qti-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// import storyXML from './qti-lookup-outcome-value.xml?raw';
const storyXML = `<qti-assessment-item
  title="32c2sb"
  identifier="ITM-32c2sb"
  time-dependent="false"
  xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
>
  <qti-outcome-declaration identifier="RAW_SCORE" cardinality="single" base-type="integer">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-interpolation-table>
      <qti-interpolation-table-entry
        include-boundary="false"
        source-value="3"
        target-value="2"
      ></qti-interpolation-table-entry>
      <qti-interpolation-table-entry
        include-boundary="false"
        source-value="2"
        target-value="1"
      ></qti-interpolation-table-entry>
      <qti-interpolation-table-entry
        include-boundary="false"
        source-value="1"
        target-value="0"
      ></qti-interpolation-table-entry>
      <qti-interpolation-table-entry
        include-boundary="false"
        source-value="0"
        target-value="0"
      ></qti-interpolation-table-entry>
    </qti-interpolation-table>
  </qti-outcome-declaration>

  <qti-response-processing>
    <qti-lookup-outcome-value identifier="SCORE">
      <qti-variable identifier="RAW_SCORE"></qti-variable>
    </qti-lookup-outcome-value>
  </qti-response-processing>
</qti-assessment-item>`;

type Story = StoryObj; // <Props>;

const meta: Meta = {
  component: 'qti-lookup-outcome-variable'
};
export default meta;

// FIXME: Story can not be used as type Default:Story, got this error : 'Expected 2 arguments, but got 1.'
export const Default = {
  render: args => {
    return html`${unsafeHTML(storyXML)}`;
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const assessmentItem = canvasElement.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('RAW_SCORE', '3');

    assessmentItem.processResponse();
    expect(assessmentItem.context.variables.find(v => v.identifier === 'SCORE').value).toEqual('2');
  }
};
