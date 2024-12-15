import '../../../../../index';
import { render } from 'lit';
import Meta, { Default as DefaultStory } from './qti-lookup-outcome-value.stories';

import { composeStory } from '@storybook/preview-api';
import { QtiLookupOutcomeValue } from '../../../../../index';

const composedStory = composeStory(DefaultStory, Meta);

test('Looks up the outcome in the interpolation table', async () => {
  render(composedStory(), document.body);

  await composedStory.play({ canvasElement: document.body });

  const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
  expect(qtiLookipOutcomeValue.process()).toEqual(2);
});
