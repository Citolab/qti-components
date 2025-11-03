import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ItemContext } from '@qti-components/shared';

describe('QtiComponent qti-subtract', () => {
  it('should calculate the difference of two values', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-outcome-declaration
          identifier="SCORE"
          cardinality="single"
          base-type="identifier"
        ></qti-outcome-declaration>
        <qti-response-processing>
          <qti-set-outcome-value identifier="SCORE">
            <qti-subtract>
              <qti-base-value>10</qti-base-value>
              <qti-base-value>3</qti-base-value>
            </qti-subtract>
          </qti-set-outcome-value>
        </qti-response-processing>
      </qti-assessment-item>
    `;
    render(template(), document.body);
    const qtiAssessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    qtiAssessmentItem.processResponse();
    const itemContext = (qtiAssessmentItem as any)._context as ItemContext;
    const scoreVariable = itemContext.variables.find(v => v.identifier === 'SCORE');
    expect(scoreVariable?.value).toEqual('7');
  });
});
