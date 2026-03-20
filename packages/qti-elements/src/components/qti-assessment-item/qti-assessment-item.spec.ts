import '@citolab/qti-components';
import { html, render } from 'lit';

import type { ItemContext } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

describe('qti-assessment-item', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('dispatches qti-item-context-updated when no responseProcessing is present', async () => {
    render(
      html`<qti-assessment-item identifier="no-processing">
        <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"></qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="integer"></qti-outcome-declaration>
        <qti-item-body>
          <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
            <qti-simple-choice identifier="ChoiceA">Choice A</qti-simple-choice>
          </qti-choice-interaction>
        </qti-item-body>
      </qti-assessment-item>`,
      container
    );

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    const contextUpdated = new Promise<CustomEvent<{ itemContext: ItemContext }>>(resolve =>
      assessmentItem.addEventListener('qti-item-context-updated', e => resolve(e as CustomEvent), { once: true })
    );

    const processed = assessmentItem.processResponse();

    expect(processed).toBe(false);

    const event = await contextUpdated;
    const variables = event.detail.itemContext.variables;

    expect(variables.find(v => v.identifier === 'numAttempts')?.value).toBe('1');
    expect(variables.find(v => v.identifier === 'completionStatus')?.value).toBe('completed');
  });

  it('resets outcome variables to default before each response processing for non-adaptive items', async () => {
    render(
      html`<qti-assessment-item identifier="non-adaptive-reset" adaptive="false">
        <qti-response-declaration identifier="RESPONSE_1" cardinality="single" base-type="integer">
          <qti-correct-response>
            <qti-value>1</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-response-declaration identifier="RESPONSE_2" cardinality="single" base-type="integer">
          <qti-correct-response>
            <qti-value>2</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"></qti-outcome-declaration>
        <qti-item-body>
          <qti-text-entry-interaction response-identifier="RESPONSE_1"></qti-text-entry-interaction>
          <qti-text-entry-interaction response-identifier="RESPONSE_2"></qti-text-entry-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-set-outcome-value identifier="SCORE">
            <qti-sum>
              <qti-variable identifier="SCORE"></qti-variable>
              <qti-match>
                <qti-variable identifier="RESPONSE_1"></qti-variable>
                <qti-correct identifier="RESPONSE_1"></qti-correct>
              </qti-match>
              <qti-match>
                <qti-variable identifier="RESPONSE_2"></qti-variable>
                <qti-correct identifier="RESPONSE_2"></qti-correct>
              </qti-match>
            </qti-sum>
          </qti-set-outcome-value>
        </qti-response-processing>
      </qti-assessment-item>`,
      container
    );

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    assessmentItem.updateResponseVariable('RESPONSE_1', '1');
    assessmentItem.updateResponseVariable('RESPONSE_2', '0');
    assessmentItem.processResponse();
    expect(+assessmentItem.getOutcome('SCORE').value).toBe(1);

    assessmentItem.updateResponseVariable('RESPONSE_1', '0');
    assessmentItem.updateResponseVariable('RESPONSE_2', '2');
    assessmentItem.processResponse();

    expect(+assessmentItem.getOutcome('SCORE').value).toBe(1);
  });

  it('retains outcome variables between response processing attempts for adaptive items', async () => {
    render(
      html`<qti-assessment-item identifier="adaptive-retain" adaptive="true">
        <qti-response-declaration identifier="RESPONSE_1" cardinality="single" base-type="integer">
          <qti-correct-response>
            <qti-value>1</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
          <qti-default-value><qti-value>0</qti-value></qti-default-value>
        </qti-outcome-declaration>
        <qti-item-body>
          <qti-text-entry-interaction response-identifier="RESPONSE_1"></qti-text-entry-interaction>
        </qti-item-body>
        <qti-response-processing>
          <qti-response-condition>
            <qti-response-if>
              <qti-match>
                <qti-variable identifier="RESPONSE_1"></qti-variable>
                <qti-correct identifier="RESPONSE_1"></qti-correct>
              </qti-match>
              <qti-set-outcome-value identifier="SCORE">
                <qti-sum>
                  <qti-variable identifier="SCORE"></qti-variable>
                  <qti-base-value base-type="float">1</qti-base-value>
                </qti-sum>
              </qti-set-outcome-value>
            </qti-response-if>
          </qti-response-condition>
        </qti-response-processing>
      </qti-assessment-item>`,
      container
    );

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await assessmentItem.updateComplete;

    assessmentItem.updateResponseVariable('RESPONSE_1', '1');
    assessmentItem.processResponse();
    expect(+assessmentItem.getOutcome('SCORE').value).toBe(1);

    assessmentItem.updateResponseVariable('RESPONSE_1', '1');
    assessmentItem.processResponse();

    expect(+assessmentItem.getOutcome('SCORE').value).toBe(2);
  });

  it('waits for template declarations before automatic template processing', async () => {
    render(
      html`<qti-assessment-item identifier="template-ordering">
        <qti-response-declaration identifier="RESPONSE0" cardinality="single" base-type="integer"></qti-response-declaration>
        <qti-template-declaration identifier="n" base-type="integer" cardinality="single">
          <qti-default-value>3</qti-default-value>
        </qti-template-declaration>
        <qti-template-declaration identifier="t" base-type="integer" cardinality="ordered"></qti-template-declaration>
        <qti-template-declaration identifier="SOLUTION0_0" base-type="integer" cardinality="single"></qti-template-declaration>
        <qti-template-processing>
          <qti-set-template-value identifier="t">
            <qti-ordered>
              <qti-repeat number-repeats="n">
                <qti-base-value base-type="integer">7</qti-base-value>
              </qti-repeat>
            </qti-ordered>
          </qti-set-template-value>
          <qti-set-template-value identifier="SOLUTION0_0">
            <qti-min>
              <qti-variable identifier="t"></qti-variable>
            </qti-min>
          </qti-set-template-value>
          <qti-set-correct-response identifier="RESPONSE0">
            <qti-variable identifier="SOLUTION0_0"></qti-variable>
          </qti-set-correct-response>
        </qti-template-processing>
      </qti-assessment-item>`,
      container
    );

    const assessmentItem = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    const templateProcessingComplete = new Promise<void>(resolve =>
      assessmentItem.addEventListener('qti-template-processing-complete', () => resolve(), { once: true })
    );
    await assessmentItem.updateComplete;
    await templateProcessingComplete;

    const templateVariables = assessmentItem.variables.filter(variable => variable.type === 'template');
    expect(templateVariables.find(variable => variable.identifier === 'n')?.value).toBe('3');
    expect(templateVariables.find(variable => variable.identifier === 't')?.value).toEqual(['7', '7', '7']);
    expect(templateVariables.find(variable => variable.identifier === 'SOLUTION0_0')?.value).toBe('7');
    expect(assessmentItem.variables.find(variable => variable.identifier === 'RESPONSE0')?.value).toBeNull();
  });
});
