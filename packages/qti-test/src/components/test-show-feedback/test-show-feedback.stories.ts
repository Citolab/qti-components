import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { within } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { TestShowFeedback } from './test-show-feedback';
import type { QtiTest } from '../qti-test/qti-test';
import type { QtiTestFeedback } from '../qti-test-feedback/qti-test-feedback';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-show-feedback');

type Story = StoryObj<TestShowFeedback & typeof args>;

const meta: Meta<TestShowFeedback> = {
  component: 'test-show-feedback',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

/**
 * No conformance asset combines real test-level outcome processing with
 * qti-test-feedback, so the test document is built inline — an empty section
 * (nothing to attempt) plus a single `access="atEnd"` feedback whose outcome
 * the play function sets by hand, the same way qti-test-feedback.spec.ts does.
 */
const assessmentTest = (button: unknown) => html`
  <qti-test navigate="item">
    <test-navigation>
      <test-container>
        <qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="T1" title="Feedback Demo">
          <qti-outcome-declaration identifier="FB_TEST" cardinality="single" base-type="identifier">
          </qti-outcome-declaration>
          <qti-test-part identifier="P1" navigation-mode="nonlinear" submission-mode="individual">
            <qti-assessment-section identifier="S1" title="S1" visible="true"> </qti-assessment-section>
          </qti-test-part>
          <qti-test-feedback identifier="test-over" outcome-identifier="FB_TEST" access="atEnd" show-hide="show">
            <p>Great job — you reached the end of the test.</p>
          </qti-test-feedback>
          <qti-outcome-processing></qti-outcome-processing>
        </qti-assessment-test>
      </test-container>
      ${button}
    </test-navigation>
  </qti-test>
`;

export const Default: Story = {
  render: args => assessmentTest(template(args, html`How Did I Do?`))
};

export const Test: Story = {
  render: () => assessmentTest(html`<test-show-feedback>How Did I Do?</test-show-feedback>`),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;
    await qtiTest.updateComplete;

    const showFeedbackButton = canvas.getByShadowText('How Did I Do?');
    const feedback = canvasElement.querySelector<QtiTestFeedback>('qti-test-feedback[identifier="test-over"]');
    expect(showFeedbackButton).toBeDisabled();
    expect(feedback?.showStatus).not.toBe('on');

    // The test concludes: its outcome processing names the atEnd feedback.
    // This makes the feedback *available* — it still does not show yet.
    qtiTest.updateOutcomeVariable('FB_TEST', 'test-over');
    qtiTest.outcomeProcessing({ atEnd: true });

    await waitFor(() => expect(showFeedbackButton).toBeEnabled());
    expect(feedback?.showStatus).not.toBe('on');

    await fireEvent.click(showFeedbackButton);

    await waitFor(() => expect(feedback?.showStatus).toBe('on'));
    expect(showFeedbackButton).toBeDisabled();
  }
};
