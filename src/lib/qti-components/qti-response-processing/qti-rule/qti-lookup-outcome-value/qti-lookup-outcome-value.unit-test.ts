import '../../../../../index';
import { expect } from '@storybook/test';
import { Default } from './qti-lookup-outcome-value.stories';

import { composeStory } from '@storybook/preview-api';
import { render } from 'lit';
import { QtiAssessmentItem, QtiLookupOutcomeValue } from '../../../../../index';

const composedStory = composeStory(Default, Default.args);

test('Checks if the form is valid', () => {
  render(composedStory.toString(), document.body);

  const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
  assessmentItem.updateResponseVariable('SCORE', '3');

  const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
  expect(qtiLookipOutcomeValue.process()).toEqual(2);
});
