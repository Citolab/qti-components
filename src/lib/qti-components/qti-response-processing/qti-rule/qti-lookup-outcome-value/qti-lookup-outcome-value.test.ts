
import { QtiAssessmentItem, QtiLookupOutcomeValue } from '@citolab/qti-components/qti-components';
import { render } from 'lit';
import './qti-lookup-outcome-value';
import { Default } from './qti-lookup-outcome-value.stories';
import { expect } from '@storybook/jest';

// import { composeStory } from '@storybook/web-components';
// const FormError = composeStory(DefaultStory, Meta);

test('Checks if the form is valid', () => {
  render(Default.render({ maxChoices: 1, minChoices: 1 }), document.body);

  const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
  assessmentItem.updateResponseVariable('SCORE', '3');

  const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
  expect(qtiLookipOutcomeValue.process()).toEqual(2);
});
