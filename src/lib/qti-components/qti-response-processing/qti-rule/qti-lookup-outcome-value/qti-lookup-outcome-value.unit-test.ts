import '@citolab/qti-components/qti-components';
import { QtiAssessmentItem, QtiLookupOutcomeValue } from '@citolab/qti-components/qti-components';
import { expect } from '@storybook/jest';
import { Default } from './qti-lookup-outcome-value.stories';

import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';

const composedStory = composeStory(Default, Default.args);

test('Checks if the form is valid', () => {
  render(composedStory.toString(), document.body);

  const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
  assessmentItem.updateResponseVariable('SCORE', '3');

  const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
  expect(qtiLookipOutcomeValue.process()).toEqual(2);
});
