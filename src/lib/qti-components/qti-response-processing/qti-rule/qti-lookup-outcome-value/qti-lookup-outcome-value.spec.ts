import '@citolab/qti-components/qti-components';
import { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { describe, expect, it } from '@jest/globals';
import { render } from 'lit';
import './qti-lookup-outcome-value';
import { QtiLookupOutcomeValue } from './qti-lookup-outcome-value';
import { Default } from './qti-lookup-outcome-value.stories';

describe('qti-lookup-outcome-value', () => {
  it('should the value of the mapping by response value', () => {
    render(Default.render({ maxChoices: 1, minChoices: 1 }), document.body);

    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('SCORE', '3');

    const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
    expect(qtiLookipOutcomeValue.process()).toEqual(2);
  });
});
