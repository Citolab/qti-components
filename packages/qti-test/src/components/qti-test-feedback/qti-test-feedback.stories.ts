import { expect, waitFor } from 'storybook/test';
import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { QtiTestFeedback } from './qti-test-feedback';
import type { QtiTest } from '../qti-test/qti-test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { args, argTypes } = getStorybookHelpers('qti-test-feedback');

type Story = StoryObj<QtiTestFeedback & typeof args>;

const meta: Meta<QtiTestFeedback> = {
  component: 'qti-test-feedback',
  args,
  argTypes
};
export default meta;

/**
 * No conformance asset combines real test-level outcome processing with
 * qti-test-feedback, so the test document is built inline — an empty section
 * (nothing to attempt), one `during` feedback and one `atEnd` feedback, whose
 * outcomes the play function sets by hand, the same way qti-test-feedback.spec.ts
 * does.
 */
const assessmentTest = html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Feedback Demo">
          <qti-outcome-declaration identifier="FB_TEST" cardinality="single" base-type="identifier">
          </qti-outcome-declaration>
          <qti-outcome-declaration identifier="FB_DURING" cardinality="single" base-type="identifier">
          </qti-outcome-declaration>
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
          </qti-test-part>
          <qti-test-feedback identifier="test-over" outcome-identifier="FB_TEST" access="atEnd" show-hide="show">
            <p>End of test — hidden until the candidate navigates here.</p>
          </qti-test-feedback>
          <qti-test-feedback identifier="in-progress" outcome-identifier="FB_DURING" access="during" show-hide="show">
            <p>Still going — shown the instant its outcome matches.</p>
          </qti-test-feedback>
          <qti-outcome-processing></qti-outcome-processing>
        </qti-assessment-test>
      </test-container>
    </test-navigation>
  </qti-test>
`;

export const Default: Story = {
  render: () => assessmentTest
};

export const Test: Story = {
  render: () => assessmentTest,
  play: async ({ canvasElement }) => {
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;

    const testOver = canvasElement.querySelector<QtiTestFeedback>('qti-test-feedback[identifier="test-over"]');
    const inProgress = canvasElement.querySelector<QtiTestFeedback>('qti-test-feedback[identifier="in-progress"]');

    // during-feedback shows the instant its outcome matches.
    qtiTest.updateOutcomeVariable('FB_DURING', 'in-progress');
    qtiTest.outcomeProcessing();
    await waitFor(() => expect(inProgress?.showStatus).toBe('on'));

    // atEnd feedback becomes available but stays hidden until the candidate
    // navigates to it.
    qtiTest.updateOutcomeVariable('FB_TEST', 'test-over');
    qtiTest.outcomeProcessing({ atEnd: true });
    expect(testOver?.showStatus).not.toBe('on');

    qtiTest.navigateTo('feedback', 'test-over');
    await waitFor(() => expect(testOver?.showStatus).toBe('on'));
  }
};
