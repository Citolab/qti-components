import '@citolab/qti-components';
import { html, render } from 'lit';
import { ContextProvider } from '@lit/context';

import { computedContext } from '@qti-components/base';

import type { ComputedContext } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

describe('qti-feedback-block show-feedback constraint', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const makeComputedContext = (showFeedback: boolean | undefined): ComputedContext => ({
    view: 'candidate',
    identifier: 'test-1',
    title: 'Test',
    testParts: [
      {
        active: true,
        identifier: 'tp-1',
        navigationMode: 'nonlinear',
        submissionMode: 'individual',
        sections: [
          {
            active: true,
            identifier: 'sec-1',
            title: 'Section 1',
            navigationMode: 'nonlinear',
            submissionMode: 'individual',
            items: [
              {
                active: true,
                identifier: 'feedback-test',
                href: '',
                variables: [],
                showFeedback,
                maxAttempts: 1
              }
            ]
          }
        ]
      }
    ]
  });

  const feedbackTemplate = html`<qti-assessment-item identifier="feedback-test">
    <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
      <qti-correct-response>
        <qti-value>ChoiceA</qti-value>
      </qti-correct-response>
    </qti-response-declaration>
    <qti-outcome-declaration identifier="FEEDBACKBASIC" cardinality="single" base-type="identifier">
      <qti-default-value><qti-value>empty</qti-value></qti-default-value>
    </qti-outcome-declaration>
    <qti-item-body>
      <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
        <qti-simple-choice identifier="ChoiceA">Choice A</qti-simple-choice>
        <qti-simple-choice identifier="ChoiceB">Choice B</qti-simple-choice>
      </qti-choice-interaction>
      <qti-feedback-block outcome-identifier="FEEDBACKBASIC" identifier="incorrect" show-hide="show">
        Incorrect
      </qti-feedback-block>
    </qti-item-body>
    <qti-response-processing>
      <qti-response-condition>
        <qti-response-if>
          <qti-match>
            <qti-variable identifier="RESPONSE"></qti-variable>
            <qti-correct identifier="RESPONSE"></qti-correct>
          </qti-match>
          <qti-set-outcome-value identifier="FEEDBACKBASIC">
            <qti-base-value base-type="identifier">correct</qti-base-value>
          </qti-set-outcome-value>
        </qti-response-if>
        <qti-response-else>
          <qti-set-outcome-value identifier="FEEDBACKBASIC">
            <qti-base-value base-type="identifier">incorrect</qti-base-value>
          </qti-set-outcome-value>
        </qti-response-else>
      </qti-response-condition>
    </qti-response-processing>
  </qti-assessment-item>`;

  it('should hide feedback when showFeedback is false', async () => {
    new ContextProvider(container, { context: computedContext, initialValue: makeComputedContext(false) });

    render(feedbackTemplate, container);

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    // Submit an incorrect answer to trigger feedback
    assessmentItem.updateResponseVariable('RESPONSE', 'ChoiceB');
    assessmentItem.processResponse();

    const feedbackBlock = assessmentItem.querySelector('qti-feedback-block');
    expect(feedbackBlock.showStatus).toBe('off');
  });

  it('should show feedback when showFeedback is true', async () => {
    new ContextProvider(container, { context: computedContext, initialValue: makeComputedContext(true) });

    render(feedbackTemplate, container);

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    // Submit an incorrect answer to trigger feedback
    assessmentItem.updateResponseVariable('RESPONSE', 'ChoiceB');
    assessmentItem.processResponse();

    const feedbackBlock = assessmentItem.querySelector('qti-feedback-block');
    expect(feedbackBlock.showStatus).toBe('on');
  });

  it('should hide feedback when showFeedback is undefined (default is false)', async () => {
    new ContextProvider(container, { context: computedContext, initialValue: makeComputedContext(undefined) });

    render(feedbackTemplate, container);

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    // No constraint set — default behavior
    assessmentItem.updateResponseVariable('RESPONSE', 'ChoiceB');
    assessmentItem.processResponse();

    const feedbackBlock = assessmentItem.querySelector('qti-feedback-block');
    expect(feedbackBlock.showStatus).toBe('off');
  });
});
