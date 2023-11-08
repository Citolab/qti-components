import '@citolab/qti-components/qti-components';
import { expect } from '@jest/globals';
import { render } from 'lit';
import Meta, { Default as DefaultStory } from './qti-lookup-outcome-value.stories';

import { QtiLookupOutcomeValue } from '@citolab/qti-components/qti-components';
import { composeStory } from '@storybook/preview-api';

const composedStory = composeStory(DefaultStory, Meta);

test('Looks up the outcome in the interpolation table', async () => {
  render(composedStory(), document.body);

  await composedStory.play({ canvasElement: document.body });

  const qtiLookipOutcomeValue = document.body.querySelector('qti-lookup-outcome-value') as QtiLookupOutcomeValue;
  expect(qtiLookipOutcomeValue.process()).toEqual(2);
});
