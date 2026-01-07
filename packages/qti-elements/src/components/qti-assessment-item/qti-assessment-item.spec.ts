import '@citolab/qti-components';
import { html, render } from 'lit';

import type { ItemContext } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

describe('qti-assessment-item', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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
      document.body
    );

    const assessmentItem = document.querySelector('qti-assessment-item') as QtiAssessmentItem;
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
});
